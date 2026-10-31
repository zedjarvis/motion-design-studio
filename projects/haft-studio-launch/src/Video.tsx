import React from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, Img, Interactive, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '../../../studio/shared/fonts';
import {Soundtrack} from '../../../studio/shared/Soundtrack';

if(typeof document!=='undefined'){
  const handle=delayRender('Load project brand font');
  const font=new FontFace('Haft Pacifico',`url("${staticFile('haft-studio-launch/Pacifico-Regular.ttf')}")`);
  font.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle);}).catch(cancelRender);
}
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const ease={...clamp,easing:Easing.bezier(.2,.8,.2,1)};
const media=(name:string)=>staticFile(`haft-studio-launch/${name}`);
const BROWN='#8b4513',INK='#302921',PAPER='#e5e7eb';

const Eyebrow:React.FC<{children:React.ReactNode;light?:boolean}>=({children,light})=><div style={{fontSize:22,letterSpacing:5,textTransform:'uppercase',color:light?'#f2e3cc':BROWN}}>{children}</div>;
const Brand:React.FC=()=> <Img src={media('logo.png')} style={{width:260,height:86}}/>;

const Opening:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill>
    <Img src={media('1.webp')} style={{width:'100%',height:'100%',objectFit:'cover',scale:interpolate(frame,[0,105],[1.075,1],clamp)}}/>
    <AbsoluteFill style={{background:'linear-gradient(90deg,#17140fe8,#17140f77 46%,transparent 85%)'}}/>
    <div style={{position:'absolute',left:100,top:88,opacity:interpolate(frame,[0,18],[0,1],clamp)}}><Eyebrow light>Haft Studio · Nairobi</Eyebrow></div>
    <Interactive.Div name="Opening statement" style={{position:'absolute',left:100,top:335,width:1020,translate:`0px ${interpolate(frame,[4,32],[65,0],ease)}px`,opacity:interpolate(frame,[4,24],[0,1],clamp)}}>
      <div style={{fontFamily:'Haft Pacifico',fontSize:98,lineHeight:1.45,color:'#faf3e8'}}>African material heritage.</div>
      <div style={{fontSize:43,lineHeight:1.5,color:'#efe4d1',marginTop:30}}>Contemporary proportions.</div>
    </Interactive.Div>
    <div style={{position:'absolute',left:100,right:100,bottom:90,height:1,background:'#ffffff66'}}><div style={{height:2,width:interpolate(frame,[8,95],[0,450],clamp),background:'#f1d4ac'}}/></div>
  </AbsoluteFill>;
};

const Materials:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:PAPER,clipPath:`inset(0 ${interpolate(frame,[0,20],[100,0],ease)}% 0 0)`}}>
    <div style={{position:'absolute',left:0,top:0,width:850,height:1080,overflow:'hidden'}}><Img src={media('pexels-maria-1.webp')} style={{width:'100%',height:'100%',objectFit:'cover',scale:interpolate(frame,[0,90],[1.15,1.03],clamp)}}/></div>
    <div style={{position:'absolute',left:960,top:155}}><Eyebrow>Materials with character</Eyebrow></div>
    {['Timber.','Stone.','Papyrus.'].map((word,i)=><div key={word} style={{position:'absolute',left:960,top:290+i*160,fontSize:105,fontFamily:'Haft Pacifico',color:INK,opacity:interpolate(frame,[12+i*8,25+i*8],[0,1],clamp),translate:`0px ${interpolate(frame,[12+i*8,30+i*8],[35,0],ease)}px`}}>{word}</div>)}
    <div style={{position:'absolute',left:960,top:905,fontSize:26,color:'#645b50'}}>Designed and produced in Nairobi.</div>
  </AbsoluteFill>;
};

const Collection:React.FC=()=>{
  const frame=useCurrentFrame();
  const items=[['neva_chair_cover.webp','Neva Chair'],['invito_table_cover.webp','Invito Table'],['neva_lounge_trimmed_cover.webp','Neva Lounge']];
  return <AbsoluteFill style={{background:PAPER,clipPath:`inset(${interpolate(frame,[0,22],[100,0],ease)}% 0 0 0)`}}>
    <div style={{position:'absolute',left:100,top:78}}><Eyebrow>The collection</Eyebrow></div>
    <div style={{position:'absolute',right:100,top:53}}><Brand/></div>
    {items.map(([image,title],i)=><Interactive.Div key={title} name={title} style={{position:'absolute',left:100+i*580,top:215,width:560,height:715,translate:`0px ${interpolate(frame,[12+i*7,35+i*7],[100,0],ease)}px`,opacity:interpolate(frame,[12+i*7,30+i*7],[0,1],clamp)}}>
      <div style={{height:605,overflow:'hidden',background:'#eee'}}><Img src={media(image)} style={{width:'100%',height:'100%',objectFit:'cover',scale:interpolate(frame,[25,135],[1.02,1.075],clamp)}}/></div>
      <div style={{display:'flex',justifyContent:'space-between',paddingTop:29,fontSize:29,borderTop:'1px solid #b5b2ae',color:INK}}><span>{title}</span><span style={{fontSize:20,color:'#82766b'}}>0{i+1}</span></div>
    </Interactive.Div>)}
    <div style={{position:'absolute',left:100,bottom:58,fontSize:20,letterSpacing:3,color:BROWN}}>RESIDENTIAL · HOSPITALITY · COMMERCIAL</div>
  </AbsoluteFill>;
};

const Close:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:PAPER,clipPath:`inset(0 0 0 ${interpolate(frame,[0,22],[100,0],ease)}%)`}}>
    <div style={{position:'absolute',left:0,width:1120,height:1080,overflow:'hidden'}}><Img src={media('6.webp')} style={{width:'100%',height:'100%',objectFit:'cover',scale:interpolate(frame,[0,120],[1.06,1],clamp)}}/></div>
    <div style={{position:'absolute',left:1220,top:135}}><Brand/></div>
    <Interactive.Div name="Explore the collection" style={{position:'absolute',left:1220,top:360,width:600,opacity:interpolate(frame,[15,32],[0,1],clamp),translate:`0px ${interpolate(frame,[15,38],[35,0],ease)}px`}}>
      <div style={{fontFamily:'Haft Pacifico',fontSize:77,lineHeight:1.4,color:INK}}>For the spaces<br/>you shape.</div>
      <div style={{marginTop:62,color:BROWN,fontSize:27,borderBottom:`2px solid ${BROWN}`,paddingBottom:15,width:360,display:'flex',justifyContent:'space-between'}}>Explore the collection <span>↗</span></div>
      <div style={{marginTop:52,color:'#665d54',fontSize:24}}>haftstudio.ke/products</div>
    </Interactive.Div>
  </AbsoluteFill>;
};

/** Original film from product code and its existing assets; no reference video. */
export const HaftStudioLaunch:React.FC=()=> <AbsoluteFill style={{fontFamily:'Studio Inter',overflow:'hidden'}}>
  <Sequence name="Material heritage" durationInFrames={125}><Opening/></Sequence>
  <Sequence name="Material palette" from={105} durationInFrames={112}><Materials/></Sequence>
  <Sequence name="Product collection" from={195} durationInFrames={157}><Collection/></Sequence>
  <Sequence name="Collection invitation" from={330} durationInFrames={120}><Close/></Sequence>
  <Soundtrack project="haft-studio-launch" voiceover/>
</AbsoluteFill>;
