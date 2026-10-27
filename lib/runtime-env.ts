// Never expose runtime secrets through next.config.env or client components.
// Cloudflare bindings are not available inside a Vercel Node.js function.
// Until a production database is connected, data routes fail closed and the
// existing checkout configuration gate keeps payments disabled.
export const env: Cloudflare.Env = {
  CHECKOUT_MODE: process.env.CHECKOUT_MODE as Cloudflare.Env["CHECKOUT_MODE"],
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
