"""Strict artwork parity gate. Never rescales, time-warps, or ignores a trailing frame."""
import argparse
import csv
from fractions import Fraction
from hashlib import sha256 as rgb_sha256
from itertools import zip_longest
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from references import probe, sha256, ROOT


def presentation_times(path,time_base):
    data=json.loads(subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_frames',
                    '-show_entries','frame=best_effort_timestamp,best_effort_timestamp_time','-of','json',str(path)],
                    check=True,capture_output=True,text=True).stdout)['frames']
    return ([frame.get('best_effort_timestamp_time')for frame in data],
            [Fraction(frame['best_effort_timestamp'])*Fraction(time_base) if frame.get('best_effort_timestamp') is not None else None for frame in data])


def rgb_frames(path, width, height, crop=None, extra_filters=()):
    """Stream actual RGB bytes, bounded to one frame. Never use a hash as equality."""
    filters = []
    if crop:
        filters.append(f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}")
    filters.extend(extra_filters)
    filters.append('format=rgb24')
    size=width*height*3
    with tempfile.TemporaryFile() as errors:
        process=subprocess.Popen(['ffmpeg','-v','error','-threads','2','-filter_threads','1','-i',str(path),
                                  '-map','0:v:0','-an','-vf',','.join(filters),'-vsync','0',
                                  '-threads','1','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,stderr=errors)
        try:
            while True:
                pixels=process.stdout.read(size)
                if not pixels:break
                if len(pixels)!=size:raise ValueError('Truncated decoded RGB frame')
                yield pixels
            if process.wait():
                errors.seek(0);raise RuntimeError(errors.read().decode(errors='replace'))
        finally:
            process.stdout.close()
            if process.poll() is None:
                process.terminate()
                try:process.wait(timeout=5)
                except subprocess.TimeoutExpired:process.kill();process.wait()


def compare(reference, candidate, crop=None, diagnostics_dir=None):
    rv = next(s for s in probe(reference)['streams'] if s['codec_type'] == 'video')
    cv = next(s for s in probe(candidate)['streams'] if s['codec_type'] == 'video')
    rp,rexact=presentation_times(reference,rv['time_base'])
    cp,cexact=presentation_times(candidate,cv['time_base'])
    expected_size = [crop['width'], crop['height']] if crop else [rv['width'], rv['height']]
    reasons = []
    if expected_size != [cv['width'], cv['height']]:
        reasons.append('dimensions')
    if Fraction(rv['r_frame_rate']) != Fraction(cv['r_frame_rate']):
        reasons.append('frame-rate')
    if len(rp) != len(cp):
        reasons.append('frame-count')
    if not rp or not cp:
        reasons.append('empty-video')
    # Artwork starts at decoded frame zero. The downloads all have a one-frame
    # container start offset. Remove only this metadata origin, never seek for a match.
    reference_origin = float(rexact[0]) if rexact and rexact[0] is not None else 0
    candidate_origin = float(cexact[0]) if cexact and cexact[0] is not None else 0
    rzero=rexact[0] if rexact else None;czero=cexact[0] if cexact else None
    pts_errors = [i for i, (a, b) in enumerate(zip(rexact, cexact))
                  if a is None or b is None or rzero is None or czero is None or a-rzero!=b-czero]
    if pts_errors:
        reasons.append('timestamps')
    frame_checks=[];mismatches=[];source_count=candidate_count=compared=0
    with_ref=rgb_frames(reference,*expected_size,crop)
    with_candidate=rgb_frames(candidate,cv['width'],cv['height'])
    try:
        for index,(a,b) in enumerate(zip_longest(with_ref,with_candidate)):
            source_count+=a is not None;candidate_count+=b is not None
            both=a is not None and b is not None
            equal=both and a==b  # Exact memcmp of every byte, not a similarity threshold.
            if both:
                compared+=1
                if not equal:mismatches.append(index)
            frame_checks.append({'frame':index,'referencePts':rp[index] if index<len(rp) else None,
                                 'candidatePts':cp[index] if index<len(cp) else None,
                                 'referenceTimeFraction':str(rexact[index]) if index<len(rexact) else None,
                                 'candidateTimeFraction':str(cexact[index]) if index<len(cexact) else None,
                                 'referenceRgbSha256':rgb_sha256(a).hexdigest() if a is not None else None,
                                 'candidateRgbSha256':rgb_sha256(b).hexdigest() if b is not None else None,
                                 'pixelsEqual':equal,'framePresentInBoth':both,
                                 'relativePtsEqual':both and index<len(rp) and index<len(cp) and index not in pts_errors})
    finally:with_ref.close();with_candidate.close()
    if source_count != len(rp) or candidate_count != len(cp):
        reasons.append('decode-count')
    if mismatches:
        reasons.append('pixels')
    result = {
        'schemaVersion': 1, 'passed': not reasons,
        'criterion': 'every decoded RGB24 pixel equal; same dimensions, fps, frame count and timestamps relative to first decoded frame',
        'reference': str(reference), 'candidate': str(candidate), 'crop': crop,
        'referenceSha256': sha256(reference),
        'candidateSha256': sha256(candidate),
        'sourceFrames': len(rp), 'candidateFrames': len(cp),
        'comparedFrames': compared,
        'comparisonMethod':'Byte-for-byte decoded RGB24 comparison; SHA-256 is recorded for audit only.',
        'comparatorSha256':sha256(Path(__file__)),
        'timingMethod':'Integer decoded PTS × rational stream time_base; exact relative-time fractions, no tolerance.',
        'frameChecks':frame_checks,
        'firstFailedFrame':next((row['frame'] for row in frame_checks if not row['pixelsEqual'] or not row['relativePtsEqual']),None),
        'pixelMismatchCount': len(mismatches), 'pixelMismatchFrames': mismatches,
        'timestampMismatchFrames': pts_errors, 'failures': reasons,
        'timeOrigins': {'reference': reference_origin, 'candidate': candidate_origin,
                        'referenceFraction':str(rzero),'candidateFraction':str(czero),
                        'policy': 'Compare relative PTS; subtract the first displayed timestamp only. No content alignment.'},
        'audio': 'Rebuilt sound is reviewed separately; excluded from visual parity.',
    }
    if diagnostics_dir and 'dimensions' not in reasons and 'frame-rate' not in reasons:
        diagnostics_dir = Path(diagnostics_dir).resolve()
        diagnostics_dir.mkdir(parents=True, exist_ok=True)
        with (diagnostics_dir/'frame-checks.csv').open('w',newline='') as file:
            writer=csv.DictWriter(file,fieldnames=list(frame_checks[0]) if frame_checks else ['frame'])
            writer.writeheader();writer.writerows(frame_checks)
        # Full-frame SSIM is diagnostic only. It never changes `passed`.
        # The framesync filter stops at the shorter input; frame-count equality is gated above.
        ref_filter = f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}," if crop else ''
        filters = (f'[0:v]{ref_filter}format=gbrp,setpts=PTS-STARTPTS[r];'
                   '[1:v]format=gbrp,setpts=PTS-STARTPTS[c];'
                   '[r][c]ssim=stats_file=ssim.log:shortest=1')
        run = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(Path(reference).resolve()),
                              '-i', str(Path(candidate).resolve()), '-filter_complex', filters,
                              '-an', '-f', 'null', '-'], cwd=diagnostics_dir, capture_output=True, text=True)
        if run.returncode:
            result['diagnosticsError'] = run.stderr
        else:
            values = []
            for line in (diagnostics_dir / 'ssim.log').read_text().splitlines():
                match = re.search(r'n:(\d+).*All:([\d.]+)', line)
                if match:
                    values.append((int(match[1]) - 1, float(match[2])))
            if values:
                worst = sorted(values, key=lambda x: x[1])[:8]
                result['diagnostics'] = {
                    'meanSSIM': sum(v for _, v in values) / len(values),
                    'worstFrames': [{'frame': i, 'ssim': v} for i, v in worst],
                    'note': 'Background-heavy images can have high SSIM while the artwork is wrong.',
                }
                for index, _ in worst[:3]:
                    select = f'select=eq(n\\,{index})'
                    graph = (f'[0:v]{ref_filter}{select},setpts=PTS-STARTPTS,format=gbrp,split=2[r][rd];'
                             f'[1:v]{select},setpts=PTS-STARTPTS,format=gbrp,split=2[c][cd];'
                             "[rd][cd]blend=all_mode=difference,lutrgb=r='min(255,val*4)':g='min(255,val*4)':b='min(255,val*4)'[d];"
                             '[r][c][d]hstack=inputs=3[out]')
                    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(Path(reference).resolve()),
                                    '-i', str(Path(candidate).resolve()), '-filter_complex', graph,
                                    '-map', '[out]', '-frames:v', '1', '-y',
                                    str(diagnostics_dir / f'frame-{index:06d}-reference-candidate-diff.png')], check=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', help='Reference project id from references/manifest.json')
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--output', type=Path)
    options = parser.parse_args()
    ref = next((r for r in json.loads((ROOT / 'references/manifest.json').read_text())['references']
                if r['id'] == options.project), None)
    if ref is None:
        parser.error(f'Unknown project {options.project}')
    output = options.output or ROOT / 'out' / options.project / 'parity'
    output.mkdir(parents=True, exist_ok=True)
    result = compare(ROOT / ref['source'], options.candidate.resolve(), ref['crop'], output)
    (output / 'report.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items()
                      if k not in ['pixelMismatchFrames', 'timestampMismatchFrames','frameChecks']}, indent=2))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
