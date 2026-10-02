import { createFileRoute } from "@tanstack/react-router";
import { CLICK_EVENTS, channelOf, checkFuriaKey, isTestTraffic } from "@/lib/jarvis.server";

const DAY = 86_400_000;
const CONTACT_CLICKS = new Set<string>(CLICK_EVENTS);
const WA_PHONE = new Set<string>([
  "property_detail_whatsapp_click",
  "whatsapp_click",
  "contact_whatsapp_fallback_click",
  "phone_click",
]);

type Ev = {
  session_id: string;
  event_name: string;
  created_at: string;
  property_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
};
type Lead = {
  id: string;
  created_at: string;
  status: string;
  contacted_at: string | null;
  appointment_at: string | null;
  property_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
};

function period(events: Ev[], leads: Lead[], since: number) {
  const ev = events.filter((e) => Date.parse(e.created_at) >= since);
  const ld = leads.filter((l) => Date.parse(l.created_at) >= since);
  const per: Record<string, { sessioni: Set<string>; visite_schede: number; nuovi_lead: number; clic_contatto: number }> = {};
  const bucket = (c: string) => (per[c] ??= { sessioni: new Set(), visite_schede: 0, nuovi_lead: 0, clic_contatto: 0 });
  const sessions = new Set<string>();
  let visite = 0;
  let clic = 0;
  for (const e of ev) {
    const b = bucket(channelOf(e.utm_source, e.utm_medium));
    sessions.add(e.session_id);
    b.sessioni.add(e.session_id);
    if (e.event_name === "property_detail_view") { visite++; b.visite_schede++; }
    if (WA_PHONE.has(e.event_name)) { clic++; b.clic_contatto++; }
  }
  for (const l of ld) bucket(channelOf(l.utm_source, l.utm_medium)).nuovi_lead++;
  return {
    sessioni: sessions.size,
    visite_schede: visite,
    nuovi_lead: ld.length,
    clic_whatsapp_telefono: clic,
    per_canale: Object.fromEntries(
      Object.entries(per).map(([k, v]) => [k, { ...v, sessioni: v.sessioni.size }]),
    ),
  };
}

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const out: T[] = [];
  for (let from = 0; from < 50_000; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export const Route = createFileRoute("/api/public/jarvis-furia-kpi")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = checkFuriaKey(request);
        if (denied) return denied;
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const now = Date.now();
        const since30 = new Date(now - 30 * DAY).toISOString();

        try {
          const [eventsRaw, leadsRaw, allLeads] = await Promise.all([
            fetchAll<Ev>((a, b) =>
              db.from("site_events")
                .select("session_id, event_name, created_at, property_id, utm_source, utm_medium")
                .gte("created_at", since30).order("created_at").range(a, b),
            ),
            fetchAll<Lead>((a, b) =>
              db.from("leads")
                .select("id, created_at, status, contacted_at, appointment_at, property_id, utm_source, utm_medium")
                .gte("created_at", since30).order("created_at").range(a, b),
            ),
            fetchAll<Pick<Lead, "status" | "contacted_at" | "appointment_at" | "utm_source" | "utm_medium">>((a, b) =>
              db.from("leads").select("status, contacted_at, appointment_at, utm_source, utm_medium").range(a, b),
            ),
          ]);
          const events = eventsRaw.filter((e) => !isTestTraffic(e.utm_source, e.utm_medium));
          const leads = leadsRaw.filter((l) => !isTestTraffic(l.utm_source, l.utm_medium));

          const propIds = new Set<string>();
          events.forEach((e) => e.property_id && propIds.add(e.property_id));
          leads.forEach((l) => l.property_id && propIds.add(l.property_id));
          const refs: Record<string, { codice: string | null; titolo: string }> = {};
          if (propIds.size) {
            const { data } = await db.from("properties").select("id, reference_code, title").in("id", [...propIds]);
            data?.forEach((p) => (refs[p.id] = { codice: p.reference_code, titolo: p.title }));
          }

          const da_ricontattare = leads
            .filter((l) => !l.contacted_at && now - Date.parse(l.created_at) > DAY)
            .map((l) => ({
              lead_id: l.id,
              quando: l.created_at,
              immobile_codice: l.property_id ? refs[l.property_id]?.codice ?? null : null,
              ore_trascorse: Math.floor((now - Date.parse(l.created_at)) / 3_600_000),
            }));

          const perProp: Record<string, { visite: Set<string>; contatti: Set<string>; condivisioni: number }> = {};
          const pb = (id: string) => (perProp[id] ??= { visite: new Set(), contatti: new Set(), condivisioni: 0 });
          for (const e of events) {
            if (!e.property_id) continue;
            if (e.event_name === "property_detail_view") pb(e.property_id).visite.add(e.session_id);
            else if (CONTACT_CLICKS.has(e.event_name)) pb(e.property_id).contatti.add(e.session_id);
            else if (e.event_name === "property_share") pb(e.property_id).condivisioni++;
          }
          for (const l of leads) if (l.property_id) pb(l.property_id).contatti.add(`lead:${l.id}`);
          const immobili = Object.entries(perProp)
            .map(([id, v]) => ({
              immobile_codice: refs[id]?.codice ?? null,
              immobile_titolo: refs[id]?.titolo ?? null,
              visite: v.visite.size,
              contatti: v.contatti.size,
              condivisioni: v.condivisioni,
            }))
            .sort((a, b) => b.visite - a.visite)
            .slice(0, 10);

          const crmLeads = allLeads.filter((l) => !isTestTraffic(l.utm_source, l.utm_medium));
          const per_status: Record<string, number> = {};
          crmLeads.forEach((l) => (per_status[l.status] = (per_status[l.status] ?? 0) + 1));

          return Response.json(
            {
              generato_il: new Date(now).toISOString(),
              contatti_da_ricontattare: da_ricontattare,
              settimana: period(events, leads, now - 7 * DAY),
              mese: period(events, leads, now - 30 * DAY),
              immobili,
              stato_crm: {
                per_status,
                contattati: crmLeads.filter((l) => l.contacted_at).length,
                con_appuntamento: crmLeads.filter((l) => l.appointment_at).length,
              },
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        } catch (e) {
          console.error("[jarvis-furia-kpi]", e);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
