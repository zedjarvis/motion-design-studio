import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

/** Missing optional benchmarks must not prevent rendering original diagnostics.
 * Published reference hashes still prevent their inclusion in production media.
 * This is an input guard, never the pixel/PTS acceptance decision. */
export async function auditRenderInputs(root,sourceHashes,references){
  const digests=new Set(),missing=[];
  for(const ref of references){
    if(ref.sha256)digests.add(ref.sha256);
    try{
      const digest=hash(await fs.readFile(path.resolve(root,ref.source)));
      if(ref.sha256&&digest!==ref.sha256)throw new Error(`Reference download differs from its manifest: ${ref.id}`);
      digests.add(digest);
    }catch(error){if(error.code==='ENOENT')missing.push(ref.id);else throw error;}
  }
  for(const [file,digest] of Object.entries(sourceHashes)){
    if(file.startsWith('public/')&&digests.has(digest))throw new Error(`A reference download is present in production assets: ${file}`);
    if(/^(studio|projects)\//.test(file)&&/\.[cm]?[jt]sx?$/.test(file)){
      const code=await fs.readFile(path.join(root,file),'utf8');
      if(code.includes('analysis/frames')||references.some(ref=>code.includes(ref.source)))throw new Error(`Production source references benchmark imagery: ${file}`);
    }
  }
  return {missingReferences:missing,referenceHashes:digests.size};
}
