import React from 'react';
import {AbsoluteFill,Img,interpolate,Interactive,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {FrameCanvas} from '../../../studio/capabilities/FrameCanvas';
import {Sketch} from '../../../studio/capabilities/Sketch';
import {Brand,INK,MINT,PAPER} from '../../../studio/product/SchoolbooksKit';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
const project='schoolbooks-fee-followup-social';
const SocialShell:React.FC<{paper?:boolean;children:React.ReactNode}>=({paper=false,children})=><AbsoluteFill style={{background:paper?PAPER:INK,color:paper?INK:'#f5f8f4',fontFamily:'Studio Inter',overflow:'hidden'}}><div style={{position:'absolute',left:88,top:102}}><Brand project={project} paper={paper}/></div>{children}</AbsoluteFill>;
const Paint:React.FC<{top:number}>=({top})=>{
  const frame=useCurrentFrame();
  return <div style={{position:'absolute',left:88,top,width:900,height:180,clipPath:`inset(0 ${interpolate(frame,[8,40],[100,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}% 0 0)`}}><Img src={staticFile('studio-art/paint-stroke.png')} style={{width:900,height:180}}/></div>;
};
const Pain:React.FC=()=> <SocialShell paper>
  <div style={{position:'absolute',left:90,top:236,fontSize:24,letterSpacing:3,color:'#476455'}}>SCHOOL FINANCE, EVERY DAY</div>
  <Interactive.Div name="Fee follow-up pain" style={{position:'absolute',left:82,top:332,fontSize:103,fontWeight:570,lineHeight:1.12,letterSpacing:-4}}>Still chasing<br/>overdue fees?</Interactive.Div>
  <Paint top={512}/>
  <div style={{position:'absolute',left:88,top:788,width:904,height:428,padding:36,borderRadius:20,border:'1px solid #b9cbbb',background:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:26,color:'#496452'}}><span>Invoice DEMO-1042</span><span>DEMO DATA</span></div>
    <div style={{fontSize:30,color:'#496452',marginTop:57}}>Recorded outstanding</div>
    <div style={{fontSize:100,fontWeight:550,letterSpacing:-4,marginTop:15}}>KES 24,000</div>
    <div style={{fontSize:27,color:'#835e24',marginTop:24}}>A finding that needs attention.</div>
  </div>
  <Sketch width={770} height={148} shape="ellipse" from={45} color="#087f70" style={{position:'absolute',left:134,top:956}}/>
  <div style={{position:'absolute',left:91,top:1400,fontSize:43,lineHeight:1.45,color:'#476455'}}>A balance is a record.<br/>What happens next?</div>
</SocialShell>;
const Solution:React.FC=()=> <SocialShell>
  <div style={{position:'absolute',left:90,top:245,fontSize:24,letterSpacing:3,color:MINT}}>GIVE THE RECORD A NEXT STEP</div>
  <Interactive.Div name="A practical next step" style={{position:'absolute',left:82,top:332,fontSize:107,fontWeight:550,lineHeight:1.11,letterSpacing:-4}}>Review.<br/>Prepare.<br/><span style={{color:MINT}}>Follow up.</span></Interactive.Div>
  <div style={{position:'absolute',left:88,top:852,width:904,padding:38,borderRadius:18,border:'1px solid #496251',background:'#18271e'}}>
    <div style={{fontSize:25,color:'#b8cfbf'}}>PERSONAL FOLLOW-UP TASK</div>
    <div style={{fontSize:40,lineHeight:1.35,marginTop:24}}>Invoice DEMO-1042<br/>Ready for your review.</div>
    <div style={{display:'inline-block',marginTop:33,padding:'18px 24px',background:MINT,color:'#102a27',fontSize:30,fontWeight:550,borderRadius:9}}>Review action ↗</div>
  </div>
  <FrameCanvas kind="pixi" width={900} height={240} style={{position:'absolute',left:88,top:1300}}/>
  <div style={{position:'absolute',left:90,top:1610,fontSize:37,lineHeight:1.5,color:'#b8cfbf'}}>Your team decides.<br/>The invoice stays unchanged.</div>
</SocialShell>;
const Closing:React.FC=()=> <SocialShell paper>
  <div style={{position:'absolute',left:90,top:250,fontSize:24,letterSpacing:3,color:'#476455'}}>MEET SCHOOLBOOKS</div>
  <Interactive.Div name="Follow-up CTA" style={{position:'absolute',left:82,top:351,fontSize:94,fontWeight:570,lineHeight:1.15,letterSpacing:-4}}>Give every balance<br/>a next step.</Interactive.Div>
  <Paint top={548}/>
  <div style={{position:'absolute',left:90,top:942,fontSize:49,lineHeight:1.4,color:'#476455'}}>AI-native accounting<br/>and school operations.</div>
  <div style={{position:'absolute',left:88,top:1296,width:904,padding:'35px 40px',borderRadius:14,background:'#087f70',fontSize:47,fontWeight:550,color:'#fff'}}>schoolbooks.ke <span style={{float:'right'}}>↗</span></div>
</SocialShell>;
export const SchoolbooksFeeFollowupSocial:React.FC=()=> <AbsoluteFill>
  <Sequence name="Overdue fee pain" durationInFrames={150}><Pain/></Sequence>
  <Sequence name="Prepare a personal follow-up" from={150} durationInFrames={180}><Solution/></Sequence>
  <Sequence name="A concrete next step" from={330} durationInFrames={120}><Closing/></Sequence>
  <Soundtrack project={project} voiceover/>
</AbsoluteFill>;
