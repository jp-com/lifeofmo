"use client";

import { useRef, useState } from "react";
import { useCheckoutGift } from "../../components/use-checkout-gift";
import { BookOpen, Check, ChevronDown, Gift, Minus, Plus, Sparkles, Truck } from "lucide-react";
import { formatPrice, orderTotals, shippingOptions, validQuantity, type ShippingMethod } from "../../lib/checkout";
import type { CheckoutConfig } from "../../lib/checkout-contract";
import { normalizeCheckoutPhone, phoneError } from "../../lib/checkout-phone";
import CheckoutPayment from "./checkout-payment";
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
  const [bookDetailsOpen, setBookDetailsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<CheckoutConfig | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitPayment = useRef<(() => void) | null>(null);
  const gift = useCheckoutGift(email, setEmail);
  const totals = orderTotals(bookQuantity, nextBookQuantity, shipping);
  const totalLabel = nextBookQuantity > 0 && paymentConfig?.nextBookPostage !== "included" ? "Estimated total" : "Total";

  return (
    <div className={styles.layout}>
      <section className={styles.product} aria-labelledby="checkout-book-title" data-details-open={bookDetailsOpen} inert={paymentBusy}>
        <p className={styles.eyebrow}>The first Life of Mo story</p>
        <h1 id="checkout-book-title">Ella’s Night Flight</h1>
        <p id="checkout-book-intro" className={styles.intro}>A woodland adventure about finding courage,<br className={styles.desktopBreak} /> one small step at a time.</p>
        <figure className={styles.art}>
          <img src="/assets/hero-collectors-edition-v2.webp" alt="Ella’s Night Flight collector’s edition beside a woodland tree and wildflowers" width="1536" height="1024" fetchPriority="high" />
        </figure>
        <div className={styles.productLine}>
          <div><h2>Collector’s edition</h2><p>{formatPrice(totals.bookUnitPrice)} per book{totals.bookSavings > 0 ? <s className={styles.originalPrice}>£20</s> : null}</p></div>
          <div className={styles.quantityLabel}><label htmlFor="book-quantity">Quantity</label><Quantity id="book-quantity" label="Ella’s Night Flight quantity" value={bookQuantity} onChange={setBookQuantity} /></div>
        </div>
        <p className={styles.mobileOffer}><strong>One to keep, one to give.</strong> Buy 2+ copies for £18 each.</p>
        <button className={styles.detailsToggle} type="button" aria-expanded={bookDetailsOpen} aria-controls="checkout-book-intro checkout-book-offer checkout-book-included checkout-book-benefits" onClick={() => setBookDetailsOpen(!bookDetailsOpen)}>
          Book details &amp; offer terms <ChevronDown size={18} aria-hidden="true" />
        </button>
        <div id="checkout-book-offer" className={styles.giftOffer}>
          <Gift size={19} aria-hidden="true" />
          <div>
            <p><strong>One to keep, one to give.</strong> Buy two or more copies of Ella’s Night Flight for £18 each. Discount applied automatically.</p>
            <details className={styles.giftTerms}>
              <summary>Offer details</summary>
              <ul>
                <li>Buy two or more collector’s edition copies in the same order. Every eligible copy costs £18.</li>
                <li>One delivery address. Ella’s Night Flight copies dispatch together when released. Delivery is charged separately and shown before payment.</li>
                <li>The £18 next-book pre-order is a separate offer. It does not count towards the two-copy threshold or receive another discount.</li>
                <li>No other percentage or money-off codes apply to these discounted copies.</li>
                <li>Returned copies are refunded at the discounted price paid. The price of copies you keep will not increase. Your statutory rights are unaffected.</li>
              </ul>
            </details>
          </div>
        </div>
        <p id="checkout-book-included" className={styles.included}>Ella’s Night Flight, plus maze, crossword and colouring activities to enjoy together.</p>
        <ul id="checkout-book-benefits" className={styles.benefits}>
          <li><BookOpen size={18} aria-hidden="true" />Made for ages 4–8</li>
          <li><Sparkles size={18} aria-hidden="true" />A story + three activities</li>
        </ul>

        <section className={styles.nextBook} aria-labelledby="next-book-title">
          <div className={styles.offerProduct}>
            <img className={styles.offerImage} src="/assets/mo-portrait-v2.webp" alt="Mo the hedgehog" width="800" height="800" loading="lazy" />
            <div className={styles.offerCopy}>
              <p className={styles.offerEyebrow}>Pre-order offer</p>
              <h2 id="next-book-title">Get the next Life of Mo book early</h2>
              <div className={styles.offerPrice}><strong>£18</strong><s>£20</s><span>Save £2 per copy</span></div>
            </div>
          </div>
          <label className={styles.addBook}>
            <span className={styles.selectionBox}>
              <input type="checkbox" checked={nextBookQuantity > 0} onChange={(event) => setNextBookQuantity(event.target.checked ? 1 : 0)} />
              <Check size={18} strokeWidth={3} aria-hidden="true" />
            </span>
            <span>Add the next chapter to my order</span>
          </label>
          {nextBookQuantity > 0 ? <div className={styles.nextQuantity}><label htmlFor="next-book-quantity">Next-book quantity</label><Quantity id="next-book-quantity" label="Next book quantity" value={nextBookQuantity} onChange={setNextBookQuantity} /></div> : null}
          <p className={styles.offerNote}>The next book may ship separately. Title and release date to be announced. {paymentConfig?.nextBookPostage === "included" ? "Your delivery charge includes any separate shipment." : "Postage for a separate shipment will be confirmed before payment."}</p>
        </section>

        <section className={styles.summary} aria-labelledby="summary-title">
          <h3 id="summary-title">Order summary</h3>
          <button type="button" className={styles.summaryToggle} aria-expanded={summaryOpen} aria-controls="checkout-summary-details" onClick={() => setSummaryOpen(!summaryOpen)}>
            <span>Order summary<small>{totalLabel} · GBP</small></span>
            <strong aria-live="polite" aria-atomic="true">{formatPrice(totals.total)}</strong>
            <ChevronDown size={18} aria-hidden="true" />
          </button>
          <div id="checkout-summary-details" className={styles.summaryDetails} data-open={summaryOpen}>
          <dl>
            <div><dt>Ella’s Night Flight <span>× {bookQuantity}</span>{totals.bookSavings > 0 ? <small className={styles.appliedDiscount}>£18 each · 10% off applied</small> : null}</dt><dd>{formatPrice(totals.books)}</dd></div>
            {nextBookQuantity > 0 ? <div><dt>The next Life of Mo book <span>× {nextBookQuantity}</span></dt><dd>{formatPrice(totals.nextBooks)}</dd></div> : null}
            <div><dt>{shippingOptions[shipping].name} delivery</dt><dd>{formatPrice(totals.delivery)}</dd></div>
            {gift.eligible ? <div className={styles.giftLine}><dt><Gift size={15} aria-hidden="true" /><span>Colouring pencils <small>One set per qualifying first order · Can be combined with the book offer</small></span></dt><dd>FREE</dd></div> : null}
            <div className={styles.total}><dt>{totalLabel} <span>GBP</span></dt><dd aria-live="polite" aria-atomic="true" data-testid="order-total">{formatPrice(totals.total)}</dd></div>
          </dl>
          {totals.bookSavings > 0 ? <p className={styles.savings}><Check size={16} aria-hidden="true" />You’re saving {formatPrice(totals.bookSavings)} on Ella’s Night Flight.</p> : null}
          {totals.nextBookSavings > 0 ? <p className={styles.savings}><Check size={16} aria-hidden="true" />You’re saving {formatPrice(totals.nextBookSavings)} on the next book.</p> : null}
          </div>
        </section>
      </section>

      <form ref={formRef} className={styles.order} onSubmit={(event) => { event.preventDefault(); submitPayment.current?.(); }} aria-label="Pre-order checkout">
        <fieldset className={styles.checkoutFields} disabled={paymentBusy}>
        <div className={styles.formHeading}><h2>Your pre-order</h2><span>All prices in GBP</span></div>

        <section className={styles.formSection} aria-labelledby="contact-title">
          <div className={styles.detailsHeading}>
            <h3 id="contact-title">Contact & delivery</h3>
            <span>United Kingdom</span>
          </div>
          <div className={styles.fields}>
            <label className={styles.field}>Full name<input name="name" autoComplete="shipping name" maxLength={150} required /></label>
            <div className={styles.contactPair}>
              <label className={styles.field}>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label className={styles.field}>Phone number<input type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="07700 900123" maxLength={32} required onChange={(event) => event.currentTarget.setCustomValidity(!event.currentTarget.value || normalizeCheckoutPhone(event.currentTarget.value) ? "" : phoneError)} /></label>
            </div>
            <label className={styles.field}>Address<input name="address" autoComplete="shipping address-line1" maxLength={200} required /></label>
            {gift.error ? <p className={styles.giftCheckError} role="status">We couldn’t check your gift. <button type="button" onClick={gift.retry}>Try again</button></p> : null}
            <details className={styles.addressExtra}>
              <summary><Plus size={14} aria-hidden="true" />Add a flat, suite, etc. <span>(optional)</span></summary>
              <label className={styles.field}>Flat, suite, etc.<input name="address2" autoComplete="shipping address-line2" maxLength={200} /></label>
            </details>
            <div className={styles.fieldPair}>
              <label className={styles.field}>Town or city<input name="city" autoComplete="shipping address-level2" maxLength={100} required /></label>
              <label className={styles.field}>Postcode<input name="postcode" autoComplete="shipping postal-code" maxLength={12} required /></label>
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



        </fieldset>
        <CheckoutPayment cart={{ bookQuantity, nextBookQuantity, shipping }} formRef={formRef} submitRef={submitPayment} onBusy={setPaymentBusy} onConfig={setPaymentConfig} />
      </form>
    </div>
  );
}
