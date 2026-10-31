"""Measure native red-card pose deltas, never reference pixel playback."""
import json
from pathlib import Path
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
index=json.loads((ROOT/'analysis/frames-index.json').read_text())['references']
source=next(item for item in index if item['project']=='alconost-localization')
poses=[]
for frame in range(110):
    image=cv2.imread(str(ROOT/source['directory']/f'frame-{frame:06d}.png'))[:,:,::-1].astype(int)
    mask=((image[:,:,0]>195)&(image[:,:,0]-image[:,:,1]>50)&(image[:,:,1]<195)).astype('uint8')
    mask[:670]=0;mask[980:]=0;mask[:,:430]=0;mask[:,840:]=0
    points=np.column_stack(np.where(mask)[::-1]).astype('float32')
    if len(points)<100:raise ValueError(f'No reliable red-card outline at {frame}')
    (x,y),(w,h),angle=cv2.minAreaRect(points)
    if w<h:angle+=90;w,h=h,w
    if abs(w-320)>8 or abs(h-190)>8:raise ValueError(f'Unexpected card bounds at {frame}')
    poses.append([float(x),float(y),float((angle+90)%180-90)])
result={'provenance':'Scalar red-outline pose deltas measured at native frames, not raster playback.',
        'sourceSha256':source['sourceSha256'],'baseMeasuredPose':poses[0],'measuredFrames':[0,110],
        'unresolved':'Hold last confident pose during low-opacity exit frames 110–124; that exit is not validated as exact.',
        'shake':[[round(p[i]-poses[0][i],4)for i in range(3)]for p in poses]}
(ROOT/'projects/alconost-localization/src/manual-motion.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
