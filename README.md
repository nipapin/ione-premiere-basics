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

## Partner referral statistics

`/account/affilates` displays all historical records for each permitted referral
code. The page, account navigation (desktop and mobile), and `/api/affilates` use
validated sessions. Partners do not need administrator rights.

Configure access in the server's `.env.local` or deployment environment using
account UUIDs from `users.user_id` and exact `ref` values:

```dotenv
ODIN_AFFILIATE_ACCESS={"JORDY_ACCOUNT_UUID":["cinecom","premierebasics","aftereffectsbasics"],"TYMON_ACCOUNT_UUID":["cinecom","premierebasics","aftereffectsbasics"]}
```

Replace both placeholders with confirmed accounts and restart the server. Use
`SELECT user_id, email FROM users WHERE lower(email) = lower($1)` to resolve each
confirmed email. Names never grant access. Each account can have its own list;
additional referral codes can be configured the same way. Administrators can
view the three original codes and all codes in this configuration. An absent
configuration grants no partner access; malformed configuration fails closed.
No database migration or historical backfill is needed.

Subscriptions count stored records across all statuses, including cancellations,
failures and trials; status and trial counts are displayed separately. Licenses
sum their recorded quantities. Renewals do not count as new subscriptions.
One-time sales count only `payments` with status `Processed`. These are record
counts, not a verified count of paid, non-refunded transactions: the legacy
subscription table lacks a payment ledger, and its cancelled status does not
distinguish refunds from subscription termination. Historical subscription
revenue is unavailable because payment amounts were not stored. Current PayPro
prices are not used as historical revenue. Records without a referral cannot be
attributed retroactively. Renewal notifications without a referral preserve the
subscription's existing attribution.

Verify with `node --test tests/cep/affiliates.test.mjs`.

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
