import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),port=Number(process.env.PRODUCTIONS_PORT||3213);
const read=async()=>JSON.parse(await fsp.readFile(path.join(root,'analysis/productions/report.json'),'utf8'));
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');let file;
    if(url.pathname==='/')file=path.join(root,'studio/productions.html');
    else if(url.pathname==='/api'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await read()));return;}
    else if(url.pathname==='/media'){
      const item=(await read()).cases.find(c=>c.project===url.searchParams.get('project'));
      if(!item){res.writeHead(404);res.end();return;}
      const kind=url.searchParams.get('kind')||'video';
      const relative={video:item.output,poster:item.poster,captions:item.captions,credits:path.join(path.dirname(item.output),'CREDITS.txt')}[kind];
      if(!relative){res.writeHead(404);res.end();return;}
      file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw Error('Invalid media path');
    }else{res.writeHead(404);res.end();return;}
    const stat=await fsp.stat(file);
    res.setHeader('Content-Type',file.endsWith('.mp4')?'video/mp4':file.endsWith('.jpg')?'image/jpeg':file.endsWith('.vtt')?'text/vtt':file.endsWith('.txt')?'text/plain; charset=utf-8':'text/html; charset=utf-8');
    res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','no-store');
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(match){const start=+match[1],end=Math.min(+(match[2]||stat.size-1),stat.size-1);
      if(start>end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);
    }else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
  }catch(error){res.writeHead(500);res.end(error.message);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Product films: http://localhost:${port}`));
