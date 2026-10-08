import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const { releaseId } = JSON.parse(readFileSync('.release/release.json', 'utf8'));
const child = spawn(process.execPath, ['server.js'], { cwd: '.release', env: { ...process.env, NODE_ENV: 'production', PORT: '3301', RELEASE_ID: releaseId, HOST_PORT: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
for (const stream of [child.stdout, child.stderr]) stream.on('data', d => { output = (output + d).slice(-5000); });
try {
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (child.exitCode !== null) throw new Error('Packaged server exited\n' + output);
    try {
      const r = await fetch('http://127.0.0.1:3301/api/deploy-health', { signal: AbortSignal.timeout(5000) });
      const data = await r.json();
      assert.equal(r.status, 503); assert.equal(data.release, releaseId); assert.equal(data.database, false);
      ready = true; break;
    } catch { await new Promise(r => setTimeout(r, 1000)); }
  }
  assert.ok(ready, 'Custom server failed smoke test\n' + output);
  const r = await fetch('http://127.0.0.1:3301/socket.io/?EIO=4&transport=polling');
  assert.equal(r.status, 200); assert.match(await r.text(), /^0\{"sid":/);
  const { default: WebSocket } = await import('ws');
  await new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:3301/socket.io/?EIO=4&transport=websocket', { handshakeTimeout: 5000 });
    ws.once('message', () => { ws.close(); resolve(); }); ws.once('error', reject);
  });
  console.log('Packaged Next server, PostgreSQL readiness, Socket.io polling and WebSocket passed.');
} finally {
  child.kill('SIGTERM'); const timer = setTimeout(() => child.kill('SIGKILL'), 3000); timer.unref();
}
