# Repository Guidelines

## Stack

- Node.js with Express 4 and `body-parser`; browser UI uses HTML, CSS, and vanilla JavaScript.
- Application records are stored in `data/db.json` through `lib/store.js`.

## Module map

### `routes/`

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product listing and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.

### `lib/`

- `lib/coupons.js` — coupon lookup, validation, and discount calculation.
- `lib/dates.js` — today’s date, date normalization, and fiscal-year calculation.
- `lib/inventory.js` — stock lookup, sellable stock, checks, reservation/release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — checkout subtotal, discount, GST, and totals calculation.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — synchronous JSON store reads/writes and audit entries.
- `lib/tax.js` — HSN GST rate lookup and CGST/SGST split.

## Commands

- `npm start` — start the app with `node server.js` (default port 3000; `PORT` overrides it).
- `node --test` — run tests with Node’s built-in test runner. No test files or test script are currently present/configured.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
