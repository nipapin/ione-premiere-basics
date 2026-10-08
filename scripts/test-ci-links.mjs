import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readlinkSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { relocateReleaseLinks } from './relocate-ci-links.mjs';
if (process.platform !== 'linux') { console.log('Runtime link fixtures run in Linux CI.'); process.exit(0); }
const root = mkdtempSync(join(tmpdir(), 'odin-runtime-links-'));
try {
  const original = join(root, 'runner/node_modules'), release = join(root, 'release');
  mkdirSync(join(original, 'bcrypt'), { recursive: true });
  mkdirSync(join(release, 'node_modules/bcrypt'), { recursive: true });
  mkdirSync(join(release, '.next/node_modules'), { recursive: true });
  writeFileSync(join(release, 'node_modules/bcrypt/index.js'), 'native-module fixture');
  const alias = join(release, '.next/node_modules/bcrypt-hash');
  symlinkSync(join(original, 'bcrypt'), alias);
  assert.equal(relocateReleaseLinks(release, original), 1);
  assert.equal(readlinkSync(alias), '../../node_modules/bcrypt');
  rmSync(join(root, 'runner'), { recursive: true });
  assert.equal(readFileSync(join(alias, 'index.js'), 'utf8'), 'native-module fixture');
  symlinkSync('/nonexistent/runner/path', join(release, '.next/node_modules/broken'));
  assert.throws(() => relocateReleaseLinks(release, original), /Nonportable runtime link/);
  console.log('Turbopack alias relocation passed after removing the original runner workspace.');
} finally {
  assert.equal(dirname(realpathSync(root)), realpathSync(tmpdir())); rmSync(root, { recursive: true, force: true });
}
