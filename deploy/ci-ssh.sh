#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DEPLOY_HOST:?}" "${DEPLOY_SSH_KEY:?}" "${DEPLOY_KNOWN_HOSTS:?}"
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9.-]+$ ]]
key="$RUNNER_TEMP/odin-key-$$"
known="$RUNNER_TEMP/odin-known-$$"
printf '%s\n' "$DEPLOY_SSH_KEY" > "$key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$known"
trap 'rm -f "$key" "$known"' EXIT
opts=(-i "$key" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$known" -o ConnectTimeout=15)
if [[ "${1:-}" == notify ]]; then
  payload=$(node --input-type=module -e 'import { createRunPayload } from "./deploy/lib/run-payload.mjs"; console.log(Buffer.from(JSON.stringify(createRunPayload())).toString("base64"))')
  attempts=4
  delay=5
  for ((attempt=1; attempt<=attempts; attempt++)); do
    if timeout --kill-after=5s 90s ssh "${opts[@]}" -o ServerAliveInterval=15 -o ServerAliveCountMax=2 "root@$DEPLOY_HOST" "cd /webhook-reciever && flock -w 60 /root/motionflow-ci/telegram-notify.lock node --env-file=.env /root/motionflow-ci/notify-server.mjs '$payload'"; then
      exit 0
    else
      status=$?
    fi
    # Retry SSH transport failures and timeouts; keep remote application errors visible.
    if (( status != 255 && status != 124 && status != 137 )); then
      exit "$status"
    fi
    if (( attempt == attempts )); then
      echo "::error::Telegram notification failed after $attempts attempts (exit $status)." >&2
      exit "$status"
    fi
    echo "::warning::Telegram notification attempt $attempt/$attempts failed (exit $status). Retrying in ${delay}s." >&2
    sleep "$delay"
    delay=$((delay * 2))
  done
elif [[ "${1:-}" == deploy ]]; then
  [[ "$RELEASE_ID" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]]
  incoming="/root/odin-deploy/incoming/$RELEASE_ID"
  ssh "${opts[@]}" "root@$DEPLOY_HOST" "mkdir -p '$incoming'"
  scp "${opts[@]}" release-artifacts/* "root@$DEPLOY_HOST:$incoming/"
  ssh "${opts[@]}" "root@$DEPLOY_HOST" "bash '$incoming/install-release.sh' '$RELEASE_ID'"
else
  echo 'Expected notify or deploy' >&2; exit 1
fi
