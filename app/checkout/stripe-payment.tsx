"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { LockKeyhole } from "lucide-react";
import { cartKey, cartSchema, type CheckoutSession } from "../../lib/checkout-contract";
import { formatPrice, orderTotals } from "../../lib/checkout";
import { normalizeCheckoutPhone, phoneError } from "../../lib/checkout-phone";
import type { PaymentProps } from "./checkout-payment";
import styles from "./checkout.module.css";

const stripeInstances = new Map<string, Promise<Stripe | null>>();
function getStripe(key: string) {
  if (!stripeInstances.has(key)) stripeInstances.set(key, loadStripe(key));
  return stripeInstances.get(key)!;
}
async function api<T>(method: string, body: unknown): Promise<T> {
  const response = await fetch("/api/checkout/session", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Payment couldn’t connect. Please try again.");
  return data;
}
const storageKey = "lom_checkout_id";
function orderId() {
  const saved = sessionStorage.getItem(storageKey);
  if (saved && /^[a-f0-9-]{36}$/.test(saved)) return saved;
  const id = crypto.randomUUID(); sessionStorage.setItem(storageKey, id); return id;
}

export default function StripePayment(props: PaymentProps & { publishableKey: string; sandbox: boolean }) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const cart = useRef(props.cart);
  cart.current = props.cart;
  useEffect(() => {
    let active = true;
    setError("");
    getStripe(props.publishableKey);
    const id = orderId();
    setActiveOrderId(id);
    api<CheckoutSession>("POST", { orderId: id, cart: cart.current }).then((value) => { if (active) setSession(value); }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [props.publishableKey, attempt]);
  if (!session) return <>
    <p role={error ? "alert" : "status"} className={error ? styles.paymentError : styles.previewNote}>{error || "Loading secure payment…"}</p>
    {error ? <div className={styles.paymentActions}>
      <button type="button" className={styles.retryPayment} onClick={() => setAttempt((value) => value + 1)}>Try again</button>
      {activeOrderId ? <a className={styles.retryPayment} href={`/checkout/complete?order=${activeOrderId}`}>Check this order’s status</a> : null}
      <button type="button" className={styles.retryPayment} onClick={() => { sessionStorage.removeItem(storageKey); setAttempt((value) => value + 1); }}>Start a new checkout</button>
    </div> : null}
    <button type="submit" className={`button ${styles.payButton}`} disabled>Pre-order · {formatPrice(orderTotals(props.cart.bookQuantity, props.cart.nextBookQuantity, props.cart.shipping).total)}</button>
  </>;
  return <CheckoutElementsProvider stripe={getStripe(props.publishableKey)} options={{ clientSecret: session.clientSecret, elementsOptions: { appearance: { theme: "stripe", variables: { colorPrimary: "#654a32", colorBackground: "#fffefa", colorText: "#352d25", colorDanger: "#8a3228", fontFamily: "system-ui, sans-serif", fontSizeBase: "16px", borderRadius: "5px", spacingUnit: "4px" } } } }}>
    <PaymentFields {...props} session={session} />
  </CheckoutElementsProvider>;
}

function PaymentFields({ cart, formRef, submitRef, onBusy, sandbox, session }: PaymentProps & { sandbox: boolean; session: CheckoutSession }) {
  const state = useCheckoutElements();
  const current = useRef(state);
  current.current = state;
  const desired = useRef(cart);
  desired.current = cart;
  const version = useRef(session.version);
  const synchronized = useRef(cartKey(session.cart));
  const queue = useRef<Promise<void>>(Promise.resolve());
  const confirming = useRef(false);
  const [syncedKey, setSyncedKey] = useState(synchronized.current);
  const [working, setWorking] = useState(false);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const sync = useCallback((force = false) => {
    const task = queue.current.catch(() => {}).then(async () => {
      const checkout = current.current;
      if (checkout.type !== "success") throw new Error("Payment is still loading. Please try again.");
      const target = cartSchema.parse(desired.current);
      if (!force && synchronized.current === cartKey(target)) return;
      setWorking(true);
      try {
        const result = await checkout.checkout.runServerUpdate(async () => {
          const update = await api<{ version: number }>("PATCH", { orderId: session.orderId, cart: target, version: version.current });
          version.current = update.version;
        });
        if (result.type === "error") throw new Error(result.error.message);
        if (result.session.currency !== "gbp" || result.session.total.total.minorUnitsAmount !== orderTotals(target.bookQuantity, target.nextBookQuantity, target.shipping).total) throw new Error("The payment total has changed. Refresh checkout before paying.");
        synchronized.current = cartKey(target);
        setSyncedKey(synchronized.current);
        setError("");
      } finally { setWorking(false); }
    });
    queue.current = task;
    return task;
  }, [session.orderId]);
  const wantedKey = cartKey(cart);
  const loaded = state.type === "success";
  useEffect(() => {
    if (!loaded || confirming.current) return;
    const timer = setTimeout(() => { sync().catch((failure) => setError(failure.message)); }, 200);
    return () => clearTimeout(timer);
  }, [wantedKey, loaded, sync]);
  useEffect(() => {
    submitRef.current = async () => {
      if (confirming.current || !ready || !formRef.current?.reportValidity()) return;
      const checkout = current.current;
      if (checkout.type !== "success") return;
      confirming.current = true; setPaying(true); onBusy(true); setError("");
      try {
        const data = new FormData(formRef.current);
        const field = (key: string) => String(data.get(key) ?? "").trim();
        if (!["name", "email", "phone", "address", "city", "postcode"].every((name) => field(name))) throw new Error("Please complete your contact and delivery details.");
        const phoneNumber = normalizeCheckoutPhone(field("phone"));
        if (!phoneNumber) throw new Error(phoneError);
        await sync(true);
        const returnUrl = `${location.origin}/checkout/complete?order=${session.orderId}`;
        const result = await checkout.checkout.confirm({
          phoneNumber,
          email: field("email"), shippingAddress: { name: field("name"), address: { line1: field("address"), line2: field("address2"), city: field("city"), postal_code: field("postcode"), country: "GB" } },
          returnUrl, redirect: "if_required",
        });
        if (result.type === "error") throw new Error(result.error.message);
        location.assign(returnUrl);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Payment couldn’t complete. Please try again.");
        confirming.current = false; setPaying(false); onBusy(false);
      }
    };
    return () => { submitRef.current = null; };
  }, [formRef, submitRef, onBusy, ready, session.orderId, sync]);
  const total = orderTotals(cart.bookQuantity, cart.nextBookQuantity, cart.shipping).total;
  return <>
    {sandbox ? <p className={styles.sandboxNote}>Test checkout — no real payment will be taken.</p> : null}
    {state.type === "error" ? <p className={styles.paymentError} role="alert">{state.error.message}</p> : <PaymentElement options={{ layout: "accordion" }} onReady={() => setReady(true)} onLoadError={() => setError("Payment fields couldn’t load. Please refresh checkout.")} />}
    {error ? <p className={styles.paymentError} role="alert">{error} <button type="button" disabled={paying || working} onClick={() => sync(true).catch((failure) => setError(failure.message))}>Try again</button></p> : null}
    <button type="submit" className={`button ${styles.payButton}`} disabled={!loaded || !ready || working || paying || syncedKey !== wantedKey || !cartSchema.safeParse(cart).success}><LockKeyhole size={17} aria-hidden="true" />{paying ? "Confirming your pre-order…" : working || syncedKey !== wantedKey ? "Updating your total…" : `Pre-order · ${formatPrice(total)}`}</button>
    <p className={styles.previewNote}>Payment processed securely by Stripe. Your pre-order is charged now.</p>
  </>;
}
