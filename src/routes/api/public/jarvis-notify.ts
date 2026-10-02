import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildPayload, sendToN8n, verifyInternalKey } from "@/lib/jarvis.server";

const Body = z.object({ tipo: z.enum(["lead", "clic"]), id: z.string().uuid() });

// Chiamato solo dai trigger del database (pg_net) dopo il salvataggio.
export const Route = createFileRoute("/api/public/jarvis-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await verifyInternalKey(request.headers.get("x-jarvis-internal")))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        try {
          const payload = await buildPayload(parsed.data.tipo, parsed.data.id);
          if (payload) await sendToN8n(payload);
        } catch (e) {
          console.error("[jarvis-notify]", e);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
