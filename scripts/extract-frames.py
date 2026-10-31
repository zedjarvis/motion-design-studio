"""Extract every decoded artwork frame for analysis, never into production assets."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

from references import ROOT, timestamps, sha256


def extract(ref):
    source = ROOT / ref['source']
    parent = ROOT / 'analysis/frames'
    parent.mkdir(parents=True, exist_ok=True)
    output = Path(tempfile.mkdtemp(prefix=ref['id'] + '-', dir=parent))
    crop = ref.get('crop')
    filters = (f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}," if crop else '') + 'format=rgb24'
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-map', '0:v:0', '-an',
                    '-vf', filters, '-vsync', '0', '-start_number', '0', '-compression_level', '3',
                    '-threads', '2', str(output / 'frame-%06d.png')], check=True)
    pts = timestamps(source)
    files = sorted(output.glob('frame-*.png'))
    if len(pts) != len(files):
        raise RuntimeError(f'{ref["id"]}: extraction lost or duplicated frames')
    result = {'project': ref['id'], 'source': ref['source'], 'sourceSha256': sha256(source),
              'crop': crop, 'count': len(files), 'directory': str(output.relative_to(ROOT)),
              'firstPts': pts[0], 'frames': [
                  {'frame': index, 'pts': pts[index], 'file': file.name, 'sha256': sha256(file)}
                  for index, file in enumerate(files)]}
    (output / 'index.json').write_text(json.dumps(result, indent=2) + '\n')
    print(f'{ref["id"]}: extracted all {len(files)} frames → {output}', flush=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project')
    options = parser.parse_args()
    refs = json.loads((ROOT / 'references/manifest.json').read_text())['references']
    if options.project:
        refs = [r for r in refs if r['id'] == options.project]
        if not refs:
            parser.error('Unknown project id')
    results = [extract(ref) for ref in refs]
    target = ROOT / 'analysis' / (f'frames-{options.project}.json' if options.project else 'frames-index.json')
    target.write_text(json.dumps({'references': results}, indent=2) + '\n')


if __name__ == '__main__':
    main()
