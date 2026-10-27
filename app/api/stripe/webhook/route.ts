import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { cartSchema } from "../../../../lib/checkout-contract";
import { checkoutDb, type OrderRow, stripeClient } from "../../../../lib/checkout-server";
import { paymentMatchesOrder, recordCheckoutNotification } from "../../../../lib/checkout-webhook";

const accepted = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"]);

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) return new Response("Webhook is not configured", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const raw = await request.text();
  if (raw.length > 1_000_000) return new Response("Payload too large", { status: 413 });
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, env.STRIPE_WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider());
  } catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.livemode !== /^(rk|sk)_live_/.test(env.STRIPE_SECRET_KEY)) return new Response("Wrong payment environment", { status: 400 });
  if (!accepted.has(event.type)) return Response.json({ received: true });
  try {
    const snapshot = event.data.object as Stripe.Checkout.Session;
    const id = snapshot.metadata?.order_id;
    if (!id) return Response.json({ received: true });
    const db = checkoutDb();
    const order = await db.prepare("SELECT * FROM checkout_orders WHERE id = ? AND stripe_session_id = ?").bind(id, snapshot.id).first<OrderRow>();
    if (!order) return new Response("Order not ready", { status: 503 });
    if (order.lock_until >= Date.now()) return new Response("Order update in progress", { status: 503 });
    const existing = await db.prepare("SELECT processed FROM checkout_events WHERE id = ?").bind(event.id).first<{ processed: number }>();
    if (existing?.processed) return Response.json({ received: true });
    // Retrieve current state: delayed or out-of-order events cannot undo payment.
    const session = await stripe.checkout.sessions.retrieve(snapshot.id, { expand: ["line_items.data.price.product"] });
    const cart = cartSchema.parse(JSON.parse(order.cart));
    const paid = session.payment_status === "paid";
    const status = paid ? paymentMatchesOrder(session, cart, order.amount) ? "paid" : "review"
      : session.status === "expired" ? "expired"
      : event.type === "checkout.session.async_payment_failed" ? "failed" : "processing";
    await recordCheckoutNotification(db, {
      eventId: event.id, eventType: event.type, orderId: id, status,
      email: session.customer_details?.email?.trim().toLowerCase() ?? null,
      phone: session.customer_details?.phone?.trim() || null,
      shipping: session.collected_information?.shipping_details ? JSON.stringify(session.collected_information.shipping_details) : null,
      paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    });
    if (status === "review") console.error("Paid checkout requires manual review", id);
    return Response.json({ received: true });
  } catch { console.error("Stripe notification could not be recorded", event.id); return new Response("Please retry", { status: 503 }); }
}
