import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** External product repos belong in env/local config, never a public checkout. */
export function resolveRepository(value,{environment=process.env,configFile=path.join(root,'.studio.local.json')}={}){
  if(typeof value!=='string'||!value.trim())throw new Error('Repository path is required');
  const variable=value.match(/^\$([A-Z][A-Z0-9_]*)$/)?.[1];
  if(!variable)return path.resolve(value);
  let configured=environment[variable];
  if(!configured){
    try{configured=JSON.parse(fs.readFileSync(configFile,'utf8')).repositories?.[variable];}
    catch(error){if(error.code!=='ENOENT')throw error;}
  }
  if(typeof configured!=='string'||!configured.trim())throw new Error(`Set ${variable} or repositories.${variable} in ignored .studio.local.json before using this optional production`);
  return path.resolve(configured);
}
