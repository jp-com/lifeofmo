"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "../../../lib/checkout";
import type { CheckoutCart } from "../../../lib/checkout-contract";
import styles from "../checkout.module.css";

type Receipt = { orderId: string; status: string; total: number; cart: CheckoutCart; giftQuantity: number };
type StatusError = { message: string; notFound: boolean };
export default function OrderStatus() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<StatusError | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let polls = 0;
    const id = new URL(location.href).searchParams.get("order");
    setError(null); setWaiting(false);
    async function check() {
      try {
        const response = await fetch(`/api/checkout/status?order=${encodeURIComponent(id ?? "")}`, { signal: abort.signal });
        const data = await response.json() as Receipt & { error?: string };
        if (abort.signal.aborted) return;
        if (!response.ok) {
          setError({ message: data.error || "We couldn’t check your order yet.", notFound: response.status === 404 });
          return;
        }
        setReceipt(data);
        if (data.status === "paid") { sessionStorage.removeItem("lom_checkout_id"); return; }
        if (["failed", "expired", "review"].includes(data.status)) return;
        polls += 1;
        if (polls < 15) timer = setTimeout(check, 2000);
        else setWaiting(true);
      } catch (failure) {
        if (!abort.signal.aborted) setError({ message: failure instanceof Error ? failure.message : "We couldn’t check your order yet.", notFound: false });
      }
    }
    check();
    return () => { abort.abort(); clearTimeout(timer); };
  }, [attempt]);
  const paid = receipt?.status === "paid";
  const ended = receipt && ["failed", "expired"].includes(receipt.status);
  const heading = paid ? "Your pre-order is confirmed."
    : error ? (error.notFound ? "We couldn’t find your order." : "We couldn’t check your pre-order.")
    : ended ? "Your pre-order wasn’t completed."
    : receipt?.status === "review" ? "Your pre-order needs a review."
    : waiting ? "Your pre-order is awaiting confirmation."
    : "Checking your pre-order…";
  return <main className={styles.receipt}>
    <p className={styles.eyebrow}>Life of Mo</p>
    <h1>{heading}</h1>
    <div aria-live="polite">
      {paid ? <>
        <p>Thank you. Your payment of <strong>{formatPrice(receipt.total)}</strong> is confirmed.</p>
        <p>Ella’s Night Flight × {receipt.cart.bookQuantity}{receipt.cart.nextBookQuantity ? ` · The next Life of Mo book × ${receipt.cart.nextBookQuantity}` : ""}</p>
        {receipt.giftQuantity ? <p>Your order includes one free colouring pencil set.</p> : null}
        <p>This is a pre-order. Dispatch dates are still to be confirmed.{receipt.cart.nextBookQuantity ? " The next book is paid in full and may ship separately at no extra delivery charge." : ""}</p>
        <p>Order reference: {receipt.orderId.slice(0, 8).toUpperCase()}</p>
      </> : error ? <p role="alert">{error.message}</p> : ended ? <p>No paid order has been confirmed. You can return to checkout to try again.</p> : <p>{receipt?.status === "review" ? "We received a payment notification and need to check the order. Please contact us with your order reference before trying again." : "We’re waiting for Stripe to confirm your payment. Please don’t pay again while it is being checked."}</p>}
      {waiting ? <p>Confirmation is taking longer than usual. Check again shortly, or contact us if you need help.</p> : null}
      {receipt && !paid ? <p>Order reference: {receipt.orderId.slice(0, 8).toUpperCase()}</p> : null}
      {error || waiting ? <button type="button" className={styles.retryPayment} onClick={() => setAttempt((value) => value + 1)}>Check again</button> : null}
    </div>
    <Link href={ended ? "/checkout" : "/"}>{ended ? "Return to checkout" : "Back to Life of Mo"}</Link>
    {!paid ? <p><Link href="/contact">Contact us about your order</Link></p> : null}
  </main>;
}
