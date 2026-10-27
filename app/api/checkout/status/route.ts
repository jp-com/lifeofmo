import { z } from "zod";
import { CheckoutError, checkoutFailure, checkoutHeaders, ownedOrder } from "../../../../lib/checkout-server";

export async function GET(request: Request) {
  try {
    const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get("order"));
    if (!id.success) throw new CheckoutError("We couldn’t find this order.", 404);
    const order = await ownedOrder(request, id.data);
    return Response.json({ orderId: order.id, status: order.status, total: order.amount, cart: JSON.parse(order.cart), giftQuantity: order.gift_quantity }, { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
