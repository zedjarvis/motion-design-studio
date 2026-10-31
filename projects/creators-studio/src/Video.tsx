import React from 'react';
import {AbsoluteFill, Interactive, interpolate, Sequence, useCurrentFrame} from 'remotion';
import '../../../studio/shared/fonts';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
import motion from './motion.json';

const BLUE = '#001168';
const at = (track: {from: number; positions: number[]}, frame: number) => track.positions[Math.max(0, Math.min(track.positions.length-1, frame-track.from))];

const BrandPlane: React.FC<{clip?: string; top?: number}> = ({clip, top = 0}) => <div style={{position: 'absolute', left: 0, top, width: 556, height: 314, overflow: 'hidden', clipPath: clip, background: 'linear-gradient(112deg, #efdce9 0%, #a878ba 17%, #4b4097 42%, #191625 72%)'}}>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 330px 130px at 360px -20px, rgba(55,56,171,.85), transparent 100%)'}}/>
  <svg width="556" height="314" style={{position: 'absolute', inset: 0, opacity: .16, mixBlendMode: 'soft-light'}}>
    <filter id="creators-grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="17" stitchTiles="stitch"/></filter>
    <rect width="556" height="314" filter="url(#creators-grain)"/>
  </svg>
  <div style={{position: 'absolute', left: 154, top: 89, scale: '1.5 1', transformOrigin: 'left top', color: 'white', fontFamily: 'Studio Inter', fontWeight: 800}}>
    <div style={{fontSize: 42, lineHeight: '44px', scale: '.92 1', transformOrigin: 'left', color: 'transparent', WebkitTextStroke: '.7px rgba(255,255,255,.82)'}}>the</div>
    <div style={{fontSize: 34, lineHeight: '28px', letterSpacing: -.7, color: '#fff', textShadow: '1px 2px 1px #080913'}}>CREATORS</div>
    <div style={{fontSize: 35, lineHeight: '35px', letterSpacing: -.8, color: 'transparent', WebkitTextStroke: '.7px rgba(255,255,255,.82)'}}>STUDIO<span style={{color: '#fff', WebkitTextStroke: '0'}}>.</span></div>
  </div>
</div>;

const Camera: React.FC<{x: number; y: number; angle: number; lens?: boolean}> = ({x, y, angle, lens = true}) => <div style={{position: 'absolute', left: x, top: y, rotate: `${angle}deg`, transformOrigin: '0 0'}}>
  <svg width="45" height="50" viewBox="-16 -25 45 50" style={{position: 'absolute', left: -16, top: -25, overflow: 'visible'}}>
    <rect x="-12.5" y="-20" width="25" height="40" rx="6" fill="#030403"/>
    {lens ? <rect x="14" y="-12" width="12" height="24" rx="5" fill="#030403"/> : null}
  </svg>
</div>;

const CameraSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const [x, y, rawAngle] = motion.camera[Math.min(frame, motion.camera.length-1)];
  const angle = rawAngle;
  const rays = motion.beamRays[frame];
  const tip = rays ? [rays[0],rays[1]] : [x,y];
  const detached = motion.detachedLens[frame];
  const a = (rays?.[2]??angle)*Math.PI/180, b = (rays?.[3]??angle)*Math.PI/180;
  const clip = `polygon(${tip[0]}px ${tip[1]}px, ${tip[0]+Math.cos(a)*1600}px ${tip[1]+Math.sin(a)*1600}px, ${tip[0]+Math.cos(b)*1600}px ${tip[1]+Math.sin(b)*1600}px)`;
  return <>
    {rays ? <BrandPlane clip={clip}/> : null}
    <Camera x={x} y={y} angle={angle} lens={frame>=108}/>
    {detached ? <div style={{position:'absolute',left:detached[0],top:detached[1],translate:'-50% -50%',width:detached[2],height:detached[3],borderRadius:'0 0 10px 10px',background:'#030403'}}/> : null}
  </>;
};

const Word: React.FC<{children: string; color: string}> = ({children, color}) => <div style={{position: 'absolute', left: 0, top: 138, width: 556, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, letterSpacing: -.7, color, scale: '1.15 1'}}>{children}</div>;

const FirstWipe: React.FC = () => {
  const local = useCurrentFrame(), frame = local+288;
  const left = Math.max(0, at(motion.firstWipe,frame)-1);
  return <><div style={{position:'absolute',left,top:0,width:556,height:314,background:BLUE}}><Word color="white">THE</Word></div><Camera x={left-25} y={156} angle={0}/></>;
};

const SecondWipe: React.FC = () => {
  const frame = useCurrentFrame()+326;
  const top = at(motion.secondWipe,frame);
  return <>
    <div style={{position:'absolute',left:0,top,width:556,height:314,background:BLUE}}><Word color="white">THE</Word></div>
    <div style={{position:'absolute',left:0,top:top-314,width:556,height:314,background:'#fff'}}><Word color="#030403">CREATORS</Word></div>
  </>;
};

const ThirdWipe: React.FC = () => {
  const frame = useCurrentFrame()+370;
  const edge = at(motion.thirdWipe,frame);
  return <>
    <div style={{position:'absolute',left:edge,top:0,width:556,height:314,background:'#fff'}}><Word color="#030403">CREATORS</Word></div>
    <div style={{position:'absolute',left:edge-556,top:0,width:556,height:314,background:BLUE}}><Word color="white">STUDIO</Word></div>
  </>;
};

const FinalDrop: React.FC = () => {
  const frame = useCurrentFrame()+406;
  const edge=at(motion.finalDrop,frame);
  return <><div style={{position:'absolute',left:0,top:edge,width:556,height:314,background:BLUE}}><Word color="white">STUDIO</Word></div><BrandPlane top={edge-314}/></>;
};

export const CreatorsStudio: React.FC = () => <AbsoluteFill style={{background:'#999d99',fontFamily:'Studio Inter'}}>
  <Interactive.Div name="Artwork panel" style={{position:'absolute',inset:0,background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'inset 0 0 0 1px rgba(0,0,0,.25)'}}>
    <Sequence name="Camera assembly and searchlight" durationInFrames={288}><CameraSearch/></Sequence>
    <Sequence name="THE reveal" from={288} durationInFrames={38}><FirstWipe/></Sequence>
    <Sequence name="CREATORS reveal" from={326} durationInFrames={44}><SecondWipe/></Sequence>
    <Sequence name="STUDIO reveal" from={370} durationInFrames={36}><ThirdWipe/></Sequence>
    <Sequence name="Final brand lockup" from={406} durationInFrames={116}><FinalDrop/></Sequence>
  </Interactive.Div>
  <Soundtrack project="creators-studio"/>
</AbsoluteFill>;
