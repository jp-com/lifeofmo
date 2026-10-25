"use client";

import { useState } from "react";
import { BookOpen, Check, CreditCard, LockKeyhole, Minus, Plus, Sparkles, Truck } from "lucide-react";
import { formatPrice, orderTotals, shippingOptions, validQuantity, type ShippingMethod } from "../../lib/checkout";
import styles from "./checkout.module.css";

function Quantity({ id, label, value, onChange }: {
  id: string;
  label: string;
  value: number;
  onChange: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const step = (amount: number) => {
    setDraft(null);
    onChange(value + amount);
  };
  return (
    <div className={styles.quantity} role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= 1} onClick={() => step(-1)}><Minus size={16} aria-hidden="true" /></button>
      <input
        id={id}
        aria-label={label}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={draft ?? value}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          if (/^\d+$/.test(raw) && validQuantity(Number(raw))) onChange(Number(raw));
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); setDraft(null); }
          if (event.key === "ArrowUp" && validQuantity(value + 1)) { event.preventDefault(); step(1); }
          if (event.key === "ArrowDown" && value > 1) { event.preventDefault(); step(-1); }
        }}
      />
      <button type="button" aria-label={`Increase ${label}`} disabled={!validQuantity(value + 1)} onClick={() => step(1)}><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}

export default function CheckoutPreview() {
  const [bookQuantity, setBookQuantity] = useState(1);
  const [nextBookQuantity, setNextBookQuantity] = useState(0);
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const totals = orderTotals(bookQuantity, nextBookQuantity, shipping);

  return (
    <div className={styles.layout}>
      <section className={styles.product} aria-labelledby="checkout-book-title">
        <p className={styles.eyebrow}>The first Life of Mo story</p>
        <h1 id="checkout-book-title">Ella’s Night Flight</h1>
        <p className={styles.intro}>A woodland adventure about finding courage,<br className={styles.desktopBreak} /> one small step at a time.</p>
        <figure className={styles.art}>
          <img src="/assets/hero-collectors-edition-v2.webp" alt="Ella’s Night Flight collector’s edition beside a woodland tree and wildflowers" width="1536" height="1024" fetchPriority="high" />
        </figure>
        <div className={styles.productLine}>
          <div><h2>Collector’s edition</h2><p>£20 per book</p></div>
          <div className={styles.quantityLabel}><label htmlFor="book-quantity">Quantity</label><Quantity id="book-quantity" label="Ella’s Night Flight quantity" value={bookQuantity} onChange={setBookQuantity} /></div>
        </div>
        <p className={styles.included}>Ella’s Night Flight, plus maze, crossword and colouring activities to enjoy together.</p>
        <ul className={styles.benefits}>
          <li><BookOpen size={18} aria-hidden="true" />Made for ages 4–8</li>
          <li><Sparkles size={18} aria-hidden="true" />A story + three activities</li>
        </ul>

        <section className={styles.nextBook} aria-labelledby="next-book-title">
          <div className={styles.offerProduct}>
            <img className={styles.offerImage} src="/assets/mo-portrait-v2.webp" alt="Mo the hedgehog" width="800" height="800" loading="lazy" />
            <div className={styles.offerCopy}>
              <p className={styles.offerEyebrow}>Pre-order offer</p>
              <h2 id="next-book-title">The next Life of Mo book</h2>
              <div className={styles.offerPrice}><strong>£15</strong><s>£20</s><span>Save £5 per copy</span></div>
            </div>
          </div>
          <label className={styles.addBook}>
            <span className={styles.selectionBox}>
              <input type="checkbox" checked={nextBookQuantity > 0} onChange={(event) => setNextBookQuantity(event.target.checked ? 1 : 0)} />
              <Check size={18} strokeWidth={3} aria-hidden="true" />
            </span>
            <span>Add the next book to my order</span>
          </label>
          {nextBookQuantity > 0 ? <div className={styles.nextQuantity}><label htmlFor="next-book-quantity">Next-book quantity</label><Quantity id="next-book-quantity" label="Next book quantity" value={nextBookQuantity} onChange={setNextBookQuantity} /></div> : null}
          <p className={styles.offerNote}>The next book may ship separately. Title and release date to be announced.</p>
        </section>

        <section className={styles.summary} aria-labelledby="summary-title">
          <h3 id="summary-title">Order summary</h3>
          <dl>
            <div><dt>Ella’s Night Flight <span>× {bookQuantity}</span></dt><dd>{formatPrice(totals.books)}</dd></div>
            {nextBookQuantity > 0 ? <div><dt>The next Life of Mo book <span>× {nextBookQuantity}</span></dt><dd>{formatPrice(totals.nextBooks)}</dd></div> : null}
            <div><dt>{shippingOptions[shipping].name} delivery</dt><dd>{formatPrice(totals.delivery)}</dd></div>
            <div className={styles.total}><dt>Total <span>GBP</span></dt><dd aria-live="polite" aria-atomic="true" data-testid="order-total">{formatPrice(totals.total)}</dd></div>
          </dl>
          {totals.savings > 0 ? <p className={styles.savings}><Check size={16} aria-hidden="true" />You’re saving {formatPrice(totals.savings)} on the next book.</p> : null}
        </section>
      </section>

      <form className={styles.order} onSubmit={(event) => event.preventDefault()} aria-label="Pre-order checkout preview">
        <div className={styles.formHeading}><h2>Your pre-order</h2><span>All prices in GBP</span></div>

        <section className={styles.formSection} aria-labelledby="contact-title">
          <div className={styles.detailsHeading}>
            <h3 id="contact-title">Contact & delivery</h3>
            <span>United Kingdom</span>
          </div>
          <div className={styles.fields}>
            <div className={styles.contactPair}>
              <label className={styles.field}>Full name<input name="name" autoComplete="shipping name" maxLength={150} /></label>
              <label className={styles.field}>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" maxLength={254} /></label>
            </div>
            <label className={styles.field}>Address<input name="address" autoComplete="shipping address-line1" maxLength={200} /></label>
            <details className={styles.addressExtra}>
              <summary><Plus size={14} aria-hidden="true" />Add a flat, suite, etc. <span>(optional)</span></summary>
              <label className={styles.field}>Flat, suite, etc.<input name="address2" autoComplete="shipping address-line2" maxLength={200} /></label>
            </details>
            <div className={styles.fieldPair}>
              <label className={styles.field}>Town or city<input name="city" autoComplete="shipping address-level2" maxLength={100} /></label>
              <label className={styles.field}>Postcode<input name="postcode" autoComplete="shipping postal-code" maxLength={12} /></label>
            </div>
            <input type="hidden" name="country" value="United Kingdom" />
          </div>
        </section>

        <fieldset className={styles.delivery}>
          <legend>Delivery</legend>
          {(Object.entries(shippingOptions) as [ShippingMethod, typeof shippingOptions[ShippingMethod]][]).map(([key, option]) => (
            <label key={key} className={`${styles.shippingOption} ${shipping === key ? styles.shippingSelected : ""}`}>
              <input type="radio" name="shipping" value={key} checked={shipping === key} onChange={() => setShipping(key)} />
              <span className={styles.shippingCopy}><strong>{option.name}</strong><span>{option.description}</span></span>
              <strong className={styles.shippingPrice}>{formatPrice(option.price)}</strong>
            </label>
          ))}
          <p className={styles.dispatchNote}><Truck size={17} aria-hidden="true" /><span>This is a pre-order. Dispatch date to be confirmed. Shipping+ priority applies once the book is ready.</span></p>
        </fieldset>



        <section className={styles.payment} aria-labelledby="payment-title">
          <h3 id="payment-title">Payment</h3>
          <div className={styles.paymentPlaceholder}>
            <CreditCard size={23} strokeWidth={1.5} aria-hidden="true" />
            <div><strong>Secure payment with Stripe</strong><p>Payment fields will appear here when checkout opens.</p></div>
            <LockKeyhole size={16} aria-hidden="true" />
          </div>
          <button type="submit" className={`button ${styles.payButton}`} disabled aria-describedby="payment-preview-note"><LockKeyhole size={17} aria-hidden="true" />Pre-order · {formatPrice(totals.total)}</button>
          <p id="payment-preview-note" className={styles.previewNote}>Design preview only. Payments aren’t enabled and no order will be placed.</p>
        </section>
      </form>
    </div>
  );
}
