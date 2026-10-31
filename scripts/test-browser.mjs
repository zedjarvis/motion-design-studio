import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout as pause} from 'node:timers/promises';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(root);
const execute=(command,args)=>new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:'inherit',env:{...process.env,STUDIO_URL:`http://127.0.0.1:${process.env.TEST_STUDIO_PORT||3210}`}});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`${command} ${args.join(' ')} exited ${code}`)));});
const port=Number(process.env.TEST_STUDIO_PORT||3210);
const studioUrl=`http://127.0.0.1:${port}`;
const npm=process.platform==='win32'?'npm.cmd':'npm';
const reachable=()=>fetch(studioUrl,{signal:AbortSignal.timeout(1000)}).then(r=>r.ok).catch(()=>false);
let studio;
try{
  await execute(npm,['run','build:art']);
  if(!await reachable()){
    console.log('Starting an owned Studio process for browser tests');
    studio=spawn(process.execPath,['node_modules/@remotion/cli/remotion-cli.js','studio','studio/index.ts','--port',String(port),'--no-open'],{stdio:'inherit',detached:process.platform!=='win32',env:process.env});
    let ready=false;for(let i=0;i<120;i++){if(await reachable()){ready=true;break;}if(studio.exitCode!==null)throw Error('Studio exited before becoming ready');await pause(500);}
    if(!ready)throw Error('Studio was not ready within 60 seconds');
  }else console.log('Reusing the existing local Studio');
  await execute(npm,['run','test:capabilities']);
  await execute(npm,['run','test:cursors']);
  // Both fixtures are self-contained; no original references or product media.
  await execute(npm,['run','render','--','EngineCheck','--concurrency','2']);
  await execute(npm,['run','render','--','CursorProbe','--concurrency','2']);
  await fs.mkdir('analysis/ci',{recursive:true});
  await fs.writeFile('analysis/ci/browser.json',JSON.stringify({passed:true,scope:'Real graphics/cursor browser checks and full EngineCheck/CursorProbe PNG, repeatability and MP4/RGB exports; not product-asset or listening acceptance'},null,2)+'\n');
}finally{
  if(studio?.pid&&studio.exitCode===null){if(process.platform==='win32')studio.kill();else process.kill(-studio.pid,'SIGTERM');}
}
