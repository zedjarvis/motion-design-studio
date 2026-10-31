import assert from 'node:assert/strict';
import {resolveRepository} from './local-config.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const rgb=(file,filter)=>{
  const result=spawnSync('ffmpeg',['-v','error','-threads','1','-i',file,...(filter?['-vf',filter]:[]),'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{maxBuffer:15_000_000,timeout:30000});
  assert.equal(result.status,0,result.stderr.toString());return result.stdout;
};

/** Product guide fidelity is independent of general movie metadata. Compare
 * native, unobscured UI in the lossless master against actual-app screenshots.
 * It does not establish backend correctness or the four artwork benchmarks. */
export async function verifyNativeUi(brief,receipt,{publicRoot='public'}={}){
  const evidence=brief.uiEvidence;
  assert(evidence,'Feature guides require actual UI capture evidence; an authored approximation cannot pass');
  assert.equal(evidence.mode,'actual-product-capture');
  const provenance=JSON.parse(await fs.readFile(evidence.manifest,'utf8'));
  assert.deepEqual(provenance.errors,[],'Native app capture had browser errors');
  assert(Object.keys(provenance.compiledAssetHashes).length>10,'Missing actual compiled app provenance');
  assert(provenance.requests.length>0&&provenance.requests.every(r=>r.intercepted),'Fixture API traffic was not fully isolated');
  assert.equal(resolveRepository(provenance.repository),resolveRepository(brief.repository));
  assert.equal(provenance.viewport.deviceScaleFactor,1);
  const {left,top,width,height}=evidence.placement;
  assert([left,top,width,height].every(Number.isInteger));
  assert.equal(width,provenance.viewport.width,'Native UI cannot be resized for this 1:1 check');
  assert.equal(height,provenance.viewport.height);
  assert.equal(await hash(receipt.parityMaster),receipt.parityMasterSha256,'RGB master changed');
  const checks=[];
  for(const check of evidence.checks){
    const shot=provenance.shots.find(s=>s.name===check.shot);assert(shot,`Missing actual UI state: ${check.shot}`);
    const source=path.join(path.dirname(evidence.manifest),shot.file),copy=path.join(publicRoot,brief.project,'native-ui',shot.file);
    assert.equal(await hash(source),shot.sha256);assert.equal(await hash(copy),shot.sha256);
    const expected=rgb(source),actual=rgb(receipt.parityMaster,`select=eq(n\\,${check.frame}),crop=${width}:${height}:${left}:${top}`);
    assert.equal(actual.length,width*height*3);assert.equal(expected.length,actual.length);
    let differences=0;for(let i=0;i<actual.length;i++)if(actual[i]!==expected[i])differences++;
    assert.equal(differences,0,`Actual UI pixels changed in ${check.shot} at frame ${check.frame}`);
    checks.push({...check,equal:true,comparedRgbBytes:actual.length,sourceSha256:shot.sha256});
  }
  assert(checks.length>=5,'Check entry, finding, modal, result and History states');
  return {passed:true,mode:evidence.mode,scope:'Exact native UI screenshot pixels in selected unobscured RGB-master frames; real component states exercised against isolated fixtures, no backend or full reference-film parity claim',provenance:evidence.manifest,checks};
}
