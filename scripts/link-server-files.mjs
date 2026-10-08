// Connect media that were never committed, without replacing files built in CI.
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readdirSync, symlinkSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
const [sourceArg, targetArg, ...roots] = process.argv.slice(2);
const source = resolve(sourceArg), target = resolve(targetArg);
if (!source.startsWith('/var/www/motionflow_p_usr/data/www/') || source === target) throw new Error('Invalid shared file source');
const tracked = execFileSync('git', ['-C', source, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let links = 0;
function connect(relative) {
  if (relative.split('/').some(p => !p || p === '..' || p.startsWith('.'))) throw new Error('Invalid shared path');
  const src = join(source, relative), dst = join(target, relative);
  if (!existsSync(src)) return;
  const stat = lstatSync(src);
  if (stat.isSymbolicLink()) return; // storage is connected separately.
  if (tracked.includes(relative)) return;
  if (stat.isDirectory() && (existsSync(dst) || tracked.some(f => f.startsWith(relative + '/')))) {
    for (const child of readdirSync(src)) if (!child.startsWith('.')) connect(relative + '/' + child);
    return;
  }
  if (existsSync(dst)) return;
  mkdirSync(dirname(dst), { recursive: true });
  symlinkSync(src, dst, stat.isDirectory() ? 'dir' : 'file'); links++;
}
for (const root of roots) connect(root);
console.log(`Preserved ${links} server-only paths.`);
