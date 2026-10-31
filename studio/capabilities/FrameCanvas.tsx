import React,{useLayoutEffect,useMemo,useRef,useState} from 'react';
import {cancelRender,continueRender,delayRender,useCurrentFrame,useVideoConfig} from 'remotion';
import type {OrbState} from 'thinking-orbs/engine';
import {createRuntime,type Backend,type FrameRuntime} from './runtime';

type Session={promise:Promise<FrameRuntime>;tail:Promise<void>;disposed:boolean};

export const FrameCanvas:React.FC<{kind:Backend;width:number;height:number;state?:OrbState;style?:React.CSSProperties}>=({kind,width,height,state='working',style})=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),host=useRef<HTMLDivElement>(null),session=useRef<Session|null>(null);
  const [initialHandle]=useState(()=>delayRender(`Initialize ${kind} canvas`));
  const initialReleased=useRef(false);
  const factory=useMemo(()=>({kind,width,height,state}),[kind,width,height,state]);
  const releaseInitial=()=>{if(!initialReleased.current){initialReleased.current=true;continueRender(initialHandle);}};
  useLayoutEffect(()=>{
    if(!host.current)return;
    const current:Session={promise:createRuntime(factory.kind,host.current,factory.width,factory.height,factory.state),tail:Promise.resolve(),disposed:false};
    session.current=current;
    return()=>{
      current.disposed=true;releaseInitial();
      current.tail.finally(()=>current.promise.then(runtime=>runtime.dispose()).catch(()=>{}));
    };
  },[factory]);
  useLayoutEffect(()=>{
    const current=session.current;if(!current)return;
    const handle=delayRender(`Draw ${kind} at frame ${frame}`);let released=false;
    const release=()=>{if(!released){released=true;continueRender(handle);}};
    current.tail=current.tail.then(async()=>{
      const runtime=await current.promise;
      if(!current.disposed){
        await runtime.draw(frame/fps);
        if(host.current&&session.current===current)host.current.dataset.drawFrame=String(frame);
      }
    }).then(()=>{releaseInitial();release();}).catch(error=>{releaseInitial();release();if(!current.disposed)cancelRender(error);});
    return release;
  },[frame,fps,factory]);
  return <div ref={host} data-frame-backend={kind} style={{width,height,...style}}/>;
};
