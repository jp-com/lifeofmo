# Life of Mo checkout

The automatic offer is implemented: one Ella collector’s edition is £20; every Ella copy in an order of two or more is £18. Next-book copies stay £18 and never count towards that threshold. Standard delivery is £5 and Shipping+ is £7.50. Stripe receives the actual discounted unit prices, so a returned Ella copy can be refunded at the £18 paid without changing the price of retained copies. No promotion codes or additional discounts are enabled.

## Current activation state

Payments remain disabled. The owner explicitly asked to decide next-book postage before enabling payment. The Stripe connector also requires reconnection. No Stripe account, sandbox credentials, webhook endpoint or real payment has been verified in this workspace. This is implemented integration code, not a live checkout.

The only implemented postage policy for an enabled checkout is `included`: one £5/£7.50 charge covers the whole order, including any later separate shipment. Do not select it until the owner confirms it. If separate postage is chosen, first add its explicit amount to the shared totals, Stripe shipping charge, summary, disclosures and tests. While pending, an order containing the next book displays an estimated total and the unresolved postage disclosure.

## Configuration

For local development, use an ignored `.dev.vars` file at the repository root. Store hosted secrets using the Sites environment-variable tools. Never put server keys in `NEXT_PUBLIC_*`, `VITE_*`, source code or chat. Prefer a restricted Stripe key (`rk_test_` / `rk_live_`) with only the permissions this checkout needs: Checkout Sessions create/read/update, associated Product/Price/Shipping Rate creation/read, and retrieval of line-item products. Confirm the exact restricted-key permissions in the chosen sandbox.

| Variable | Purpose |
| --- | --- |
| `CHECKOUT_MODE` | `disabled` by default; `sandbox` for test credentials; `live` only after launch verification |
| `NEXT_BOOK_POSTAGE` | `pending` until decided; currently only `included` can enable checkout |
| `STRIPE_SECRET_KEY` | Server-only restricted key for the selected environment |
| `STRIPE_PUBLISHABLE_KEY` | Matching public Stripe key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this environment’s endpoint or local listener |

All settings and D1 must be present, with matching test/live key prefixes, before payment sessions can be created. Disabling checkout stops new/updated sessions; already-authorised Stripe payments still need webhook processing. To stop existing open sessions as well, expire them in Stripe.

Use a separate Stripe sandbox for development. After account connection, apply pending D1 migrations (including `0003_messy_carnage.sql`), configure sandbox keys, and forward sandbox webhooks to `http://127.0.0.1:5173/api/stripe/webhook` with Stripe CLI. Keep the listener signing secret local. Restart the development server after changing `.dev.vars`.

The hosted endpoint is `/api/stripe/webhook` and must receive unauthenticated requests from Stripe; it authenticates the raw payload using its Stripe signature. The currently private Site may block those requests before the handler. Confirm the production routing/access arrangement before enabling live mode; do not publish the private site merely to test webhooks.

Register these events using API version `2026-09-30.endive` (the version pinned by Stripe Node 23.0.1):

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

## Payment and order flow

The checkout shell, art and quantity controls render independently of Stripe. The payment bundle loads only when configured. Stripe.js loads once per key, in parallel with session creation. Checkout Sessions with `ui_mode: elements` and the Payment Element handle card data and payment authentication. Payment methods stay dynamic and are managed in Stripe. No automatic tax setting is enabled; tax configuration must be reviewed separately before launch.

Contact details require a phone number. The compact email/phone row stacks on narrow screens and supports telephone autofill. UK numbers starting with `0` are converted to `+44`; explicit `+` and `00` international prefixes are accepted. The number is passed to Stripe confirmation with phone collection enabled, then saved from Stripe’s verified `customer_details.phone` into `checkout_orders.phone` (migration `0004_talented_colleen_wing.sql`). It is not included in public order-status responses or used for marketing signup.

The server rejects injected amounts, invalid quantities, unsupported shipping and excessive totals. It computes prices again from its catalog. A random HttpOnly, SameSite cookie owns each local order; session IDs alone grant no access. POST creation is idempotent. Version checks and short database leases serialize cart updates, and `runServerUpdate` refreshes Stripe without discarding entered payment details. Payment is locked while the cart changes; confirmation performs one final server sync and total check.

Only a signature-verified webhook can mark an order paid. It retrieves current Stripe state and checks currency, total, unit prices, product identifiers, quantities and UK shipping details against the saved order. Mismatches go to `review`, never to automatic fulfilment. D1 records the event and paid order atomically; duplicates are harmless and delayed failures cannot downgrade a paid order. Stripe retries transient database/API failures.

`checkout_orders` is the fulfilment record: paid status, exact charged cart, delivery details, payment ID and a maximum of one pencil set. `checkout_events` deduplicates notifications. Gift eligibility is recalculated using the confirmed email and paid-order history; redemption happens in the same transaction as payment confirmation. A later signup cannot turn a second order into a qualifying first order. Stripe receipts can be configured in the Dashboard; this code does not send a separate order email or automatically dispatch books.

The return page reads the owned database record and polls briefly for webhook confirmation. Redirecting to that page cannot mark an order paid. Pending asynchronous payments are clearly marked pending, with instructions not to pay twice. Orders requiring review show a reference and contact link.

## Verification

Run `npm run test:checkout`, `npx tsc --noEmit`, and `npm run build`. Local tests cover discount thresholds, next-book exclusion, both shipping rates, payload validation, tampered paid sessions, signature verification, duplicate/out-of-order events, first-order gift redemption and transaction rollback. Browser checks cover the discount UI and disabled checkout. These checks do not replace the sandbox payment test.

Before activation, exercise the connected sandbox end to end: a normal payment, a decline and authentication challenge; 1 → 2 → 3 → 1 copies; next-book add/remove and both delivery choices; a retry after a network error; duplicate/async webhook delivery; paid-order persistence and gift redemption; and the return page. Then verify the same webhook route and matching live settings without making an unapproved real charge.
