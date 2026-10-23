import { z } from "zod";
import { getDb } from "../../../db";
import { contactMessages } from "../../../db/schema";
import { contactSchema, contactErrors } from "../../../lib/contact";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Please send your message from the Life of Mo website." }, { status: 403, headers });
  }
  try {
    const raw = await request.text();
    if (raw.length > 12000) {
      return Response.json({ error: "Please keep your message under 5,000 characters." }, { status: 400, headers });
    }
    let payload;
    try { payload = JSON.parse(raw); } catch {
      return Response.json({ error: "Please check the form and try again." }, { status: 400, headers });
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return Response.json({ error: "Please check the form and try again." }, { status: 400, headers });
    }
    if (payload.website) return Response.json({ ok: true }, { headers });
    const result = contactSchema.safeParse(payload);
    if (!result.success) {
      return Response.json({ error: "Please check the highlighted fields.", fields: contactErrors(result.error) }, { status: 400, headers });
    }
    const id = z.string().uuid().safeParse(payload.requestId);
    if (!id.success) return Response.json({ error: "Please refresh the page and try again." }, { status: 400, headers });
    await getDb().insert(contactMessages).values({ id: id.data, ...result.data }).onConflictDoNothing({ target: contactMessages.id });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ error: "Your message couldn’t be saved just now. Please try again in a moment." }, { status: 503, headers });
  }
}
