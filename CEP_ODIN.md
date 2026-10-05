# Odin Pro CEP integration

## Motionflow management integration (opt-in)

The site keeps its own accounts and billing. `/api/integrations/motionflow/users`
provides authenticated, paginated user search, subscription/seat and CEP device inspection,
manual extension access and device revocation to Motionflow. It requires a server-only
`MOTIONFLOW_MANAGEMENT_SECRET` (32+ characters), migration
`2026_09_30_002_motionflow_management.sql`, and `MOTIONFLOW_MANAGEMENT_ENABLED=true`.
Without the flag, CEP continues using the existing subscription rule. Manual grants and
blocks never update payment/subscription rows. Every mutation is audited transactionally.

Catalog integration is independently enabled by `MOTIONFLOW_CATALOG_ENABLED=true` with
`MOTIONFLOW_CATALOG_ORIGIN`, `MOTIONFLOW_CATALOG_SECRET` and an exact comma-separated
`MOTIONFLOW_DOWNLOAD_HOSTS` allowlist. Motionflow preserves legacy IDs (AE 283, PR 275)
via its `ODIN_CATALOG_PACK_MAP`. CEP still signs in/downloads through this site.
Managed updates initially use complete archives; diff returns `NO_DIFF_SOURCE` for
the CEP full-download fallback. Default is the legacy catalog described below.

See `../next-app/docs/odin-integration-runbook.md` for pack format, environment variables,
deployment order and rollback. Neither feature should be enabled before its readiness checks.

This site serves the `odin-cep` client from the shared CEP project. Existing Odin website accounts and subscriptions are used; Motionflow accounts are not required.

## Deploy

1. Run `npm run migrate` from the site directory. It uses the website database settings from `.env` (shared configuration in `db/config.mjs`; the website Pool is created in `src/app/database/pool.ts`), discovers all `.sql` files in `db/migrations/`, and applies pending files in filename order. Applied filenames, checksums and timestamps are recorded in `odin_schema_migrations`. Repeat runs skip applied files. Connection timeout is 10 seconds; SQL timeout is 120 seconds. Concurrent migration runs are rejected.
2. Set `NEXT_PUBLIC_APP_URL=https://odin-pro.com`. Optionally set `CEP_DEVICE_LIMIT` (default: 3 active devices per account).
3. Build and deploy the site using the project's normal deployment process. The migration and deployment are not performed by the local CEP build.
4. Test browser sign-in from the Odin panel, approve the displayed code, then verify the profile and device list. Check a subscribed and an unsubscribed account, device replacement, and revocation. Verify pack installation in both Adobe hosts.

## Adding migrations

Add a new file such as `db/migrations/2026_09_30_001_description.sql` and run
`npm run migrate`. No changes to the script or package.json are needed.
Use unique, sortable filenames. Do not edit applied files: add a new migration.
Do not include top-level `BEGIN`, `COMMIT`, or `ROLLBACK`: the runner wraps each
file and its history entry in one transaction. Use transactional PostgreSQL SQL.
If a file fails, it is rolled back and later files are not run. Earlier successful
files remain applied. The initial CEP migration uses `IF NOT EXISTS`, so it can
also register a database that was migrated with the previous one-file script.

## Authentication

The panel calls `POST /api/cep/auth/device`, opens `/?cep=…` (the homepage with a confirmation dialog), and polls `POST /api/cep/auth/token` with a panel-only secret. Older `/cep/login?code=…` links redirect there. The website preserves the confirmation destination through login and signup. Signup retains the existing automatic website session; email confirmation uses the actual confirmation token rather than an email address.

Codes expire after five minutes. Consent requires a website session and a matching request origin. A token can be claimed once; only token/secret hashes are stored. Account-level transaction locks enforce device limits. Access tokens expire after 30 days; `GET /api/cep/me` and `POST /api/cep/devices/revoke` support the panel profile. Old AtomX sessions do not become new CEP sessions automatically.

Entitlements use this site's existing subscription rule (`next_charge_date` in the future), including invited subscription seats. Active accounts expose `ai_generations_limit: 100`; inactive accounts expose zero. AI requests go to Motionflow, which verifies this site's CEP Bearer token through `/api/cep/me` and maintains a separate Odin usage ledger with 100 generations per UTC calendar month. Deploy the corresponding `next-app` AI integration before distributing the updated panel. There are no free pack slots or individual pack purchases for Odin.

## Catalog and downloads

`GET /api/cep/market?host=AE|PR` adapts the existing AtomX metadata feed for the author `Premiere Basics`. `GET /api/cep/market/download?pack_id=…` requires a valid CEP token and an active subscription, validates the pack against that catalog, then redirects to the existing Odin package server's signed full archive URL. Panel credentials are never forwarded to AtomX or the package storage host.

The adapter depends on the existing `api.get-atomx.com` metadata service and `package.odin-pro.com/presigned/pack?host=AEFT|PPRO` service. Pack updates use full archives. Remote category previews, incremental downloads, extension auto-updates, WebSocket notifications, and Motionflow telemetry are disabled in the Odin panel; installed categories are read locally. The existing legacy package service is not modified by this integration.

## Local checks

```sh
npm ci --prefix tests/cep
npm test --prefix tests/cep
npm run build
```

The isolated test package uses an in-memory PostgreSQL engine and mocked catalog/download responses. It does not connect to the production database or create real user accounts. Tests cover token claims, expiration, device limits/replacement/revocation, subscription seats, rate limits, safe return paths, catalog filtering, and download-host validation. Actual Adobe pack application and production login still require the deployment smoke test above.
