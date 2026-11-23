# Odin Pro releases

Push to `master` builds on GitHub Actions (Ubuntu x64, Node 20.20.2). The runner installs dependencies, builds Next.js, packages production dependencies plus the custom `server.js`, and tests Socket.io polling and WebSocket connections. TypeScript stays in the runtime because Next loads `next.config.ts` at startup.

CI deploys to SSH `motionflow`, process `odin-pro`, port 3001. No npm install or build runs on the VPS. The installer verifies checksum and runtime, links the existing `.env` and server-only public media, activates a release and checks its exact release ID and PostgreSQL. Failed activation restores the previous PM2 configuration. Other PM2 processes are not reloaded.

Paths:

- Releases: `/root/odin-deploy/releases/<sha>-<run>-<attempt>`.
- Current and previous: `/root/odin-deploy/current` and `previous`.
- Original checkout/media/env: `/var/www/motionflow_p_usr/data/www/odin-pro.com` (preserved).
- Last three releases retained, including current and previous.

`DEPLOY_ENABLED=true` enables deployment. Secrets `DEPLOY_HOST`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` use a dedicated SSH key and strict host verification. `BUILD_PUBLIC_ENV` contains only public browser settings. Production credentials remain on the server. PR builds do not receive production credentials or deploy.

Transactional email and the contact form use the Resend HTTPS API. Set `RESEND_API_KEY` in the server `.env` to a key with sending access to the verified `odin-pro.com` domain. The contact form sends to `support@odin-pro.com`, so keep that address routed to the support inbox when changing incoming mail providers.

For incoming email forwarding, add an `email.received` webhook in Resend pointed at `https://odin-pro.com/api/webhooks/resend`. Add `RESEND_WEBHOOK_SECRET` (the webhook's signing secret), `RESEND_INBOUND_API_KEY` (a separate Full access key for retrieving and forwarding inbound messages), and `RESEND_FORWARD_TO` (the destination inbox) to the server `.env`, then reload the `odin-pro` process. The handler forwards mail for `help@odin-pro.com`, `no-reply@odin-pro.com`, and `support@odin-pro.com` with attachments and the original reply address. Set `RESEND_INBOUND_TEST_ADDRESS` to one exact address on the team's `resend.app` domain to try the forwarding flow before switching MX. Remove that setting after the switch.

The existing Telegram bot and subscriber registry are reused. One message per run/attempt is sent, then edited for deployment and completion. Shared notifier source is maintained in `nipapin/motionflow` (`deploy/lib/telegram-run.mjs`) and installed at `/root/motionflow-ci`. The old push hook to `85.92.108.114/deploy` is disabled (hook 539613125).

For normal changes, commit and push to `master`, or ask the agent to do it. Use Actions → Odin Pro build and deploy → Run workflow to redeploy. Set the `deploy` input to false for a build only. `npm run fetch` dispatches that workflow through authenticated `gh`; it no longer builds on the server. Schema migrations remain a separate deliberate operation (`npm run migrate`); the old deployment did not migrate automatically.
