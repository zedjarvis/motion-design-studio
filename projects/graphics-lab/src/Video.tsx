import React,{useEffect,useMemo,useState} from 'react';
import {AbsoluteFill,Freeze,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FrameCanvas} from '../../../studio/capabilities/FrameCanvas';
import {Sketch} from '../../../studio/capabilities/Sketch';
import {entranceTimeline} from '../../../studio/capabilities/choreography';
import '../../../studio/shared/fonts';

const Tile:React.FC<{name:string;x:number;y:number;children:React.ReactNode}>=({name,x,y,children})=><div data-capability={name} style={{position:'absolute',left:x,top:y,width:400,height:360,padding:20,border:'1px solid #34493d'}}><div style={{fontSize:25,color:'#dce9e0',marginBottom:24}}>{name}</div>{children}</div>;

export const GraphicsCapabilities:React.FC=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const choreography=useMemo(entranceTimeline,[]);
  choreography.timeline.seek(frame/fps*1000,true);
  useEffect(()=>()=>{choreography.timeline.cancel();},[choreography]);
  return <AbsoluteFill style={{background:'#101a14',fontFamily:'Studio Inter'}}>
    <Tile name="p5.brush" x={0} y={0}><div style={{width:350,height:200,overflow:'hidden',clipPath:`inset(0 ${interpolate(frame,[0,45],[100,0],{extrapolateRight:'clamp'})}% 0 0)`}}><Img src={staticFile('studio-art/paint-stroke.png')} style={{width:900,height:180}}/></div></Tile>
    <Tile name="p5.js" x={400} y={0}><FrameCanvas kind="p5" width={350} height={220}/></Tile>
    <Tile name="Thinking Orbs" x={800} y={0}><FrameCanvas kind="orb" width={220} height={220} state="connecting"/></Tile>
    <Tile name="Rough.js" x={0} y={360}><Sketch width={330} height={180} shape="ellipse"/></Tile>
    <Tile name="Anime.js" x={400} y={360}><div style={{translate:`0px ${choreography.value.y}px`,opacity:choreography.value.opacity}}><div style={{height:45,width:310,background:'#72d9be',borderRadius:8}}/><div style={{height:45,width:255,background:'#72d9be',borderRadius:8,marginTop:20,opacity:choreography.value.second}}/><div style={{height:45,width:200,background:'#72d9be',borderRadius:8,marginTop:20,opacity:choreography.value.third}}/></div></Tile>
    <Tile name="PixiJS" x={800} y={360}><FrameCanvas kind="pixi" width={350} height={220}/></Tile>
  </AbsoluteFill>;
};

/** Browser-only acceptance harness. Not part of a product film. */
export const GraphicsSeekTest:React.FC=()=>{
  const [frame,setFrame]=useState(0);
  useEffect(()=>{
    const target=window as Window&{motionSeekTest?:(frame:number)=>void};
    target.motionSeekTest=setFrame;
    return()=>{delete target.motionSeekTest;};
  },[]);
  return <Freeze frame={frame}><GraphicsCapabilities/></Freeze>;
};
