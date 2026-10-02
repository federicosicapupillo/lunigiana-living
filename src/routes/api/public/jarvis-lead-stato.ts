import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkFuriaKey } from "@/lib/jarvis.server";

const Body = z.object({
  lead_id: z.string().uuid(),
  azione: z.enum(["contattato", "appuntamento", "non_interessato"]),
});

const RANK = { new: 0, contacted: 1, in_progress: 2, closed: 3 } as const;
type Status = keyof typeof RANK;

export const Route = createFileRoute("/api/public/jarvis-lead-stato")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = checkFuriaKey(request);
        if (denied) return denied;
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ ok: false, errore: "dati non validi" }, { status: 400 });
        const { lead_id, azione } = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: lead } = await supabaseAdmin
          .from("leads")
          .select("status, contacted_at, appointment_at")
          .eq("id", lead_id)
          .maybeSingle();
        if (!lead) return Response.json({ ok: false, errore: "lead inesistente" }, { status: 404 });

        const now = new Date().toISOString();
        const current = lead.status as Status;
        const target: Status =
          azione === "contattato" ? "contacted" : azione === "appuntamento" ? "in_progress" : "closed";
        const update: { status?: Status; contacted_at?: string; appointment_at?: string; outcome?: string } = {};
        // Lo stato non torna mai indietro.
        if (RANK[target] > RANK[current]) update.status = target;
        if (azione === "contattato" && !lead.contacted_at) update.contacted_at = now;
        if (azione === "appuntamento" && !lead.appointment_at) update.appointment_at = now;
        if (azione === "non_interessato") update.outcome = "not_interested";

        if (Object.keys(update).length) {
          const { error } = await supabaseAdmin.from("leads").update(update).eq("id", lead_id);
          if (error) {
            console.error("[jarvis-lead-stato]", error.message);
            return Response.json({ ok: false, errore: "aggiornamento non riuscito" }, { status: 500 });
          }
        }
        return Response.json({ ok: true, stato: update.status ?? current });
      },
    },
  },
});
