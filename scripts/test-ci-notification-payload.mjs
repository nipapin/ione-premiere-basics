import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRunPayload } from '../deploy/lib/run-payload.mjs';

const root = mkdtempSync(join(tmpdir(), 'odin-notification-'));
try {
  const eventPath = join(root, 'event.json');
  const sha = 'a'.repeat(40), message = 'Add referral visits\n\nKeep historical buyers and track new visits separately.';
  const env = { GITHUB_EVENT_PATH: eventPath, RELEASE_COMMIT: sha, GITHUB_SHA: 'b'.repeat(40), GITHUB_REPOSITORY: 'nipapin/ione-premiere-basics', GITHUB_RUN_ID: '123', GITHUB_RUN_ATTEMPT: '2', NOTIFY_STATUS: 'success', NOTIFY_DETAIL: 'build: success; deploy: success' };
  for (const event of [
    { head_commit: { id: sha, message } },
    { workflow_run: { head_commit: { id: sha, message } }, head_commit: { id: env.GITHUB_SHA, message: 'Wrong workflow commit' } },
  ]) {
    writeFileSync(eventPath, JSON.stringify(event));
    const payload = createRunPayload(env);
    assert.equal(payload.commitMessage, message);
    assert.equal(payload.sha, sha);
    assert.equal(payload.detail, env.NOTIFY_DETAIL);
    assert.equal(payload.url, 'https://github.com/nipapin/ione-premiere-basics/actions/runs/123/attempts/2');
  }
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const expected = execFileSync('git', ['show', '--no-patch', '--format=%B', head], { encoding: 'utf8' }).trim();
  writeFileSync(eventPath, JSON.stringify({ head_commit: { id: sha, message: 'Wrong event commit' } }));
  assert.equal(createRunPayload({ ...env, RELEASE_COMMIT: head }).commitMessage, expected);
  assert.equal(createRunPayload({ ...env, RELEASE_COMMIT: head, GITHUB_EVENT_PATH: join(root, 'missing.json') }).commitMessage, expected);
  assert.equal(createRunPayload({ ...env, RELEASE_COMMIT: 'missing' }).commitMessage, '');
  assert.ok(readFileSync(new URL('../deploy/ci-ssh.sh', import.meta.url), 'utf8').includes('JSON.stringify(createRunPayload())'));
  console.log('Odin notification payload checks passed; no messages sent.');
} finally { rmSync(root, { recursive: true, force: true }); }
