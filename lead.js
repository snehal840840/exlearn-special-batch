// Cloudflare Pages Function: receives a lead from the landing page and forwards it to NeoDove CRM.
// Set NEODOVE_URL in Cloudflare: Settings -> Variables and Secrets (type: Secret).
export async function onRequestPost({ request, env }) {
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
  let d;
  try { d = await request.json(); } catch (e) { return json({ ok: false, error: "bad request" }, 400); }
  if (d.website) return json({ ok: true });                 // spam trap
  const name = String(d.name || "").trim().slice(0, 100);
  const mobile = String(d.phone || "").replace(/\D/g, "").slice(-10);
  const email = String(d.email || "").trim().slice(0, 150);
  if (!name || mobile.length < 10) return json({ ok: false, error: "invalid" }, 400);
  if (!env.NEODOVE_URL) return json({ ok: false, error: "not configured" }, 500);

  const body = {
    name, mobile, email,
    source: String(d.source || "").slice(0, 60),
    course: String(d.course || "").slice(0, 100),
    mode: String(d.mode || "").slice(0, 40),
    experience: String(d.experience || "").slice(0, 60),
    message: String(d.message || "").slice(0, 500),
  };
  const r = await fetch(env.NEODOVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.ok ? json({ ok: true }) : json({ ok: false, error: "crm " + r.status }, 502);
}
