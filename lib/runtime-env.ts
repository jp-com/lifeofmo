// Never expose runtime secrets through next.config.env or client components.
import { createClient } from "@libsql/client/http";
import { libsqlD1 } from "../db/libsql-d1";

// Vercel uses Turso; the Vinext alias still uses native Cloudflare D1 locally.
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
export const env: Cloudflare.Env = {
  DB: databaseUrl && authToken ? libsqlD1(createClient({ url: databaseUrl, authToken })) : undefined,
  CHECKOUT_MODE: process.env.CHECKOUT_MODE as Cloudflare.Env["CHECKOUT_MODE"],
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
