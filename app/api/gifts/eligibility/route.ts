import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { checkoutOrders, giftClaims, subscribers } from "../../../../db/schema";
import { allowedGiftOrigin, giftCookie, giftCookieToken, giftHeaders, giftLookupSchema } from "../../../../lib/gifts";

export async function POST(request: Request) {
  if (!allowedGiftOrigin(request)) return Response.json({ error: "Please use the Life of Mo checkout." }, { status: 403, headers: giftHeaders });
  try {
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ eligible: false }, { status: 400, headers: giftHeaders });
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = null; }
    const parsed = giftLookupSchema.safeParse(data);
    if (!parsed.success) return Response.json({ eligible: false }, { status: 400, headers: giftHeaders });
    const { email } = parsed.data;
    const token = parsed.data.token ?? giftCookieToken(request);
    if (!email && !token) return Response.json({ eligible: false }, { headers: giftHeaders });
    const db = getDb();
    const hasPaidOrder = async (address: string) => Boolean(await db.select({ id: checkoutOrders.id }).from(checkoutOrders).where(and(eq(checkoutOrders.email, address), eq(checkoutOrders.status, "paid"))).get());
    if (email) {
      if (await hasPaidOrder(email)) return Response.json({ email, eligible: false }, { headers: giftHeaders });
      const claim = await db.select().from(giftClaims).where(eq(giftClaims.email, email)).get();
      if (claim) return Response.json({ email, eligible: !claim.redeemedAt }, { headers: giftHeaders });
      // Existing subscribers qualify too. This lookup never signs anyone up.
      const subscriber = await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.email, email)).get();
      return Response.json({ email, eligible: Boolean(subscriber) }, { headers: giftHeaders });
    }
    if (token) {
      const claim = await db.select().from(giftClaims).where(eq(giftClaims.id, token)).get();
      if (claim) return Response.json({ email: claim.email, eligible: !claim.redeemedAt && !(await hasPaidOrder(claim.email)) }, {
        headers: { ...giftHeaders, "Set-Cookie": giftCookie(claim.id, request) },
      });
    }
    return Response.json({ eligible: false }, { headers: giftHeaders });
  } catch {
    return Response.json({ error: "We couldn’t check your gift just now." }, { status: 503, headers: giftHeaders });
  }
}
