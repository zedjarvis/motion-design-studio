import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {verifyNativeUi} from '../scripts/verify-native-ui.mjs';
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'native-ui-gate-test-'));
const project=`__native_ui_test_${path.basename(temporary)}`,publicRoot=path.join(temporary,'public'),copied=path.join(publicRoot,project,'native-ui');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const ffmpeg=(args,input)=>{const r=spawnSync('ffmpeg',['-v','error',...args],{input,maxBuffer:5_000_000,timeout:15000});assert.equal(r.status,0,r.stderr.toString());return r.stdout;};
try{
  await fs.mkdir(copied,{recursive:true});
  const width=16,height=12,left=6,top=8,frames=[],shots=[];
  for(let n=0;n<5;n++){
    const source=Buffer.alloc(width*height*3),full=Buffer.alloc(32*32*3,9);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<3;c++){
      const value=(n*31+x*5+y*7+c*19)%256;source[(y*width+x)*3+c]=value;full[((y+top)*32+x+left)*3+c]=value;
    }
    frames.push(full);const file=`state-${n}.png`;
    ffmpeg(['-f','rawvideo','-pixel_format','rgb24','-video_size',`${width}x${height}`,'-i','pipe:0','-frames:v','1','-y',path.join(temporary,file)],source);
    const bytes=await fs.readFile(path.join(temporary,file));await fs.writeFile(path.join(copied,file),bytes);shots.push({name:`state-${n}`,file,sha256:digest(bytes)});
  }
  // Synthetic provenance is an explicit unit fixture for the pixel verifier;
  // production evidence comes from the actual-app capture script and review.
  const provenance={repository:temporary,errors:[],compiledAssetHashes:Object.fromEntries(Array.from({length:11},(_,i)=>[`synthetic-${i}`,'unit-fixture'])),requests:[{intercepted:true}],viewport:{width,height,deviceScaleFactor:1},shots};
  const manifest=path.join(temporary,'PROVENANCE.json');await fs.writeFile(manifest,JSON.stringify(provenance));
  const brief={project,repository:temporary,uiEvidence:{mode:'actual-product-capture',manifest,placement:{left,top,width,height},checks:shots.map((s,frame)=>({frame,shot:s.name}))}};
  const encode=async(data,name)=>{const file=path.join(temporary,name);ffmpeg(['-f','rawvideo','-pixel_format','rgb24','-video_size','32x32','-framerate','30','-i','pipe:0','-frames:v','5','-threads','1','-c:v','libx264rgb','-crf','0','-y',file],data);return {parityMaster:file,parityMasterSha256:digest(await fs.readFile(file))};};
  const master=await encode(Buffer.concat(frames),'master.mp4');
  assert.equal((await verifyNativeUi(brief,master,{publicRoot})).checks.length,5);
  await assert.rejects(()=>verifyNativeUi({...brief,uiEvidence:undefined},master,{publicRoot}),/actual UI capture evidence/);
  await assert.rejects(()=>verifyNativeUi({...brief,uiEvidence:{...brief.uiEvidence,placement:{left,top,width:17,height}}},master,{publicRoot}),/cannot be resized/);
  const changed=Buffer.concat(frames);changed[4*32*32*3+(top*32+left)*3]++;
  await assert.rejects(async()=>verifyNativeUi(brief,await encode(changed,'one-channel-error.mp4'),{publicRoot}),/Actual UI pixels changed/);
  console.log('4 native UI gate checks passed: exact pixels, missing evidence, resizing and a one-channel error.');
}finally{await fs.rm(temporary,{recursive:true,force:true});}
