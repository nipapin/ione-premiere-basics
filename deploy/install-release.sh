#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
id=${1:?release ID required}
[[ "$id" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]] || exit 1
root=/root/odin-deploy
legacy=/var/www/motionflow_p_usr/data/www/odin-pro.com
incoming="$root/incoming/$id"
release="$root/releases/$id"
[[ "$(uname -s)" == Linux && "$(uname -m)" == x86_64 ]]
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 20 ]]
for tool in pm2 flock curl tar sha256sum; do command -v "$tool" >/dev/null; done
[[ -f "$legacy/.env" ]]
mkdir -p "$root/releases" "$root/shared"
exec 9>"$root/deploy.lock"
flock -n 9 || { echo 'Deployment already running' >&2; exit 1; }
cd "$incoming"
sha256sum -c odin.tgz.sha256
previous=""
config="$root/shared/ecosystem.legacy.config.cjs"
if [[ -L "$root/current" ]]; then
  previous=$(readlink -f "$root/current")
  [[ "$previous" == "$root/releases/"* && -f "$previous/ecosystem.release.config.cjs" ]]
  config="$previous/ecosystem.release.config.cjs"
else
  cat > "$config" <<'JS'
module.exports={apps:[{name:'odin-pro',cwd:'/var/www/motionflow_p_usr/data/www/odin-pro.com',script:'/usr/bin/npm',args:['start'],env:{NODE_ENV:'production',PORT:'3001'},autorestart:true,time:true}]};
JS
fi
[[ ! -e "$release" ]] || { echo 'Release exists; rerun all jobs with a new attempt' >&2; exit 1; }
stage=$(mktemp -d "$root/releases/.staging-$id-XXXXXX")
switched=0
start_app() {
  if pm2 describe odin-pro >/dev/null 2>&1; then pm2 delete odin-pro; fi
  pm2 start "$1" --only odin-pro
}
rollback() {
  trap - ERR INT TERM
  if [[ "$switched" == 1 ]]; then
    if [[ -n "$previous" ]]; then
      ln -s "$previous" "$root/.rollback-$id"; mv -Tf "$root/.rollback-$id" "$root/current"
    else rm -f "$root/current"; fi
    start_app "$config" || true
    pm2 save || true
  fi
  echo 'Deployment failed; previous application restored if activation had started.' >&2
  exit 1
}
trap rollback ERR INT TERM
tar -xzf odin.tgz -C "$stage" --no-same-owner --no-same-permissions
cd "$stage"
node scripts/verify-ci-release.mjs "$id"
ln -s "$legacy/.env" .env
node scripts/link-server-files.mjs "$legacy" "$stage" public
mv "$stage" "$release"
ln -s "$release" "$root/.current-$id"; mv -Tf "$root/.current-$id" "$root/current"
switched=1
start_app "$release/ecosystem.release.config.cjs"
healthy=0
for attempt in $(seq 1 25); do
  if curl --fail --silent --max-time 5 http://127.0.0.1:3001/api/deploy-health | node "$release/scripts/check-ci-health.mjs" "$id"; then healthy=1; break; fi
  sleep 2
done
[[ "$healthy" == 1 ]] || { echo 'Readiness failed' >&2; false; }
curl --fail --silent --max-time 5 'http://127.0.0.1:3001/socket.io/?EIO=4&transport=polling' | node -e 'let s="";for await(const d of process.stdin)s+=d;if(!s.startsWith("0{\"sid\":"))process.exit(1)' --input-type=module
pm2 save
if [[ -n "$previous" ]]; then ln -s "$previous" "$root/.previous-$id"; mv -Tf "$root/.previous-$id" "$root/previous"; fi
trap - ERR INT TERM
node "$release/scripts/prune-ci-releases.mjs" "$root" || echo 'Release cleanup failed; inspect disk space' >&2
echo "Activated $id; no build or npm install ran on VPS."
