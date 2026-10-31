import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useVideoConfig} from 'remotion';

export type GaussianField = readonly [cx: number, cy: number, sx: number, sy: number, r: number, g: number, b: number];
type Props = {base: number; fields: readonly GaussianField[]; dotSpacing?: number};
const cache = new Map<string, ImageData>();

/** Editable analytic fields, computed locally. No reference image or residual is used. */
export const AnalyticBackdrop: React.FC<Props> = ({base, fields, dotSpacing = 0}) => {
  const {width, height} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender('Paint analytic backdrop'));
  useLayoutEffect(() => {
    const key = JSON.stringify([width, height, base, fields, dotSpacing]);
    let data = cache.get(key);
    if (!data) {
      data = new ImageData(width, height);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        let r = base, g = base, b = base;
        for (const [cx, cy, sx, sy, dr, dg, db] of fields) {
          const energy = Math.exp(-.5 * (((x-cx)/sx)**2 + ((y-cy)/sy)**2));
          r += dr * energy; g += dg * energy; b += db * energy;
        }
        const dot = dotSpacing ? Math.max(0, 1.5 - Math.hypot(x % dotSpacing - (dotSpacing-1)/2, y % dotSpacing - (dotSpacing-1)/2)) * .14 : 0;
        const pixel = (y*width+x)*4;
        data.data[pixel] = r*(1-dot); data.data[pixel+1] = g*(1-dot);
        data.data[pixel+2] = b*(1-dot); data.data[pixel+3] = 255;
      }
      cache.set(key, data);
    }
    ref.current?.getContext('2d')?.putImageData(data, 0, 0);
    continueRender(handle);
  }, [base, dotSpacing, fields, handle, height, width]);
  return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0}}/>;
};
