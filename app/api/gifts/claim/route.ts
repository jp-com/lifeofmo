import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { checkoutOrders, giftClaims, subscribers } from "../../../../db/schema";
import { allowedGiftOrigin, giftClaimSchema, giftCookie, giftHeaders } from "../../../../lib/gifts";

export async function POST(request: Request) {
  if (!allowedGiftOrigin(request)) return Response.json({ error: "Please claim your gift on the Life of Mo website." }, { status: 403, headers: giftHeaders });
  try {
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ error: "Please check your email address." }, { status: 400, headers: giftHeaders });
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = null; }
    const parsed = giftClaimSchema.safeParse(data);
    if (!parsed.success) return Response.json({ error: "Please enter a valid email address." }, { status: 400, headers: giftHeaders });
    const { email, marketingConsent, company } = parsed.data;
    if (company) return Response.json({ error: "We couldn’t save your gift. Please try again." }, { status: 400, headers: giftHeaders });
    const db = getDb();
    const previousOrder = await db.select({ id: checkoutOrders.id }).from(checkoutOrders).where(and(eq(checkoutOrders.email, email), eq(checkoutOrders.status, "paid"))).get();
    if (previousOrder) return Response.json({ error: "This gift is available with your first order only." }, { status: 409, headers: giftHeaders });
    const claim = db.insert(giftClaims).values({ id: crypto.randomUUID(), email }).onConflictDoNothing({ target: giftClaims.email });
    if (marketingConsent) {
      await db.batch([claim, db.insert(subscribers).values({ email, source: "mo-gift", consentVersion: "mo-gift-book-news-v1" }).onConflictDoNothing({ target: subscribers.email })]);
    } else { await claim; }
    const saved = await db.select().from(giftClaims).where(eq(giftClaims.email, email)).get();
    if (!saved) throw new Error("Gift was not saved");
    if (saved.redeemedAt) return Response.json({ error: "This first-order gift has already been used with this email." }, { status: 409, headers: giftHeaders });
    return Response.json({ ok: true, claimPath: `/checkout?gift=${saved.id}`, emailDelivery: "not-configured" }, {
      headers: { ...giftHeaders, "Set-Cookie": giftCookie(saved.id, request) },
    });
  } catch {
    return Response.json({ error: "We couldn’t save your gift just now. Please try again in a moment." }, { status: 503, headers: giftHeaders });
  }
}
