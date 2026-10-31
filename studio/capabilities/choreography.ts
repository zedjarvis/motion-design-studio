import {createTimeline,engine} from 'animejs';

// This adapter is clocked by Remotion; no Anime requestAnimationFrame loop.
engine.useDefaultMainLoop=false;

export const entranceTimeline=()=>{
  const value={y:72,opacity:0,second:0,third:0};
  const timeline=createTimeline({autoplay:false,defaults:{ease:'outCubic'}})
    .add(value,{y:[72,0],opacity:[0,1],duration:650},0)
    .add(value,{second:[0,1],duration:500},220)
    .add(value,{third:[0,1],duration:500},440);
  return {value,timeline};
};

type Point={x:number;y:number};
export const guideCursorTimeline=(targets:{review:Point;confirm:Point;history:Point;open:Point},fps:number,frames:{review:number;confirm:number;history:number;open:number})=>{
  const {review,confirm,history,open}=targets,start={x:review.x-120,y:review.y+100};
  const ms=(frame:number)=>frame/fps*1000;
  const value={...start};
  const timeline=createTimeline({autoplay:false,defaults:{ease:'inOutCubic'}})
    .add(value,{x:[start.x,review.x],y:[start.y,review.y],duration:ms(18)},ms(frames.review-18))
    .add(value,{x:[review.x,confirm.x],y:[review.y,confirm.y],duration:ms(24)},ms(frames.confirm-24))
    .add(value,{x:[confirm.x,history.x],y:[confirm.y,history.y],duration:ms(15)},ms(frames.history-15))
    .add(value,{x:[history.x,open.x],y:[history.y,open.y],duration:ms(33)},ms(frames.open-33));
  return {value,timeline};
};
