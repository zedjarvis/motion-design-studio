import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const names=['motion-studio','motion-p5-brush','motion-p5','motion-thinking-orbs','motion-roughjs','motion-animejs','motion-pixijs','motion-cursors'];
const install=process.argv.includes('--install');
const target=path.join(os.homedir(),'.codex','skills');
const plan=[];
for(const name of names){
  const source=path.join(root,'skills',name),destination=path.join(target,name);
  await fs.access(path.join(source,'SKILL.md'));
  let existing;
  try{existing=await fs.realpath(destination);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing&&existing!==source)throw Error(`Existing skill preserved; destination conflicts: ${destination}`);
  plan.push({source,destination,existing:!!existing});
}
if(install){
  await fs.mkdir(target,{recursive:true});
  for(const item of plan)if(!item.existing)await fs.symlink(item.source,item.destination,'dir');
}
for(const item of plan)console.log(`${install?'Available':'Would link'}: ${path.basename(item.source)} -> ${item.destination}`);
if(!install)console.log('Dry run only. Pass --install to register these repo-owned skills for other projects. Existing different skills are never replaced.');
