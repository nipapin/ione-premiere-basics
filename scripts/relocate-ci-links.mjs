import { existsSync, lstatSync, readdirSync, readlinkSync, symlinkSync, unlinkSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Turbopack external-module aliases must resolve inside the delivered release.
export function relocateReleaseLinks(releaseArg, originalModulesArg) {
  const release = resolve(releaseArg), originalModules = resolve(originalModulesArg);
  let count = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const file = join(dir, entry), stat = lstatSync(file);
      if (stat.isSymbolicLink()) {
        let target = resolve(dirname(file), readlinkSync(file));
        if (target.startsWith(originalModules + sep)) {
          target = join(release, 'node_modules', relative(originalModules, target));
          unlinkSync(file); symlinkSync(relative(dirname(file), target), file); count++;
        }
        if (!target.startsWith(release + sep) || !existsSync(file)) throw new Error(`Nonportable runtime link: ${relative(release, file)}`);
      } else if (stat.isDirectory()) walk(file);
    }
  }
  walk(release);
  return count;
}
