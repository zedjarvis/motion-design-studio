"""Report all four required productions. Missing outputs are failures."""
import argparse
import json
from pathlib import Path
import sys
from compare import compare
from references import ROOT, sha256


def check_capture(candidate, composition, visited=None):
    """Pixels alone cannot establish that the studio generated the candidate."""
    receipt_file = candidate.parent / 'receipt.json'
    visited=set() if visited is None else visited
    if receipt_file in visited:return ['cyclic-capture-evidence']
    visited.add(receipt_file)
    if not receipt_file.is_file():
        return ['missing-capture-receipt']
    receipt = json.loads(receipt_file.read_text())
    failures = []
    if receipt.get('composition') != composition:
        failures.append('wrong-composition-receipt')
    if receipt.get('status') != 'rendered-not-parity-approved':
        failures.append('incomplete-capture')
    for stage in ['bundle', 'sourceAudit', 'capture', 'determinism', 'encode']:
        if receipt.get('stages', {}).get(stage) != 'passed':
            failures.append(f'capture-stage-{stage}')
    if receipt.get('parityMasterSha256') != sha256(candidate):
        failures.append('candidate-receipt-hash')
    if not receipt.get('sourceHashes') or not receipt.get('lockfileSha256'):
        failures.append('missing-source-provenance')
    if receipt.get('kind')=='audio-revision':
        evidence=receipt.get('captureEvidence',{})
        parent=Path(evidence.get('receipt',''))
        if not parent.is_file() or sha256(parent)!=evidence.get('sha256'):
            failures.append('invalid-parent-capture-evidence')
        else:
            failures.extend(check_capture(Path(evidence['master']),composition,visited))
        if receipt.get('stages',{}).get('audioRevision')!='passed':failures.append('audio-revision-picture-check')
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidates', type=Path, help='JSON object mapping project ids to candidate MP4 paths')
    parser.add_argument('--output', type=Path, default=ROOT / 'out/acceptance')
    options = parser.parse_args()
    candidates = json.loads(options.candidates.read_text())
    manifest = json.loads((ROOT / 'references/manifest.json').read_text())
    options.output.mkdir(parents=True, exist_ok=True)
    results = []
    for ref in manifest['references']:
        file = candidates.get(ref['id'])
        if not file or not Path(file).is_file():
            result = {'project': ref['id'], 'passed': False, 'failures': ['missing-candidate']}
        else:
            try:
                candidate = Path(file).resolve()
                failures = check_capture(candidate, ref['composition'])
                if failures:
                    result = {'project': ref['id'], 'passed': False, 'failures': failures}
                else:
                    result = {'project': ref['id'], **compare(ROOT / ref['source'], candidate,
                              ref['crop'], options.output / ref['id'])}
            except Exception as error:
                result = {'project': ref['id'], 'passed': False, 'failures': ['comparison-error'], 'error': str(error)}
        results.append(result)
        project_output=options.output/ref['id'];project_output.mkdir(parents=True,exist_ok=True)
        (project_output/'report.json').write_text(json.dumps(result,indent=2)+'\n')
    report = {'passed': bool(results) and all(r['passed'] for r in results), 'projects': results}
    (options.output / 'suite.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'passed':report['passed'],'projects':[
        {key:value for key,value in item.items() if key not in ['frameChecks','pixelMismatchFrames','timestampMismatchFrames']}
        for item in results]},indent=2))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
