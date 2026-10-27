// Shared display rules. Payment routes recalculate these prices on the server.
export const BOOK_PRICE = 2000;
export const MULTI_BOOK_PRICE = 1800;
export const MULTI_BOOK_MINIMUM = 2;
export const NEXT_BOOK_PRICE = 1800;
export const NEXT_BOOK_REGULAR_PRICE = 2000;
export const shippingOptions = {
  standard: {
    name: "Standard",
    price: 500,
    description: "Tracked delivery",
  },
  plus: {
    name: "Shipping+",
    price: 750,
    description:
      "Priority dispatch, faster delivery and prepaid UK change-of-mind returns",
  },
} as const;
export type ShippingMethod = keyof typeof shippingOptions;

export function validQuantity(quantity: number, minimum = 1) {
  return Number.isSafeInteger(quantity) && quantity >= minimum && quantity <= 999999;
}

export function orderTotals(bookQuantity: number, nextBookQuantity: number, shipping: ShippingMethod) {
  if (!validQuantity(bookQuantity) || !validQuantity(nextBookQuantity, 0) || !Object.hasOwn(shippingOptions, shipping)) {
    throw new Error("Choose a whole number of books.");
  }
  const bookUnitPrice = bookQuantity >= MULTI_BOOK_MINIMUM ? MULTI_BOOK_PRICE : BOOK_PRICE;
  const books = bookQuantity * bookUnitPrice;
  const nextBooks = nextBookQuantity * NEXT_BOOK_PRICE;
  const delivery = shippingOptions[shipping].price;
  const bookSavings = bookQuantity * (BOOK_PRICE - bookUnitPrice);
  const nextBookSavings = nextBookQuantity * (NEXT_BOOK_REGULAR_PRICE - NEXT_BOOK_PRICE);
  return {
    bookUnitPrice,
    books,
    nextBooks,
    delivery,
    total: books + nextBooks + delivery,
    bookSavings,
    nextBookSavings,
    savings: bookSavings + nextBookSavings,
  };
}

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
export const formatPrice = (pence: number) => pounds.format(pence / 100);
