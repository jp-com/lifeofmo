import { env } from "#life-of-mo-runtime";
import Stripe from "stripe";
import { z } from "zod";
import type { CheckoutConfig } from "./checkout-contract";

export const checkoutHeaders = { "Cache-Control": "no-store", "Vary": "Cookie" };
export class CheckoutError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function checkoutConfig(): CheckoutConfig {
  const mode = env.CHECKOUT_MODE;
  const keyMode = mode === "live" ? "live" : "test";
  const configured = (mode === "sandbox" || mode === "live") &&
    new RegExp(`^(rk|sk)_${keyMode}_`).test(env.STRIPE_SECRET_KEY ?? "") &&
    (env.STRIPE_PUBLISHABLE_KEY ?? "").startsWith(`pk_${keyMode}_`) &&
    (env.STRIPE_WEBHOOK_SECRET ?? "").startsWith("whsec_") && Boolean(env.DB);
  return { enabled: Boolean(configured), ...(configured ? { publishableKey: env.STRIPE_PUBLISHABLE_KEY, sandbox: mode === "sandbox" } : {}), nextBookPostage: "included" };
}
export function stripeClient() {
  if (!env.STRIPE_SECRET_KEY) throw new CheckoutError("Checkout isn’t open yet.", 503);
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-09-30.endive", httpClient: Stripe.createFetchHttpClient(), timeout: 10000, maxNetworkRetries: 1 });
}
export function checkoutDb() {
  if (!env.DB) throw new CheckoutError("Checkout is temporarily unavailable.", 503);
  return env.DB;
}
export function requireCheckout(request: Request) {
  if (!checkoutConfig().enabled) throw new CheckoutError("Checkout isn’t open yet. No payment has been taken.", 503);
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new CheckoutError("Please use the Life of Mo checkout.", 403);
}
export async function parseCheckoutBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const text = await request.text();
  if (text.length > 4096) throw new CheckoutError("Please check your order.");
  let body;
  try { body = JSON.parse(text); } catch { throw new CheckoutError("Please check your order."); }
  const result = schema.safeParse(body);
  if (!result.success) throw new CheckoutError(result.error.issues[0]?.message ?? "Please check your order.");
  return result.data;
}
const ownerCookieName = "lom_checkout_owner";
export function ownerToken(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ownerCookieName}=`))?.slice(ownerCookieName.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export function newOwnerCookie(request: Request) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${ownerCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=172800${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export async function hash(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function ownerHash(request: Request) {
  const token = ownerToken(request);
  if (!token) throw new CheckoutError("Please refresh checkout and try again.", 403);
  return hash(token);
}
export type OrderRow = { id: string; owner_hash: string; stripe_session_id: string | null; status: string; cart: string; version: number; amount: number; lock_id: string | null; lock_until: number; gift_quantity: number };
export async function ownedOrder(request: Request, id: string) {
  const order = await checkoutDb().prepare("SELECT * FROM checkout_orders WHERE id = ? AND owner_hash = ?").bind(id, await ownerHash(request)).first<OrderRow>();
  if (!order) throw new CheckoutError("We couldn’t find this checkout. Please start again.", 404);
  return order;
}
export function checkoutFailure(error: unknown) {
  if (error instanceof CheckoutError) return Response.json({ error: error.message }, { status: error.status, headers: checkoutHeaders });
  // Do not log request bodies, addresses, Stripe secrets or payment client secrets.
  console.error("Checkout operation failed", error instanceof Stripe.errors.StripeError ? error.type : "internal_error");
  return Response.json({ error: "Checkout couldn’t connect. Please try again; no new order has been confirmed." }, { status: 503, headers: checkoutHeaders });
}
