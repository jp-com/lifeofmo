import { z } from "zod";
import { getDb } from "../../../db";
import { contactMessages } from "../../../db/schema";
import { booksellerErrors, booksellerSchema } from "../../../lib/booksellers";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Please send your enquiry from the Life of Mo website." }, { status: 403, headers });
  }
  try {
    const raw = await request.text();
    if (raw.length > 16000) {
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
    const result = booksellerSchema.safeParse(payload);
    if (!result.success) {
      return Response.json({ error: "Please check the highlighted fields.", fields: booksellerErrors(result.error) }, { status: 400, headers });
    }
    const id = z.string().uuid().safeParse(payload.requestId);
    if (!id.success) return Response.json({ error: "Please refresh the page and try again." }, { status: 400, headers });
    const { name, email, bookshop, location, message } = result.data;
    await getDb().insert(contactMessages).values({
      id: id.data,
      name,
      email,
      topic: "Bookshops",
      message: `Bookshop: ${bookshop}\nLocation: ${location}\n\n${message}`,
    }).onConflictDoNothing({ target: contactMessages.id });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ error: "Your enquiry couldn’t be saved just now. Please try again in a moment." }, { status: 503, headers });
  }
}
