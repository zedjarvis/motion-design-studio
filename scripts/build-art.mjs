import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root=process.cwd(),assetDir=path.join(root,'projects/graphics-lab/assets'),publicDir=path.join(root,'public/studio-art');
await fs.mkdir(assetDir,{recursive:true});await fs.mkdir(publicDir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const source=path.join(root,'node_modules/p5.brush/dist/brush.js');
const capture=async()=>{
  const page=await browser.newPage({viewport:{width:900,height:180},deviceScaleFactor:1});
  try{
    await page.setContent('<body style="margin:0;background:transparent"></body>');
    await page.addScriptTag({path:source});
    return await page.evaluate(()=>{
      const b=globalThis.brush;
      const canvas=b.createCanvas(900,180,{pixelDensity:1,parent:document.body});
      b.seed(931);b.noiseSeed(931);b.scaleBrushes(2);b.clear();
      b.angleMode(b.DEGREES);b.push();b.translate(-450,-90);
      b.noFill();b.noHatch();b.noField();
      const names=b.box();b.set(names.includes('marker')?'marker':'HB','#72d9be',5);
      b.line(25,87,870,94);b.line(58,108,836,98);
      b.pop();b.render();
      const tinted=document.createElement('canvas');tinted.width=900;tinted.height=180;
      const ctx=tinted.getContext('2d');ctx.drawImage(canvas,0,0);
      ctx.globalCompositeOperation='source-in';ctx.fillStyle='#72d9be';ctx.fillRect(0,0,900,180);
      return {png:tinted.toDataURL('image/png'),brushes:names};
    });
  }finally{await page.close();}
};
try{
  const a=await capture(),b=await capture();
  const png=Buffer.from(a.png.split(',')[1],'base64'),repeat=Buffer.from(b.png.split(',')[1],'base64');
  const decode=bytes=>{
    const r=spawnSync('ffmpeg',['-v','error','-i','pipe:0','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{input:bytes,maxBuffer:4_000_000});
    assert.equal(r.status,0,r.stderr?.toString());return r.stdout;
  };
  const pixels=decode(png),repeated=decode(repeat);
  assert(pixels.equals(repeated),'Seeded brush artwork changed across fresh browser pages');
  let painted=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)painted++;
  assert(painted>1000,'Brush output is blank or too small');
  const file=path.join(assetDir,'paint-stroke.png');await fs.writeFile(file,png);
  const record={source:'p5.brush 3.0.0 standalone, official installed library',seed:931,noiseSeed:931,
    width:900,height:180,pixelDensity:1,sha256:createHash('sha256').update(png).digest('hex'),
    generator:'scripts/build-art.mjs',generatorSha256:createHash('sha256').update(await fs.readFile(import.meta.filename)).digest('hex'),
    license:'Studio-authored artwork generated using p5.brush (MIT); library notice retained in THIRD_PARTY_NOTICES.txt',
    usage:'Build-time p5.brush marker alpha, tinted to brand mint with a native Canvas2D source-in pass; Remotion controls its reveal. No reference artwork is used.',
    verification:{freshPageRgbEqual:true,paintedPixels:painted},availableBrushes:a.brushes};
  await fs.writeFile(path.join(assetDir,'PROVENANCE.json'),JSON.stringify(record,null,2)+'\n');
  await fs.copyFile(file,path.join(publicDir,'paint-stroke.png'));
  await fs.mkdir(path.join(root,'analysis/capabilities'),{recursive:true});
  await fs.writeFile(path.join(root,'analysis/capabilities/brush-build.json'),JSON.stringify(record,null,2)+'\n');
  console.log(`p5.brush: seeded native artwork, ${painted} painted pixels; fresh-page RGBA equality passed.`);
}finally{await browser.close();}
