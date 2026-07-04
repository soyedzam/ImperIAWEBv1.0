// ImperIA CX — intake de leads (Performance Score + formularios) -> D1 + CX (GoHighLevel)
const T = (v, n) => (typeof v === "string" ? v.slice(0, n) : (v == null ? null : String(v).slice(0, n)));
const N = (v) => { const x = Number(v); return Number.isFinite(x) ? x : null; };
const B = (v) => (v === true || v === "true" || v === 1 || v === "1" || v === "on") ? 1 : 0;

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json" } });
  let d;
  try { d = await request.json(); } catch (e) { return json({ ok: false, error: "bad json" }, 400); }
  const origin = request.headers.get("Origin");
  if (origin) { try { if (new URL(origin).hostname !== new URL(request.url).hostname) return json({ ok: false }, 403); } catch (e) {} }
  if (d.website) return json({ ok: true });               // honeypot
  if (!d.email && !d.whatsapp) return json({ ok: false, error: "missing contact" }, 422);
  try {
    await env.DB.prepare(
      "INSERT INTO leads (ts,evento,formulario,modo,nombre,whatsapp,email,empresa,arquetipo,giro,score,banda,tier_sugerido,perdida_mes,proyeccion_mes,brecha,contacto_ok,senal_ok,respuestas,pagina,url,referente,query,idioma,user_agent) " +
      "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(
      new Date().toISOString(), T(d.evento, 60), T(d.formulario, 60), T(d.modo, 20),
      T(d.nombre, 120), T(d.whatsapp, 40), T(d.email, 160), T(d.empresa, 160),
      T(d.arquetipo, 80), T(d.giro, 40),
      N(d.score), T(d.banda, 40), T(d.tier_sugerido, 60),
      N(d.perdida_mes), N(d.proyeccion_mes), N(d.brecha),
      B(d.contacto_ok), B(d.senal_ok),
      T(JSON.stringify(d.respuestas || {}), 4000),
      T(d.pagina, 160), T(d.url, 300), T(d.referente, 300), T(d.query, 300),
      T(d.idioma, 10), T(request.headers.get("user-agent"), 300)
    ).run();
  } catch (e) { return json({ ok: false, error: "db" }, 500); }
  if (env.CX_WEBHOOK) {
    context.waitUntil(fetch(env.CX_WEBHOOK, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
    }).catch(() => {}));
  }
  return json({ ok: true });
}
