import { env } from "#life-of-mo-runtime";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Database unavailable. Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN on Vercel, or a DB binding on Cloudflare."
    );
  }

  return drizzle(env.DB, { schema });
}
