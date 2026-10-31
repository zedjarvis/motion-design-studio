import React,{useEffect,useMemo} from 'react';
import {AbsoluteFill,Freeze,Img,Interactive,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FrameCanvas} from '../../../studio/capabilities/FrameCanvas';
import {entranceTimeline} from '../../../studio/capabilities/choreography';
import {FilmShell,INK,MINT} from '../../../studio/product/SchoolbooksKit';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
const project='schoolbooks-product-brag';

const Opening:React.FC=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),entry=useMemo(entranceTimeline,[]);entry.timeline.seek(frame/fps*1000,true);
  useEffect(()=>()=>{entry.timeline.cancel();},[entry]);
  return <FilmShell project={project} eyebrow="FINANCE + SCHOOL OPERATIONS">
    <div style={{position:'absolute',left:94,top:260,color:MINT,letterSpacing:3,fontSize:22}}>MEET SCHOOLBOOKS</div>
    <Interactive.Div name="Working team hook" style={{position:'absolute',left:88,top:342,fontSize:108,lineHeight:1.08,letterSpacing:-5,fontWeight:550,translate:`0px ${entry.value.y}px`,opacity:entry.value.opacity}}>Your records.<br/><span style={{color:MINT}}>A working team.</span></Interactive.Div>
    <div style={{position:'absolute',left:96,top:678,fontSize:32,lineHeight:1.5,color:'#b1c8b9',opacity:entry.value.second}}>One school workspace.<br/>Agents that work from your records.</div>
    <FrameCanvas kind="pixi" width={660} height={440} style={{position:'absolute',left:980,top:280}}/>
    <FrameCanvas kind="orb" state="connecting" width={360} height={360} style={{position:'absolute',left:1360,top:320}}/>
    <div style={{position:'absolute',right:240,top:760,color:'#a5c0af',fontSize:23,letterSpacing:2}}>CONNECTED TO YOUR CONTEXT</div>
  </FilmShell>;
};
const Workspace:React.FC=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),entry=useMemo(entranceTimeline,[]);entry.timeline.seek(frame/fps*1000,true);
  useEffect(()=>()=>{entry.timeline.cancel();},[entry]);
  return <FilmShell project={project} eyebrow="ONE CONNECTED WORKSPACE">
    <div style={{position:'absolute',left:94,top:155,fontSize:65,fontWeight:550,letterSpacing:-2.5}}>One workspace. <span style={{color:MINT}}>Every school day.</span></div>
    <div style={{position:'absolute',left:320,top:288,width:1280,height:620,opacity:entry.value.opacity,translate:`0px ${entry.value.y}px`,overflow:'hidden',borderRadius:12}}><Img src={staticFile(`${project}/workspace-1280.png`)} style={{width:1280,height:620}}/></div>
    <div style={{position:'absolute',left:320,top:941,color:'#a7beaf',fontSize:23}}>Finance · People · Fees · Projects · Spark</div>
  </FilmShell>;
};
const Closing:React.FC=()=> <FilmShell project={project} eyebrow="A CLEARER WAY TO RUN THE SCHOOL">
  <Interactive.Div name="Human control payoff" style={{position:'absolute',left:88,top:315,fontSize:111,fontWeight:550,lineHeight:1.1,letterSpacing:-5}}>Agents prepare.<br/><span style={{color:MINT}}>You decide.</span></Interactive.Div>
  <div style={{position:'absolute',left:1200,top:350,width:540,padding:36,border:'1px solid #405c4a',borderRadius:16,background:'#16261c'}}><div style={{fontSize:23,color:'#a4c3af'}}>THE NEXT STEP</div><div style={{fontSize:37,lineHeight:1.3,marginTop:25}}>Review the source.<br/>Confirm the action.</div><div style={{marginTop:30,fontSize:22,color:MINT}}>Your team stays in control. ↗</div></div>
  <div style={{position:'absolute',left:96,bottom:105,fontSize:38,color:MINT}}>schoolbooks.ke ↗</div>
  <div style={{position:'absolute',right:92,bottom:118,fontSize:25,color:'#a7beaf'}}>Accounting and operations, connected.</div>
</FilmShell>;
export const SchoolbooksProductBrag:React.FC=()=> <AbsoluteFill style={{background:INK}}>
  <Sequence name="Records become a working team" durationInFrames={150}><Opening/></Sequence>
  <Sequence name="Actual product workspace" from={150} durationInFrames={225}><Workspace/></Sequence>
  <Sequence name="Human review and CTA" from={375} durationInFrames={165}><Closing/></Sequence>
  <Sequence name="Share poster" durationInFrames={1}><Freeze frame={75}><Closing/></Freeze></Sequence>
  <Soundtrack project={project} voiceover/>
</AbsoluteFill>;
