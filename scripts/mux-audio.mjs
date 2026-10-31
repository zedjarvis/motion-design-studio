// Revise sound without recapturing unchanged authored picture. Every video
// packet and presentation timestamp must remain identical to the parent render.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {run} from './process.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [project,parentArg]=process.argv.slice(2);
if(!project||!parentArg)throw new Error('Usage: npm run mux:audio -- project-id parent/master.rgb.mp4');
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const parent=path.resolve(parentArg),parentReceipt=path.join(path.dirname(parent),'receipt.json');
const capture=JSON.parse(await fs.readFile(parentReceipt,'utf8'));
if(capture.status!=='rendered-not-parity-approved'||capture.parityMasterSha256!==await hash(parent))throw new Error('Parent is not a completed, hash-verified studio render');
for(const stage of ['sourceAudit','bundle','capture','determinism','encode'])if(capture.stages[stage]!=='passed')throw new Error(`Parent failed ${stage}`);
const folder=path.join(root,'public/generated',project),mix=path.join(folder,'mix.wav');
const audio=JSON.parse(await fs.readFile(path.join(folder,'audio-report.json'),'utf8'));
const {fps,durationInFrames,width,height}=capture.video;
if(audio.project!==project||audio.frames!==durationInFrames||audio.fps!==fps||!audio.technicalChecksPassed||audio.sha256!==await hash(mix))throw new Error('Soundtrack report does not match this picture or audio');
for(const [file,digest]of Object.entries(audio.stems||{}))if(digest!==await hash(path.join(folder,file)))throw new Error(`Changed stem: ${file}`);
const attempt=await fs.mkdtemp(path.join(root,'out',capture.composition,'sound-'));
const receipt={...capture,status:'started',kind:'audio-revision',
  framesOrigin:capture.framesOrigin||path.join(path.dirname(parent),'frames'),
  bundleOrigin:capture.bundleOrigin||path.join(path.dirname(parent),'bundle'),
  sourceScope:'sourceHashes/bundleHashes describe inherited captured picture; audioRevision records the replacement soundtrack.',
  captureEvidence:{receipt:parentReceipt,sha256:await hash(parentReceipt),master:parent},
  audioRevision:{project,mixSha256:await hash(mix),report:audio,sourceHashes:{}},stages:{...capture.stages}};
for(const file of ['scripts/mux-audio.mjs','scripts/voiceover.py','scripts/audio.py',`projects/${project}/audio-cues.json`,`projects/${project}/narration.json`]){
  try{receipt.audioRevision.sourceHashes[file]=await hash(path.join(root,file));}catch(error){if(error.code!=='ENOENT')throw error;}
}
const save=()=>fs.writeFile(path.join(attempt,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
try{
  await save();await fs.copyFile(mix,path.join(attempt,'mix.wav'));
  for(const file of ['CREDITS.txt','audio-report.json'])await fs.copyFile(path.join(folder,file),path.join(attempt,file));
  const movie=path.join(attempt,'video.mp4'),master=path.join(attempt,'master.rgb.mp4');
  await run('ffmpeg',['-v','error','-i',capture.output,'-i',mix,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-frames:v',String(durationInFrames),'-t',String(durationInFrames/fps),'-movflags','+faststart','-y',movie]);
  await run('ffmpeg',['-v','error','-i',parent,'-i',movie,'-map','0:v:0','-map','1:a:0','-c','copy','-frames:v',String(durationInFrames),'-movflags','+faststart','-y',master]);
  const packetHash=async file=>(await run('ffmpeg',['-v','error','-i',file,'-map','0:v:0','-c','copy','-an','-f','hash','-hash','sha256','-'])).stdout.trim();
  const pts=async file=>JSON.parse((await run('ffprobe',['-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',file])).stdout).frames.map(frame=>frame.best_effort_timestamp_time);
  for(const [before,after]of [[parent,master],[capture.output,movie]]){
    if(await packetHash(before)!==await packetHash(after)||JSON.stringify(await pts(before))!==JSON.stringify(await pts(after)))throw new Error('Audio revision changed captured picture or presentation times');
  }
  receipt.exportMetadata=JSON.parse((await run('ffprobe',['-v','error','-count_frames','-show_streams','-of','json',master])).stdout);
  const video=receipt.exportMetadata.streams.find(stream=>stream.codec_type==='video');
  if(video.width!==width||video.height!==height||Number(video.nb_read_frames)!==durationInFrames)throw new Error('Video metadata changed');
  receipt.stages.audioRevision='passed';receipt.output=movie;receipt.outputSha256=await hash(movie);
  receipt.parityMaster=master;receipt.parityMasterSha256=await hash(master);receipt.status='rendered-not-parity-approved';
  receipt.audioRevision.pictureIdentity='Every compressed video packet and every displayed PTS equal to the hash-verified parent capture.';
  console.log(`Audio revision: ${movie}\nRGB master: ${master}\nCaptured picture and timestamps unchanged.`);
}catch(error){receipt.status='failed';receipt.error=String(error.stack||error);process.exitCode=1;console.error(error.message);}
finally{await save();}
