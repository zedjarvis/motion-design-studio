import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {run} from './process.mjs';
import {resolveRepository} from './local-config.mjs';
import {verifyNativeUi} from './verify-native-ui.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const cases=(await read('projects/production-cases.json')).cases;
const results=[];
await fs.mkdir('analysis/productions',{recursive:true});
const timestamp=seconds=>new Date(Math.round(seconds*1000)).toISOString().slice(11,23).replace('.',',');
for(const item of cases){
  const dir=`projects/${item.project}`,brief=await read(`${dir}/production.json`);
  assert.equal(brief.composition,item.composition);
  const folders=await fs.readdir(`out/${item.composition}`,{withFileTypes:true});
  const candidates=[];
  for(const folder of folders.filter(f=>f.isDirectory())){
    try{const p=`out/${item.composition}/${folder.name}/receipt.json`,receipt=await read(p);
      if(receipt.output&&receipt.stages.encode==='passed')candidates.push({p,receipt,time:(await fs.stat(p)).mtimeMs});
    }catch{}
  }
  candidates.sort((a,b)=>b.time-a.time);assert(candidates.length,`No full export for ${item.composition}`);
  const {p:receiptPath,receipt}=candidates[0];
  for(const key of ['sourceAudit','bundle','snapshot','chrome','capture','determinism','encode'])assert.equal(receipt.stages[key],'passed',`${item.project}: ${key}`);
  assert.equal(await hash(receipt.output),receipt.outputSha256,'MP4 changed after rendering');
  // Inputs used by the frozen bundle remain auditable. Documentation/review files
  // can change after export; authored code, copied media and dependency pins cannot.
  for(const [file,digest] of Object.entries(receipt.sourceHashes)){
    if(file.startsWith('studio/')||file.startsWith('public/')||/\.[cm]?[jt]sx?$/.test(file)||/\/src\/.*\.json$/.test(file)||['package.json','remotion.config.ts'].includes(file))
      assert.equal(await hash(file),digest,`Stale export input: ${file}`);
  }
  assert.equal(await hash('pnpm-lock.yaml'),receipt.lockfileSha256,'Export dependencies changed');
  const metadata=JSON.parse((await run('ffprobe',['-v','error','-count_frames','-show_streams','-of','json',receipt.output])).stdout);
  const v=metadata.streams.find(s=>s.codec_type==='video'),a=metadata.streams.find(s=>s.codec_type==='audio');
  assert(v&&a,'Export must contain picture and sound');
  assert.equal(v.width,brief.width);assert.equal(v.height,brief.height);assert.equal(+v.nb_read_frames,brief.durationInFrames);
  const [num,den]=v.avg_frame_rate.split('/').map(Number);assert.equal(num/den,brief.fps);
  assert(Math.abs(+v.duration-brief.durationInFrames/brief.fps)<1/brief.fps,'Picture duration mismatch');
  assert.equal(+a.sample_rate,48000);assert.equal(a.channels,2);
  const plan=await read(`${dir}/narration.json`),cues=await read(`${dir}/audio-cues.json`),audio=await read(`public/generated/${item.project}/audio-report.json`);
  assert(audio.technicalChecksPassed&&audio.voiceover);
  assert.equal(await hash(`${dir}/narration.json`),audio.narrationPlanSha256);
  assert.equal(await hash(`${dir}/audio-cues.json`),audio.planSha256);
  for(const segment of plan.segments)assert(segment.startFrame>=0&&segment.endFrame<=brief.durationInFrames&&segment.endFrame>segment.startFrame);
  for(const cue of cues.cues)assert(Number.isInteger(cue.frame)&&cue.frame>=0&&cue.frame<brief.durationInFrames);
  for(const evidence of brief.evidence){
    const file=path.resolve(resolveRepository(brief.repository),evidence.file);
    assert(file.startsWith(resolveRepository(brief.repository)+path.sep));
    const lines=(await fs.readFile(file,'utf8')).split('\n');assert(Math.max(...evidence.lines)<=lines.length);
  }
  const measurement=await run('ffmpeg',['-hide_banner','-i',receipt.output,'-vn','-af','loudnorm=I=-18:TP=-1:LRA=11:print_format=json','-f','null','-']);
  const loudness=JSON.parse(measurement.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/s)[0]);
  assert(Math.abs(+loudness.input_i+18)<=1,`Encoded loudness ${loudness.input_i}`);
  assert(+loudness.input_tp<=-1,`Encoded true peak ${loudness.input_tp}`);
  const nativeUi=item.kind==='guide'?await verifyNativeUi(brief,receipt):undefined;
  const delivery=path.dirname(receipt.output);
  const poster=path.join(delivery,'poster.jpg');
  await run('ffmpeg',['-v','error','-i',receipt.output,'-vf',`select=eq(n\\,${brief.posterFrame})`,'-frames:v','1','-q:v','2','-y',poster]);
  const captions='WEBVTT\n\n'+plan.segments.map((s,i)=>`${i+1}\n${timestamp(s.startFrame/brief.fps).replace(',','.')} --> ${timestamp(s.endFrame/brief.fps).replace(',','.')}\n${s.text}\n`).join('\n');
  await fs.writeFile(path.join(delivery,'captions.vtt'),captions);
  for(const file of ['CREDITS.txt','share-copy.txt','SCRIPT.md'])await fs.copyFile(`${dir}/${file}`,path.join(delivery,file));
  await fs.copyFile('THIRD_PARTY_NOTICES.txt',path.join(delivery,'THIRD_PARTY_NOTICES.txt'));
  const board=`analysis/productions/${item.project}-decoded.jpg`;
  const small=brief.width<brief.height?'270:480':'480:270';
  await run('ffmpeg',['-v','error','-i',receipt.output,'-vf',`fps=1/2,scale=${small},tile=3x${Math.ceil(brief.durationInFrames/brief.fps/2/3)}:padding=4:color=gray`,'-frames:v','1','-q:v','2','-y',board]);
  const result={...item,title:brief.title,passed:true,receipt:receiptPath,output:path.relative(root,receipt.output),poster:path.relative(root,poster),captions:path.relative(root,path.join(delivery,'captions.vtt')),width:v.width,height:v.height,fps:num/den,frames:+v.nb_read_frames,seconds:+v.duration,sha256:receipt.outputSha256,encodedAudio:{lufs:+loudness.input_i,truePeakDbtp:+loudness.input_tp,sampleRate:+a.sample_rate,channels:a.channels},skills:brief.skills,nativeUi,visualReview:brief.visualReview,listeningReview:brief.listeningReview,decodedBoard:board};
  await fs.writeFile(`${dir}/delivery.json`,JSON.stringify(result,null,2)+'\n');results.push(result);
  console.log(`${item.composition}: ${v.nb_read_frames} frames, ${v.width}x${v.height}, ${loudness.input_i} LUFS`);
}
await fs.writeFile('analysis/productions/report.json',JSON.stringify({technicalChecksPassed:true,scope:'Three authored product-video workflows; not a reference parity result or a listening certification',cases:results},null,2)+'\n');
