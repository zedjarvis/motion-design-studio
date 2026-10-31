import React from 'react';
import {AbsoluteFill,cancelRender,continueRender,delayRender,Img,staticFile} from 'remotion';
import '../shared/fonts';

export const INK='#09090a',MINT='#72d9be',PAPER='#edf3ef';
if(typeof document!=='undefined'){
  const handle=delayRender('Schoolbooks wordmark font');
  new FontFace('Film Manrope',`url("${staticFile('schoolbooks-product-brag/Manrope.woff2')}")`,{weight:'200 800'}).load()
    .then(font=>{document.fonts.add(font);continueRender(handle);}).catch(cancelRender);
}
export const Brand:React.FC<{project:string;paper?:boolean}>=({project,paper=false})=><div style={{display:'flex',gap:14,alignItems:'center',color:paper?INK:'#f5f8f4'}}>
  <Img src={staticFile(`${project}/brand-48.png`)} style={{width:48,height:48}}/>
  <span style={{fontFamily:'Film Manrope',fontSize:36,fontWeight:760,letterSpacing:-1.8}}>Schoolbooks</span>
</div>;
export const FilmShell:React.FC<{project:string;paper?:boolean;eyebrow:string;children:React.ReactNode}>=({project,paper=false,eyebrow,children})=><AbsoluteFill style={{fontFamily:'Studio Inter',background:paper?PAPER:INK,color:paper?INK:'#f5f8f4',overflow:'hidden'}}>
  <div style={{position:'absolute',left:86,top:58}}><Brand project={project} paper={paper}/></div>
  <div style={{position:'absolute',right:86,top:75,fontSize:18,letterSpacing:2.6,color:paper?'#4e6758':'#9bb5a4'}}>{eyebrow}</div>
  {children}
</AbsoluteFill>;

