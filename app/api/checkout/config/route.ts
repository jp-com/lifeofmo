import { checkoutConfig, checkoutHeaders, newOwnerCookie, ownerToken } from "../../../../lib/checkout-server";

export function GET(request: Request) {
  const config = checkoutConfig();
  return Response.json(config, { headers: { ...checkoutHeaders, ...(config.enabled && !ownerToken(request) ? { "Set-Cookie": newOwnerCookie(request) } : {}) } });
}
