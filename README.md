# Life of Mo

Responsive launch website for Ella’s Night Flight, built with React, Vinext and the Sites Cloudflare Worker integration.

## Launch state

- Book price: £20 GBP.
- All pre-order links lead directly to `/checkout`. Payments remain disabled until Stripe is connected and the next-book postage policy is decided.
- The checkout presents the £20 collector’s edition, independent quantities for the optional next book at £18 instead of £20, £5 Standard tracked delivery and £7.50 Shipping+ (initial test price). Shipping+ includes priority dispatch once available, faster delivery and prepaid UK change-of-mind returns.
- The “One to keep, one to give” offer automatically prices all Ella copies at £18 each for quantities of two or more; one copy remains £20. The optional next book stays £18 and does not count towards the threshold. The offer details and separate savings are shown beside the product and in the summary.
- Delivery is UK-only. Postage for a separately dispatched next book is unresolved, and such baskets show an estimated total. Dispatch dates and the next book’s title/release date are unconfirmed.
- Stripe Checkout Sessions and Payment Element integration is implemented behind a disabled activation gate, with server pricing, owned sessions, signed webhooks and persistent order records. The connected Stripe app still requires reauthentication, so no sandbox payment has been verified. See `docs/stripe-checkout.md` for configuration and verification.
- Email signups persist in D1. This build does not send emails or connect an email marketing provider.
- The `/contact` page validates enquiries and stores them in D1. It does not forward messages by email; connect an email delivery provider before offering inbox notifications. The visible `hello@lifeofmo.example` address is a non-clickable placeholder, to replace before launch.
- The `/booksellers` page is linked from the footer and includes an introduction, book overview, planned wider collection (more books, plush friends and accessories) and a stocking enquiry form. The five image boxes are deliberate placeholders; future products are presented as planned, with no release dates or ordering options. Bookshop name and location are validated with the other fields and stored in the existing contact message under the `Bookshops` topic; no newsletter subscription or email is sent.
- Site access is private to the owner.

## Content and assets

The website uses the supplied Life of Mo wordmark, palette, book cover, two interior spreads, activity illustrations and individual Mo, Ella, Benny and Pip portraits. The founder section uses the supplied woodland tea scene, displayed at its natural aspect ratio with the existing responsive width and placement. The homepage omits preview captions; asset provenance retains the illustration status. Lora and Nunito Sans are self-hosted, with their licenses included.

The favicon places the original black hedgehog on a white circle in both light and dark mode. PNG and ICO fallbacks are included; `scripts/prepare-favicon.mjs` regenerates them from the unchanged emblem source.

`asset-provenance.json` records sources, image-generation prompts and asset status.

## Responsive composition

- Desktop: maximum 1200px container, 40px gutters, 5:7 hero, three activity columns and four character columns.
- Tablet (701–1023px): 32px gutters and a 468px minimum hero; retain two-column book/story layouts, three activities and two character columns. Footer places the brand and navigation beside the newsletter.
- Phone (700px and below): 24px gutters, text/art/action hero sequence, three compact illustrated activity rows, two character columns and stacked footer. At 374px and below, gutters reduce to 18px.
- Natural content height, 16px inputs, 44px secondary controls and 48px primary actions with a 6px corner radius; reduced-motion support and native dialog focus containment.
- The story preview includes two supplied spreads with dot controls and a three-second rotation. It pauses on hover, keyboard focus or manual selection, and respects reduced-motion preferences.

The checkout uses paired contact fields, an expandable optional address line and a compact UK destination label. Its order summary sits with the book on the right on desktop. A smaller book image and reduced section spacing bring the payment action higher while retaining 16px inputs; contact fields stack on narrow phones.

At 700px and below, checkout uses a thumbnail beside the title, expandable book details and order breakdown, and a visible next-book offer. Supporting text is at least 14px and secondary help links have 44px tap areas. Desktop layout is unchanged. The order-status heading distinguishes missing orders, lookup errors, review and delayed confirmation from an active check.

## Main files

- `app/page.tsx`: homepage, characters and FAQ.
- `app/checkout/`: responsive checkout preview, with the form on the left and book on the right on desktop; product first on phones.
- `lib/checkout.ts`: shared prices in integer pence, automatic multi-copy pricing and total calculations; payment routes recalculate these on the server.
- `app/api/checkout/`, `app/api/stripe/webhook/`, `lib/checkout-*.ts` and `lib/stripe-pricing.ts`: Stripe session management, validation, payment confirmation and order storage.
- `components/site-chrome.tsx`: shared navigation, footer, newsletter and dialogs.
- `components/story-spreads.tsx`: two-spread carousel and motion preferences.
- `app/contact/`: responsive contact page and form.
- `app/booksellers/`: bookseller page, scoped styles and stocking enquiry form.
- `app/api/booksellers/route.ts` and `lib/booksellers.ts`: validated, idempotent bookseller enquiry storage without a new database migration.
- `app/api/contact/route.ts`: validated, idempotent enquiry storage.
- `lib/contact.ts`: shared enquiry types and validation.
- `app/globals.css`: visual design and responsive rules.
- `app/api/subscribe/route.ts`: signup validation and persistence.
- `db/schema.ts` and `drizzle/`: database schema and migration.
- `app/layout.tsx`: page metadata.
- `.openai/hosting.json`: private Site identity and D1 binding.

## Local development

Requires Node.js 22.13 or newer. Install with `npm ci`, then run `npm run dev`. The portable preview starts at http://127.0.0.1:5173.

Run `npx tsc --noEmit` for type validation. Follow the Sites plugin workflow for builds and publication; preserve its Vite plugin and Worker entrypoint. Runtime state, credentials, generated build output and node_modules are excluded from source control.

For a fresh local database, build once and apply pending SQL from `drizzle/` with Wrangler using the generated `dist/server/wrangler.json` and `.wrangler/state`. Do not replay migrations already applied. Hosted publication applies production migrations separately.

## Verified

Desktop, tablet and phone layouts were checked from 320px to 1920px, with no horizontal overflow or missing images. The mobile menu, character dialogs and FAQ were exercised. The former excerpt reader has been removed. A test signup was confirmed in the local database; duplicate email, invalid email, missing consent, honeypot, malformed JSON and cross-origin request behavior were checked. Test subscriber records are local only.

## Before taking orders

Confirm charges for separately shipped books and whether the next-book preorder is paid now before enabling payment, as requested by the owner. Reconnect Stripe, configure a separate sandbox and verify the complete payment/webhook flow described in `docs/stripe-checkout.md`. The current private Site must have an accessible Stripe webhook route before live activation. Confirm the final artwork, physical format, dispatch windows and Shipping+ terms before taking orders. Connect an email delivery service when launch messages are ready to send.

## Activity update

The three confirmed activities are Maze, Crossword and Colouring. Their descriptions are “Help the woodland friends find their way.”, “Solve the clues and fill in the words.” and “Bring the woodland to life with your own colours.” The illustrations follow the supplied desktop/phone references. The section uses three columns above 700px and stacked illustrated rows at 700px and below; all three activities remain visible. No link to a ten-activity collection is included.

## Focused story and launch copy

The hero presents the collector’s edition, £20 price and direct checkout link. The story preview combines Ella’s first step with the spread carousel and product-details accordion on the same flat cream background as the rest of the page. Activities follow under “Inside the book.” with “Three cozy activities to enjoy together.” Unconfirmed format, dimensions, page count and production details remain unpublished.

The footer uses the tagline “Stories that hug back”, grouped Explore and Here to help navigation, a “Keep in touch” newsletter form and a separate copyright/privacy row. The email field retains an accessible label without displaying it above the field.

Page sections use spacing rather than divider rules. Header, story, friends, founder, closing invitation and footer column separators are removed; activity card outlines and FAQ row separators remain functional component details.

From the friends section through the closing invitation, headings share a responsive scale of 32–36px on desktop and 28px on tablet and phone. Supporting text and FAQ questions/answers use 16px, with character captions at 14px. Content-block gaps are 80px on desktop, 64px on tablet and 56px on phone. FAQ controls use at least 64px rows with 20px vertical padding; the existing artwork, image columns and copy are retained.

The activities and friends headings and introductory text are centred at every screen size, with balanced line wrapping and centred paragraph widths on phones. Friends sit in softly outlined cream cards, with short muted lavender, gold, moss and warm-brown marks between names and descriptions. Four columns become two below 1024px.

The hero availability/dispatch line and the cover, open-spread and activities preview captions are removed. The closing purchase card repeats the collector’s edition and £20 price above its direct checkout link, with artwork flush to the card’s right edge on desktop. Dispatch information remains in the FAQ.

The story excerpt link, reader modal and hero’s “Look inside” link are removed.

## Mo’s gift popup

`components/gift-popup.tsx` opens a three-step gift card after the visitor reaches “Inside the book.” It reuses the approved Mo portrait and existing colouring illustration, with the site’s cream, brown, lavender, Lora and Nunito styling. A dismissal is remembered, with a small optional gift button for reopening; a saved claim suppresses future prompts. The popup never mounts on checkout. Native dialog focus containment, Escape, focus return, small-screen scrolling and reduced-motion behaviour are supported. For a repeatable local design preview, visit `/?gift-preview=1#activities-title` (development only).

`POST /api/gifts/claim` validates and saves a unique normalised email in `gift_claims` (migration `0002_cool_lady_ursula.sql`). Newsletter consent is separate and unchecked; only an explicit opt-in inserts a subscriber. Duplicate claims reuse their original opaque claim link. A successful claim stores an HttpOnly, SameSite cookie and offers a copyable `/checkout?gift=<claim-id>` backup link; the URL contains no email address. Email sending is intentionally unconnected for now.

`POST /api/gifts/eligibility` checks the checkout email and paid-order history, recovers a saved claim from its cookie/link, and also recognises existing subscribers. The checkout shows one free colouring pencil set for a qualifying first order and states that it combines with the book offer. Changing the email immediately clears stale eligibility. The claim token is removed from the checkout URL after recovery. Used claims and previous purchasers are ineligible. The Stripe webhook checks the confirmed email and redeems at most one set atomically with the paid-order record; the browser’s display is not fulfilment authority.

The colouring artwork is illustrative; replace it with the actual pencil-set image once that product is chosen. Local API checks cover persistence, duplicate claims, token recovery, existing subscribers, separate marketing consent, invalid input, honeypot and cross-origin rejection. Browser checks cover reveal/claim/copy, email recovery, automatic gift display, changing/clearing email, keyboard dismissal, and 320px/390px phone plus laptop layout dimensions.
