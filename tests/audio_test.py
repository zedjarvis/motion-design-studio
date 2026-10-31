import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import audio
from references import sha256

class AudioTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        (self.root/'public/audio').mkdir(parents=True)
        self.music=self.root/'public/audio/tone.wav'
        subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','sine=frequency=100:duration=2','-ar','48000','-ac','2','-y',str(self.music)],check=True)
        self.plan={'project':'unit','fps':10,'durationInFrames':20,'music':{'src':'audio/tone.wav','gain':.2,'fadeInFrames':1,'fadeOutFrames':2},'cues':[]}
        self.ledger={'assets':[{'path':'audio/tone.wav','sha256':sha256(self.music),'credit':'Synthetic unit tone'}]}
        self.planfile=self.root/'plan.json'
        self.patch=patch('audio.ROOT',self.root);self.patch.start()
    def tearDown(self):self.patch.stop();self.temp.cleanup()
    def build(self):
        self.planfile.write_text(json.dumps(self.plan));(self.root/'public/audio/ledger.json').write_text(json.dumps(self.ledger))
        return audio.build(self.planfile,self.root/'output')
    def test_valid_mix_has_exact_sample_count_and_measured_levels(self):
        self.plan['cues']=[{'src':'audio/tone.wav','frame':5,'gain':.1}]
        self.build();report=json.loads((self.root/'output/audio-report.json').read_text())
        self.assertTrue(report['technicalChecksPassed']);self.assertEqual(report['samples'],96000)
    def test_unknown_or_changed_asset_is_rejected(self):
        self.ledger['assets']=[]
        with self.assertRaisesRegex(ValueError,'provenance'):self.build()
        self.ledger['assets']=[{'path':'audio/tone.wav','sha256':'wrong','credit':'unit'}]
        with self.assertRaisesRegex(ValueError,'source changed'):self.build()
    def test_invalid_gains_and_cue_frames_are_rejected(self):
        for gain in [-1,2,float('nan'),float('inf')]:
            self.plan['music']['gain']=gain
            with self.subTest(gain=gain),self.assertRaisesRegex(ValueError,'gain'):self.build()
        self.plan['music']['gain']=.2
        for frame in [-1,20,1.5,'1']:
            self.plan['cues']=[{'src':'audio/tone.wav','frame':frame,'gain':.1}]
            with self.subTest(frame=frame),self.assertRaisesRegex(ValueError,'Cue frame'):self.build()
    def test_outside_missing_and_symlinked_audio_are_rejected(self):
        outside=self.root/'outside.wav';outside.write_bytes(b'not audio')
        (self.root/'public/link.wav').symlink_to(outside)
        for name in ['../outside.wav','missing.wav','link.wav']:
            with self.subTest(name=name),self.assertRaisesRegex(ValueError,'inside public'):audio.checked_public_path(name)
    def test_rational_frame_to_sample_mapping(self):
        self.assertEqual(audio.sample_at(535,60),428000)
        self.assertEqual(audio.sample_at(30000,'30000/1001'),48048000)
