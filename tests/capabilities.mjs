import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {MODE_FRAMES,resolvePreset} from 'thinking-orbs/engine';
import rough from 'roughjs';
import {createTimeline,engine} from 'animejs';

const results=[];
const check=(name,fn)=>{fn();results.push({name,passed:true});};
engine.useDefaultMainLoop=false;
check('All nine Orbs modes at 20/32/64 are finite, depth sorted and seekable',()=>{
  for(const state of ['working','searching','solving','listening','connecting','weaving','composing','breathing','shaping']){
    for(const size of [20,32,64]){
      const {mode,speed,opts}=resolvePreset(state,size),frame=t=>MODE_FRAMES[mode](size,t*speed,{...opts});
      const a=frame(.6);assert(a.dots.length>0);
      for(const d of a.dots)assert([d.x,d.y,d.z,d.r,d.white].every(Number.isFinite));
      for(let i=1;i<a.dots.length;i++)assert(a.dots[i].z>=a.dots[i-1].z);
      frame(17);assert.deepEqual(frame(.6),a);assert.notDeepEqual(frame(1.9),a);
    }
  }
});
check('Rough.js preserves a positive seed and changes with another seed',()=>{
  const g=rough.generator(),draw=seed=>g.toPaths(g.rectangle(0,0,200,100,{seed,roughness:1.4,fill:'#72d9be',fillStyle:'cross-hatch'}));
  assert.deepEqual(draw(42),draw(42));assert.notDeepEqual(draw(42),draw(43));assert(draw(42).some(p=>p.d.length>20));
});
check('Anime.js paused numeric timeline seeks backward without accumulating state',()=>{
  const sample=order=>{const model={x:0};const t=createTimeline({autoplay:false}).add(model,{x:[0,100],duration:1000,ease:'outCubic'},0);for(const time of order)t.seek(time,true);const x=model.x;t.cancel();return x;};
  assert.equal(sample([500]),87.5);assert.equal(sample([1000,0,800,500]),sample([500]));assert.equal(sample([1000,0]),0);
});

const rgba=uri=>{
  const png=Buffer.from(uri.split(',')[1],'base64');
  const r=spawnSync('ffmpeg',['-v','error','-i','pipe:0','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{input:png,maxBuffer:8_000_000});
  assert.equal(r.status,0,r.stderr.toString());return r.stdout;
};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${process.env.STUDIO_URL||'http://localhost:3210'}/GraphicsSeekTest`);
  let target;
  for(let i=0;i<120&&!target;i++){
    for(const frame of page.frames())if(await frame.evaluate(()=>typeof window.motionSeekTest==='function').catch(()=>false)){target=frame;break;}
    if(!target)await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert(target,'Studio did not load the acceptance harness');
  const sample=async n=>{
    await target.evaluate(n=>window.motionSeekTest(n),n);
    await target.waitForFunction(n=>{
      const hosts=[...document.querySelectorAll('[data-frame-backend]')];
      return hosts.length===3&&hosts.every(host=>host.dataset.drawFrame===String(n));
    },n,{timeout:30000});
    return target.evaluate(()=>Object.fromEntries([...document.querySelectorAll('[data-frame-backend]')].map(host=>[host.dataset.frameBackend,host.querySelector('canvas').toDataURL('image/png')])));
  };
  const first=await sample(15),later=await sample(45);await sample(89);await sample(0);const repeated=await sample(15);
  for(const name of ['p5','orb','pixi']){
    const a=rgba(first[name]),b=rgba(later[name]),c=rgba(repeated[name]);
    assert(a.equals(c),`${name} did not redraw identically after backward seeking`);
    assert(!a.equals(b),`${name} did not respond to frame time`);
    let visible=0;for(let i=3;i<a.length;i+=4)if(a[i]>0)visible++;
    assert(visible>20,`${name} canvas is blank`);
    results.push({name:`${name}: actual canvas, nonblank, time-dependent and byte-identical after reverse seek`,passed:true,visiblePixels:visible,rgbaSha256:createHash('sha256').update(a).digest('hex')});
  }
  assert.deepEqual(errors,[],'Browser raised errors');
  await page.screenshot({path:'analysis/capabilities/studio-seek-test.png'});
}finally{await browser.close();}
const brush=JSON.parse(await fs.readFile('analysis/capabilities/brush-build.json','utf8'));
assert(brush.verification.freshPageRgbEqual);results.push({name:'p5.brush actual seeded artwork matches across fresh pages',passed:true});
await fs.writeFile('analysis/capabilities/report.json',JSON.stringify({passed:true,results},null,2)+'\n');
console.log(`${results.length} capability checks passed.`);
