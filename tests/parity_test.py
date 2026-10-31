import json
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from compare import compare
from references import sha256
suite_spec=importlib.util.spec_from_file_location('parity_suite',ROOT/'scripts/parity-suite.py')
suite=importlib.util.module_from_spec(suite_spec)
suite_spec.loader.exec_module(suite)


def encode(path, frames, width=16, height=16, fps=10):
    subprocess.run(['ffmpeg', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                    '-s', f'{width}x{height}', '-r', str(fps), '-i', '-',
                    '-c:v', 'ffv1', '-pix_fmt', 'gbrp', '-y', str(path)],
                   input=b''.join(frames), check=True)


class ParityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.directory = Path(self.temp.name)
        self.frames = [bytes([n * 60, 20, 30]) * (16 * 16) for n in range(3)]
        self.source = self.directory / 'source.mkv'
        encode(self.source, self.frames)

    def tearDown(self):
        self.temp.cleanup()

    def test_independently_encoded_identical_pixels_pass(self):
        candidate = self.directory / 'candidate.mkv'
        encode(candidate, self.frames)
        result = compare(self.source, candidate)
        self.assertTrue(result['passed'], result)
        self.assertEqual(result['comparedFrames'], 3)

    def test_one_channel_of_one_pixel_in_last_frame_fails(self):
        candidate = self.directory / 'pixel.mkv'
        changed = list(self.frames)
        last = bytearray(changed[-1])
        last[-1] += 1
        changed[-1] = bytes(last)
        encode(candidate, changed)
        result = compare(self.source, candidate)
        self.assertFalse(result['passed'])
        self.assertEqual(result['pixelMismatchFrames'], [2])

    def test_audit_hashes_cannot_substitute_for_rgb_byte_equality(self):
        candidate=self.directory/'hash-collision.mkv'
        changed=list(self.frames);last=bytearray(changed[-1]);last[-1]+=1;changed[-1]=bytes(last)
        encode(candidate,changed)
        with patch('compare.rgb_sha256')as digest:
            digest.return_value.hexdigest.return_value='same-audit-hash'
            result=compare(self.source,candidate)
        self.assertFalse(result['passed'])
        self.assertEqual(result['pixelMismatchFrames'],[2])
        self.assertFalse(result['frameChecks'][2]['pixelsEqual'])

    def test_one_microsecond_relative_timing_drift_fails(self):
        candidate=self.directory/'drift.nut'
        subprocess.run(['ffmpeg','-v','error','-i',str(self.source),'-vf',
                        r'settb=1/1000000,setpts=PTS+if(eq(N\,1)\,1\,0)',
                        '-vsync','0','-enc_time_base','1:1000000','-c:v','ffv1','-y',str(candidate)],check=True)
        result=compare(self.source,candidate)
        self.assertEqual(result['pixelMismatchCount'],0)
        self.assertEqual(result['timestampMismatchFrames'],[1])
        self.assertIn('timestamps',result['failures'])

    def test_diagnostics_include_worst_frame_images(self):
        candidate = self.directory / 'diagnostics.mkv'
        changed = list(self.frames)
        changed[-1] = bytes([0, 200, 90]) * (16 * 16)
        encode(candidate, changed)
        diagnostics = self.directory / 'diagnostics'
        result = compare(self.source, candidate, diagnostics_dir=diagnostics)
        self.assertFalse(result['passed'])
        self.assertNotIn('diagnosticsError', result)
        self.assertEqual(result['diagnostics']['worstFrames'][0]['frame'], 2)
        self.assertTrue(list(diagnostics.glob('*-reference-candidate-diff.png')))

    def test_missing_tail_fails_even_if_compared_pixels_match(self):
        candidate = self.directory / 'short.mkv'
        encode(candidate, self.frames[:2])
        result = compare(self.source, candidate)
        self.assertFalse(result['passed'])
        self.assertIn('frame-count', result['failures'])
        self.assertEqual(result['pixelMismatchCount'], 0)

    def test_equal_rgb_diagnostics_have_a_black_difference_panel(self):
        candidate = self.directory / 'same.mkv'
        encode(candidate, self.frames)
        diagnostics = self.directory / 'same-diagnostics'
        self.assertTrue(compare(self.source, candidate, diagnostics_dir=diagnostics)['passed'])
        for file in diagnostics.glob('*-reference-candidate-diff.png'):
            pixels = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(file),
                                     '-vf', 'crop=16:16:32:0,format=rgb24',
                                     '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
            self.assertEqual(pixels, bytes(16 * 16 * 3))

    def test_wrong_fps_fails_with_equal_pixel_sequence(self):
        candidate = self.directory / 'fps.mkv'
        encode(candidate, self.frames, fps=20)
        result = compare(self.source, candidate)
        self.assertFalse(result['passed'])
        self.assertIn('frame-rate', result['failures'])
        self.assertIn('timestamps', result['failures'])

    def test_container_start_offset_is_reported_and_not_content_aligned(self):
        candidate = self.directory / 'offset.mkv'
        subprocess.run(['ffmpeg', '-v', 'error', '-itsoffset', '0.1', '-i', str(self.source),
                        '-c', 'copy', '-y', str(candidate)], check=True)
        result = compare(self.source, candidate)
        self.assertTrue(result['passed'], result)
        self.assertNotEqual(result['timeOrigins']['reference'], result['timeOrigins']['candidate'])

    def test_rgb_lossless_mp4_preserves_decoded_pixels(self):
        candidate = self.directory / 'rgb.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(self.source), '-c:v', 'libx264rgb',
                        '-crf', '0', '-pix_fmt', 'rgb24', '-y', str(candidate)], check=True)
        self.assertTrue(compare(self.source, candidate)['passed'])

    def test_explicit_crop_passes_without_rescaling(self):
        crop = {'x': 2, 'y': 2, 'width': 8, 'height': 8}
        candidate = self.directory / 'crop.mkv'
        encode(candidate, [bytes([n * 60, 20, 30]) * 64 for n in range(3)], width=8, height=8)
        self.assertTrue(compare(self.source, candidate, crop)['passed'])
        self.assertFalse(compare(self.source, candidate)['passed'])

    def test_suite_fails_on_all_missing_candidates(self):
        candidates = self.directory / 'candidates.json'
        candidates.write_text('{}')
        output = self.directory / 'suite'
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/parity-suite.py'),
                                 str(candidates), '--output', str(output)], capture_output=True)
        self.assertEqual(result.returncode, 1)
        report = json.loads((output / 'suite.json').read_text())
        self.assertFalse(report['passed'])
        self.assertEqual(len(report['projects']), 4)

    def test_suite_requires_studio_capture_evidence(self):
        candidates = self.directory / 'no-receipts.json'
        refs = json.loads((ROOT / 'references/manifest.json').read_text())['references']
        candidates.write_text(json.dumps({ref['id']: str(self.source) for ref in refs}))
        output = self.directory / 'provenance-suite'
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/parity-suite.py'),
                                 str(candidates), '--output', str(output)], capture_output=True)
        self.assertEqual(result.returncode, 1)
        report = json.loads((output / 'suite.json').read_text())
        self.assertTrue(all('missing-capture-receipt' in ref['failures'] for ref in report['projects']))

    def test_audio_revision_requires_a_hash_verified_parent_capture(self):
        receipt={'composition':'Proof','status':'rendered-not-parity-approved','kind':'audio-revision',
                 'sourceHashes':{'scene':'fixture'},'lockfileSha256':'fixture',
                 'parityMasterSha256':sha256(self.source),
                 'stages':{name:'passed'for name in ['sourceAudit','bundle','capture','determinism','encode','audioRevision']},
                 'captureEvidence':{'receipt':str(self.directory/'missing-parent.json'),'sha256':'not-a-capture','master':str(self.source)}}
        (self.directory/'receipt.json').write_text(json.dumps(receipt))
        self.assertIn('invalid-parent-capture-evidence',suite.check_capture(self.source,'Proof'))


class RepoInspectionTests(unittest.TestCase):
    def test_repo_evidence_excludes_credentials_and_external_symlinks(self):
        with tempfile.TemporaryDirectory() as temp:
            repo = Path(temp) / 'repo'
            repo.mkdir()
            (repo / 'package.json').write_text('{"name":"sample-product","description":"An evidence-backed demo"}')
            (repo / 'README.md').write_text('# A real product\n\nUpload a file and export a result.\n')
            (repo / '.env').write_text('SECRET=never-export-this')
            (repo / 'secrets').mkdir()
            (repo / 'secrets' / 'settings.json').write_text('{"title":"private-only-title"}')
            outside = Path(temp) / 'outside.md'
            outside.write_text('# private-outside-workspace')
            (repo / 'external.md').symlink_to(outside)
            (repo / 'screen.tsx').write_text('<h1>Send to demo@example.com</h1>')
            output = Path(temp) / 'evidence.json'
            result = subprocess.run(['node', str(ROOT / 'scripts/inspect-repo.mjs'), str(repo), '--out', str(output)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            text = output.read_text()
            self.assertIn('sample-product', text)
            self.assertIn('Upload a file', text)
            self.assertNotIn('private-only-title', text)
            self.assertNotIn('private-outside-workspace', text)
            self.assertNotIn('never-export-this', text)
            self.assertNotIn('demo@example.com', text)


if __name__ == '__main__':
    unittest.main()
