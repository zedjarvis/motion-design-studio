import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '../../../studio/shared/fonts';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
import motion from './motion.json';
import land from './land.json';

const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

const Signature: React.FC = () => {
  const frame = useCurrentFrame();
  if(frame>60)return <Img src={staticFile('minimalist-priceless/signature-authored.png')} style={{position:'absolute',left:0,top:0,width:445,height:116}}/>;
  return <Interactive.Div name="Parto Motion signature" style={{position:'absolute',left:0,top:0,width:445,height:116,opacity:interpolate(frame,[5,60],[0,1],clamp)}}>
    <svg width="445" height="116" viewBox="0 0 445 116">
      <circle cx="31" cy="36" r="10" fill="none" stroke="#ededed" strokeWidth="1"/>
      <circle cx="31" cy="36" r="4.5" fill="#eee"/>
      <path d="M31 36 78 83H439" stroke="#aaa" strokeWidth="2" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={interpolate(frame,[5,50],[1,0],clamp)}/>
      <text x="90" y="76" fill="#eee" fontFamily="Studio Inter" fontSize="27" fontWeight="300" letterSpacing="-.7" textLength="199" lengthAdjust="spacingAndGlyphs">PARTO MOTION</text>
      <text x="203" y="101" fill="#dedede" fontFamily="Studio Inter" fontSize="15" letterSpacing="6.5">Art &amp; Creativity</text>
      <path d="m409 78-4 5 4 5m5-10-4 5 4 5m5-10-4 5 4 5m5-10-4 5 4 5" stroke="#eee" strokeWidth="1.4" fill="none"/>
      <path d="M429 78H439V88H429Z" fill="#eee"/>
    </svg>
  </Interactive.Div>;
};

const Sphere: React.FC<{x:number;y:number;r:number;glow?:boolean;face?:boolean}> = ({x,y,r,glow=true,face=false}) => {
  const frame=useCurrentFrame();
  const turn=face?interpolate(frame,[198,214,225],[35,0,-95],clamp):0;
  return <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={face||!glow?'#eeebeb':'#fff'} style={glow?{filter:'drop-shadow(0 0 13px rgba(255,255,255,.72))'}:undefined}/>
    {face&&frame<230?<g transform={`rotate(${turn})`}>
      <circle cx={-r*.45} cy={r*.16} r={r*.115} fill="#050505"/>
      <circle cx={r*.22} cy={r*.28} r={r*.11} fill="#050505"/>
      <path d={`M${-r*.48},${r*.5} Q${-r*.18},${r*.92} ${r*.32},${r*.55} Q${r*.02},${r*.32} ${-r*.48},${r*.5}`} fill="#050505"/>
    </g>:null}
  </g>;
};

const CoinStack: React.FC = () => {
  const frame=useCurrentFrame();
  const measured=motion.coinCenters[frame];
  const x=measured?measured[0]-5:540;
  return <svg width="1080" height="1920" style={{position:'absolute',inset:0,overflow:'hidden'}}>
    <defs><filter id="coin-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
    {[0,1,2,3,4,5].map(index=>{
      const appear=interpolate(frame,[36+index*3,61+index*3],[0,1],clamp);
      const y=1091-index*17-300*(1-appear)**2 + (index===5?Math.sin(frame*.1)*18:0);
      const rx=54, ry=15+Math.sin(frame*.13+index)*3;
      return <g key={index} opacity={appear} transform={`translate(${x+Math.sin(index+frame*.05)*4} ${y}) rotate(${Math.sin(frame*.08+index)*8})`}>
        <ellipse rx={rx} ry={ry} fill="rgba(255,255,255,.06)" stroke="#eee" strokeWidth="2" filter="url(#coin-glow)"/>
        <ellipse rx={rx} ry={ry} fill="#080808" fillOpacity=".4" stroke="#eee" strokeWidth="1.5"/>
        <ellipse rx="44" ry={Math.max(8,ry-4)} fill="none" stroke="#eee" strokeWidth="1"/>
        <text x="0" y="6" textAnchor="middle" fill="#fff" fontFamily="Studio Inter" fontSize="22" transform="scale(1 .6)">$</text>
      </g>;
    })}
  </svg>;
};

const PointAndFace: React.FC = () => {
  const frame=useCurrentFrame();
  const point=motion.ball[frame];
  if(!point)return null;
  const [x,y,radius]=point;
  const face=frame>=188&&frame<258;
  return <svg width="1080" height="1920" style={{position:'absolute',inset:0}}>
    {frame<40?<path d={`M${x} ${y}v${interpolate(frame,[8,30,40],[0,350,0],clamp)}`} stroke="#ddd" strokeWidth="1" opacity=".55"/>:null}
    {frame>=160&&frame<190?<path d={`M${x-380} ${y-240}Q${x-200} ${y-210} ${x} ${y}`} fill="none" stroke="#aaa" strokeWidth="1.2" opacity=".7"/>:null}
    <Sphere x={x} y={y} r={face?radius:Math.max(18,radius)} glow={!face} face={face}/>
  </svg>;
};

const Pendulum: React.FC = () => {
  const frame=useCurrentFrame();
  const circles=motion.pendulum[frame];
  const offset=frame>367?interpolate(frame,[367,377,397],[0,-142,-760],clamp):0;
  return <svg width="1080" height="1920" style={{position:'absolute',inset:0,overflow:'hidden'}}>
    <defs><filter id="pendulum-string-glow" x="-100%" y="-10%" width="300%" height="120%"><feGaussianBlur stdDeviation="2"/><feComponentTransfer><feFuncA type="linear" slope=".6"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {circles.map(([x,y,radius],index)=>{
      const pan=circles.length===5?circles.slice(1,4).map((circle,i)=>circle[0]-[473,540,607][i]).sort((a,b)=>a-b)[1]:offset;
      const pivot=circles.length===5?[406,473,540,607,674][index]+pan:x;
      const length=interpolate(frame,[274+index*3,307+index*3],[0,1],clamp);
      const distance=Math.hypot(x-pivot,y);
      const fraction=Math.max(0,distance-Math.min(35,radius))/Math.max(1,distance)*length;
      const moving=Math.abs(x-pivot)>2||Math.abs(y-936)>15;
      return <g key={index}>
        <line x1={pivot} y1={0} x2={pivot+(x-pivot)*fraction} y2={y*fraction} stroke={moving?'#fff':'#eee'} strokeWidth={moving?2.15:1.4} strokeLinecap="round" shapeRendering="geometricPrecision" filter={moving?'url(#pendulum-string-glow)':undefined}/>
        <Sphere x={x} y={y} r={Math.min(35,radius)} glow={Math.abs(y-936)>15}/>
      </g>;
    })}
  </svg>;
};

const Globe: React.FC = () => {
  const frame=useCurrentFrame();
  const longitude=(-90+(frame-420)*2)*Math.PI/180;
  const latitude=15*Math.PI/180;
  const centerX=interpolate(frame,[397,414,428],[1250,590,540],clamp);
  const radius=82;
  const outlines=land.map(ring=>{
    let d='',visible=false;
    for(const [lon,lat] of ring){
      const a=lon*Math.PI/180-longitude,b=lat*Math.PI/180;
      const x=Math.cos(b)*Math.sin(a);
      const y=Math.cos(latitude)*Math.sin(b)-Math.sin(latitude)*Math.cos(b)*Math.cos(a);
      const z=Math.sin(latitude)*Math.sin(b)+Math.cos(latitude)*Math.cos(b)*Math.cos(a);
      if(z>0){d+=`${visible?'L':'M'}${(x*radius).toFixed(2)},${(-y*radius).toFixed(2)}`;visible=true;}else visible=false;
    }
    return d;
  });
  return <svg width="1080" height="1920" style={{position:'absolute',inset:0}}>
    <defs><filter id="earth-haze"><feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="3" seed="21"/><feColorMatrix type="saturate" values="0"/></filter><clipPath id="earth-disk"><circle r={radius}/></clipPath></defs>
    <g transform={`translate(${centerX} 955)`} style={{filter:'drop-shadow(0 0 12px rgba(255,255,255,.24))'}}>
      <circle r={radius} fill="#050505" stroke="#eee" strokeWidth="1.8"/>
      <g clipPath="url(#earth-disk)"><rect x={-radius} y={-radius} width={radius*2} height={radius*2} filter="url(#earth-haze)" opacity=".13"/>{outlines.map((d,index)=><path key={index} d={d} stroke="#eee" strokeWidth="1.15" strokeLinejoin="round" fill="none"/>)}</g>
    </g>
  </svg>;
};

const Caption: React.FC = () => {
  const frame=useCurrentFrame();
  const bounds=motion.captionBounds[frame];
  if(!bounds)return null;
  const [x,y,w,h]=bounds;
  const phase=frame<165?0:frame<270?1:frame<397?2:3;
  const text=["You know what's priceless?",'smile','sleeping peacefully','And the beauty of nature.'][phase];
  const full=[667,121,479,570][phase];
  const revealed=Math.min(full,w+3);
  return <svg width="1080" height="1920" style={{position:'absolute',inset:0,overflow:'hidden'}}>
    <defs><clipPath id="minimal-line-reveal"><rect x={x-3} y={y-15} width={revealed+7} height="100"/></clipPath></defs>
    <text x={x} y={y+Math.min(h,44)} fill="#eeebeb" fontFamily="Studio Bodoni" fontSize={phase===3?48:52} textLength={full} lengthAdjust="spacingAndGlyphs" clipPath="url(#minimal-line-reveal)">{text}</text>
  </svg>;
};

export const MinimalistPriceless: React.FC = () => <AbsoluteFill style={{background:'#000',overflow:'hidden'}}>
  <Signature/>
  <Sequence name="Coin stack" durationInFrames={174}><CoinStack/></Sequence>
  <Sequence name="Point and smile" durationInFrames={275}><PointAndFace/></Sequence>
  <Sequence name="Pendulum motion" from={274} durationInFrames={123} layout="none"><PendulumGlobal/></Sequence>
  <Sequence name="Natural world" from={397} durationInFrames={138} layout="none"><GlobeGlobal/></Sequence>
  <Caption/>
  <Soundtrack project="minimalist-priceless" voiceover/>
</AbsoluteFill>;

// Scene-local Remotion coordinates are translated explicitly back to their
// authored frame space, keeping the recovered geometric tracks seekable.
const PendulumGlobal: React.FC=()=> <Sequence from={-274} layout="none"><Pendulum/></Sequence>;
const GlobeGlobal: React.FC=()=> <Sequence from={-397} layout="none"><Globe/></Sequence>;
