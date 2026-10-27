"use client";

import { lazy, Suspense, useEffect, useState, type RefObject } from "react";
import { CreditCard, LockKeyhole } from "lucide-react";
import { formatPrice, orderTotals } from "../../lib/checkout";
import type { CheckoutCart, CheckoutConfig } from "../../lib/checkout-contract";
import styles from "./checkout.module.css";

const StripePayment = lazy(() => import("./stripe-payment"));
export type PaymentProps = {
  cart: CheckoutCart;
  formRef: RefObject<HTMLFormElement | null>;
  submitRef: RefObject<(() => void) | null>;
  onBusy: (busy: boolean) => void;
};

export default function CheckoutPayment(props: PaymentProps & { onConfig: (config: CheckoutConfig) => void }) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { onConfig } = props;
  useEffect(() => {
    const abort = new AbortController();
    setError(false);
    fetch("/api/checkout/config", { signal: abort.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const value: CheckoutConfig = await response.json();
      setConfig(value); onConfig(value);
    }).catch(() => { if (!abort.signal.aborted) setError(true); });
    return () => abort.abort();
  }, [attempt, onConfig]);
  const placeholder = <>
    <div className={styles.paymentPlaceholder}>
      <CreditCard size={23} strokeWidth={1.5} aria-hidden="true" />
      <div><strong>Secure payment with Stripe</strong><p role="status">{error ? "Payment couldn’t load." : config && !config.enabled ? "Pre-orders aren’t open for payment yet." : "Loading secure payment…"}</p></div>
      <LockKeyhole size={16} aria-hidden="true" />
    </div>
    {error ? <button type="button" className={styles.retryPayment} onClick={() => setAttempt((value) => value + 1)}>Try again</button> : null}
    <button type="submit" className={`button ${styles.payButton}`} disabled><LockKeyhole size={17} aria-hidden="true" />Pre-order · {formatPrice(orderTotals(props.cart.bookQuantity, props.cart.nextBookQuantity, props.cart.shipping).total)}</button>
    <p className={styles.previewNote}>No payment will be taken until checkout opens.</p>
  </>;
  return <section className={styles.payment} aria-labelledby="payment-title">
    <h3 id="payment-title">Payment</h3>
    {config?.enabled && config.publishableKey ? <Suspense fallback={placeholder}><StripePayment {...props} publishableKey={config.publishableKey} sandbox={Boolean(config.sandbox)} /></Suspense> : placeholder}
  </section>;
}
