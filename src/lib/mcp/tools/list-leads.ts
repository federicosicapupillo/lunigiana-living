import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

/**
 * Leads are protected by RLS: only staff accounts can read them. A non-staff
 * caller simply gets an empty list — the policy, not this tool, is the gate.
 */
export default defineTool({
  name: "list_leads",
  title: "Elenco richieste",
  description:
    "List CRM contact requests (leads) with status, source and linked listing. Staff accounts only; contains personal contact data.",
  inputSchema: {
    status: z
      .enum(["new", "contacted", "in_progress", "closed"])
      .nullable()
      .describe("Filter by lead status. Null for any."),
    since: z
      .string()
      .trim()
      .max(40)
      .nullable()
      .describe("ISO date/time lower bound on creation, e.g. 2026-09-01. Null for no bound."),
    limit: z.number().int().min(1).max(100).describe("Maximum number of leads, 1-100."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (args, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("leads")
      .select(
        "id, created_at, full_name, email, phone, status, source, source_page, property_id, property_type, preferred_area, budget_range, message, outcome, contacted_at, appointment_at, utm_source, utm_medium, utm_campaign",
      )
      .order("created_at", { ascending: false })
      .limit(args.limit);

    if (args.status) q = q.eq("status", args.status);
    if (args.since) {
      const parsed = new Date(args.since);
      if (Number.isNaN(parsed.getTime())) throw new ToolError(`"${args.since}" is not a valid date.`);
      q = q.gte("created_at", parsed.toISOString());
    }

    const { data, error } = await q;
    if (error) throw new ToolError(error.message);

    const leads = (data ?? []).map((l) => ({
      id: l.id,
      created_at: l.created_at,
      full_name: l.full_name,
      email: l.email,
      phone: l.phone,
      status: l.status,
      source: l.source,
      source_page: l.source_page,
      property_id: l.property_id,
      property_type: l.property_type,
      preferred_area: l.preferred_area,
      budget_range: l.budget_range,
      message: l.message,
      outcome: l.outcome,
      contacted_at: l.contacted_at,
      appointment_at: l.appointment_at,
      utm_source: l.utm_source,
      utm_medium: l.utm_medium,
      utm_campaign: l.utm_campaign,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text:
            leads.length === 0
              ? "Nessuna richiesta trovata (oppure l'account non ha i permessi di staff)."
              : leads
                  .map((l) => `${l.created_at} — ${l.full_name} (${l.status}) — ${l.source ?? "n/d"}`)
                  .join("\n"),
        },
      ],
      structuredContent: { leads },
    };
  },
});
