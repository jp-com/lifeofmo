import { z } from "zod";

export const giftEmail = z.string().trim().toLowerCase().email().max(254);
export const giftClaimSchema = z.object({
  email: giftEmail,
  marketingConsent: z.boolean().default(false),
  company: z.string().max(200).optional(),
});
export const giftLookupSchema = z.object({
  email: giftEmail.optional(),
  token: z.string().uuid().optional(),
});
export const GIFT_COOKIE = "lom_gift";
export const giftHeaders = { "Cache-Control": "no-store" };

export function allowedGiftOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (!origin || origin === new URL(request.url).origin) && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function giftCookieToken(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${GIFT_COOKIE}=`))?.slice(GIFT_COOKIE.length + 1);
  return z.string().uuid().safeParse(value).success ? value : undefined;
}

export function giftCookie(id: string, request: Request) {
  return `${GIFT_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
