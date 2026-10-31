import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {parseArgs} from 'node:util';

const {positionals, values} = parseArgs({allowPositionals: true, options: {out: {type: 'string'}}});
if (!positionals[0] || !values.out) throw new Error('Usage: npm run inspect:repo -- /path/to/repo --out projects/name/evidence.json');
const root = await fs.realpath(path.resolve(positionals[0]));
const forbidden = /(?:^|\/)(?:node_modules|\.git|\.next|dist|build|coverage|out|\.cache|\.aws|\.codex|\.agents|secrets?|credentials?)(?:\/|$)|(?:^|\/)\.env(?:\.|$)|(?:^|\/)(?:id_rsa|id_ed25519|service[-_]?account)(?:\.|$)|(?:secret|credential|token|private[-_]?key)|\.(?:pem|p12|pfx|key|lock)$/i;
const sourceExtension = /\.(?:tsx?|jsx?|vue|svelte|html|css|scss|md|json)$/i;
const assetExtension = /\.(?:svg|png|jpe?g|webp|avif|woff2?|ttf|otf)$/i;
const scrub = text => text
  .replace(/(?:sk-|gh[pousr]_|AKIA)[A-Za-z0-9_-]{12,}/g, '[REDACTED]')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
  .replace(/(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|[\w.-]+\.internal)(?::\d+)?(?:\/[^\s"'<>]*)?/gi, '[LOCAL-URL]');

// rg honors repository ignore rules. Source inspection executes no project scripts.
const listing = await new Promise((resolve, reject) => {
  const child = spawn('rg', ['--files', '--hidden', '-0', '-g', '!.git', '-g', '!node_modules'], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8').on('data', data => {stdout += data;});
  child.stderr.setEncoding('utf8').on('data', data => {stderr += data;});
  child.on('error', reject);
  child.on('close', status => resolve({status, stdout, stderr}));
});
if (![0, 1].includes(listing.status)) throw new Error(listing.stderr || 'rg is required for ignore-aware inspection');
const listed = listing.stdout.split('\0').filter(Boolean).filter(file => !forbidden.test(file));
const priority = file => /(?:^|\/)README\.md$/i.test(file) ? 0 : file === 'package.json' ? 1
  : /(?:page|index|layout|route|hero|onboarding|dashboard|styles|globals)\./i.test(file) ? 2 : 3;
const sources = listed.filter(file => sourceExtension.test(file) && !assetExtension.test(file))
  .filter(file => !/(?:pnpm-lock|package-lock|yarn\.lock|test|spec|fixture|customer|session|\.config\.)/i.test(file))
  .sort((a, b) => priority(a) - priority(b) || a.localeCompare(b)).slice(0, 180);
const evidence = [];
const brand = {colors: [], fonts: [], assets: []};
const packages = [];
const routes = [];
for (const file of sources) {
  const absolute = path.join(root, file);
  // Do not follow a tracked symlink into a different workspace or a secret file.
  const info = await fs.lstat(absolute);
  if (!info.isFile() || info.size > 250_000) continue;
  const real = await fs.realpath(absolute);
  if (!real.startsWith(root + path.sep)) continue;
  const raw = await fs.readFile(absolute, 'utf8');
  if (/(?:-----BEGIN .*PRIVATE KEY-----|client_secret|api_key\s*[:=]|password\s*[:=]|DATABASE_URL)/i.test(raw)) continue;
  const text = scrub(raw);
  if (/(?:^|\/)package\.json$/.test(file)) {
    try {
      const data = JSON.parse(text);
      packages.push({file, name: data.name, description: data.description,
        scripts: Object.keys(data.scripts || {}), dependencies: Object.keys(data.dependencies || {})});
    } catch { /* Other evidence remains usable if a package file is malformed. */ }
  }
  if (/(?:^|\/)(?:app|pages|routes)\//.test(file)) routes.push(file);
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const readme = /README\.md$/i.test(file) && (/^#{1,3}\s/.test(line) || (i < 35 && line.length > 30 && !line.startsWith('![')));
    const visible = /<(?:h[1-6]|p|title|button)\b|(?:title|heading|description|label|placeholder):\s*['"`]/.test(line);
    const brandLine = /(?:--[\w-]+\s*:|font-family\s*:|fontFamily\s*:|#[\da-fA-F]{6}\b|oklch\()/.test(line);
    if ((readme || visible || brandLine) && line.length < 1000) {
      evidence.push({file, line: i + 1, kind: brandLine ? 'brand' : readme ? 'readme' : 'visible-copy', text: line});
    }
    if (brandLine) {
      for (const color of line.match(/#[\da-fA-F]{6}\b|oklch\([^)]*\)|rgba?\([^)]*\)/g) || [])
        if (!brand.colors.some(item => item.value === color)) brand.colors.push({value: color, file, line: i + 1});
      const family = line.match(/(?:font-family|fontFamily)\s*:\s*(.+?)[;},]?$/);
      if (family) brand.fonts.push({value: family[1], file, line: i + 1});
    }
  }
}
for (const file of listed.filter(file => assetExtension.test(file)).slice(0, 300)) {
  const info = await fs.lstat(path.join(root, file));
  if (info.isFile()) brand.assets.push({file, bytes: info.size});
}
const report = {schemaVersion: 1, repository: root, sourceFilesScanned: sources.length,
  packages, routes: routes.slice(0, 60), brand, evidence: evidence.slice(0, 500),
  authoringRequired: ['Read the evidence and relevant code to establish entry → action → result.',
    'Choose claims supported by source file and line; distinguish inferred claims.',
    'Reuse the real product components or local assets; author original motion with Remotion.',
    'Register the composition, build sound cues, capture, inspect, and render.'],
  limitations: ['Static inspection is evidence gathering, not an autonomous video generator.',
    'No project scripts were executed. No screenshots or reference videos are required for original authoring.',
    'Heuristic redaction is not proof that a repository is free of personal data; review evidence before using it on screen.']};
await fs.mkdir(path.dirname(path.resolve(values.out)), {recursive: true});
await fs.writeFile(values.out, JSON.stringify(report, null, 2) + '\n');
console.log(`Evidence: ${values.out}\nScanned ${sources.length} candidate source files; ${report.evidence.length} grounded excerpts.`);
