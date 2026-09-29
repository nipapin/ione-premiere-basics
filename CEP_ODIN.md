# Odin Pro CEP integration

This site serves the `odin-cep` client from the shared CEP project. Existing Odin website accounts and subscriptions are used; Motionflow accounts are not required.

## Deploy

1. Apply `db/migrations/2026_09_29_odin_cep_auth.sql` to the database used by this site. It adds three Odin CEP tables and does not migrate or remove legacy device records.
2. Set `NEXT_PUBLIC_APP_URL=https://odin-pro.com`. Optionally set `CEP_DEVICE_LIMIT` (default: 3 active devices per account).
3. Build and deploy the site using the project's normal deployment process. The migration and deployment are not performed by the local CEP build.
4. Test browser sign-in from the Odin panel, approve the displayed code, then verify the profile and device list. Check a subscribed and an unsubscribed account, device replacement, and revocation. Verify pack installation in both Adobe hosts.

## Authentication

The panel calls `POST /api/cep/auth/device`, opens `/cep/login?code=…&client=odin-cep`, and polls `POST /api/cep/auth/token` with a panel-only secret. The website preserves the confirmation destination through login and signup. Signup retains the existing automatic website session; email confirmation uses the actual confirmation token rather than an email address.

Codes expire after five minutes. Consent requires a website session and a matching request origin. A token can be claimed once; only token/secret hashes are stored. Account-level transaction locks enforce device limits. Access tokens expire after 30 days; `GET /api/cep/me` and `POST /api/cep/devices/revoke` support the panel profile. Old AtomX sessions do not become new CEP sessions automatically.

Entitlements use this site's existing subscription rule (`next_charge_date` in the future), including invited subscription seats. There are no AI credits, free pack slots, or individual pack purchases for Odin.

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
