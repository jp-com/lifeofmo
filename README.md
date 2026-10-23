# Life of Mo

Responsive launch website for Ella’s Night Flight, built with React, Vinext and the Sites Cloudflare Worker integration.

## Launch state

- Book price: £20 GBP.
- Pre-orders are opening soon. Dispatch timing and delivery charges are unconfirmed.
- The “Notify me when pre-orders open” buttons open a launch-signup dialog. No payment is taken and no copy is reserved.
- Stripe checkout is deliberately deferred until the owner is ready to build it.
- Email signups persist in D1. This build does not send emails or connect an email marketing provider.
- Site access is private to the owner.

## Content and assets

The website uses the supplied Life of Mo wordmark, character sheets, palette and Lora / Nunito Sans typography. Four new illustrations closely follow the original concept: the book-and-tree hero, open storybook, three activity vignettes and the founder woodland scene. Cover, story and activity imagery are labelled as previews. Fonts are self-hosted, with their licenses included. Replace these preview images with approved production files before opening orders.

`asset-provenance.json` records sources, image-generation prompts and asset status.

## Responsive composition

- Desktop: maximum 1200px container, 40px gutters, 5:7 hero, three activity columns and four character columns.
- Tablet (701–1023px): 32px gutters and a 468px minimum hero; retain two-column book/story layouts, three activities and four characters. Footer becomes two columns plus a links row.
- Phone (700px and below): 24px gutters, text/art/action hero sequence, three compact illustrated activity rows, two character columns and stacked footer. At 374px and below, gutters reduce to 18px.
- Natural content height, 16px inputs, 44px secondary controls and 48px primary actions; reduced-motion support and native dialog focus containment.
- Removed decorative icon strips, chips, redundant labels, fake multi-slide samples and the cropped founder portrait.

## Main files

- `app/page.tsx`: homepage, navigation, reader, characters, FAQ and signup dialogs.
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

Desktop, tablet and phone layouts were checked from 320px to 1920px, with no horizontal overflow or missing images. The mobile menu, character dialogs, single-excerpt reader with selectable text and FAQ were exercised. A test signup was confirmed in the local database; duplicate email, invalid email, missing consent, honeypot, malformed JSON and cross-origin request behavior were checked. Test subscriber records are local only.

## Before taking orders

Confirm the final cover and interior artwork, physical format, dispatch window, delivery destinations and charges. Add the Stripe checkout flow and reviewed shop policies. Connect an email delivery service when launch messages are ready to send.

## Activity update

The three confirmed activities are Spot the difference, Hidden objects and Colouring. New illustrations follow the supplied desktop/phone references. The section uses three columns above 700px and stacked illustrated rows at 700px and below; all three activities remain visible. No link to a ten-activity collection is included.

## Focused story and launch copy

The story preview combines Ella’s first step and the reason to share the book, alongside the open spread on the same flat cream background as the rest of the page. The separate emotional-theme strip has been removed. Activities follow directly under “More to enjoy together.” The footer promises a pre-order notification and uses a “Notify me” action. Unconfirmed format, dimensions, page count and production details remain unpublished.

Page sections use spacing rather than divider rules. Header, story, friends, founder, closing invitation and footer column separators are removed; activity card outlines and FAQ row separators remain functional component details.

The activities and friends headings and introductory text are centred at every screen size, with balanced line wrapping and centred paragraph widths on phones.
