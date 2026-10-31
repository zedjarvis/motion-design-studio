"""Local motion diagnostics only. These regions never replace the full RGB gate."""
import argparse
import csv
import json
from pathlib import Path
from compare import rgb_frames
from references import ROOT,sha256

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('project');parser.add_argument('candidate',type=Path);parser.add_argument('--output',type=Path)
args=parser.parse_args()
ref=next(item for item in json.loads((ROOT/'references/manifest.json').read_text())['references'] if item['id']==args.project)
regions=json.loads((ROOT/'references/regions.json').read_text()).get(args.project,[])
output=args.output or ROOT/'out'/args.project/'motion-audit';output.mkdir(parents=True,exist_ok=True)
results=[]
for region in regions:
    x,y,w,h=region['bounds'];start,end=region['frames']
    filters=[f'crop={w}:{h}:{x}:{y}',f'trim=start_frame={start}:end_frame={end}']
    source=rgb_frames(ROOT/ref['source'],w,h,ref['crop'],filters)
    candidate=rgb_frames(args.candidate,w,h,extra_filters=filters)
    rows=[];previous_a=previous_b=None
    try:
        for index,(a,b) in enumerate(zip(source,candidate)):
            motion=lambda current,previous:sum(abs(x-y)for x,y in zip(current,previous))/len(current) if previous else 0
            ma,mb=motion(a,previous_a),motion(b,previous_b)
            rows.append({'frame':start+index,'regionPixelsEqual':a==b,'referenceMotionMAE':ma,'candidateMotionMAE':mb,
                         'referenceActiveCandidateHeld':ma>=region.get('activeMAE',.5) and mb<.02})
            previous_a,previous_b=a,b
    finally:source.close();candidate.close()
    if len(rows)!=end-start:raise ValueError('Region audit did not cover every requested frame')
    with (output/(region['name']+'.csv')).open('w',newline='')as file:
        writer=csv.DictWriter(file,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    results.append({'name':region['name'],'bounds':region['bounds'],'frames':region['frames'],
                    'reviewFrames':[row['frame']for row in rows if row['referenceActiveCandidateHeld']],
                    'warning':'Activity thresholds locate missing motion only. Pixel equality of every full frame is still mandatory.'})
report={'project':args.project,'candidate':str(args.candidate.resolve()),'candidateSha256':sha256(args.candidate),
        'diagnosticOnly':True,'regions':results}
(output/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
