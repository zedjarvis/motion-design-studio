import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '../../../studio/shared/fonts';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
import {measuredCurve} from '../../../studio/shared/measuredCurve';

const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const FRAMES=[0,12,24,36,48,60,72,96,120,144,168,192,216,228,281,288,300,312,336,350,363];
// Frame, center x/y, projected width/height and in-plane orientation are
// measurable scene parameters. The UI beneath this rig remains editable.
const X=[-170,429.49,433.77,435.29,436.15,444,444,444,444,444,444,444,444,444,444,444,450,453.87,454.15,467.72,680];
const Y=[2200,1170.15,1062.3,1018.21,993.27,990,1100,1100,960,960,955,960,960,960,960,960,980,980.32,956.63,877.74,-590];
const WIDTH=[1050,389.76,379.34,414.1,501.12,840,1030,1030,784,662,618,650,1400,1600,1600,881,670,639.32,632.36,632.46,632];
const HEIGHT=[2300,927.83,828.27,883.98,1064.72,1830,2230,2230,1680,1428,1310,1380,3000,3400,3400,1902,1410,1360.7,1357.09,1354.18,1354];
const ANGLE=[-28,-14.68,-9.08,-5.17,-2.6,0,0,0,0,0,0,-2,-72,-90,0,0,3,4.66,6.46,6.47,6.5];
const val=(frame:number,values:number[])=>measuredCurve(frame,FRAMES,values);

const Wallpaper: React.FC = () => <svg width="390" height="844" viewBox="0 0 390 844" style={{position:'absolute',inset:0}}>
  <defs>
    <linearGradient id="phone-base" x1="0" y1="0" x2=".5" y2="1"><stop stopColor="#173251"/><stop offset=".5" stopColor="#080b12"/><stop offset="1" stopColor="#050104"/></linearGradient>
    <radialGradient id="phone-blue" cx=".16" cy=".34" r=".91"><stop stopColor="#4c94d1"/><stop offset=".18" stopColor="#285783"/><stop offset=".75" stopColor="#112336"/><stop offset="1" stopColor="#050708"/></radialGradient>
    <radialGradient id="phone-pink" cx=".14" cy=".1" r=".94"><stop stopColor="#ffa2cc"/><stop offset=".1" stopColor="#cf326f"/><stop offset=".45" stopColor="#701335"/><stop offset=".78" stopColor="#220912"/><stop offset="1" stopColor="#090408"/></radialGradient>
    <linearGradient id="phone-edge" x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#b1d6f7" stopOpacity=".2"/><stop offset=".75" stopColor="#4a80ab"/><stop offset="1" stopColor="#dce3ed"/></linearGradient>
  </defs>
  <rect width="390" height="844" fill="url(#phone-base)"/>
  <ellipse cx="111" cy="642" rx="380" ry="267" fill="#4a0a26" transform="rotate(48 111 642)"/>
  <ellipse cx="370" cy="170" rx="315" ry="411" fill="url(#phone-blue)"/>
  <ellipse cx="247" cy="445" rx="67" ry="199" fill="url(#phone-edge)" transform="rotate(-44 247 445)"/>
  <ellipse cx="238" cy="431" rx="66" ry="192" fill="url(#phone-pink)" transform="rotate(-44 238 431)"/>
  <path d="M0 360Q90 336 150 400" stroke="#f3a5ce" strokeWidth="2" fill="none" opacity=".45"/>
</svg>;

const Cloud: React.FC=()=> <svg width="105" height="65" viewBox="0 0 105 65"><path d="M20 59a16 16 0 0 1-4-31 24 24 0 0 1 45-12 18 18 0 0 1 30 16 14 14 0 0 1-2 27Z" fill="white"/></svg>;

const Icon: React.FC<{kind:string}> = ({kind}) => {
  const wrap:React.CSSProperties={position:'relative',width:60,height:60,borderRadius:15,overflow:'hidden',boxShadow:'0 2px 4px #0003',display:'flex',alignItems:'center',justifyContent:'center'};
  const background=({calendar:'#fff',photos:'#fff',orbit:'#0b051a',news:'#ee2355',tv:'#030106',clock:'#030106',notes:'#fff',curve:'#fff',camera:'#df3274',message:'#fff',wave:'#0b0204',layers:'#f53378',green:'#4bd65b',books:'#030106',mail:'#fff',menu:'#050b13'} as Record<string,string>)[kind]||'#111';
  return <div style={{...wrap,background}}>
    {kind==='calendar'?<div style={{textAlign:'center'}}><div style={{fontSize:34,lineHeight:'36px',fontWeight:500,color:'#111'}}>3</div><div style={{fontSize:9,color:'#a2355d',fontWeight:700}}>DEC</div></div>:null}
    {kind==='photos'?<svg width="60" height="60"><circle cx="23" cy="24" r="15" fill="#b2336b"/><circle cx="39" cy="39" r="14" fill="#6fd57d"/></svg>:null}
    {kind==='orbit'?<svg width="58" height="58"><circle cx="30" cy="28" r="24" stroke="#a188d7" strokeWidth="2" fill="none"/><circle cx="36" cy="23" r="12" stroke="#a188d7" strokeWidth="2" fill="none"/><circle cx="22" cy="43" r="10" stroke="#a188d7" strokeWidth="2" fill="none"/></svg>:null}
    {kind==='news'?<svg width="60" height="60"><path d="M28 0h15v19l17-9v16L43 37v23H28V45L0 60V43l28-17Z" fill="#b6efd3"/></svg>:null}
    {kind==='tv'?<><div style={{position:'absolute',left:31,top:9,width:23,height:23,borderRadius:'50%',background:'#a78ae0'}}/><span style={{fontSize:38,color:'white',letterSpacing:-4,fontWeight:600,zIndex:1}}>tv</span></>:null}
    {kind==='clock'?<svg width="60" height="60"><circle cx="30" cy="30" r="24" fill="white"/><path d="m17 21 13 12 16-17" fill="none" stroke="#111" strokeWidth="2"/></svg>:null}
    {kind==='notes'?<svg width="60" height="60"><rect width="10" height="60" fill="#f1ec61"/>{Array.from({length:16},(_,i)=><path key={i} d={`M12 ${i*4+1}H60`} stroke="#777" strokeWidth="1"/>)}</svg>:null}
    {kind==='curve'?<svg width="60" height="60"><path d="M0 22Q26 8 33 25T60 15M33 0Q27 29 36 60" fill="none" stroke="#853e62" strokeWidth="2"/></svg>:null}
    {kind==='camera'?<svg width="60" height="60"><circle cx="39" cy="39" r="17" fill="#020b24"/><circle cx="20" cy="21" r="11" fill="#020b24"/><circle cx="10" cy="10" r="4" fill="#020b24"/></svg>:null}
    {kind==='message'?<svg width="60" height="60"><path d="M8 22Q8 10 23 10h12q16 0 16 14v24l-9-5H23Q8 43 8 29Z" fill="#60bf6b"/></svg>:null}
    {kind==='wave'?<svg width="60" height="60"><path d="m10 41 10-16 2 10 10-16 2 13 10-18v27Z" fill="#ec501d"/></svg>:null}
    {kind==='layers'?<svg width="60" height="60"><rect x="13" y="16" width="33" height="33" rx="4" fill="#0b1536" transform="rotate(42 30 30)"/><rect x="13" y="9" width="33" height="33" rx="4" fill="#245b8a" transform="rotate(42 30 30)"/></svg>:null}
    {kind==='green'?<svg width="60" height="60">{Array.from({length:5},(_,i)=><path key={i} d={`M${-20+i*15} 55 35 ${-i*2}`} stroke="#12678e" strokeWidth="5"/>)}</svg>:null}
    {kind==='books'?<svg width="60" height="60"><rect x="12" y="11" width="11" height="40" rx="1" fill="white"/><rect x="25" y="10" width="11" height="40" rx="1" fill="white"/><rect x="38" y="10" width="11" height="40" rx="1" fill="white"/></svg>:null}
    {kind==='mail'?<svg width="60" height="60"><rect x="7" y="12" width="46" height="36" rx="5" fill="#19476c"/><path d="m9 17 21 16 21-16" stroke="white" strokeWidth="2" fill="none"/></svg>:null}
    {kind==='menu'?<svg width="60" height="60">{[14,29,44].map(y=><g key={y}><circle cx="12" cy={y} r="5" fill="white"/><rect x="24" y={y-4} width="29" height="8" rx="3" fill="#0c1826"/></g>)}</svg>:null}
  </div>;
};

const Launcher:React.FC=()=>{
  const frame=useCurrentFrame();
  const launch=interpolate(frame,[5,23],[.08,1],clamp),fly=interpolate(frame,[34,55,65],[0,1,1.8],clamp);
  const icons=[['calendar',198,100],['photos',283,100],['orbit',198,185],['news',283,185],['tv',28,265],['clock',113,265],['notes',198,265],['curve',283,265],['camera',28,350],['message',113,350],['wave',198,350],['layers',283,350],['green',28,435],['books',113,435],['mail',198,435],['menu',283,435]] as const;
  return <div style={{position:'absolute',inset:0,opacity:interpolate(frame,[60,68],[1,0],clamp),scale:launch,transformOrigin:'195px 380px'}}>
    <div style={{position:'absolute',left:28-fly*25,top:100-fly*80,width:145,height:145,borderRadius:20,background:'#020b18',color:'white',textAlign:'center',scale:1+fly*.3}}><div style={{fontSize:42,lineHeight:'58px',paddingTop:8}}>66°</div><Cloud/></div>
    {icons.map(([kind,left,top],i)=><div key={kind} style={{position:'absolute',left:left+fly*((i%4-1.5)*25),top:top+fly*((i%5-2)*40),scale:1+fly*(i%3)*.15,rotate:`${fly*(i%2?6:-6)}deg`}}><Icon kind={kind}/>{kind==='mail'?<div style={{position:'absolute',top:-7,left:17,borderRadius:8,background:'#325b8e',color:'#bde3ff',padding:'0 5px',fontSize:14}}>7777</div>:null}</div>)}
  </div>;
};

const TwobaseMark:React.FC<{size?:number}>=({size=42})=><Img src={staticFile('glassy-phone/twobase-logo.png')} style={{width:size,height:size,objectFit:'contain'}}/>;
const Glass:React.FC<{children:React.ReactNode;top:number;height:number}>=({children,top,height})=><div style={{position:'absolute',left:12,top,width:366,height,borderRadius:20,background:'linear-gradient(115deg,rgba(48,9,30,.7),rgba(53,8,32,.25))',border:'1px solid rgba(255,255,255,.7)',boxShadow:'inset 1px 1px 3px #fff5,inset -6px 0 12px #b8468355,0 8px 20px #0003',backdropFilter:'blur(13px)',boxSizing:'border-box',overflow:'hidden'}}>{children}</div>;

const LockScreen:React.FC=()=>{
  const frame=useCurrentFrame();
  const messageOpacity=interpolate(frame,[64,72,99,107],[0,1,1,0],clamp);
  const musicOpacity=interpolate(frame,[97,108],[0,1],clamp);
  return <div style={{position:'absolute',inset:0,opacity:interpolate(frame,[62,73],[0,1],clamp)}}>
    <div style={{opacity:interpolate(frame,[76,80],[0,1],clamp),translate:`0px ${interpolate(frame,[76,94],[-250,0],clamp)}px`}}>
      <div style={{position:'absolute',top:74,width:390,textAlign:'center',fontSize:20,color:'#b4e4ff'}}>Wed Apr 2</div>
      <div style={{position:'absolute',top:88,width:390,textAlign:'center',fontSize:128,fontWeight:500,lineHeight:'140px',letterSpacing:-8,background:'linear-gradient(120deg,#94eeff 20%,#507bc4 65%,#1c3c73)',WebkitBackgroundClip:'text',color:'transparent',WebkitTextStroke:'.5px #b7e7ff',textShadow:'0 0 4px #7cd0ff22'}}>9:42</div>
    </div>
    <div style={{opacity:messageOpacity,rotate:`${interpolate(frame,[95,107],[0,5],clamp)}deg`,transform:`perspective(700px) rotateX(${interpolate(frame,[94,103],[0,-88],clamp)}deg)`,transformOrigin:'center 550px',backfaceVisibility:'hidden'}}><Glass top={interpolate(frame,[66,96],[368,520],clamp)} height={68}><div style={{display:'flex',gap:10,padding:10,alignItems:'center'}}><div style={{width:46,height:46,borderRadius:13,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}><TwobaseMark size={42}/></div><div><div style={{fontSize:14,color:'white'}}>Twobase</div><div style={{fontSize:12,color:'#d2b7ca'}}>We have a new idea!</div></div></div></Glass></div>
    <div style={{opacity:musicOpacity,transform:`perspective(700px) rotateX(${interpolate(frame,[97,108],[88,0],clamp)}deg)`,transformOrigin:'center 550px',backfaceVisibility:'hidden'}}><Glass top={550} height={167}>
      <div style={{display:'flex',padding:13,gap:14,alignItems:'center'}}><div style={{width:55,height:55,borderRadius:13,background:'#cd477f',fontSize:53,lineHeight:'51px',color:'white',textAlign:'center'}}>♫</div><div><div style={{fontSize:16,color:'white',whiteSpace:'nowrap'}}>Just need the right music</div><div style={{fontSize:15,color:'#a38c9c'}}>For the video</div></div></div>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'1px 18px',fontSize:11,color:'#b9a3b3'}}><span>0:31</span><div style={{height:4,background:'#bea0ae66',flex:1,borderRadius:4}}><div style={{height:4,width:'28%',background:'white',borderRadius:4}}/></div><span>-3:24</span></div>
      <div style={{display:'flex',justifyContent:'space-evenly',alignItems:'center',color:'white',fontSize:30,paddingTop:10}}><span>◀◀</span><span style={{fontWeight:800}}>Ⅱ</span><span>▶▶</span><span style={{fontSize:23}}>○</span></div>
    </Glass><div style={{position:'absolute',left:42,top:741,width:50,height:50,borderRadius:'50%',border:'1px solid #fff5',background:'#0003',color:'white',display:'grid',placeItems:'center',fontSize:24}}>▮</div><div style={{position:'absolute',right:42,top:741,width:50,height:50,borderRadius:'50%',border:'1px solid #fff5',background:'#30031a66',color:'white',display:'grid',placeItems:'center',fontSize:23}}>▣</div></div>
  </div>;
};

const PlaneIcon:React.FC=()=> <svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M88 42H62L43 12H32l8 30H20L10 30H3l5 20-5 20h7l10-12h20l-8 30h11l19-30h26q10-8 0-16Z" fill="white"/></svg>;
const DirectionIcon:React.FC=()=> <svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M48 10Q51 6 54 12L84 78Q88 89 78 86L50 70 23 86Q12 91 17 78Z" fill="white"/></svg>;

const CameraScreen:React.FC=()=>{
  const frame=useCurrentFrame();
  const video=interpolate(frame,[153,165],[0,1],clamp);
  const zoom=interpolate(frame,[144,163,180,194],[1,1.8,2.7,3.1],clamp);
  const marker=interpolate(frame,[172,195],[0,1],clamp);
  const navigation=interpolate(frame,[201,215],[0,1],clamp);
  return <div style={{position:'absolute',inset:0,background:frame>155?'#000':'#20283d',opacity:interpolate(frame,[125,138],[0,1],clamp)}}>
    <div style={{position:'absolute',left:0,top:interpolate(frame,[145,162],[98,110],clamp),width:390,bottom:interpolate(frame,[145,162],[0,90],clamp),overflow:'hidden'}}>
      <Img src={staticFile('glassy-phone/recovered-landscape.jpg')} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',scale:zoom,transformOrigin:'50% 8%'}}/>
      <svg width="390" height="680" style={{position:'absolute',inset:0}}><path d="M130 0V680M260 0V680M0 226H390M0 452H390" stroke="white" strokeWidth=".6" opacity=".22"/></svg>
      {frame<174?<div style={{position:'absolute',left:156,top:85,width:16,height:10,opacity:.45}}><PlaneIcon/></div>:null}
      {frame>=172?<div style={{position:'absolute',left:195,top:350,translate:'-50% -50%',width:interpolate(frame,[174,195,215],[10,90,130],clamp),height:interpolate(frame,[174,195,215],[10,90,130],clamp),borderRadius:'50%',background:navigation>.5?'rgba(255,255,255,.4)':'#ef9a61',border:'1px solid #fffd',boxShadow:'4px 8px 15px #0003',padding:navigation>.5?25:17,boxSizing:'border-box',opacity:marker}}><div style={{position:'absolute',inset:navigation>.5?20:0,borderRadius:'50%',background:navigation>.5?'#009afa':'transparent'}}>{navigation>.5?<DirectionIcon/>:<PlaneIcon/>}</div></div>:null}
    </div>
    {frame>152?<div style={{position:'absolute',top:51,width:390,textAlign:'center',color:'white',fontSize:15,fontWeight:600}}>00:00:00</div>:null}
    <div style={{position:'absolute',left:126,top:interpolate(frame,[145,165],[600,690],clamp),width:155,display:'flex',justifyContent:'space-between',alignItems:'center',color:'white',fontSize:13}}><span>.5</span><span style={{width:34,height:34,border:'1px solid #fff8',borderRadius:'50%',display:'grid',placeItems:'center',color:'#e7cf67'}}>1</span><span>2</span><span>3</span></div>
    <div style={{position:'absolute',left:195,top:interpolate(frame,[145,165],[686,750],clamp),translate:'-50% -50%',width:interpolate(frame,[145,165],[92,65],clamp),height:interpolate(frame,[145,165],[92,65],clamp),border:'1.5px solid #fff9',borderRadius:'50%',padding:5,boxSizing:'border-box',boxShadow:'0 0 0 2px #0002'}}><div style={{width:'100%',height:'100%',borderRadius:'50%',background:video>.5?'#db241e':'#ddd'}}/></div>
    <div style={{position:'absolute',left:115,top:785,width:175,height:34,borderRadius:20,background:'#3339',display:'flex',justifyContent:'space-evenly',alignItems:'center',fontSize:13,color:'white'}}><span style={{color:video>.5?'#e9d568':'#fff'}}>VIDEO</span><span style={{color:video>.5?'#fff':'#e9d568'}}>PHOTO</span></div>
  </div>;
};

const MapArtwork:React.FC<{small?:boolean}>=({small=false})=>{
  const frame=useCurrentFrame();
  const rotate=interpolate(frame,[224,242,266,285],[0,0,-32,0],clamp);
  const zoom=interpolate(frame,[224,238,264,288],[2,1.4,1,1],clamp);
  return <svg width={small?390:888} height={small?844:1920} viewBox="0 0 888 1920" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,background:'#f8f7f3'}}>
    <g transform={`translate(444 960) scale(${zoom}) rotate(${rotate}) translate(-444 -960)`}>
      <path d="M-100-100H565L390 850 260 1080H-100Z" fill="#9bd86e"/>
      <path d="M430-250C670 120 600 560 451 1000S385 1560 420 2260M-200 1460H1150M-100 600 1100 300M850-200V2400" stroke="#8b969a" strokeWidth="20" fill="none"/>
      <path d="M430-250C670 120 600 560 451 1000S385 1560 420 2260M-200 1460H1150M-100 600 1100 300M850-200V2400" stroke="#c3c7c8" strokeWidth="13" fill="none"/>
      <path d="M420 2260C385 1560 410 1230 451 1000S622 470 580 150" stroke="#8cc7e5" strokeWidth="34" fill="none"/>
      <path d="M420 2260C385 1560 410 1230 451 1000S622 470 580 150" stroke="#008ee7" strokeWidth="19" fill="none"/>
      <text x="438" y="1445" textAnchor="middle" fontFamily="Studio Inter" fontSize="42" fill="#424749">PATH AVE</text>
      <text x="-10" y="580" fontFamily="Studio Inter" fontSize="42" fill="#424749" rotate="-15">FIFTH STREET</text>
    </g>
  </svg>;
};

const MapMarker:React.FC=()=> <div style={{position:'absolute',left:444,top:1020,translate:'-50% -50%',width:315,height:315,borderRadius:'50%',background:'linear-gradient(115deg,#ffffff77,#fff)',border:'2px solid #fff',boxShadow:'20px 30px 34px #0002',display:'grid',placeItems:'center'}}><div style={{width:190,height:190,borderRadius:'50%',background:'#0098f4',padding:35,boxSizing:'border-box'}}><DirectionIcon/></div></div>;

const BrandScreen:React.FC=()=>{
  const frame=useCurrentFrame();
  return <div style={{position:'absolute',inset:0,background:'#050505',opacity:interpolate(frame,[293,304],[0,1],clamp)}}>
    <div style={{position:'absolute',top:435,left:60,width:270,display:'flex',justifyContent:'center',alignItems:'center',gap:3}}><TwobaseMark size={53}/><div style={{color:'white',fontSize:27,fontWeight:600,fontStyle:'italic',overflow:'hidden',width:interpolate(frame,[305,320],[0,140],clamp),whiteSpace:'nowrap'}}>Twobase</div></div>
    <div style={{position:'absolute',top:500,left:0,width:390,textAlign:'center',fontSize:13,color:'#aaa',opacity:interpolate(frame,[315,330],[0,1],clamp)}}>Motion Design Agency</div>
  </div>;
};

export const GlassyPhone:React.FC=()=>{
  const frame=useCurrentFrame();
  const photo=interpolate(frame,[113,129],[0,1],clamp);
  const map=frame>=225&&frame<282;
  const final=frame>=282;
  const x=val(frame,X),y=val(frame,Y),w=val(frame,WIDTH),h=val(frame,HEIGHT),angle=val(frame,ANGLE);
  return <AbsoluteFill style={{background:final?'#f7f7f7':'linear-gradient(#dedede,#fff)',fontFamily:'Studio Inter',overflow:'hidden'}}>
    {!final?<Img src={staticFile('glassy-phone/recovered-landscape.jpg')} style={{position:'absolute',inset:'-50px',width:988,height:2020,objectFit:'cover',filter:'blur(32px)',opacity:photo}}/>:<AbsoluteFill style={{background:'radial-gradient(ellipse 320px 300px at 40px 60px,#a5d77a66,transparent)'}}/>}
    {!map?<>
      {!final&&frame<60?<div style={{position:'absolute',left:x-290,top:y-h*.48,width:580,height:h,rotate:`${angle}deg`,borderRadius:110,background:'#0003',filter:'blur(55px)',scale:1.05}}/>:null}
      <Interactive.Div name="Phone rig" style={{position:'absolute',left:x,top:y,width:390,height:844,translate:'-50% -50%',scale:`${w/390} ${h/844}`,rotate:`${angle}deg`,transform:`perspective(1800px) rotateY(${final?-5:interpolate(frame,[0,48,120,216],[-9,0,0,-5],clamp)}deg)`,transformOrigin:'center center',filter:frame<8?`blur(${interpolate(frame,[0,8],[14,0],clamp)}px)`:undefined}}>
        <div style={{position:'absolute',inset:-4,borderRadius:62,background:'linear-gradient(125deg,#888,#151515 22%,#777 40%,#111 60%,#444)',boxShadow:'2px 3px 0 #161616,4px 4px 0 #777'}}/>
        <div style={{position:'absolute',left:-8,top:231,width:5,height:90,borderRadius:2,background:'linear-gradient(90deg,#222,#888,#333)'}}/>
        <div style={{position:'absolute',right:-8,top:232,width:5,height:95,borderRadius:2,background:'linear-gradient(90deg,#222,#888,#333)'}}/>
        <div style={{position:'absolute',right:-8,top:345,width:5,height:92,borderRadius:2,background:'linear-gradient(90deg,#222,#888,#333)'}}/>
        <div style={{position:'absolute',inset:2,borderRadius:57,background:'#000',overflow:'hidden'}}>
          <Wallpaper/>
          {frame>=62&&frame<138?<LockScreen/>:null}
          {frame>=125&&frame<225?<CameraScreen/>:null}
          {final?<><MapArtwork small/><BrandScreen/></>:null}
          {(frame<157||final)?<div style={{position:'absolute',left:140,top:14,width:110,height:32,borderRadius:19,background:'#000'}}/>:null}
          <div style={{position:'absolute',left:140,bottom:8,width:110,height:3.5,borderRadius:4,background:'white',opacity:final&&frame>301?0:1}}/>
        </div>
        {frame<68?<Launcher/>:null}
      </Interactive.Div>
    </>:<><MapArtwork/><MapMarker/></>}
    <Soundtrack project="glassy-phone" voiceover/>
  </AbsoluteFill>;
};
