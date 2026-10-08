const { releaseId } = require('./release.json');
module.exports = { apps: [{
  name: 'odin-pro', cwd: __dirname, script: 'server.js',
  node_args: [`--env-file=${__dirname}/.env`],
  instances: 1, exec_mode: 'fork', autorestart: true, restart_delay: 3000,
  time: true, env: { NODE_ENV: 'production', PORT: '3001', RELEASE_ID: releaseId },
}] };
