import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const report=JSON.parse(await fs.readFile('analysis/productions/report.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true});
const results=[];
try{
  for(const item of report.cases){
    const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:3213');
    const video=page.locator(`article[data-project="${item.project}"] video`);
    await video.waitFor();
    const playback=await video.evaluate(async(video,seconds)=>{
      video.muted=true;
      const ended=new Promise((resolve,reject)=>{
        video.addEventListener('ended',()=>resolve({duration:video.duration,time:video.currentTime,readyState:video.readyState,width:video.videoWidth,height:video.videoHeight}),{once:true});
        video.addEventListener('error',()=>reject(Error(video.error?.message||'Video error')),{once:true});
        setTimeout(()=>reject(Error('Playback did not finish')),Math.ceil(seconds*1000)+20000);
      });
      await video.play();return ended;
    },item.seconds);
    assert.equal(playback.width,item.width);assert.equal(playback.height,item.height);
    assert(Math.abs(playback.duration-item.seconds)<.1);assert(Math.abs(playback.time-item.seconds)<.1);assert.deepEqual(errors,[]);
    results.push({project:item.project,passed:true,muted:true,...playback});
    await page.screenshot({path:`analysis/productions/${item.project}-player.png`});await page.close();
  }
}finally{await browser.close();}
await fs.writeFile('analysis/productions/playback.json',JSON.stringify({passed:true,scope:'Full muted HTML video playback; no auditory evaluation',results},null,2)+'\n');
console.log('All three exports played to the end in Chrome (muted).');
