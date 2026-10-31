import React from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, Img, Interactive, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Soundtrack} from '../../../studio/shared/Soundtrack';

const media=(file:string)=>staticFile(`schoolbooks-launch/${file}`);
if(typeof document!=='undefined'){
  for(const [name,file] of [['Schoolbooks Inter','Inter.woff2'],['Schoolbooks Manrope','Manrope.woff2']]){
    const handle=delayRender(`Load ${name}`);
    new FontFace(name,`url("${media(file)}")`,{weight:'100 900'}).load().then(font=>{document.fonts.add(font);continueRender(handle);}).catch(cancelRender);
  }
}
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const ease={...clamp,easing:Easing.bezier(.18,.78,.2,1)};
const MINT='#72d9be',INK='#09090a',PAPER='#edf3ef';

const Brand:React.FC<{dark?:boolean;size?:number}>=({dark=false,size=34})=><div style={{display:'flex',gap:13,alignItems:'center',color:dark?INK:'#f5f7f6'}}>
  <Img src={media('brand-mark.svg')} style={{width:size*1.25,height:size*1.25}}/>
  <span style={{fontFamily:'Schoolbooks Manrope',fontSize:size,fontWeight:760,letterSpacing:'-.052em'}}>Schoolbooks</span>
</div>;

const Background:React.FC=()=> <AbsoluteFill style={{background:INK}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 84% 42%,#164a3e60,transparent 58%)'}}/>
  <AbsoluteFill style={{backgroundImage:'linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px)',backgroundSize:'96px 96px',maskImage:'linear-gradient(90deg,transparent,#000)'}}/>
</AbsoluteFill>;

const Header:React.FC<{section:string}>=({section})=><>
  <div style={{position:'absolute',left:96,top:58}}><Brand/></div>
  <div style={{position:'absolute',right:96,top:72,fontSize:18,letterSpacing:3,color:'#aab7b1',textTransform:'uppercase'}}>{section}</div>
</>;

const Cursor:React.FC<{x:number;y:number;clicked?:boolean}>=({x,y,clicked})=><svg width="45" height="52" viewBox="0 0 45 52" style={{position:'absolute',left:x,top:y,filter:'drop-shadow(0 3px 4px #0008)',scale:clicked?.85:1,transformOrigin:'5px 4px'}}>
  <path d="M5 4L7 42L17 32L25 48L33 44L25 28L40 26Z" fill="#fff" stroke="#111" strokeWidth="2"/>
</svg>;

const RecordCard:React.FC<{label:string;detail:string;from:number;top:number;rotation:number}>=({label,detail,from,top,rotation})=>{
  const frame=useCurrentFrame();
  return <div style={{position:'absolute',left:1210,top,width:490,height:155,padding:'26px 30px',border:'1px solid #ffffff26',borderRadius:15,background:'#16231f',boxShadow:'0 16px 45px #0005',opacity:interpolate(frame,[from,from+8],[0,1],clamp),translate:`${interpolate(frame,[from,from+17],[160,0],ease)}px 0px`,rotate:`${interpolate(frame,[from,from+20],[rotation+5,rotation],ease)}deg`}}>
    <div style={{display:'flex',alignItems:'center',gap:20}}>
      <div style={{width:48,height:52,border:'1.5px solid #72d9be99',borderRadius:8,padding:10}}><div style={{height:2,background:MINT,marginTop:3}}/><div style={{height:2,background:MINT,marginTop:9}}/><div style={{height:2,background:MINT,marginTop:9,width:16}}/></div>
      <div><div style={{fontSize:28,fontWeight:600,color:'#f6faf7'}}>{label}</div><div style={{fontSize:19,color:'#b5c7bc',marginTop:7}}>{detail}</div></div>
      <div style={{marginLeft:'auto',fontSize:25,color:MINT}}>↗</div>
    </div>
  </div>;
};

const Opening:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill>
    <Background/><Header section="The school day, connected"/>
    <div style={{position:'absolute',left:100,top:262,fontSize:19,color:MINT,letterSpacing:4}}>LESS CHASING. MORE CLARITY.</div>
    <Interactive.Div name="Records hook" style={{position:'absolute',left:94,top:326,fontSize:103,fontWeight:560,lineHeight:1.08,letterSpacing:-5,color:'#f4f6f4',opacity:interpolate(frame,[1,13],[0,1],clamp),translate:`0px ${interpolate(frame,[1,22],[46,0],ease)}px`}}>
      Your school has<br/>the <span style={{color:MINT}}>records.</span>
    </Interactive.Div>
    <Interactive.Div name="Put records to work" style={{position:'absolute',left:100,top:645,fontSize:35,color:'#a9b7b0',opacity:interpolate(frame,[44,61],[0,1],clamp),translate:`0px ${interpolate(frame,[44,65],[18,0],ease)}px`}}>Put them to work.</Interactive.Div>
    <RecordCard label="School fees" detail="Invoices · receipts · balances" from={9} top={290} rotation={-5}/>
    <RecordCard label="Your people" detail="Payroll · teams · approvals" from={26} top={480} rotation={2}/>
    <RecordCard label="Daily operations" detail="Projects · tasks · documents" from={43} top={670} rotation={-2}/>
    <div style={{position:'absolute',left:100,right:100,bottom:90,height:1,background:'#ffffff1a'}}/>
    <div style={{position:'absolute',left:100,bottom:55,fontSize:18,letterSpacing:2,color:'#93a39a'}}>01 / FROM RECORDS TO ACTION</div>
  </AbsoluteFill>;
};

const Workspace:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:INK,clipPath:`inset(0 ${interpolate(frame,[0,18],[100,0],ease)}% 0 0)`}}>
    <Background/><Header section="Finance + school operations"/>
    <Interactive.Div name="Unified workspace title" style={{position:'absolute',top:150,left:96,fontSize:62,fontWeight:540,letterSpacing:-2.5,color:'#f5f7f5'}}>One workspace. <span style={{color:MINT}}>Every school day.</span></Interactive.Div>
    <div style={{position:'absolute',left:164,top:261,width:1592,height:772,borderRadius:14,overflow:'hidden',border:'1px solid #ffffff40',boxShadow:'0 30px 85px #0009',scale:interpolate(frame,[0,31],[.94,1],ease),translate:`0px ${interpolate(frame,[0,31],[90,0],ease)}px`}}>
      <Img src={media('workspace.jpg')} style={{width:'100%',height:'100%'}}/>
      {frame>=85&&<Cursor x={interpolate(frame,[85,118],[1110,1280],ease)} y={interpolate(frame,[85,118],[525,414],ease)} clicked={frame>=122&&frame<126}/>}
      {frame>=128&&<div style={{position:'absolute',right:57,top:490,padding:'14px 20px',background:'#edf7f3',border:'1px solid #087f7055',borderRadius:9,color:'#166050',fontSize:22,opacity:interpolate(frame,[128,142],[0,1],clamp)}}>Ask Spark what needs attention <span style={{marginLeft:16}}>↗</span></div>}
    </div>
    <div style={{position:'absolute',right:166,top:232,fontSize:15,color:'#94a69b',letterSpacing:1.6}}>ACTUAL APP · DEMO SCHOOL</div>
  </AbsoluteFill>;
};

const Specialist:React.FC=()=>{
  const frame=useCurrentFrame();
  const modal=interpolate(frame,[110,126],[0,1],clamp);
  return <AbsoluteFill style={{background:INK,clipPath:`inset(0 0 0 ${interpolate(frame,[0,18],[100,0],ease)}%)`}}>
    <Background/><Header section="Live records. Reviewed next steps."/>
    <div style={{position:'absolute',left:98,top:254,display:'flex',alignItems:'center',gap:16,color:MINT,fontSize:22,letterSpacing:1}}><Img src={media('spark-52.png')} style={{width:52,height:52}}/> SPARK + SPECIALIST AGENTS</div>
    <Interactive.Div name="Evidence headline" style={{position:'absolute',left:94,top:353,fontSize:85,lineHeight:1.08,fontWeight:530,letterSpacing:-4,color:'#f5f7f5',translate:`0px ${interpolate(frame,[10,34],[40,0],ease)}px`,opacity:interpolate(frame,[10,28],[0,1],clamp)}}>Ask Spark.<br/>Check the<br/><span style={{color:MINT}}>evidence.</span></Interactive.Div>
    <div style={{position:'absolute',left:100,top:746,width:650,fontSize:29,lineHeight:1.5,color:'#b2c0b7'}}>An accounting specialist.<br/>A next step your team can review.</div>
    <div style={{position:'absolute',left:904,top:232,width:850,height:676,borderRadius:19,border:'1px solid #ffffff25',background:'#151b18',boxShadow:'0 28px 90px #0006',overflow:'hidden',translate:`${interpolate(frame,[0,29],[200,0],ease)}px 0px`}}>
      <div style={{padding:'26px 32px',borderBottom:'1px solid #ffffff18',display:'flex',alignItems:'center',gap:17}}>
        <Img src={media('accounting-agent.webp')} style={{width:68,height:68,borderRadius:18,objectFit:'cover'}}/>
        <div><div style={{fontSize:27,fontWeight:550,color:'#f4f7f4'}}>Accounting specialist</div><div style={{fontSize:18,color:'#a2b3a8',marginTop:6}}>Private evidence and reviewed next steps.</div></div>
        <div style={{marginLeft:'auto',fontSize:15,color:MINT,border:'1px solid #72d9be44',borderRadius:20,padding:'7px 12px'}}>Active</div>
      </div>
      <div style={{padding:32}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:31,fontWeight:550,color:'#f4f7f4'}}>Findings</div><div style={{fontSize:17,color:'#b5c1b9'}}>ILLUSTRATIVE DEMO</div></div>
        <div style={{display:'flex',gap:28,borderBottom:'1px solid #ffffff20',marginTop:27,fontSize:22}}><div style={{paddingBottom:14,borderBottom:`2px solid ${MINT}`,color:MINT}}>Needs attention</div><div style={{color:'#a6b2aa'}}>History</div></div>
        <div style={{marginTop:26,padding:26,border:'1px solid #ffffff27',borderRadius:12}}>
          <div style={{fontSize:25,color:'#f2f7f3'}}>Invoice DEMO-1042 <span style={{float:'right',fontSize:18,color:'#e4c384'}}>Open</span></div>
          <div style={{marginTop:17,fontSize:22,color:'#c9d4cc'}}>Recorded outstanding KES 24,000</div>
          <div style={{marginTop:12,fontSize:18,color:'#9cab9f'}}>Checked against the source record</div>
          <div style={{display:'flex',gap:22,alignItems:'center',marginTop:25,fontSize:20}}><div style={{padding:'12px 20px',border:'1px solid #ffffff40',background:frame>=105?'#283b31':'#1a231d',borderRadius:7,color:'#edf6f0'}}>Review action</div><span style={{color:'#b0bfb4'}}>Snooze 24 hours</span></div>
        </div>
        <div style={{fontSize:20,color:'#b1c5b7',marginTop:26}}>Evidence first. A prepared follow-up next.</div>
      </div>
      {frame>=65&&frame<110&&<Cursor x={interpolate(frame,[65,100],[700,120],ease)} y={interpolate(frame,[65,100],[530,459],ease)} clicked={frame>=105}/>}
      {frame>=110&&<>
        <AbsoluteFill style={{background:'#05090799',opacity:modal}}/>
        <div style={{position:'absolute',left:48,top:158,width:754,padding:35,borderRadius:14,background:'#222c25',border:'1px solid #5a7867',boxShadow:'0 20px 50px #0009',opacity:modal,translate:`0px ${interpolate(frame,[110,132],[35,0],ease)}px`}}>
          <div style={{fontSize:31,fontWeight:550,color:'#f5f8f4'}}>Review follow-up task</div>
          <div style={{fontSize:23,lineHeight:1.5,color:'#c4d1c7',marginTop:21}}>Create a personal task from this finding.<br/>The invoice evidence is checked again<br/>when you confirm.</div>
          <div style={{marginTop:30,padding:'17px 21px',borderLeft:`3px solid ${MINT}`,background:'#72d9be0c',fontSize:22,color:MINT}}>Prepared for your review.</div>
          <div style={{marginTop:34,display:'flex',gap:15,justifyContent:'flex-end',fontSize:21}}><div style={{padding:'14px 20px',color:'#d3dfd5',border:'1px solid #56635a',borderRadius:8}}>Cancel</div><div style={{padding:'14px 20px',color:'#102a27',background:MINT,borderRadius:8,fontWeight:600}}>Create follow-up task</div></div>
        </div>
      </>}
    </div>
    <div style={{position:'absolute',left:906,bottom:100,fontSize:21,color:'#92a99a'}}>Demonstrated from the product’s review flow.</div>
  </AbsoluteFill>;
};

const Closing:React.FC<{poster?:boolean}>=({poster=false})=>{
  const localFrame=useCurrentFrame();const frame=poster?65:localFrame;
  return <AbsoluteFill style={{background:PAPER,clipPath:`inset(0 0 0 ${interpolate(frame,[0,20],[100,0],ease)}%)`}}>
    <div style={{position:'absolute',left:96,top:58}}><Brand dark/></div>
    <div style={{position:'absolute',right:98,top:74,fontSize:19,color:'#4b6757',letterSpacing:3}}>SCHOOL OPERATIONS, WITH INTELLIGENCE.</div>
    <Interactive.Div name="Human control payoff" style={{position:'absolute',left:92,top:305,color:INK,fontSize:113,fontWeight:560,lineHeight:1.1,letterSpacing:-5.5,opacity:interpolate(frame,[10,25],[0,1],clamp),translate:`0px ${interpolate(frame,[10,34],[48,0],ease)}px`}}>Agents prepare.<br/><span style={{color:'#087f70'}}>You decide.</span></Interactive.Div>
    {frame>=55?<Img src={media('brand-lockup.png')} style={{position:'absolute',left:1316,top:194,width:512,height:512}}/>:<div style={{position:'absolute',right:215,top:318,width:265,height:265,rotate:`${interpolate(frame,[15,50],[10,-5],ease)}deg`,scale:interpolate(frame,[15,46],[.75,1],ease),opacity:interpolate(frame,[15,30],[0,1],clamp)}}><Img src={media('brand-mark.png')} style={{width:'100%',height:'100%',filter:'drop-shadow(0 24px 40px #07843f22)'}}/></div>}
    <div style={{position:'absolute',left:100,top:648,fontSize:35,color:'#4f6357',opacity:interpolate(frame,[23,40],[0,1],clamp)}}>Accounting and operations, connected.</div>
    <div style={{position:'absolute',left:100,right:100,bottom:117,height:1,background:'#0d4d332c'}}/>
    <div style={{position:'absolute',left:100,bottom:52,fontSize:35,fontWeight:550,color:'#087f70'}}>schoolbooks.ke <span style={{marginLeft:20}}>↗</span></div>
    <div style={{position:'absolute',right:100,bottom:64,fontSize:20,color:'#4f6357'}}>Meet your new school workspace.</div>
  </AbsoluteFill>;
};

/** Original Brag story, authored in the shared Remotion studio from repository evidence. */
export const SchoolbooksLaunch:React.FC=()=>{
  return <AbsoluteFill
    style={{
      fontFamily: 'Schoolbooks Inter',
      overflow: 'hidden',
      background: INK
    }}
  >
    <Sequence name="Records become useful" durationInFrames={141}><Opening/></Sequence>
    <Sequence name="Actual school workspace" from={120} durationInFrames={215}><Workspace/></Sequence>
    <Sequence name="Spark and the accounting specialist" from={315} durationInFrames={260}><Specialist/></Sequence>
    <Sequence name="Agents prepare, you decide" from={555} durationInFrames={135}><Closing/></Sequence>
    <Sequence name="Poster thumbnail" durationInFrames={1}><Closing poster/></Sequence>
    <Soundtrack project="schoolbooks-launch" voiceover/>
  </AbsoluteFill>;
};
