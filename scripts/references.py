"""Inventory the supplied references without modifying them (Python stdlib + FFmpeg)."""
import argparse
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def sha256(path):
    with Path(path).open('rb') as file:
        return hashlib.file_digest(file, 'sha256').hexdigest()


def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-count_frames', '-show_streams',
                           '-show_format', '-of', 'json', str(path)]))


def timestamps(path):
    result = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                             '-show_frames', '-show_entries',
                             'frame=best_effort_timestamp_time,pkt_duration_time',
                             '-of', 'json', str(path)]))
    return [f.get('best_effort_timestamp_time') for f in result['frames']]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sheets', action='store_true')
    parser.add_argument('--manifest', type=Path, default=ROOT / 'references/manifest.json')
    options = parser.parse_args()
    manifest = json.loads(options.manifest.read_text())
    output = ROOT / 'analysis'
    output.mkdir(exist_ok=True)
    inventory = []
    for ref in manifest['references']:
        path = ROOT / ref['source']
        data = probe(path)
        video = next(s for s in data['streams'] if s['codec_type'] == 'video')
        pts = timestamps(path)
        fps = Fraction(video['r_frame_rate'])
        target = ref['crop'] or {'width': video['width'], 'height': video['height']}
        item = {
            **ref, 'sha256': sha256(path),
            'sourceVideo': video,
            'sourceAudio': [s for s in data['streams'] if s['codec_type'] == 'audio'],
            'target': {'width': target['width'], 'height': target['height'],
                       'fps': float(fps), 'fpsRational': str(fps), 'frames': len(pts),
                       'duration': len(pts) / float(fps)},
            'timestamps': pts,
        }
        inventory.append(item)
        print(f"{ref['id']}: {len(pts)} frames, {target['width']}x{target['height']}, {fps} fps")
        if options.sheets:
            sheets = output / 'contact-sheets'
            sheets.mkdir(exist_ok=True)
            crop = ref['crop']
            crop_filter = f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}," if crop else ''
            filters = (crop_filter + "fps=2,scale=240:-1,"
                       "drawtext=text='%{pts\\:hms}':fontsize=16:fontcolor=white:"
                       "box=1:boxcolor=black@0.7:x=4:y=4,"
                       "tile=6x7:padding=4:margin=4:color=0x222222")
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-vf', filters,
                            '-frames:v', '1', '-y', str(sheets / f"{ref['id']}.jpg")], check=True)
    (output / 'inventory.json').write_text(json.dumps({'references': inventory}, indent=2) + '\n')


if __name__ == '__main__':
    main()
