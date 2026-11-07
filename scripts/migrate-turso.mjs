import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { fileURLToPath } from "node:url";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) throw new Error("Turso connection settings are required");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  await migrate(drizzle(client), { migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)) });
  console.log("Turso migrations are up to date.");
} finally { client.close(); }
