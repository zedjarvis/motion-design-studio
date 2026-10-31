import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Freeze,useCurrentFrame} from 'remotion';
import {DemoCursor} from '../../../studio/cursor/DemoCursor';

const kinds=['arrow','hand','touch'] as const;
export const CursorProbe:React.FC=()=>{
 const frame=useCurrentFrame();
 return <AbsoluteFill data-cursor-probe-frame={frame} style={{background:'#edf3ef',fontFamily:'sans-serif'}}>
  {kinds.map((kind,i)=>{const x=215+i*425,y=310;return <React.Fragment key={kind}>
    <div style={{position:'absolute',left:i*425,top:0,width:425,height:720,background:i===1?'#151719':'#edf3ef',color:i===1?'#fff':'#151719',padding:45,boxSizing:'border-box'}}><div style={{fontSize:24}}>{kind} / hotspot + click</div><div style={{marginTop:170,fontSize:18}}>Actual target · frame {frame}</div><div style={{position:'absolute',left:45,top:310,width:335,height:1,background:'#72d9be'}}/><div style={{position:'absolute',left:215,top:200,width:1,height:260,background:'#72d9be'}}/></div>
    <DemoCursor x={x} y={y} kind={kind} height={48} tilt={kind==='arrow'?5:0} clicks={[{frame:30,x,y}]}/>
  </React.Fragment>;})}
 </AbsoluteFill>;
};
export const CursorSeekTest:React.FC=()=>{
 const [frame,setFrame]=useState(0);
 useEffect(()=>{(window as unknown as {cursorSeekTest:(frame:number)=>void}).cursorSeekTest=setFrame;},[]);
 return <Freeze frame={frame}><CursorProbe/></Freeze>;
};
