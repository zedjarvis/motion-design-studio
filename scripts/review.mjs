import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port=Number(process.env.REVIEW_PORT||3211);
const read=async file=>JSON.parse(await fsp.readFile(path.join(root,file),'utf8'));
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const manifest=(await read('references/manifest.json')).references;
    const candidates=await read('references/candidates.json');
    if(url.pathname==='/api'){
      const inventory=(await read('analysis/inventory.json')).references;
      let results=[];try{results=(await read('out/acceptance/suite.json')).projects;}catch{}
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify(manifest.map(ref=>({id:ref.id,composition:ref.composition,
        ...inventory.find(item=>item.id===ref.id).target,crop:ref.crop,result:results.find(result=>result.project===ref.id&&result.candidate===path.resolve(root,candidates[ref.id]||'')),
        available:!!candidates[ref.id]}))));return;
    }
    let file;
    if(url.pathname==='/')file=path.join(root,'studio/review.html');
    else if(url.pathname==='/frames'){
      const ref=manifest.find(ref=>ref.id===url.searchParams.get('project'));
      if(!ref)throw new Error('Unknown project');
      file=path.join(root,'out/acceptance',ref.id,'frame-checks.csv');
      res.setHeader('Content-Disposition','attachment; filename="frame-checks.csv"');
    }
    else if(url.pathname==='/media'){
      const ref=manifest.find(ref=>ref.id===url.searchParams.get('project'));
      if(!ref)throw new Error('Unknown project');
      file=url.searchParams.get('kind')==='reference'?path.join(root,ref.source)
        :path.join(path.dirname(path.resolve(root,candidates[ref.id])),'video.mp4');
    }else{res.writeHead(404);res.end();return;}
    const stat=await fsp.stat(file);
    const isVideo=file.endsWith('.mp4');
    res.setHeader('Content-Type',isVideo?'video/mp4':file.endsWith('.csv')?'text/csv; charset=utf-8':'text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Accept-Ranges','bytes');
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(match){
      const start=Number(match[1]),end=Math.min(Number(match[2]||stat.size-1),stat.size-1);
      if(start> end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});
      fs.createReadStream(file,{start,end}).pipe(res);
    }else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
  }catch(error){res.writeHead(400);res.end(error.message);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Artwork review: http://localhost:${port}`));
