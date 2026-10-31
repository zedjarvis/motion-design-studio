import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {clickPulse,clickScale,HOTSPOTS,type CursorClick,type CursorKind} from './motion';

/** Studio-authored glyphs. Coordinates are the ACTIVE HOTSPOT, never the SVG
 * top-left. An outer origin anchors tilt/press; the viewBox maps the tip to 0,0. */
export const DemoCursor:React.FC<{x:number;y:number;kind?:CursorKind;height?:number;opacity?:number;tilt?:number;clicks?:CursorClick[];accent?:string;ringColor?:string}>=({x,y,kind='arrow',height=34,opacity=1,tilt=0,clicks=[],accent='#72d9be',ringColor='#087f70'})=>{
  const frame=useCurrentFrame(),{fps,width,height:filmHeight}=useVideoConfig();
  const hotspot=HOTSPOTS[kind],press=clickScale(frame,clicks,fps);
  return <div data-cursor-layer style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:1000,overflow:'visible'}}>
    <svg data-click-effects width={width} height={filmHeight} style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
      {clicks.map(event=>{const pulse=clickPulse(frame,event,fps);return pulse.visible&&<g key={event.frame} data-click-frame={event.frame} data-click-x={event.x} data-click-y={event.y} opacity={pulse.opacity}>
        <circle cx={event.x} cy={event.y} r={pulse.radius} fill={accent} fillOpacity={.11}/>
        <circle cx={event.x} cy={event.y} r={pulse.radius} fill="none" stroke="#ffffff" strokeWidth={4.5} opacity={.75}/>
        <circle cx={event.x} cy={event.y} r={pulse.radius} fill="none" stroke={ringColor} strokeWidth={2}/>
        <circle cx={event.x} cy={event.y} r={Math.max(2,pulse.radius*.56)} fill="none" stroke={accent} strokeWidth={1.5} opacity={.6}/>
      </g>;})}
    </svg>
    <div data-cursor-anchor data-cursor-kind={kind} style={{position:'absolute',left:x,top:y,width:0,height:0,opacity,transform:`rotate(${tilt}deg) scale(${press})`,transformOrigin:'0 0',overflow:'visible'}}>
      <svg data-cursor-icon data-hotspot-x={hotspot.x} data-hotspot-y={hotspot.y} width={height*40/48} height={height} viewBox={`${hotspot.x} ${hotspot.y} 40 48`} preserveAspectRatio="none" style={{position:'absolute',left:0,top:0,overflow:'visible',filter:'drop-shadow(0 1.5px 1.5px #00000055)'}} aria-hidden="true">
        {kind==='arrow'&&<path d="M5 4L5.7 29.4L12.3 23L17.9 35.1L23.3 32.5L17.6 20.9L27.2 20.5Z" fill="#18191b" stroke="white" strokeWidth={1.8} strokeLinejoin="round"/>}
        {kind==='hand'&&<g fill="#fff" stroke="#202226" strokeWidth={1.65} strokeLinejoin="round" strokeLinecap="round">
          <path d="M14 22V8C14 4 19 4 19 8V18C19 15 24 15 24 19V21C24 18 29 18 29 22V24C29 21 34 22 34 25V31C34 39 29 43 23 43H20C17 43 14 40 12 37L6 28C4 25 7 22 10 24L14 27Z"/>
          <path d="M19 19V27M24 22V29M29 25V30" fill="none"/>
        </g>}
        {kind==='touch'&&<><circle cx="20" cy="24" r="13" fill="#fff" fillOpacity={.72} stroke="#25282c" strokeWidth={1.7}/><circle cx="20" cy="24" r="3" fill={ringColor}/></>}
      </svg>
    </div>
  </div>;
};
