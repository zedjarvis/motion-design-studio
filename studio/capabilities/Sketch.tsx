import React,{useMemo} from 'react';
import rough from 'roughjs';
import {interpolate,useCurrentFrame} from 'remotion';

/** Stable Rough.js geometry. Only the reveal changes with time. */
export const Sketch:React.FC<{width:number;height:number;shape?:'rect'|'ellipse'|'line';seed?:number;color?:string;from?:number;style?:React.CSSProperties}>=({width,height,shape='rect',seed=931,color='#72d9be',from=0,style})=>{
  const frame=useCurrentFrame();
  const paths=useMemo(()=>{
    const generator=rough.generator(),opts={seed,roughness:1.1,stroke:color,strokeWidth:3.2,disableMultiStroke:false,preserveVertices:true};
    const drawing=shape==='ellipse'?generator.ellipse(width/2,height/2,width-12,height-12,opts):shape==='line'?generator.line(5,height/2,width-5,height/2,opts):generator.rectangle(6,6,width-12,height-12,opts);
    return generator.toPaths(drawing);
  },[width,height,shape,seed,color]);
  return <svg width={width} height={height} style={{overflow:'visible',...style}} aria-hidden="true">
    {paths.map((path,i)=><path key={i} d={path.d} fill={path.fill??'none'} stroke={path.stroke} strokeWidth={path.strokeWidth} pathLength={1} strokeDasharray="1" strokeDashoffset={interpolate(frame,[from,from+22],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>)}
  </svg>;
};
