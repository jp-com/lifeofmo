import { cartSchema, sessionRequestSchema, updateRequestSchema } from "../../../../lib/checkout-contract";
import { CheckoutError, checkoutConfig, checkoutDb, checkoutFailure, checkoutHeaders, hash, ownedOrder, ownerHash, parseCheckoutBody, requireCheckout, stripeClient } from "../../../../lib/checkout-server";
import { stripeCart } from "../../../../lib/stripe-pricing";

export async function POST(request: Request) {
  try {
    requireCheckout(request);
    const { orderId, cart } = await parseCheckoutBody(request, sessionRequestSchema);
    const db = checkoutDb();
    const owner = await ownerHash(request);
    await db.prepare("INSERT OR IGNORE INTO checkout_orders (id, owner_hash, cart, amount) VALUES (?, ?, ?, ?)").bind(orderId, owner, JSON.stringify(cart), stripeCart(cart).totals.total).run();
    const order = await ownedOrder(request, orderId);
    const savedCart = cartSchema.parse(JSON.parse(order.cart));
    if (!["draft", "open"].includes(order.status)) throw new CheckoutError("This checkout has already ended. Please start a new checkout.", 409);
    const stripe = stripeClient();
    let session;
    if (order.stripe_session_id) {
      session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    } else {
      const { line_items, shipping_options } = stripeCart(savedCart);
      session = await stripe.checkout.sessions.create({
        mode: "payment", ui_mode: "elements", currency: "gbp",
        line_items, shipping_options, shipping_address_collection: { allowed_countries: ["GB"] },
        phone_number_collection: { enabled: true },
        return_url: `${new URL(request.url).origin}/checkout/complete?order=${orderId}`,
        client_reference_id: orderId, metadata: { order_id: orderId },
        payment_intent_data: { metadata: { order_id: orderId } },
        integration_identifier: "life-of-mo-woodland-xqmtvhrn",
        adaptive_pricing: { enabled: false }, allow_promotion_codes: false,
      }, { idempotencyKey: `lom-checkout-${orderId}` });
      await db.prepare("UPDATE checkout_orders SET stripe_session_id = ?, status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stripe_session_id IS NULL").bind(session.id, orderId).run();
    }
    if (session.status !== "open" || !session.client_secret) throw new CheckoutError("This checkout has ended. Please start a new checkout.", 409);
    if (session.livemode === checkoutConfig().sandbox) throw new CheckoutError("Payment is temporarily unavailable.", 503);
    return Response.json({ orderId, clientSecret: session.client_secret, version: order.version, cart: savedCart }, { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}

export async function PATCH(request: Request) {
  let release: (() => Promise<unknown>) | undefined;
  try {
    requireCheckout(request);
    const { orderId, cart, version } = await parseCheckoutBody(request, updateRequestSchema);
    const order = await ownedOrder(request, orderId);
    if (!order.stripe_session_id || order.status !== "open") throw new CheckoutError("This checkout has already ended. Please check your order status.", 409);
    const db = checkoutDb();
    const lockId = crypto.randomUUID();
    const lock = await db.prepare("UPDATE checkout_orders SET lock_id = ?, lock_until = ? WHERE id = ? AND version = ? AND status = 'open' AND lock_until < ? RETURNING id").bind(lockId, Date.now() + 45000, orderId, version, Date.now()).first();
    if (!lock) throw new CheckoutError("Your order changed in another request. Refresh checkout to continue.", 409);
    release = () => db.prepare("UPDATE checkout_orders SET lock_id = NULL, lock_until = 0 WHERE id = ? AND lock_id = ?").bind(orderId, lockId).run();
    const { line_items, shipping_options, totals } = stripeCart(cart);
    const session = await stripeClient().checkout.sessions.update(order.stripe_session_id, {
      line_items, shipping_options,
    }, { idempotencyKey: `lom-update-${orderId}-${version}-${await hash(JSON.stringify(cart))}` });
    if (session.status !== "open" || session.amount_total !== totals.total || session.currency !== "gbp") throw new CheckoutError("The payment total couldn’t be updated. Please refresh checkout.", 409);
    await db.prepare("UPDATE checkout_orders SET cart = ?, amount = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND lock_id = ?").bind(JSON.stringify(cart), totals.total, orderId, lockId).run();
    return Response.json({ version: version + 1, cart, total: totals.total }, { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
  finally { if (release) await release().catch(() => {}); }
}
