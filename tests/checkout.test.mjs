import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import ts from "typescript";
import Stripe from "stripe";

// Compile just the pure payment rules for Node, without a Worker or browser.
const compiled = new URL("../work/checkout-tests/", import.meta.url);
await mkdir(compiled, { recursive: true });
for (const file of ["checkout", "checkout-contract", "checkout-phone", "stripe-pricing", "checkout-webhook"]) {
  const source = await readFile(new URL(`../lib/${file}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace(/from (["'])(\.\/[\w-]+)\1/g, 'from "$2.mjs"');
  await writeFile(new URL(`${file}.mjs`, compiled), output);
}
const { orderTotals } = await import(new URL("checkout.mjs", compiled).href);
const { cartSchema } = await import(new URL("checkout-contract.mjs", compiled).href);
const { stripeCart } = await import(new URL("stripe-pricing.mjs", compiled).href);
const { paymentMatchesOrder, recordCheckoutNotification } = await import(new URL("checkout-webhook.mjs", compiled).href);
const { normalizeCheckoutPhone } = await import(new URL("checkout-phone.mjs", compiled).href);

test("checkout accepts UK and international phone formats and rejects incomplete numbers", () => {
  for (const input of ["07700 900123", "(07700) 900-123", "+44 7700 900123", "0044 7700 900123"]) assert.equal(normalizeCheckoutPhone(input), "+447700900123");
  assert.equal(normalizeCheckoutPhone("+1 (202) 555-0100"), "+12025550100");
  for (const input of ["", "   ", "123", "abc07700900123", "++447700900123", "+1234567890123456"]) assert.equal(normalizeCheckoutPhone(input), null);
});

test("Ella quantity 1 → 2 → 3 → 1 applies and removes the offer", () => {
  for (const [quantity, subtotal, savings, total] of [[1, 2000, 0, 2500], [2, 3600, 400, 4100], [3, 5400, 600, 5900], [1, 2000, 0, 2500]]) {
    const value = orderTotals(quantity, 0, "standard");
    assert.equal(value.books, subtotal); assert.equal(value.bookSavings, savings); assert.equal(value.total, total);
  }
});
test("next books never trigger Ella's discount; both shipping options agree with Stripe", () => {
  assert.equal(orderTotals(1, 2, "standard").bookSavings, 0);
  assert.equal(orderTotals(1, 2, "standard").total, 6100);
  for (const shipping of ["standard", "plus"]) {
    const cart = { bookQuantity: 2, nextBookQuantity: 3, shipping };
    const stripe = stripeCart(cart);
    assert.equal(stripe.line_items[0].price_data.unit_amount, 1800);
    assert.equal(stripe.line_items[1].price_data.unit_amount, 1800);
    const billed = stripe.line_items.reduce((sum, item) => sum + item.quantity * item.price_data.unit_amount, 0) + stripe.shipping_options[0].shipping_rate_data.fixed_amount.amount;
    assert.equal(billed, shipping === "plus" ? 9750 : 9500);
    assert.equal(billed, orderTotals(2, 3, shipping).total);
  }
});
test("server rejects invalid quantities, unknown shipping and injected client amounts", () => {
  const valid = { bookQuantity: 1, nextBookQuantity: 0, shipping: "standard" };
  for (const change of [{ bookQuantity: 0 }, { bookQuantity: 1.5 }, { bookQuantity: "2" }, { bookQuantity: 999999 }, { nextBookQuantity: -1 }, { shipping: "free" }, { total: 1 }, { bookUnitPrice: 1 }]) assert.equal(cartSchema.safeParse({ ...valid, ...change }).success, false);
  assert.equal(cartSchema.safeParse({ ...valid, bookQuantity: 2 }).success, true);
});
function paidSession() {
  return { payment_status: "paid", currency: "gbp", amount_total: 4100, shipping_cost: { amount_total: 500 },
    collected_information: { shipping_details: { address: { country: "GB" } } }, customer_details: { email: "buyer@example.test", phone: "+447700900123" },
    line_items: { has_more: false, data: [{ quantity: 2, currency: "gbp", amount_total: 3600, price: { unit_amount: 1800, product: { metadata: { sku: "ella-collectors-edition" } } } }] } };
}
test("paid-order verification rejects mismatched prices, products, destinations and unpaid sessions", () => {
  const cart = { bookQuantity: 2, nextBookQuantity: 0, shipping: "standard" };
  assert.equal(paymentMatchesOrder(paidSession(), cart, 4100), true);
  for (const mutate of [
    (s) => { s.payment_status = "unpaid"; }, (s) => { s.amount_total = 1; }, (s) => { s.currency = "usd"; },
    (s) => { s.line_items.data[0].quantity = 1; s.line_items.data[0].price.unit_amount = 3600; },
    (s) => { s.line_items.data[0].price.product.metadata.sku = "next-book-preorder"; },
    (s) => { s.collected_information.shipping_details.address.country = "US"; },
    (s) => { s.customer_details.phone = null; },
  ]) { const session = paidSession(); mutate(session); assert.equal(paymentMatchesOrder(session, cart, 4100), false); }
});
test("Stripe signatures reject modified or unsigned event bodies", async () => {
  const stripe = new Stripe("sk_test_fixture");
  const secret = "whsec_test_fixture";
  const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed", data: { object: {} } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal((await stripe.webhooks.constructEventAsync(payload, signature, secret)).id, "evt_test");
  await assert.rejects(stripe.webhooks.constructEventAsync(payload + " ", signature, secret));
  await assert.rejects(stripe.webhooks.constructEventAsync(payload, "", secret));
});
async function database() {
  const sqlite = new DatabaseSync(":memory:");
  const folder = new URL("../drizzle/", import.meta.url);
  for (const name of (await readdir(folder)).filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(await readFile(new URL(name, folder), "utf8"));
  const db = {
    prepare(sql) { return { sql, values: [], bind(...values) { return { sql, values }; } }; },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try { for (const query of statements) sqlite.prepare(query.sql).run(...query.values); sqlite.exec("COMMIT"); }
      catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  const order = (id) => sqlite.prepare("INSERT INTO checkout_orders (id, owner_hash, cart, amount, status) VALUES (?, 'owner', '{}', 4100, 'open')").run(id);
  return { sqlite, db, order };
}
test("duplicate and out-of-order notifications never double-redeem a gift or downgrade paid orders", async () => {
  const { sqlite, db, order } = await database();
  try {
    order("order-1"); order("order-2");
    sqlite.prepare("INSERT INTO subscribers (email, source) VALUES (?, 'test')").run("buyer@example.test");
    const event = { eventId: "evt_1", eventType: "checkout.session.completed", orderId: "order-1", status: "paid", email: "buyer@example.test", phone: "+447700900123", shipping: "{}", paymentIntent: "pi_test" };
    await recordCheckoutNotification(db, event); await recordCheckoutNotification(db, event);
    await recordCheckoutNotification(db, { ...event, eventId: "evt_2", status: "failed", eventType: "checkout.session.async_payment_failed" });
    await recordCheckoutNotification(db, { ...event, eventId: "evt_3", orderId: "order-2" });
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM gift_claims").get().count, 1);
    assert.equal(sqlite.prepare("SELECT status FROM checkout_orders WHERE id = 'order-1'").get().status, "paid");
    assert.equal(sqlite.prepare("SELECT phone FROM checkout_orders WHERE id = 'order-1'").get().phone, "+447700900123");
    assert.equal(sqlite.prepare("SELECT gift_quantity FROM checkout_orders WHERE id = 'order-1'").get().gift_quantity, 1);
    assert.equal(sqlite.prepare("SELECT gift_quantity FROM checkout_orders WHERE id = 'order-2'").get().gift_quantity, 0);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM checkout_events WHERE processed = 1").get().count, 3);
  } finally { sqlite.close(); }
});
test("unpaid asynchronous orders do not redeem gifts; failed writes roll back the event", async () => {
  const { sqlite, db, order } = await database();
  try {
    order("order-3");
    sqlite.prepare("INSERT INTO gift_claims (id, email) VALUES ('claim', 'pending@example.test')").run();
    const event = { eventId: "evt_async", eventType: "checkout.session.completed", orderId: "order-3", status: "processing", email: "pending@example.test", shipping: "{}", paymentIntent: "pi_test" };
    await recordCheckoutNotification(db, event);
    assert.equal(sqlite.prepare("SELECT redeemed_at FROM gift_claims WHERE id = 'claim'").get().redeemed_at, null);
    sqlite.exec("CREATE TRIGGER reject_payment BEFORE UPDATE ON checkout_orders WHEN NEW.status = 'paid' BEGIN SELECT RAISE(ABORT, 'test failure'); END");
    await assert.rejects(recordCheckoutNotification(db, { ...event, eventId: "evt_success", status: "paid" }));
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM checkout_events WHERE id = 'evt_success'").get().count, 0);
    assert.equal(sqlite.prepare("SELECT redeemed_at FROM gift_claims WHERE id = 'claim'").get().redeemed_at, null);
    sqlite.exec("DROP TRIGGER reject_payment");
    await recordCheckoutNotification(db, { ...event, eventId: "evt_success", status: "paid" });
    assert.equal(sqlite.prepare("SELECT gift_quantity FROM checkout_orders WHERE id = 'order-3'").get().gift_quantity, 1);
  } finally { sqlite.close(); }
});

test("claiming a gift after a paid first order does not add it to a second order", async () => {
  const { sqlite, db, order } = await database();
  try {
    order("first"); order("second");
    const event = { eventId: "evt_first", eventType: "checkout.session.completed", orderId: "first", status: "paid", email: "returning@example.test", shipping: "{}", paymentIntent: "pi_first" };
    await recordCheckoutNotification(db, event);
    sqlite.prepare("INSERT INTO gift_claims (id, email) VALUES ('late-claim', 'returning@example.test')").run();
    await recordCheckoutNotification(db, { ...event, eventId: "evt_second", orderId: "second", paymentIntent: "pi_second" });
    assert.equal(sqlite.prepare("SELECT SUM(gift_quantity) AS quantity FROM checkout_orders").get().quantity, 0);
  } finally { sqlite.close(); }
});
