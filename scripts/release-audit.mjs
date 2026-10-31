import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const forbidden=[/(^|\/)\.env(?:\.|$)/,/(^|\/)(?:node_modules|out|analysis|coverage|\.aws|\.codex|\.agents)(?:\/|$)/,/\.studio\.local\.json$/,/\.(?:mp4|mkv|nut|pem|key)$/,/projects\/.*\/(?:evidence|delivery)\.json$/,/public\/generated\//,/\/assets\/voice\//,/public\/.*\/voice\//,/docs\/research\/cursors\/evidence\//,/references\/candidates\.json$/];
const credentials=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['api-key',/\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/],['aws-access-key',/\bAKIA[0-9A-Z]{16}\b/],['machine-path',/\/(?:home|Users)\/[^/\s]+\/(?:Desktop|Documents|PROJECTS)\//]];
export async function auditFiles(root,files){
  const issues=[];
  for(const file of files){
    if(forbidden.some(pattern=>pattern.test(file))){issues.push({file,rule:'local-only-path'});continue;}
    const target=path.resolve(root,file);
    if(!target.startsWith(path.resolve(root)+path.sep)){issues.push({file,rule:'outside-repository'});continue;}
    const stat=await fs.lstat(target);
    if(stat.isSymbolicLink()){issues.push({file,rule:'symlink'});continue;}
    if(stat.size>10_000_000){issues.push({file,rule:'large-file'});continue;}
    if(/\.(?:[cm]?[jt]sx?|py|json|md|txt|ya?ml)$/.test(file)||['.gitignore','.coveragerc','LICENSE'].includes(file)){
      const content=await fs.readFile(target,'utf8');
      for(const [rule,pattern] of credentials)if(pattern.test(content))issues.push({file,rule});
    }
  }
  return issues;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const git=spawnSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'});
  if(git.status!==0)throw new Error('Run release audit inside an initialized Git checkout');
  const files=[...new Set(git.stdout.split('\0').filter(Boolean))];
  const issues=await auditFiles(root,files);
  if(issues.length){console.error(JSON.stringify(issues,null,2));process.exitCode=1;}
  else console.log(`Release audit passed: ${files.length} files; no forbidden local paths, large files or common credential patterns.`);
}
