# Life of Mo

Repository: `/Users/jp/Documents/Codex/2026-10-23/th/work/life-of-mo`.
Production: `https://lifeofmo.com`; GitHub: `jp-com/lifeofmo`.
Vercel project: `lifeofmo` (`prj_YPUmUGMsLNN7sRSly7Qp6bRspjGy`),
team: `team_sayJwDZH4aEnNZ7IHSrd56g6`. Main pushes trigger production deployment.

## Commands and architecture

- `npm run dev`: Vinext preview at `http://127.0.0.1:5173` with Cloudflare D1.
- `npm run build:vercel`: native Next.js production build. Run in a clean checkout when Vinext is active; both generate `.next` route types.
- `npm run test:checkout`: payment rules and webhook checks.
- `npm run test:database`: persistence, gift routes and atomic database updates.
- `npm run db:migrate:turso`: tracked production migrations; requires server-only Turso credentials. Never print or commit secrets.
- Vercel uses Turso through `lib/runtime-env.ts`; local/Sites uses `lib/runtime-env.cloudflare.ts`. Storage configuration and Stripe payment readiness are separate.

## Efficient workflow

- Read only relevant files and sections with `rg` and bounded reads. Filter tool results before returning them: status, identifiers, relevant errors and short log excerpts. Avoid full JSON, tool catalogs and page trees unless needed.
- Prefer connectors/APIs for hosted state and terminal tools for code or API checks. Use the browser for visual verification and capabilities unavailable through direct tools.
- Reuse valid browser tabs, handles and loaded documentation. After context loss, restore required browser documentation once. Read the relevant component or fresh UI state; capture screenshots when assessing appearance.
- Batch independent reads. Check deployment status after an appropriate build interval; fetch build logs for failures or unexpected delays. Stop checking once success is established.
- Keep investigation proportional: copy/CSS changes need focused checks; persistence/payment changes need meaningful integration checks. Do not rerun broad checks without a new reason.
- When model/reasoning controls are available, match effort to complexity. Do not claim a setting changed unless it actually did.
- Keep updates and final replies concise, with outcome, verification and material limitations. Preserve artwork, copy and desktop layout when a change is scoped to mobile spacing.
