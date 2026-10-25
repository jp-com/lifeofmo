# Life of Mo

Responsive launch website for Ella’s Night Flight, built with React, Vinext and the Sites Cloudflare Worker integration.

## Launch state

- Book price: £20 GBP.
- The page presents the £20 pre-order offer. Dispatch timing and delivery charges are unconfirmed.
- Purchase buttons read “Pre-order the book” (or “Pre-order” in the header) and are intentionally static. They do not navigate, submit data or open a dialog. No payment is taken and no copy is reserved.
- Stripe checkout is deliberately deferred until the owner is ready to build it.
- Email signups persist in D1. This build does not send emails or connect an email marketing provider.
- The `/contact` page validates enquiries and stores them in D1. It does not forward messages by email; connect an email delivery provider before offering inbox notifications. The visible `hello@lifeofmo.example` address is a non-clickable placeholder, to replace before launch.
- Site access is private to the owner.

## Content and assets

The website uses the supplied Life of Mo wordmark, palette, book cover, two interior spreads, activity illustrations and individual Mo, Ella, Benny and Pip portraits. The founder section uses the supplied woodland tea scene, displayed at its natural aspect ratio with the existing responsive width and placement. The homepage omits preview captions; asset provenance retains the illustration status. Lora and Nunito Sans are self-hosted, with their licenses included.

The monochrome hedgehog favicon switches from black in light mode to white in dark mode. PNG and ICO fallbacks are included; `scripts/prepare-favicon.mjs` regenerates them from the emblem source.

`asset-provenance.json` records sources, image-generation prompts and asset status.

## Responsive composition

- Desktop: maximum 1200px container, 40px gutters, 5:7 hero, three activity columns and four character columns.
- Tablet (701–1023px): 32px gutters and a 468px minimum hero; retain two-column book/story layouts, three activities and two character columns. Footer places the brand and navigation beside the newsletter.
- Phone (700px and below): 24px gutters, text/art/action hero sequence, three compact illustrated activity rows, two character columns and stacked footer. At 374px and below, gutters reduce to 18px.
- Natural content height, 16px inputs, 44px secondary controls and 48px primary actions with a 6px corner radius; reduced-motion support and native dialog focus containment.
- The story preview includes two supplied spreads with dot controls and a three-second rotation. It pauses on hover, keyboard focus or manual selection, and respects reduced-motion preferences.

## Main files

- `app/page.tsx`: homepage, characters and FAQ.
- `components/site-chrome.tsx`: shared navigation, footer, newsletter and dialogs.
- `components/story-spreads.tsx`: two-spread carousel and motion preferences.
- `app/contact/`: responsive contact page and form.
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

Confirm the final cover and interior artwork, physical format, dispatch window, delivery destinations and charges. Add the Stripe checkout flow and reviewed shop policies. Connect an email delivery service when launch messages are ready to send.

## Activity update

The three confirmed activities are Maze, Crossword and Colouring. Their descriptions are “Help the woodland friends find their way.”, “Solve the clues and fill in the words.” and “Bring the woodland to life with your own colours.” The illustrations follow the supplied desktop/phone references. The section uses three columns above 700px and stacked illustrated rows at 700px and below; all three activities remain visible. No link to a ten-activity collection is included.

## Focused story and launch copy

The hero presents the collector’s edition, £20 price and static pre-order button. The story preview combines Ella’s first step with the spread carousel and product-details accordion on the same flat cream background as the rest of the page. Activities follow under “Inside the book.” with “Three cozy activities to enjoy together.” Unconfirmed format, dimensions, page count and production details remain unpublished.

The footer uses the tagline “Stories that hug back”, grouped Explore and Here to help navigation, a “Keep in touch” newsletter form and a separate copyright/privacy row. The email field retains an accessible label without displaying it above the field.

Page sections use spacing rather than divider rules. Header, story, friends, founder, closing invitation and footer column separators are removed; activity card outlines and FAQ row separators remain functional component details.

From the friends section through the closing invitation, headings share a responsive scale of 32–36px on desktop and 28px on tablet and phone. Supporting text and FAQ questions/answers use 16px, with character captions at 14px. Content-block gaps are 80px on desktop, 64px on tablet and 56px on phone. FAQ controls use at least 64px rows with 20px vertical padding; the existing artwork, image columns and copy are retained.

The activities and friends headings and introductory text are centred at every screen size, with balanced line wrapping and centred paragraph widths on phones. Friends sit in softly outlined cream cards, with short muted lavender, gold, moss and warm-brown marks between names and descriptions. Four columns become two below 1024px.

The hero availability/dispatch line and the cover, open-spread and activities preview captions are removed. The closing purchase card repeats the collector’s edition and £20 price above its static pre-order button, with artwork flush to the card’s right edge on desktop. Dispatch information remains in the FAQ.

The story excerpt link, reader modal and hero’s “Look inside” link are removed.
