# iOne Premiere Basics

A modern web application built with Next.js 15 that provides a platform for managing and displaying educational content. The application features Material-UI components, MDX support for rich content creation, and secure authentication.

## Features

- 🎨 Modern UI with Material-UI (MUI) components
- 📝 MDX support for rich content authoring
- 🔒 Authentication with PostgreSQL-backed sessions and HTTP-only cookies
- 🗄️ Supabase integration for data storage
- ✨ Syntax highlighting for code blocks
- 📱 Responsive design
- 🚀 Built with TypeScript for type safety

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI Library:** Material-UI v6
- **Content:** MDX with remark-gfm support
- **Authentication:** Custom PostgreSQL-backed sessions and HTTP-only cookies
- **Database:** Supabase
- **Styling:** Emotion
- **Language:** TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory with the necessary environment variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## Sales dashboard and partners

Administrators open `/account/affilates` for **all Odin Pro sales**, including
direct orders. The overview shows revenue, successful transactions, unique
buyers, current paid subscriptions, vendor net, and the partner list. Open a
partner for the same report scoped to their selected referral links. All
administrators can view every partner and create their own; partner accounts
can view only their assigned reports.

Revenue uses actual PayPro order prices after discounts and refunds, before
processor fees. The default overview uses PayPro's recorded balance-currency
amounts, including purchases charged in other currencies. Billing currencies
are also available separately in the selector. No current price, estimated
exchange rate or partner commission is used. Net and fees use the provider's
actual balance amounts, which can be negative after a refund. Multi-item orders
without an exact settlement breakdown are flagged instead of being prorated.
Dates and month boundaries are UTC. Refunds update the original sale period.
Active subscriptions and seats are current metrics, independent of the date
filter. Trials, failed charges, manual grants, expired access and disabled
subscriptions are excluded from paid active subscriptions.

The Links tab shows searchable, paginated per-link visits, buyers, transactions,
active access and revenue. Create link is available from both the overview and
partner reports. Manage links uses a bounded search picker for historical codes;
account access is edited separately by email. Codes can be shared across partner reports; global sales are
counted once. The **Create link** form saves a unique lowercase code (3–64
letters, numbers or hyphens) and returns a copyable URL. Duplicate/historical
codes cannot be claimed as new links. Creation and settings require verified
sessions and CSRF. Financial API responses expose masked buyer labels only.
Existing `ODIN_AFFILIATE_ACCESS` mappings remain compatible for legacy access.

Before a future deployment, apply `npm run migrate`, then import the provider
history deliberately. Neither operation is automatic during deployment.
`scripts/export-paypro-sales.mjs` is read-only and outputs a sanitized order
snapshot; it must run where the PayPro API IP whitelist permits requests.
`scripts/import-paypro-sales.mjs --file <snapshot.json>` validates a snapshot as a
dry run. Add `--apply` for a deliberate database import, or `--apply --local` for
loopback databases only. Imports and signed webhook deliveries upsert the same
order/item key, so retries cannot duplicate revenue. Signed financial IPNs are
verified and order details are read through the authenticated PayPro API before
saving. API request echoes, keys, addresses and payment-card data are not stored.

### Local review

`npm run preview:sales` uses a dedicated PostgreSQL instance on
`127.0.0.1:55432` and starts Next on `http://127.0.0.1:3100`. It reads the
sanitized `.local/affiliate-preview/paypro-data.json` snapshot. Local data,
PostgreSQL files and preview build output are ignored by Git. Production
credentials are disabled in the preview child process and its database is
hardcoded to loopback. Preview login: `preview@odin.local` / `LocalPreview123!`.
The local draft groups Cinecom under Jordy and both Basics codes under Tymon;
this mapping is editable in **Manage links**, not applied to production.
The new migration creates those two profiles without guessing account access
or assigning historical codes in production.

Visits start with this version: previous visits were never stored. Incoming
`/?ref=code` visits are counted once per link and browser tab session, including
when a referral attribution cookie already exists. Refreshes deduplicate by UUID;
unknown links and common crawler user agents are excluded. No IP addresses are
stored. First-touch payment attribution remains unchanged. Apply the visits
migration before enabling this version.

Verify with `npm test --prefix tests/cep` and `npm run build`.

## Project Structure

- `/articles` - MDX content files
- `/markdown` - Additional markdown content
- `/public` - Static assets
- `/src` - Application source code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ using [Next.js](https://nextjs.org)

## Partner earnings

Each partner's **Earnings settings** selects personal links, personal links plus
direct sales (no referral), or all sales. Settings require an administrator and
CSRF verification. Developer/Developers defaults to all sales, Tymon to personal
links plus direct sales, and Jordy to personal links only after applying
`2026_10_14_001_partner_earnings.sql`. Existing link and account assignments remain.

For each recorded sale, use the actual PayPro net in its settlement currency,
subtract 7% atomX royalty, then allocate 50% of the remainder to the partner.
Royalty and partner share are rounded per sale to cents; negative settlements
reverse the same calculation. Totals use the selected UTC sale period, include
all pages, and never combine currencies. Missing net or settlement currency is
excluded and visibly flagged as incomplete. Link filters narrow the displayed
report to that link. These reports calculate earnings; they do not send payouts.

Global read access to affiliate reports can be granted by adding an existing
account UUID to `odin_affiliate_report_viewers`. The account sees the affiliate
tab and every partner report, without site administrator or editing privileges.
