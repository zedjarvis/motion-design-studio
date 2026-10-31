"""Build deterministic sound from frame-indexed local cues; no reference audio is used."""
import argparse
from fractions import Fraction
import json
import math
from pathlib import Path
import re
import subprocess

from references import ROOT, sha256

RATE = 48000


def sample_at(frame, fps):
    return round(Fraction(frame * RATE, 1) / Fraction(str(fps)))


def checked_public_path(relative):
    public = (ROOT / 'public').resolve()
    file = (public / relative).resolve()
    if not file.is_relative_to(public) or not file.is_file():
        raise ValueError(f'Audio asset must be an existing file inside public/: {relative}')
    return file


def build(plan_file, output):
    plan = json.loads(Path(plan_file).read_text())
    fps, frames = plan['fps'], plan['durationInFrames']
    count = sample_at(frames, fps)
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    tracks = [plan['music'], *plan['cues']]
    inputs, filters, labels = [], [], []
    ledger = json.loads((ROOT / 'public/audio/ledger.json').read_text())
    known = {a['path']: a for a in ledger['assets']}
    credits, assets = set(), []
    for index, track in enumerate(tracks):
        file = checked_public_path(track['src'])
        start = track.get('frame', 0)
        if not isinstance(start, int) or not 0 <= start < frames:
            raise ValueError(f'Cue frame {start} is outside the composition')
        if track['src'] not in known:
            raise ValueError(f'Audio asset has no provenance record: {track["src"]}')
        asset = known[track['src']]
        if sha256(file) != asset['sha256']:
            raise ValueError(f'Audio source changed; update its provenance: {file}')
        gain = float(track['gain'])
        if not math.isfinite(gain) or not 0 <= gain <= 1:
            raise ValueError('Track gain must be finite and between 0 and 1')
        assets.append({'path': track['src'], 'sha256': asset['sha256'], 'frame': start, 'gain': gain})
        credits.add(asset['credit'])
        inputs += ['-i', str(file)]
        label = f'a{index}'
        chain = (f'[{index}:a]aresample={RATE},aformat=sample_fmts=fltp:channel_layouts=stereo,'
                 f'volume={gain}')
        if index == 0:
            chain += f',atrim=end_sample={count},apad=whole_len={count}'
            chain += f',afade=t=in:ss=0:ns={sample_at(plan["music"].get("fadeInFrames", 4), fps)}'
            fade = sample_at(plan['music'].get('fadeOutFrames', round(fps * .7)), fps)
            chain += f',afade=t=out:ss={count-fade}:ns={fade}'
        else:
            chain += f',adelay={sample_at(start, fps)}S:all=1'
        filters.append(chain + f'[{label}]')
        labels.append(f'[{label}]')
    filters.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0,'
                   f'apad=whole_len={count},atrim=end_sample={count}[mix]')
    base_graph = ';'.join(filters)
    normalization = 'loudnorm=I=-18:TP=-1.5:LRA=9:print_format=json'
    measure = subprocess.run(['ffmpeg', '-v', 'info', *inputs, '-filter_complex',
                              base_graph + ';[mix]' + normalization + '[out]',
                              '-map', '[out]', '-f', 'null', '-'], check=True, capture_output=True, text=True)
    data = re.findall(r'\{\s*"input_i"[\s\S]*?\}', measure.stderr)
    if not data:
        raise RuntimeError('FFmpeg did not report loudness measurements')
    levels = json.loads(data[-1])
    if not all(math.isfinite(float(levels[k])) for k in ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset']):
        raise RuntimeError('Soundtrack is silent or has invalid loudness measurements')
    second = ('loudnorm=I=-18:TP=-1.5:LRA=9:linear=true:'
              f'measured_I={levels["input_i"]}:measured_TP={levels["input_tp"]}:'
              f'measured_LRA={levels["input_lra"]}:measured_thresh={levels["input_thresh"]}:'
              f'offset={levels["target_offset"]},aresample={RATE},'
              f'apad=whole_len={count},atrim=end_sample={count}[out]')
    movie = output / 'mix.wav'
    subprocess.run(['ffmpeg', '-v', 'error', *inputs, '-filter_complex', base_graph + ';[mix]' + second,
                    '-map', '[out]', '-ar', str(RATE), '-ac', '2', '-c:a', 'pcm_s24le', '-y', str(movie)], check=True)
    analysis = subprocess.run(['ffmpeg', '-v', 'info', '-i', str(movie), '-af', normalization,
                               '-f', 'null', '-'], check=True, capture_output=True, text=True)
    final_levels = json.loads(re.findall(r'\{\s*"input_i"[\s\S]*?\}', analysis.stderr)[-1])
    metadata = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(movie)],
                                        check=True, capture_output=True, text=True).stdout)['streams'][0]
    actual_samples = int(metadata['duration_ts'])
    if metadata['time_base'] != f'1/{RATE}' or actual_samples != count:
        raise RuntimeError('Final soundtrack sample count does not match the video duration')
    passed = abs(float(final_levels['input_i']) + 18) <= .5 and float(final_levels['input_tp']) <= -1.0
    report = {'schemaVersion': 1, 'project': plan['project'], 'status': 'measured-not-listened',
              'planSha256': sha256(plan_file),
              'technicalChecksPassed': passed, 'sampleRate': RATE, 'channels': 2,
              'samples': count, 'fps': fps, 'frames': frames, 'sha256': sha256(movie),
              'loudness': final_levels, 'assets': assets, 'credits': sorted(credits),
              'syncStatus': plan.get('syncStatus', 'pending-visual-lock'),
              'note': 'New library-based sound design. Not original reference audio, not AI-generated music. Auditory and final picture-sync review remain required.'}
    (output / 'audio-report.json').write_text(json.dumps(report, indent=2) + '\n')
    (output / 'CREDITS.txt').write_text('\n'.join(sorted(credits)) + '\n')
    print(f'{plan["project"]}: {movie}, {count} samples; technical checks {"PASS" if passed else "FAIL"}')
    if not passed:
        raise RuntimeError('Final loudness/peak check failed; see audio-report.json')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project')
    options = parser.parse_args()
    plan_file = ROOT / 'projects' / options.project / 'audio-cues.json'
    if json.loads(plan_file.read_text()).get('voiceover'):
        from voiceover import mix
        mix(options.project)
    else:
        build(plan_file, ROOT / 'public/generated' / options.project)


if __name__ == '__main__':
    main()
