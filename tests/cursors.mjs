import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {guideCursorTimeline} from '../studio/capabilities/choreography.ts';
import {clickPulse,clickScale} from '../studio/cursor/motion.ts';
const results=[];
const plan=JSON.parse(await fs.readFile('projects/schoolbooks-feature-guide/src/cursor-plan.json','utf8'));
const cues=JSON.parse(await fs.readFile('projects/schoolbooks-feature-guide/audio-cues.json','utf8'));
const actualClicks=cues.cues.filter(c=>c.src.includes('/click_')).map(c=>c.frame);
assert.deepEqual(plan.clicks.map(c=>c.frame),actualClicks);results.push({name:'Guide visual clicks equal the three authored click SFX frames; link hover has no phantom click',passed:true});
const event={frame:30,x:120,y:140,endFrame:45};
assert.equal(clickScale(29,[event],30),1);assert(clickScale(32,[event],30)<.9);assert.equal(clickScale(60,[event],30),1);
assert(!clickPulse(29,event,30).visible);assert(clickPulse(32,event,30).visible);assert(!clickPulse(45,event,30).visible);
results.push({name:'Press recovers and ripple ends at scene boundary, with no pre-click flash',passed:true});
const targets={review:{x:100,y:150},confirm:{x:400,y:250},history:{x:250,y:300},open:{x:300,y:350}};
const timing={review:183,confirm:399,history:531,open:633};
const path=guideCursorTimeline(targets,30,timing);
for(const name of ['open','review','history','confirm','review']){path.timeline.seek(timing[name]/30*1000,true);assert(Math.abs(path.value.x-targets[name].x)<.001&&Math.abs(path.value.y-targets[name].y)<.001);}
path.timeline.cancel();results.push({name:'Anime path arrives on event-plan frames under arbitrary seek order',passed:true});
const rgba=png=>{const r=spawnSync('ffmpeg',['-v','error','-threads','1','-i','pipe:0','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{input:png,maxBuffer:5_000_000,timeout:15000});assert.equal(r.status,0,r.stderr.toString());return r.stdout;};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(`${process.env.STUDIO_URL||'http://localhost:3210'}/CursorSeekTest`);
 let target;for(let i=0;i<120&&!target;i++){
  for(const f of page.frames())if(await f.evaluate(()=>typeof window.cursorSeekTest==='function').catch(()=>false)){target=f;break;}
  if(!target)await new Promise(r=>setTimeout(r,250));
 }
 assert(target,'Cursor test did not mount');
 const sample=async frame=>{
  await target.evaluate(n=>window.cursorSeekTest(n),frame);
  await target.waitForFunction(n=>document.querySelector('[data-cursor-probe-frame]')?.getAttribute('data-cursor-probe-frame')===String(n),frame);
  const geometry=await target.evaluate(()=>[...document.querySelectorAll('[data-cursor-anchor]')].map(anchor=>{
   const svg=anchor.querySelector('[data-cursor-icon]'),hotspot=new DOMPoint(+svg.dataset.hotspotX,+svg.dataset.hotspotY),point=hotspot.matrixTransform(svg.getScreenCTM()),box=anchor.getBoundingClientRect();
   return {kind:anchor.dataset.cursorKind,error:Math.hypot(point.x-box.x,point.y-box.y),overflow:getComputedStyle(svg).overflow};
  }));
  for(const entry of geometry){assert(entry.error<.001,`${entry.kind} hotspot drift ${entry.error}`);assert.equal(entry.overflow,'visible');}
  return {png:await target.locator('[data-cursor-probe-frame]').screenshot(),geometry};
 };
 const before=await sample(0),pressed=await sample(32);await sample(60);await sample(0);const repeated=await sample(32);
 assert(rgba(pressed.png).equals(rgba(repeated.png)),'Cursor layer depends on seek order');
 assert(!rgba(before.png).equals(rgba(pressed.png)),'No visible click feedback');
 results.push({name:'Real browser: arrow/hand/touch hotspots remain fixed through press and tilt, and SVG paint is not clipped',passed:true,geometry:pressed.geometry});
 results.push({name:'Real browser: clicked image changes and is byte-identical after backward seeking',passed:true});
 assert.deepEqual(errors,[]);await fs.mkdir('analysis/cursors',{recursive:true});await fs.writeFile('analysis/cursors/probe.png',pressed.png);
}finally{await browser.close();}
await fs.writeFile('analysis/cursors/report.json',JSON.stringify({passed:true,results},null,2)+'\n');console.log(`${results.length} cursor checks passed.`);
