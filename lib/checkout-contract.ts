import { z } from "zod";
import { orderTotals, validQuantity } from "./checkout";

export const cartSchema = z.object({
  bookQuantity: z.number().int().min(1).max(999999),
  nextBookQuantity: z.number().int().min(0).max(999999),
  shipping: z.enum(["standard", "plus"]),
}).strict().refine((cart) => validQuantity(cart.bookQuantity) && validQuantity(cart.nextBookQuantity, 0) && orderTotals(cart.bookQuantity, cart.nextBookQuantity, cart.shipping).total <= 99_999_999, "This order is too large for online checkout. Please contact us.");
export type CheckoutCart = z.infer<typeof cartSchema>;
export type CheckoutSession = {
  orderId: string;
  clientSecret: string;
  version: number;
  cart: CheckoutCart;
};
export type CheckoutConfig = { enabled: boolean; publishableKey?: string; sandbox?: boolean; nextBookPostage: "pending" | "included" };
export const cartKey = (cart: CheckoutCart) => `${cart.bookQuantity}:${cart.nextBookQuantity}:${cart.shipping}`;
export const sessionRequestSchema = z.object({ orderId: z.string().uuid(), cart: cartSchema }).strict();
export const updateRequestSchema = sessionRequestSchema.extend({ version: z.number().int().nonnegative() });
