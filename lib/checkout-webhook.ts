import type Stripe from "stripe";
import { NEXT_BOOK_PRICE, orderTotals } from "./checkout";
import type { CheckoutCart } from "./checkout-contract";

// Check the actual Stripe line items, including edits made through Stripe.js.
// An equal total alone does not prove the expected books were purchased.
export function paymentMatchesOrder(session: Stripe.Checkout.Session, cart: CheckoutCart, amount: number) {
  const totals = orderTotals(cart.bookQuantity, cart.nextBookQuantity, cart.shipping);
  const items = session.line_items;
  if (session.payment_status !== "paid" || session.currency !== "gbp" || session.amount_total !== amount || amount !== totals.total || session.shipping_cost?.amount_total !== totals.delivery || !items || items.has_more || items.data.length !== (cart.nextBookQuantity ? 2 : 1)) return false;
  const expected = new Map([
    ["ella-collectors-edition", { quantity: cart.bookQuantity, price: totals.bookUnitPrice }],
    ...(cart.nextBookQuantity ? [["next-book-preorder", { quantity: cart.nextBookQuantity, price: NEXT_BOOK_PRICE }] as const] : []),
  ]);
  for (const item of items.data) {
    const product = item.price?.product;
    if (!product || typeof product === "string" || product.deleted) return false;
    const sku = product.metadata.sku;
    const wanted = expected.get(sku);
    if (!wanted || item.quantity !== wanted.quantity || item.price?.unit_amount !== wanted.price || item.currency !== "gbp" || item.amount_total !== wanted.price * wanted.quantity) return false;
    expected.delete(sku);
  }
  return expected.size === 0 && session.collected_information?.shipping_details?.address?.country === "GB" && Boolean(session.customer_details?.email) && Boolean(session.customer_details?.phone?.trim());
}

type Notification = { eventId: string; eventType: string; orderId: string; status: "paid" | "processing" | "failed" | "expired" | "review"; email: string | null; phone: string | null; shipping: string | null; paymentIntent: string | null };

// D1 batches are transactions. The event guard and gift redemption run in the
// same transaction as the paid-order record, including concurrent deliveries.
export async function recordCheckoutNotification(db: D1Database, notification: Notification) {
  const n = notification;
  const pending = "EXISTS (SELECT 1 FROM checkout_events WHERE id = ? AND processed = 0)";
  const statements = [db.prepare("INSERT OR IGNORE INTO checkout_events (id, order_id, type) VALUES (?, ?, ?)").bind(n.eventId, n.orderId, n.eventType)];
  if (n.status === "paid" && n.email) {
    statements.push(
      db.prepare(`INSERT OR IGNORE INTO gift_claims (id, email) SELECT ?, ? WHERE ${pending} AND EXISTS (SELECT 1 FROM subscribers WHERE email = ?) AND NOT EXISTS (SELECT 1 FROM checkout_orders WHERE email = ? AND status = 'paid' AND id <> ?)`)
        .bind(crypto.randomUUID(), n.email, n.eventId, n.email, n.email, n.orderId),
      db.prepare(`UPDATE gift_claims SET redeemed_at = CURRENT_TIMESTAMP, redeemed_order_id = ? WHERE email = ? AND redeemed_at IS NULL AND ${pending} AND NOT EXISTS (SELECT 1 FROM checkout_orders WHERE email = ? AND status = 'paid' AND id <> ?)`)
        .bind(n.orderId, n.email, n.eventId, n.email, n.orderId),
      db.prepare(`UPDATE checkout_orders SET status = 'paid', email = ?, phone = ?, shipping_details = ?, payment_intent_id = ?, gift_quantity = (SELECT COUNT(*) FROM gift_claims WHERE redeemed_order_id = ?), paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status <> 'paid' AND ${pending}`)
        .bind(n.email, n.phone ?? null, n.shipping, n.paymentIntent, n.orderId, n.orderId, n.eventId),
    );
  } else {
    statements.push(db.prepare(`UPDATE checkout_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status NOT IN ('paid', 'review') AND ${pending}`).bind(n.status, n.orderId, n.eventId));
  }
  statements.push(db.prepare("UPDATE checkout_events SET processed = 1 WHERE id = ?").bind(n.eventId));
  await db.batch(statements);
}
