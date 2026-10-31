import React,{useEffect,useMemo} from 'react';
import {AbsoluteFill,Interactive,Sequence,useCurrentFrame,useVideoConfig} from 'remotion';
import {FrameCanvas} from '../../../studio/capabilities/FrameCanvas';
import {Sketch} from '../../../studio/capabilities/Sketch';
import {guideCursorTimeline} from '../../../studio/capabilities/choreography';
import {INK,MINT} from '../../../studio/product/SchoolbooksKit';
import {NativeProductView} from '../../../studio/product/NativeProductView';
import {Soundtrack} from '../../../studio/shared/Soundtrack';
import metadata from './native-ui.json';
import cursorPlan from './cursor-plan.json';
import {DemoCursor} from '../../../studio/cursor/DemoCursor';
import {clamp,cursorOpacity} from '../../../studio/cursor/motion';
const project='schoolbooks-feature-guide',left=160,top=108;
type Box={x:number;y:number;width:number;height:number};
const shots=metadata.shots as Array<{name:string;file:string;targets:Record<string,Box>}>;
const box=(shot:string,target:string)=>{
  const result=shots.find(s=>s.name===shot)?.targets[target];
  if(!result)throw new Error(`Missing native product target ${shot}/${target}; recapture the actual app`);
  return result;
};
const point=(shot:string,target:string)=>{const b=box(shot,target);return {x:left+b.x+(target==='open'?b.width*.88:b.width-Math.min(12,b.width*.2)),y:top+b.y+b.height-(target==='open'?.5:7)};};
const eventFrame=(target:string)=>{const event=cursorPlan.clicks.find(c=>c.target===target);if(!event)throw new Error(`Missing cursor event ${target}`);return event.frame;};
const clickEvents=cursorPlan.clicks.map(event=>({...event,...point(event.shot,event.target)}));
const shot=(name:string)=>shots.find(s=>s.name===name)!;
const Highlight:React.FC<{shot:string;target:string;from:number}>=({shot,target,from})=>{
  const b=box(shot,target);
  return <Sketch width={b.width+14} height={b.height+14} from={from} style={{position:'absolute',left:left+b.x-7,top:top+b.y-7}}/>;
};
const headings=['Accounting specialist → Findings','Review the proposed follow-up','Confirm the follow-up task','History → Open follow-up task'];
const descriptions=['Find the recorded invoice and review its evidence.','Check the source and proposed task before continuing.','Schoolbooks checks the invoice evidence again.','The finding moves to History. The invoice record stays unchanged.'];
const stages=[{name:'overview',from:0,duration:60},{name:'finding',from:60,duration:135},{name:'review',from:195,duration:220},{name:'created',from:415,duration:125},{name:'history',from:540,duration:180}];

export const SchoolbooksFeatureGuide:React.FC=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const step=frame<150?0:frame<330?1:frame<510?2:3;
  const cursor=useMemo(()=>guideCursorTimeline({review:point('finding','review'),confirm:point('review','confirm'),history:point('created','history'),open:point('history','open')},fps,{review:eventFrame('review'),confirm:eventFrame('confirm'),history:eventFrame('history'),open:cursorPlan.linkArrivalFrame}),[fps]);
  cursor.timeline.seek(Math.max(0,frame-1)/fps*1000,true);
  const previousX=cursor.value.x;
  cursor.timeline.seek(frame/fps*1000,true);
  const link=box('history','open');
  const onLink=frame>=600&&cursor.value.x>=left+link.x&&cursor.value.x<=left+link.x+link.width&&cursor.value.y>=top+link.y&&cursor.value.y<=top+link.y+link.height;
  const tilt=onLink?0:clamp((cursor.value.x-previousX)*.35,-cursorPlan.maxTiltDegrees,cursorPlan.maxTiltDegrees);
  useEffect(()=>()=>{cursor.timeline.cancel();},[cursor]);
  return <AbsoluteFill style={{fontFamily:'Studio Inter',background:INK,color:'#f5f8f4'}}>
    <div style={{position:'absolute',left,top:30,color:MINT,fontSize:23}}>STEP {step+1} / 4</div>
    <Interactive.Div name="Guide instruction outside actual product viewport" style={{position:'absolute',left:330,top:20,fontSize:41,fontWeight:550,letterSpacing:-1.4}}>{headings[step]}</Interactive.Div>
    <div style={{position:'absolute',left:330,top:76,fontSize:18,color:'#b7cbbd'}}>{descriptions[step]}</div>
    <div style={{position:'absolute',right:160,top:83,fontSize:12,letterSpacing:1.2,color:'#a4bdad'}}>ACTUAL PRODUCT UI · DEMO DATA</div>
    {stages.map(stage=><Sequence key={stage.name} name={`Actual Schoolbooks: ${stage.name}`} from={stage.from} durationInFrames={stage.duration} layout="none">
      <NativeProductView project={project} shot={stage.name} file={shot(stage.name).file} left={left} top={top} width={metadata.viewport.width} height={metadata.viewport.height}/>
    </Sequence>)}
    {frame>=165&&frame<195&&<Highlight shot="finding" target="review" from={165}/>}
    {frame>=375&&frame<415&&<Highlight shot="review" target="confirm" from={375}/>}
    {frame>=510&&frame<540&&<Highlight shot="created" target="history" from={510}/>}
    {frame>=600&&<Highlight shot="history" target="open" from={600}/>}
    <DemoCursor x={cursor.value.x} y={cursor.value.y} kind={onLink?'hand':'arrow'} height={cursorPlan.height} tilt={tilt} opacity={cursorOpacity(frame,cursorPlan.windows)} clicks={clickEvents} accent={MINT} ringColor="#087f70"/>
    <FrameCanvas kind="p5" width={1600} height={44} style={{position:'absolute',left:160,top:1024}}/>
    <Soundtrack project={project} voiceover/>
  </AbsoluteFill>;
};
