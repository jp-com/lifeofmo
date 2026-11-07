import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const compiled = new URL("../work/database-tests/", import.meta.url);
await mkdir(compiled, { recursive: true });
async function compile(source, target, replacements = []) {
  let output = ts.transpileModule(await readFile(new URL(source, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [from, to] of replacements) output = output.replaceAll(from, to);
  output = output.replace(/from (["'])(\.\/[\w-]+)\1/g, 'from "$2.mjs"');
  await writeFile(new URL(target, compiled), output);
}
await compile("../db/libsql-d1.ts", "adapter.mjs");
await compile("../db/schema.ts", "schema.mjs");
for (const file of ["gifts", "checkout", "checkout-contract", "checkout-webhook"]) await compile(`../lib/${file}.ts`, `${file}.mjs`);
for (const route of ["claim", "eligibility"]) await compile(`../app/api/gifts/${route}/route.ts`, `${route}.mjs`, [
  ['"../../../../db"', '"./fixture.mjs"'], ['"../../../../db/schema"', '"./schema.mjs"'], ['"../../../../lib/gifts"', '"./gifts.mjs"'],
]);
await writeFile(new URL("fixture.mjs", compiled), `
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/d1";
import { libsqlD1 } from "./adapter.mjs";
export const client = createClient({url:"file::memory:"});
export const binding = libsqlD1(client);
export const getDb = () => drizzle(binding);
`);
const { client, binding } = await import(new URL("fixture.mjs", compiled));
const { drizzle } = await import("drizzle-orm/libsql");
const { migrate } = await import("drizzle-orm/libsql/migrator");
const { POST: claim } = await import(new URL("claim.mjs", compiled));
const { POST: eligibility } = await import(new URL("eligibility.mjs", compiled));
const { recordCheckoutNotification } = await import(new URL("checkout-webhook.mjs", compiled));
const migrationsFolder = new URL("../drizzle", import.meta.url).pathname;
const request = (route, body, cookie) => new Request(`https://lifeofmo.com/api/gifts/${route}`, {
  method: "POST", headers: { "content-type": "application/json", origin: "https://lifeofmo.com", ...(cookie ? {cookie} : {}) }, body: JSON.stringify(body),
});

test("production SQLite adapter: migrations, gift routes and atomic webhook updates", async (t) => {
  try {
    await migrate(drizzle(client), { migrationsFolder });
    await migrate(drizzle(client), { migrationsFolder }); // Safe to run again on later deploys.
    let cookie;
    await t.test("claim persists, repeat claims reuse it, and checkout recognises cookie and email without marketing signup", async () => {
      const response = await claim(request("claim", {email:"  Gift@Example.test  ", marketingConsent:false}));
      assert.equal(response.status, 200);
      const saved = await response.json();
      assert.equal(saved.ok, true);
      cookie = response.headers.get("set-cookie").split(";")[0];
      assert.match(response.headers.get("set-cookie"), /HttpOnly; SameSite=Lax/);
      const repeated = await claim(request("claim", {email:"gift@example.test"}));
      assert.equal((await repeated.json()).claimPath, saved.claimPath);
      assert.equal((await client.execute("SELECT * FROM gift_claims")).rows.length, 1);
      assert.equal((await client.execute("SELECT * FROM subscribers")).rows.length, 0);
      for (const body of [{}, {email:"gift@example.test"}, {token:saved.claimPath.split("=")[1]}]) {
        const checked = await eligibility(request("eligibility", body, cookie));
        assert.equal(checked.status, 200);
        assert.equal((await checked.json()).eligible, true);
      }
    });
    await t.test("Drizzle batches retain column mapping and parameterised RETURNING rows", async () => {
      const { sql } = await import("drizzle-orm");
      const { giftClaims } = await import(new URL("schema.mjs", compiled));
      const { getDb } = await import(new URL("fixture.mjs", compiled));
      const rows = await getDb().batch([getDb().select({one:sql`1`,two:sql`2`}).from(giftClaims), getDb().select({value:sql`3`}).from(giftClaims)]);
      assert.deepEqual(rows, [[{one:1,two:2}],[{value:3}]]);
      const row = await binding.prepare("UPDATE gift_claims SET email = ? WHERE email = ? RETURNING email").bind("gift@example.test", "gift@example.test").first();
      assert.deepEqual(row, {email:"gift@example.test"});
    });
    await t.test("failed batches roll back every write", async () => {
      await assert.rejects(binding.batch([
        binding.prepare("INSERT INTO gift_claims (id,email) VALUES (?,?)").bind("rollback", "rollback@example.test"),
        binding.prepare("INSERT INTO nonexistent_table VALUES (1)"),
      ]));
      assert.equal(await binding.prepare("SELECT id FROM gift_claims WHERE id = ?").bind("rollback").first(), null);
    });
    await t.test("duplicate payment events redeem exactly one gift and used claims are rejected", async () => {
      await binding.prepare("INSERT INTO checkout_orders (id,owner_hash,cart,amount) VALUES ('order-1','owner','{}',2500)").run();
      const event = {eventId:"evt-1",eventType:"checkout.session.completed",orderId:"order-1",status:"paid",email:"gift@example.test",phone:"+447700900123",shipping:null,paymentIntent:"pi_test"};
      await recordCheckoutNotification(binding, event);
      await recordCheckoutNotification(binding, event);
      assert.equal(await binding.prepare("SELECT gift_quantity FROM checkout_orders WHERE id='order-1'").first("gift_quantity"), 1);
      assert.equal(await binding.prepare("SELECT COUNT(*) AS n FROM checkout_events").first("n"), 1);
      assert.equal((await claim(request("claim", {email:"gift@example.test"}))).status, 409);
      assert.equal((await (await eligibility(request("eligibility", {}, cookie))).json()).eligible, false);
    });
  } finally { client.close(); }
});
