import type { NextRequest } from "next/server";

// Stores a quiz subscriber + their routine in Supabase via the REST API (no SDK
// dependency). Insert uses the service-role key, so it must stay server-side.
// Email SENDING is not wired yet — that needs a verified domain + provider
// (Resend). For now we capture the lead; sending is a drop-in follow-up.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Pretend success, store nothing.
  if (body?.hp) return Response.json({ ok: true });

  const email = String(body?.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json(
      { error: "Email signup isn't configured yet. Check back soon!" },
      { status: 503 }
    );
  }

  const p = body?.profile || {};
  const resp = await fetch(`${url}/rest/v1/subscribers?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      email,
      skin_type: p.skinType ?? null,
      concern: p.concern ?? null,
      sensitive: p.sensitive ?? null,
      budget: p.budget ?? null,
      routine: body?.routine ?? null,
      source: "quiz",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[subscribe] supabase error:", resp.status, text);
    return Response.json({ error: "Couldn't save right now. Try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
