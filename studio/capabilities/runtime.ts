import type {OrbState} from 'thinking-orbs/engine';

export type Backend='p5'|'pixi'|'orb';
export type FrameRuntime={draw:(seconds:number)=>void|Promise<void>;dispose:()=>void};

/** Each draw is a complete image at an absolute time. No backend owns a clock. */
export async function createRuntime(kind:Backend,host:HTMLElement,width:number,height:number,state:OrbState='working'):Promise<FrameRuntime>{
  if(kind==='p5'){
    const {default:P5}=await import('p5');
    return new Promise((resolve,reject)=>{
      let seconds=0;
      try{new P5(p=>{
        p.setup=()=>{
          p.pixelDensity(1);p.createCanvas(width,height);p.noLoop();
          resolve({draw:async t=>{seconds=t;await p.redraw();},dispose:()=>{p.remove();}});
        };
        p.draw=()=>{
          p.clear();p.randomSeed(20261031);p.noiseSeed(20261031);
          const y=height*.5,left=30,right=width-30;
          p.stroke('#315849');p.strokeWeight(2);p.line(left,y,right,y);
          const progress=Math.max(0,Math.min(1,seconds/18));
          p.stroke('#72d9be');p.strokeWeight(5);p.line(left,y,left+(right-left)*progress,y);
          for(let i=0;i<5;i++){
            const x=left+(right-left)*i/4;
            p.stroke(i/4<=progress?'#72d9be':'#496256');p.strokeWeight(2);
            p.fill(i/4<=progress?'#72d9be':'#15251e');p.circle(x,y,18);
          }
          p.noStroke();
          for(let i=0;i<22;i++){
            const x=p.random(14,width-14),base=p.random(.12,.87)*height;
            p.fill(114,217,190,35);p.circle(x,base+Math.sin(seconds*.7+i)*5,3);
          }
        };
      },host);}catch(error){reject(error);}
    });
  }
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;host.appendChild(canvas);
  if(kind==='orb'){
    const {resolvePreset,MODE_FRAMES,paintFrame}=await import('thinking-orbs/engine');
    const preset=resolvePreset(state,64),ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('2D canvas unavailable');
    return {draw:seconds=>{
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);
      const size=Math.min(width,height);ctx.translate((width-size)/2,(height-size)/2);ctx.scale(size/64,size/64);
      paintFrame(ctx,MODE_FRAMES[preset.mode](64,seconds*preset.speed,{...preset.opts}),true,{r:114,g:217,b:190});
    },dispose:()=>canvas.remove()};
  }
  const {Application,Graphics}=await import('pixi.js');
  const app=new Application();
  await app.init({canvas,width,height,preference:'webgl',autoStart:false,sharedTicker:false,
    backgroundAlpha:0,resolution:1,antialias:false,preserveDrawingBuffer:true});
  app.stop();app.ticker.stop();
  const tracks=new Graphics();
  for(let i=0;i<3;i++)tracks.moveTo(0,height*(.2+i*.3)).bezierCurveTo(width*.35,height*(.2+i*.3),width*.5,height*.5,width*.85,height*.5);
  tracks.stroke({width:1.5,color:0x72d9be,alpha:.23});app.stage.addChild(tracks);
  const records=Array.from({length:18},(_,i)=>{
    const g=new Graphics().roundRect(-14,-9,28,18,3).fill(i%3?0x72d9be:0xe0c68c);
    app.stage.addChild(g);return g;
  });
  return {draw:seconds=>{
    records.forEach((g,i)=>{
      const u=((seconds*.14+i/records.length)%1+1)%1;
      const origin=height*(.2+(i%3)*.3);
      g.position.set(width*.85*u,origin+(height*.5-origin)*(u*u*(3-2*u)));
      g.alpha=Math.sin(Math.PI*u)*.9;g.rotation=(1-u)*.12;
    });app.render();
  },dispose:()=>app.destroy({removeView:true},{children:true})};
}
