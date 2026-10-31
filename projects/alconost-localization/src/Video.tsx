import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '../../../studio/shared/fonts';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
import {AnalyticBackdrop} from '../../../studio/shared/AnalyticBackdrop';
import manualMotion from './manual-motion.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BLUE = '#007aff';

const Background: React.FC = () => <AnalyticBackdrop base={251.259} dotSpacing={34} fields={[
  [457.224,608.327,157.396,142.686,-34.935,-21.992,.014],
  [326.863,1549.384,126.311,125.349,-28.083,-17.888,1.126],
  [702.763,1316.485,150.606,140.621,-.712,-17.329,-33.151],
]}/>;

const Heading: React.FC<{children: React.ReactNode}> = ({children}) => <Interactive.Div name="Scene heading" style={{position: 'absolute', left: 80, top: 341, width: 920, fontSize: 72, fontWeight: 700, letterSpacing: -1.6, lineHeight: '88px', textAlign: 'center', color: '#202020'}}>{children}</Interactive.Div>;

const FileWindow: React.FC<{missing?: boolean}> = ({missing = false}) => {
  const frame=useCurrentFrame();
  const [dx,dy,angle]=missing?manualMotion.shake[Math.min(frame,manualMotion.shake.length-1)]:[0,0,0];
  return <div style={{position: 'absolute', left: missing ? 470 : 290, top: missing ? 720 : 570, translate:`${dx}px ${dy}px`, width: 320, height: 190, background: '#fff', border: missing ? '1px solid #ff4545' : '1px solid rgba(230,230,230,.3)', borderRadius: 12, rotate: missing ? `${8+angle}deg` : '-6deg', boxShadow: '0 15px 40px rgba(72,80,100,.06)', overflow: 'hidden'}}>
    <div style={{height: 49, borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6}}>
      <div style={{width: 10, height: 10, borderRadius: '50%', background: '#ff6057'}}/>
      <div style={{width: 10, height: 10, borderRadius: '50%', background: '#ffbd2d'}}/>
      <div style={{width: 10, height: 10, borderRadius: '50%', background: '#28c840'}}/>
      <span style={{marginLeft: 'auto', color: missing ? '#ff4141' : '#999', fontSize: 20, fontWeight: 600}}>{missing ? 'de.json' : 'en.json'}</span>
    </div>
    <div style={{fontFamily: 'Studio Mono', fontSize: 21, margin: '14px 17px', whiteSpace: 'nowrap', opacity: missing ? .45 : 1}}>
      <span style={{color: '#007aff'}}>&quot;welcome&quot;</span><span>: </span><span style={{color: '#ff8a00'}}>{missing ? '""' : '"Hello!"'}</span>
    </div>
    {missing ? <div style={{position: 'absolute', right: 16, bottom: 16, padding: '3px 10px', borderRadius: 5, background: '#ff3d38', color: 'white', fontSize: 26, fontWeight: 600, lineHeight: '33px'}}>⊙Missing</div> : null}
  </div>;
};

const Manual: React.FC = () => {
  const frame = useCurrentFrame();
  return <>
    <Heading>Manual Localization?</Heading>
    <Interactive.Div name="Translation files" style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [110, 124], [1, .05], clamp)}}>
      <FileWindow/>
      <FileWindow missing/>
    </Interactive.Div>
  </>;
};

const Language: React.FC<{children: string; color: string; left: number; top: number}> = ({children, color, left, top}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left, top: top + interpolate(frame, [0, 10], [14, 0], clamp), opacity: interpolate(frame, [0, 9], [0, 1], clamp), background: 'rgba(255,255,255,.95)', borderRadius: 36, padding: '13px 24px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 500, boxShadow: '0 0 15px rgba(255,255,255,.5)'}}>
    <span style={{width: 17, height: 17, border: `2px solid ${color}`, borderRadius: '50%', background: color === '#ec5157' ? '#f5d14a' : color, boxSizing: 'border-box'}}/>{children}
  </div>;
};

const Sync: React.FC = () => {
  const frame = useCurrentFrame();
  return <>
    <Heading>Continuous Sync</Heading>
    <Interactive.Div name="Continuous API diagram" style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [101, 112], [1, .05], clamp)}}>
      <div style={{position: 'absolute', left: 158, top: 739, width: 766, height: 10, borderRadius: 8, background: 'rgba(49,112,255,.09)'}}/>
      <div style={{position: 'absolute', left: 158, top: 739, width: 766, height: 10, borderRadius: 8, background: BLUE, scale: `${interpolate(frame, [0, 64], [0, 1], clamp)} 1`, transformOrigin: 'left center'}}/>
      <Sequence name="Spanish language" from={22} durationInFrames={91} layout="none"><Language left={270} top={622} color="#ec5157">Spanish</Language></Sequence>
      <Sequence name="German language" from={44} durationInFrames={69} layout="none"><Language left={601} top={622} color="#333333">German</Language></Sequence>
      <Sequence name="French language" from={73} durationInFrames={40} layout="none"><Language left={331} top={801} color="#4376d8">French</Language></Sequence>
      <Sequence name="Japanese language" from={91} durationInFrames={22} layout="none"><Language left={596} top={801} color="#eb777c">Japanese</Language></Sequence>
      <div style={{position: 'absolute', left: 474, top: 678, width: 132, height: 132, border: `10px solid ${BLUE}`, borderRadius: '50%', background: 'white', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, fontSize: 34, fontWeight: 700, boxShadow: '0 0 50px rgba(0,122,255,.13)'}}>API</div>
    </Interactive.Div>
  </>;
};

const CheckRow: React.FC<{children: string; top: number}> = ({children, top}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: 132, top, width: 816, height: 94, borderRadius: 14, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 30px', boxSizing: 'border-box', fontSize: 36, fontWeight: 600, opacity: interpolate(frame, [0, 10], [0, 1], clamp), translate: `${interpolate(frame, [0, 10], [35, 0], clamp)}px 0px`}}>
    <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill={BLUE}/><path d="m16 24 6 6 12-12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
    {children}
  </div>;
};

const Global: React.FC = () => {
  const frame = useCurrentFrame();
  return <>
    <Heading>Global in 1 Week</Heading>
    <Interactive.Div name="Localization checklist" style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [136, 149], [1, .04], clamp)}}>
      <Sequence name="120 languages" from={12} durationInFrames={138} layout="none"><CheckRow top={554}>120+ Languages</CheckRow></Sequence>
      <Sequence name="API synchronization" from={44} durationInFrames={106} layout="none"><CheckRow top={699}>Continuous API Sync</CheckRow></Sequence>
      <Sequence name="Native translators" from={70} durationInFrames={80} layout="none"><CheckRow top={844}>Native Translators</CheckRow></Sequence>
    </Interactive.Div>
  </>;
};

const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  return <>
    <Heading>Start Scaling Today</Heading>
    <Interactive.Div name="Localization health dashboard" style={{position: 'absolute', left: 150, top: 500, width: 780, height: 350, borderRadius: 24, background: 'rgba(255,255,255,.94)', border: '1px solid rgba(160,180,255,.14)', boxShadow: '0 12px 22px rgba(120,140,190,.05)', opacity: interpolate(frame, [0, 12], [0, 1], clamp)}}>
      <div style={{position: 'absolute', left: 28, top: 30, fontSize: 34, fontWeight: 700}}>Localization Health</div>
      <div style={{position: 'absolute', right: 28, top: 27, padding: '5px 16px', color: BLUE, background: '#edf4ff', borderRadius: 24, fontSize: 30, fontWeight: 600}}>Sync Active</div>
      <div style={{position: 'absolute', left: 28, right: 28, top: 92, height: 1, background: '#f0f0f0'}}/>
      <div style={{position: 'absolute', left: 28, top: 220}}><div style={{fontSize: 52, fontWeight: 700, lineHeight: '63px', color: BLUE}}>120+</div><div style={{fontSize: 28, color: '#737780'}}>Languages</div></div>
      <div style={{position: 'absolute', left: 318, top: 220}}><div style={{fontSize: 52, fontWeight: 700, lineHeight: '63px', color: BLUE}}>15M+</div><div style={{fontSize: 28, color: '#737780'}}>Words Done</div></div>
      <svg width="132" height="120" viewBox="0 0 132 120" style={{position: 'absolute', right: 26, bottom: 29}}>
        <defs><linearGradient id="al-chart" x1="0" y1="0" x2="0" y2="1"><stop stopColor={BLUE}/><stop offset="1" stopColor="#5ea1fc"/></linearGradient></defs>
        {[40,80,60,100].map((height, index) => {
          const h = height * (.88 + .12 * Math.sin(frame / 9 + index));
          return <rect key={index} x={index * 34} y={120-h} width="24" height={h} rx="6" fill="url(#al-chart)"/>;
        })}
      </svg>
    </Interactive.Div>
    <Interactive.Div name="Get Started button" style={{position: 'absolute', left: 150, top: 910, width: 780, height: 80, borderRadius: 12, background: '#ff9200', boxShadow: '0 10px 23px rgba(255,146,0,.18)', color: 'white', fontSize: 36, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: interpolate(frame, [0, 12], [0, 1], clamp)}}>Get Started</Interactive.Div>
  </>;
};

const Subtitle: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return <Interactive.Div name="Supporting line" style={{position: 'absolute', top: 1060, left: 80, width: 920, textAlign: 'center', color: '#202020', fontSize: 40, fontWeight: 600, letterSpacing: 0, lineHeight: '50px', opacity: interpolate(frame, [0, 4], [0, 1], clamp)}}>{children}</Interactive.Div>;
};

export const AlconostLocalization: React.FC = () => <AbsoluteFill style={{fontFamily: 'Studio Inter', color: '#202020'}}>
  <Background/>
  <Img src={staticFile('alconost-localization/alconost-logo.svg')} style={{position: 'absolute', left: 430, top: 290, width: 220, height: 38.37}}/>
  <Sequence name="Manual localization" durationInFrames={125}><Manual/></Sequence>
  <Sequence name="Continuous synchronization" from={125} durationInFrames={113}><Sync/></Sequence>
  <Sequence name="Global in one week" from={238} durationInFrames={150}><Global/></Sequence>
  <Sequence name="Localization health and CTA" from={388} durationInFrames={102}><Dashboard/></Sequence>
  <Sequence name="Ready to scale" from={15} durationInFrames={53} layout="none"><Subtitle>Ready to scale your SaaS globally,</Subtitle></Sequence>
  <Sequence name="Managing translation files" from={68} durationInFrames={52} layout="none"><Subtitle>but stuck managing translation files?</Subtitle></Sequence>
  <Sequence name="Meet Alconost" from={127} durationInFrames={27} layout="none"><Subtitle>Meet Alconost.</Subtitle></Sequence>
  <Sequence name="Professional localization" from={154} durationInFrames={38} layout="none"><Subtitle>Professional localization built</Subtitle></Sequence>
  <Sequence name="Modern workflows" from={192} durationInFrames={43} layout="none"><Subtitle>for modern software workflows.</Subtitle></Sequence>
  <Sequence name="Integrations and sync" from={240} durationInFrames={55} layout="none"><Subtitle>Direct integrations, continuous sync,</Subtitle></Sequence>
  <Sequence name="Native translator support" from={295} durationInFrames={35} layout="none"><Subtitle>and native translators.</Subtitle></Sequence>
  <Sequence name="Adapt your product" from={330} durationInFrames={55} layout="none"><Subtitle>We adapt your product, not just the text.</Subtitle></Sequence>
  <Sequence name="Global with confidence" from={393} durationInFrames={36} layout="none"><Subtitle>Go global with confidence.</Subtitle></Sequence>
  <Sequence name="Start today" from={430} durationInFrames={55} layout="none"><Subtitle>Start today at Alconost.com.</Subtitle></Sequence>
  <Interactive.Div name="Website" style={{position: 'absolute', left: 0, top: 1188, width: 1080, textAlign: 'center', fontSize: 30, fontWeight: 700, color: BLUE, letterSpacing: -.8, lineHeight: '40px'}}>alconost.com</Interactive.Div>
  <Soundtrack project="alconost-localization" voiceover/>
</AbsoluteFill>;
