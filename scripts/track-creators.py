"""Recover editable camera/panel motion from the Creators reference. No pixels are exported."""
import json
from pathlib import Path
import sys

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
index = json.loads((ROOT / 'analysis/frames-index.json').read_text())['references']
ref = next(item for item in index if item['project'] == 'creators-studio')
directory = ROOT / ref['directory']
detections = []
last = np.array([278., 340.])
heading = -90.
for frame in range(293):
    image = cv2.imread(str(directory / f'frame-{frame:06d}.png'))
    mask = ((image.max(2) < 24) * 255).astype('uint8')
    count, labels, stats, centers = cv2.connectedComponentsWithStats(mask)
    choices = []
    for label in range(1, count):
        x, y, width, height, area = stats[label]
        if 8 <= width <= 80 and 8 <= height <= 80 and 90 < area < 2300 and x > 2 and x + width < 555:
            choices.append((label, area, np.linalg.norm(centers[label] - last)))
    if not choices:
        detections.append([278., 340., -90.])
        continue
    label, area, _ = max(choices, key=lambda value: value[1] - .8 * value[2])
    center = centers[label]
    lenses = [other for other in range(1, count)
              if 25 < stats[other, 4] < area * .8 and 8 < np.linalg.norm(centers[other] - center) < 42]
    if lenses:
        lens = min(lenses, key=lambda other: np.linalg.norm(centers[other] - center))
        delta = centers[lens] - center
        angle = np.degrees(np.arctan2(delta[1], delta[0]))
        heading = heading + ((angle - heading + 180) % 360) - 180
    else:
        points = np.column_stack(np.where(labels == label)[::-1]).astype('float32')
        _, (width, height), angle = cv2.minAreaRect(points)
        major = angle if width > height else angle + 90
        heading = min((major - 90 + k * 180 for k in range(-3, 4)), key=lambda angle: abs(angle - heading))
    detections.append([round(float(center[0]), 3), round(float(center[1]), 3), round(float(heading), 3)])
    last = center

# At 200/201 the body merges with its motion trail. The old component selector
# chose a letter in the exposed brand plane instead. Interpolate between the
# adjacent independently measured poses; retain all other native held frames.
for frame in [200, 201]:
    detections[frame] = [round((a+b)/2, 3) for a,b in zip(detections[198], detections[202])]

opening = []
detached_lens = []
beam_rays = []
for frame in range(293):
    image = cv2.imread(str(directory / f'frame-{frame:06d}.png'))
    x,y,angle = detections[frame]
    radians = np.radians(angle)
    tip = np.array([x+np.cos(radians)*27,y+np.sin(radians)*27])
    # Purple chroma isolates the light cone from the white panel and black rig.
    chroma = image.max(2).astype(float)-image.min(2)
    yy,xx = np.where((chroma>20)&(image[:,:,0]>image[:,:,2]))
    delta = np.column_stack([xx,yy])-tip
    distance = np.linalg.norm(delta,axis=1)
    angular = (np.degrees(np.arctan2(delta[:,1],delta[:,0]))-angle+180)%360-180
    valid = angular[(distance>60)&(np.abs(angular)<40)]
    width = max(abs(float(np.quantile(valid,.002))),abs(float(np.quantile(valid,.998)))) if len(valid)>40 and 100<=frame<282 else 0
    opening.append(round(min(28,width),3))
    # Fit the two long, straight boundaries, not the letters inside the cone.
    # Their intersection sits behind the lens, close to the camera body center.
    silhouette=(image.max(2)<225).astype('uint8')*255
    silhouette[:3]=0;silhouette[-3:]=0;silhouette[:,:3]=0;silhouette[:,-3:]=0
    lines=cv2.HoughLinesP(cv2.Canny(silhouette,50,150),1,np.pi/1800,25,minLineLength=45,maxLineGap=8)
    groups=[[],[]]
    body=np.array([x,y])
    for line in lines.reshape(-1,4) if lines is not None and 106<=frame<274 else []:
        a,b=np.array(line[:2]),np.array(line[2:]);delta=b-a
        length=np.linalg.norm(delta);heading=np.degrees(np.arctan2(delta[1],delta[0]))
        difference=(heading-angle+90)%180-90
        distance=abs(delta[0]*(body-a)[1]-delta[1]*(body-a)[0])/length
        if 5<abs(difference)<40 and distance<30:
            direction=heading if abs((heading-angle+180)%360-180)<90 else heading+180
            groups[int(difference>0)].append((length,a,b,direction))
    groups=[sorted(group,key=lambda edge:-edge[0])[:5] for group in groups]
    best=None
    for a in groups[0]:
        for b in groups[1]:
            try:
                terms=np.linalg.solve(np.column_stack([a[2]-a[1],-(b[2]-b[1])]),b[1]-a[1])
                apex=a[1]+terms[0]*(a[2]-a[1]);distance=np.linalg.norm(apex-body)
                score=a[0]+b[0]-distance*10
                if distance<35 and (best is None or score>best[0]):best=(score,apex,a[3],b[3])
            except np.linalg.LinAlgError:pass
    if best:
        beam_rays.append([round(float(v),3) for v in [*best[1],best[2],best[3]]])
    elif 100<=frame<106:
        half=(frame-98)*2.4
        beam_rays.append([x,y,angle-half,angle+half])
    elif 106<=frame<282:
        # The boundary is too short/blurred for Hough during the rapid turn and
        # at the right crop edge. Preserve the cone instead of flashing it off.
        beam_rays.append([x,y,angle-23.5,angle+23.5])
    else:beam_rays.append(None)
    mask=(image.max(2)<24).astype('uint8')
    count,labels,stats,centers=cv2.connectedComponentsWithStats(mask)
    candidates=[i for i in range(1,count) if 35<stats[i,4]<300 and abs(centers[i,0]-278)<20 and centers[i,1]<y-14]
    if candidates and 62<=frame<108:
        i=max(candidates,key=lambda i:stats[i,4])
        lx,ly,w,h,_=stats[i]
        detached_lens.append([round(float(centers[i,0]),3),round(float(centers[i,1]),3),int(w),int(h)])
    else:detached_lens.append(None)

# Position of a solid translating panel can be recovered from coverage. It is
# a geometric parameter, not an image sequence or a per-pixel residual.
right_to_left = []
down = []
left_to_right = []
final_drop = []
for frame in range(288, 433):
    image = cv2.imread(str(directory / f'frame-{frame:06d}.png')).astype(float)
    red = image[:, :, 2]
    if 288 <= frame <= 324:
        coverage = np.clip((252 - red[65:95].mean(0)) / 247, 0, 1)
        right_to_left.append(round(float(556 - coverage.sum()), 3))
    if 326 <= frame <= 362:
        coverage = np.clip((252 - red[:, 45:95].mean(1)) / 247, 0, 1)
        down.append(round(float(314 - coverage.sum()), 3))
    if 370 <= frame <= 400:
        coverage = np.clip((252 - red[65:95].mean(0)) / 247, 0, 1)
        left_to_right.append(round(float(coverage.sum()), 3))
    if 406 <= frame <= 432:
        blue = ((image[:, :, 2] < 18) & (image[:, :, 1] < 45)
                & (image[:, :, 0] > 65) & (image[:, :, 0] < 145))
        rows = np.where(blue[:, 20:536].mean(1) > .85)[0]
        final_drop.append(float(rows.min()) if len(rows) else 314.)

result = {
    'provenance': 'Connected-component camera tracking and scalar panel coverage recovered from the supplied artwork; no raster frames are used in production.',
    'camera': detections,
    'coneOpening': opening,
    'detachedLens': detached_lens,
    'beamRays': beam_rays,
    'firstWipe': {'from': 288, 'positions': right_to_left},
    'secondWipe': {'from': 326, 'positions': down},
    'thirdWipe': {'from': 370, 'positions': left_to_right},
    'finalDrop': {'from': 406, 'positions': final_drop},
}
output = ROOT / 'projects/creators-studio/src/motion.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(result, separators=(',', ':')) + '\n')
print(f'Wrote geometric motion tracks to {output}')
