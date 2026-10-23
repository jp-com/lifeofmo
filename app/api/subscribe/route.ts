import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { error: "Please submit the form from the Life of Mo website." },
      { status: 403, headers },
    );
  try {
    const raw = await request.text();
    if (raw.length > 2048)
      return Response.json(
        { error: "Please check your email address." },
        { status: 400, headers },
      );
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return Response.json(
        { error: "Please try the form again." },
        { status: 400, headers },
      );
    }
    if (!payload || typeof payload !== "object")
      return Response.json(
        { error: "Please check your email address." },
        { status: 400, headers },
      );
    if (payload.company) return Response.json({ ok: true }, { headers });
    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const source = ["footer", "preorder", "bookseller"].includes(payload.source)
      ? payload.source
      : "footer";
    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      payload.consent !== true
    )
      return Response.json(
        {
          error:
            "Please enter a valid email address and agree to receive updates.",
        },
        { status: 400, headers },
      );
    await getDb()
      .insert(subscribers)
      .values({ email, source })
      .onConflictDoNothing({ target: subscribers.email });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json(
      {
        error:
          "We couldn’t save your email just now. Please try again in a moment.",
      },
      { status: 503, headers },
    );
  }
}
