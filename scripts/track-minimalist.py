"""Extract sphere and caption geometry for editable reconstruction; no imagery is exported."""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
refs = json.loads((ROOT / 'analysis/frames-index.json').read_text())['references']
directory = ROOT / next(item['directory'] for item in refs if item['project'] == 'minimalist-priceless')
ball, pendulum, captions, coins = [], [], [], []
for frame in range(535):
    image = cv2.imread(str(directory / f'frame-{frame:06d}.png'))
    gray = image.mean(2).astype('uint8')
    binary = (gray > 185).astype('uint8')
    binary[:180, :460] = 0
    binary[1180:] = 0
    distance = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
    peaks = (distance >= cv2.dilate(distance, np.ones((39,39), np.uint8)) - .01) & (distance > 13)
    count, labels, stats, centers = cv2.connectedComponentsWithStats(peaks.astype('uint8'))
    choices = []
    for label in range(1, count):
        x, y = centers[label]
        radius = distance[int(y), int(x)]
        if not 15 < radius < 55:
            continue
        if frame < 39 and abs(x-540) < 100:
            choices.append([x,y,radius])
        elif 39 <= frame < 165 and y < 850:
            choices.append([x,y,radius])
        elif 165 <= frame < 195 and y < 1100 and radius > 18:
            choices.append([x,y,radius])
        elif 195 <= frame < 275 and y < 1100 and radius > 20:
            choices.append([x,y,radius])
    point = min(choices, key=lambda point: abs(point[2]-25)) if choices else None
    if 188 <= frame < 258:
        # The face's eye holes reduce its distance maximum. Use the outer contour.
        contours, _ = cv2.findContours((gray>160).astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        shapes = [cv2.boundingRect(c) for c in contours if 2500<cv2.contourArea(c)<10000]
        shapes = [s for s in shapes if 65<s[2]<110 and 65<s[3]<110]
        if shapes:
            x,y,w,h = min(shapes, key=lambda s:abs(s[0]+s[2]/2-540))
            point = [x+w/2,y+h/2,(w+h)/4]
    ball.append([round(float(n),3) for n in point] if point is not None else None)
    circles = []
    if 274 <= frame < 397:
        detected = cv2.HoughCircles(gray[750:1050], cv2.HOUGH_GRADIENT, dp=1, minDist=32,
                                   param1=80, param2=15, minRadius=24, maxRadius=40)
        if detected is not None:
            circles = sorted([[round(float(x),2),round(float(y+750),2),round(float(r),2)]
                              for x,y,r in detected[0]], key=lambda point:point[0])
    pendulum.append(circles)
    lower = 1160 if frame<165 else 1040 if frame<270 else 1330 if frame<397 else 1060
    mask = gray[lower:1850] > 155
    rows = np.where(mask.sum(1)>4)[0]
    groups = np.split(rows, np.where(np.diff(rows)>4)[0]+1) if len(rows) else []
    groups = [group for group in groups if 16 < group[-1]-group[0] < 80]
    if groups:
        group = max(groups, key=lambda group:mask[group].sum())
        y0,y1 = int(group[0]),int(group[-1])
        xx = np.where(mask[y0:y1+1].sum(0)>0)[0]
        captions.append([int(xx.min()),lower+y0,int(xx.max()-xx.min()+1),y1-y0+1])
    else:
        captions.append(None)
    coin_mask = gray[950:1150] > 170
    ys,xs = np.where(coin_mask)
    coins.append([round(float(xs.mean()),2),round(float(ys.mean()+950),2)] if len(xs)>100 and frame<174 else None)

# Missing detections while the point is outside the image remain outside.
for frame in range(39, 84):
    if ball[frame] is None:
        ball[frame] = [540.,-80.,25.]
result = {'provenance':'Scalar centers, radii and caption bounds measured from the supplied reference; no raster imagery or per-pixel residuals.',
          'ball':ball,'pendulum':pendulum,'captionBounds':captions,'coinCenters':coins}
output=ROOT/'projects/minimalist-priceless/src/motion.json'
output.write_text(json.dumps(result,separators=(',',':'))+'\n')
print(f'Wrote measured geometric tracks to {output}')
for frame in [90,210,240,300,330,420,480]:print(frame,'caption',captions[frame])
