import {bundle} from '@remotion/bundler';
import {openBrowser, renderFrames, renderStill, selectComposition, stitchFramesToVideo} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {run} from './process.mjs';
import {auditRenderInputs} from './render-inputs.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const {values, positionals} = parseArgs({allowPositionals: true, options: {
  props: {type: 'string'}, out: {type: 'string'}, frames: {type: 'string'},
  concurrency: {type: 'string', default: '2'}, 'check-determinism': {type: 'boolean', default: true},
}});
const id = positionals[0];
if (!id) throw new Error('Usage: npm run render -- CompositionId [--props props.json] [--out out/name] [--frames 0,30,60]');
const inputProps = values.props ? JSON.parse(await fs.readFile(path.resolve(values.props), 'utf8')) : {};
const output = path.resolve(values.out || path.join(root, 'out', id));
const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';
// Pin the compositing backend across batch capture and fresh-browser checks.
// Automatic GL selection changed one-channel edge rounding on the phone rig.
const chromiumOptions = {gl: 'swangle'};
const requested = values.frames?.split(',').map(Number);
if (requested?.some(f => !Number.isInteger(f) || f < 0)) throw new Error('--frames must contain non-negative integers');
const concurrency = Number(values.concurrency);
if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('--concurrency must be a positive integer');

const hash = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
const filesUnder = async (directory) => {
  const result = [];
  for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(file));
    else if (entry.isFile()) result.push(file);
    else if (entry.isSymbolicLink()) throw new Error(`Render inputs cannot be external symlinks: ${file}`);
  }
  return result.sort();
};

await fs.mkdir(output, {recursive: true});
// Each attempt has its own directory: stale frames from an older, longer film cannot enter a render.
const attempt = await fs.mkdtemp(path.join(output, 'capture-'));
const receiptPath = path.join(attempt, 'receipt.json');
const receipt = {schemaVersion: 1, composition: id, status: 'started', inputProps,
  node: process.version, platform: os.platform(), arch: os.arch(), chrome,
  remotion: JSON.parse(await fs.readFile(path.join(root, 'node_modules/remotion/package.json'), 'utf8')).version,
  chromiumOptions, stages: {}, sourceHashes: {}};
let browser;
const save = () => fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
try {
  for (const directory of ['studio', 'projects', 'public']) {
    for (const file of await filesUnder(path.join(root, directory))) {
      receipt.sourceHashes[path.relative(root, file)] = await hash(file);
    }
  }
  for (const file of ['scripts/render.mjs', 'scripts/render-inputs.mjs', 'scripts/process.mjs', 'remotion.config.ts', 'package.json']) {
    receipt.sourceHashes[file] = await hash(path.join(root, file));
  }
  const references = JSON.parse(await fs.readFile(path.join(root, 'references/manifest.json'), 'utf8')).references;
  receipt.referenceAvailability = await auditRenderInputs(root,receipt.sourceHashes,references);
  receipt.stages.sourceAudit = 'passed';
  receipt.lockfileSha256 = await hash(path.join(root, 'pnpm-lock.yaml'));
  const version = await run(chrome, ['--version']);
  receipt.chromeVersion = version.stdout.trim();
  await save();
  console.log('Bundling editable Remotion source');
  const serveUrl = await bundle({entryPoint: path.join(root, 'studio/index.ts'),
    publicDir: path.join(root, 'public'), outDir: path.join(attempt, 'bundle'), enableCaching: false});
  receipt.stages.bundle = 'passed';
  // Validate source consistency at the snapshot boundary. Later Studio edits
  // do not affect this immutable bundle and must not invalidate its receipt.
  for (const [file, digest] of Object.entries(receipt.sourceHashes)) {
    if (digest !== await hash(path.join(root, file))) throw new Error(`Render input changed while bundling: ${file}`);
  }
  if (receipt.lockfileSha256 !== await hash(path.join(root, 'pnpm-lock.yaml')))
    throw new Error('Dependency lockfile changed while bundling');
  receipt.bundleHashes = {};
  for (const file of await filesUnder(serveUrl)) receipt.bundleHashes[path.relative(serveUrl, file)] = await hash(file);
  receipt.stages.snapshot = 'passed';
  browser = await openBrowser('chrome', {browserExecutable: chrome, chromiumOptions});
  receipt.stages.chrome = 'passed';
  await save();
  const composition = await selectComposition({serveUrl, id, inputProps, puppeteerInstance: browser});
  const {width, height, fps, durationInFrames} = composition;
  receipt.video = {width, height, fps, durationInFrames};
  if (requested?.some(frame => frame >= durationInFrames)) throw new Error('Requested frame is outside this composition');
  const frameDir = path.join(attempt, 'frames');
  await fs.mkdir(frameDir);
  const capture = await renderFrames({composition, serveUrl, inputProps, puppeteerInstance: browser,
    outputDir: frameDir, imageFormat: 'png', concurrency, ...(requested ? {frames: requested} : {}),
    onStart: ({frameCount}) => console.log(`Capturing ${frameCount} frames in Chrome (${width}x${height}, ${fps} fps)`),
    onFrameUpdate: (count) => {if (count % 50 === 0) console.log(`Captured ${count} frames`);},
  });
  // Remotion 4.0.535 closes its capture server asynchronously. Hold its audio
  // and stitching workspace across the independent determinism captures.
  if (!requested) capture.assetsInfo.downloadMap.preventCleanup();
  receipt.stages.capture = 'passed';
  const frameFiles = (await fs.readdir(frameDir)).filter(file => file.endsWith('.png')).sort();
  receipt.frames = await Promise.all(frameFiles.map(async file => ({file, sha256: await hash(path.join(frameDir, file))})));
  await save();
  if (values['check-determinism'] && !requested) {
    const repeatDir = path.join(attempt, 'determinism');
    await fs.mkdir(repeatDir);
    // Capture out of order in a fresh browser. A timeline that relies on previous frames fails this check.
    const freshBrowser = await openBrowser('chrome', {browserExecutable: chrome, chromiumOptions});
    try {
      for (const frame of [...new Set([durationInFrames - 1, 0, Math.floor(durationInFrames / 2)])]) {
        const repeat = path.join(repeatDir, `${frame}.png`);
        await renderStill({composition, serveUrl, inputProps, frame, imageFormat: 'png',
          output: repeat, puppeteerInstance: freshBrowser});
        const original = receipt.frames.find(f => Number(f.file.match(/(\d+)\.png$/)?.[1]) === frame);
        if (!original) throw new Error(`Missing original capture for frame ${frame}`);
        const decodedHash = async file => (await run('ffmpeg', ['-v', 'error', '-i', file,
          '-vf', 'format=rgb24', '-f', 'hash', '-hash', 'sha256', '-'])).stdout.trim();
        if (await decodedHash(path.join(frameDir, original.file)) !== await decodedHash(repeat))
          throw new Error(`Non-deterministic capture at frame ${frame}`);
      }
    } finally {await freshBrowser.close({silent: true});}
    receipt.stages.determinism = 'passed';
    await save();
  }
  if (!requested) {
    const movie = path.join(attempt, 'video.mp4');
    console.log('Stitching captured PNGs and authored audio to MP4');
    await stitchFramesToVideo({assetsInfo: capture.assetsInfo, fps, width, height,
      outputLocation: movie, codec: 'h264', pixelFormat: 'yuv420p', crf: 12, x264Preset: 'medium'});
    // A new YUV420 encode changes pixels even when the canvas is exact. Preserve
    // decoded RGB in a separate lossless MP4 master for the strict benchmark.
    const master = path.join(attempt, 'master.rgb.mp4');
    await run('ffmpeg', ['-v', 'error', '-framerate', String(fps), '-start_number', String(capture.assetsInfo.firstFrameIndex),
      '-i', capture.assetsInfo.imageSequenceName, '-i', movie, '-map', '0:v:0', '-map', '1:a?',
      '-c:v', 'libx264rgb', '-crf', '0', '-preset', 'medium', '-pix_fmt', 'rgb24', '-c:a', 'copy',
      '-frames:v', String(durationInFrames), '-movflags', '+faststart', '-y', master]);
    receipt.parityMaster = master;
    receipt.parityMasterSha256 = await hash(master);
    const metadata = await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-of', 'json', master]);
    receipt.exportMetadata = JSON.parse(metadata.stdout);
    const video = receipt.exportMetadata.streams.find(s => s.codec_type === 'video');
    if (!video || video.width !== width || video.height !== height || Number(video.nb_read_frames) !== durationInFrames)
      throw new Error('Encoded dimensions or frame count do not match the composition');
    const [num, den] = video.r_frame_rate.split('/').map(Number);
    if (Math.abs(num / den - fps) > 0.000001) throw new Error('Encoded frame rate differs from the composition');
    receipt.outputSha256 = await hash(movie);
    receipt.stages.encode = 'passed';
    receipt.output = movie;
  }
  for (const [file, digest] of Object.entries(receipt.bundleHashes)) {
    if (digest !== await hash(path.join(serveUrl, file))) throw new Error(`Frozen bundle changed during capture: ${file}`);
  }
  receipt.status = requested ? 'frames-captured' : 'rendered-not-parity-approved';
  console.log(`Receipt: ${receiptPath}`);
  if (receipt.output) console.log(`MP4: ${receipt.output}`);
  if (receipt.parityMaster) console.log(`RGB lossless parity master: ${receipt.parityMaster}`);
} catch (error) {
  receipt.status = 'failed';
  receipt.error = String(error?.stack || error);
  console.error(`Render failed: ${error.message}\nReceipt: ${receiptPath}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close({silent: true});
  await save();
}
