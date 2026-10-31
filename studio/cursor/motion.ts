export type CursorKind='arrow'|'hand'|'touch';
export type CursorClick={frame:number;x:number;y:number;endFrame?:number};
export type CursorWindow={from:number;to:number};
export const HOTSPOTS={arrow:{x:5,y:4},hand:{x:16.5,y:5},touch:{x:20,y:24}} as const;
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export function cursorOpacity(frame:number,windows:CursorWindow[],fadeFrames=4){
  return Math.max(0,...windows.map(w=>Math.min(smooth((frame-w.from)/fadeFrames),smooth((w.to-frame)/fadeFrames))));
}
export function clickScale(frame:number,clicks:CursorClick[],fps:number){
  const event=clicks.find(c=>frame>=c.frame&&frame<c.frame+fps*.4);
  if(!event)return 1;
  const age=(frame-event.frame)/fps;
  if(age<.065)return 1-.14*smooth(age/.065);
  if(age<.19)return .86+.17*smooth((age-.065)/.125);
  return 1.03-.03*smooth((age-.19)/.18);
}
export function clickPulse(frame:number,event:CursorClick,fps:number){
  const duration=fps*.5,age=frame-event.frame;
  if(age<0||age>=duration||(event.endFrame!==undefined&&frame>=event.endFrame))return {visible:false,radius:0,opacity:0};
  const t=age/duration;
  return {visible:true,radius:5+23*(1-Math.pow(1-t,3)),opacity:.62*Math.pow(1-t,1.5)};
}
