import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {resolveRepository} from '../scripts/local-config.mjs';
import {auditRenderInputs} from '../scripts/render-inputs.mjs';
import {auditFiles} from '../scripts/release-audit.mjs';
import {clickPulse,clickScale,cursorOpacity} from '../studio/cursor/motion.ts';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fixture=async fn=>{const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-unit-'));try{await fn(root);}finally{await fs.rm(root,{recursive:true,force:true});}};

test('repository environment overrides ignored local config',()=>fixture(async root=>{
 const configFile=path.join(root,'config.json');await fs.writeFile(configFile,JSON.stringify({repositories:{PRODUCT_REPO:'/local/product'}}));
 assert.equal(resolveRepository('$PRODUCT_REPO',{environment:{PRODUCT_REPO:'/env/product'},configFile}),'/env/product');
 assert.equal(resolveRepository('$PRODUCT_REPO',{environment:{},configFile}),'/local/product');
 assert.equal(resolveRepository(root),root);
}));
test('missing/malformed product configuration fails clearly',()=>fixture(async root=>{
 const configFile=path.join(root,'config.json');
 assert.throws(()=>resolveRepository('',{configFile}),/path is required/);
 assert.throws(()=>resolveRepository('$PRODUCT_REPO',{environment:{},configFile}),/Set PRODUCT_REPO/);
 await fs.writeFile(configFile,'{broken');assert.throws(()=>resolveRepository('$PRODUCT_REPO',{environment:{},configFile}),SyntaxError);
}));
test('optional missing references do not block original renders',()=>fixture(async root=>{
 const result=await auditRenderInputs(root,{},[{id:'optional',source:'absent.mp4',sha256:hash('reference')}]);
 assert.deepEqual(result,{missingReferences:['optional'],referenceHashes:1});
}));
test('declared hashes block copied reference media even without originals',()=>fixture(async root=>{
 await assert.rejects(()=>auditRenderInputs(root,{'public/copied.mp4':hash('reference')},[{id:'optional',source:'absent.mp4',sha256:hash('reference')}]),/reference download/);
}));
test('changed reference files fail the input audit',()=>fixture(async root=>{
 await fs.writeFile(path.join(root,'reference.mp4'),'changed');
 await assert.rejects(()=>auditRenderInputs(root,{},[{id:'ref',source:'reference.mp4',sha256:hash('expected')}]),/differs from its manifest/);
}));
test('existing reference hashes and authored source are audited',()=>fixture(async root=>{
 await fs.mkdir(path.join(root,'studio'));await fs.writeFile(path.join(root,'reference.mp4'),'ref');await fs.writeFile(path.join(root,'studio/scene.tsx'),'<div>authored</div>');
 assert.equal((await auditRenderInputs(root,{'studio/scene.tsx':hash('source')},[{id:'ref',source:'reference.mp4'}])).referenceHashes,1);
 await fs.writeFile(path.join(root,'studio/scene.tsx'),"const source='analysis/frames/0001.png'");
 await assert.rejects(()=>auditRenderInputs(root,{'studio/scene.tsx':'hash'},[]),/references benchmark imagery/);
 await fs.writeFile(path.join(root,'studio/scene.tsx'),"const source='reference.mp4'");
 await assert.rejects(()=>auditRenderInputs(root,{'studio/scene.tsx':'hash'},[{id:'ref',source:'reference.mp4'}]),/references benchmark imagery/);
}));
test('release audit accepts source and catches credentials without printing values',()=>fixture(async root=>{
 await fs.writeFile(path.join(root,'good.ts'),'export const ready=true');assert.deepEqual(await auditFiles(root,['good.ts']),[]);
 const token='ghp_'+'x'.repeat(36);await fs.writeFile(path.join(root,'bad.ts'),token);
 const issues=await auditFiles(root,['bad.ts']);assert.equal(issues[0].rule,'github-token');assert(!JSON.stringify(issues).includes(token));
}));
test('release audit rejects private/local files, traversal, links and oversized files',()=>fixture(async root=>{
 assert.equal((await auditFiles(root,['.env','out/movie.mp4','projects/demo/evidence.json'])).length,3);
 assert.equal((await auditFiles(root,['../outside.txt']))[0].rule,'outside-repository');
 await fs.symlink('/outside',path.join(root,'link'));assert.equal((await auditFiles(root,['link']))[0].rule,'symlink');
 const file=await fs.open(path.join(root,'large'),'w');await file.truncate(10_000_001);await file.close();assert.equal((await auditFiles(root,['large']))[0].rule,'large-file');
}));
test('cursor visibility fades only inside its authored windows',()=>{
 const windows=[{from:10,to:30}];assert.equal(cursorOpacity(0,windows),0);assert.equal(cursorOpacity(10,windows),0);assert.equal(cursorOpacity(20,windows),1);assert.equal(cursorOpacity(30,windows),0);assert(cursorOpacity(12,windows)>0&&cursorOpacity(12,windows)<1);assert.equal(cursorOpacity(10,[]),0);
});
test('click pressure recovers, and fixed-point pulses respect their end frame',()=>{
 const event={frame:30,x:10,y:20,endFrame:42};assert.equal(clickScale(0,[event],30),1);assert(clickScale(31,[event],30)<1);assert(clickScale(34,[event],30)<1);assert(clickScale(37,[event],30)>1);assert.equal(clickScale(90,[event],30),1);
 assert(!clickPulse(29,event,30).visible);assert(clickPulse(32,event,30).visible);assert(!clickPulse(42,event,30).visible);assert(!clickPulse(90,event,30).visible);
 assert(clickPulse(35,{frame:30,x:10,y:20},30).radius>clickPulse(31,event,30).radius);
});
