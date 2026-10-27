import type Stripe from "stripe";
import { NEXT_BOOK_PRICE, orderTotals, shippingOptions } from "./checkout";
import type { CheckoutCart } from "./checkout-contract";

export function stripeCart(cart: CheckoutCart) {
  const totals = orderTotals(cart.bookQuantity, cart.nextBookQuantity, cart.shipping);
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
    price_data: { currency: "gbp", unit_amount: totals.bookUnitPrice, product_data: {
      name: "Ella’s Night Flight — collector’s edition",
      description: cart.bookQuantity >= 2 ? "One to keep, one to give — £18 per copy. Pre-order; dispatch date to be confirmed." : "Pre-order; dispatch date to be confirmed.",
      metadata: { sku: "ella-collectors-edition" },
    } }, quantity: cart.bookQuantity,
  }];
  if (cart.nextBookQuantity) line_items.push({ price_data: { currency: "gbp", unit_amount: NEXT_BOOK_PRICE, product_data: {
    name: "The next Life of Mo book", description: "Pre-order, paid in full now. No extra delivery charge if shipped separately. Title and release date to be announced.", metadata: { sku: "next-book-preorder" },
  } }, quantity: cart.nextBookQuantity });
  return { line_items, shipping_options: [{ shipping_rate_data: {
    type: "fixed_amount" as const, display_name: shippingOptions[cart.shipping].name,
    fixed_amount: { currency: "gbp", amount: totals.delivery },
  } }], totals };
}
