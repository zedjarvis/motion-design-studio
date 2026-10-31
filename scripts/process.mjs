import {spawn} from 'node:child_process';

export const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {...options, stdio: ['ignore', 'pipe', 'pipe']});
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8').on('data', data => {stdout += data;});
  child.stderr.setEncoding('utf8').on('data', data => {stderr += data;});
  child.on('error', reject);
  child.on('close', status => {
    if (status === 0) resolve({stdout, stderr});
    else reject(new Error(`${command} exited ${status}: ${stderr}`));
  });
});
