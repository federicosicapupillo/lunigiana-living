import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NOTIFY_TO = "furiaimmobiliare@libero.it";

const InputSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(3).max(50),
  message: z.string().trim().max(3000).optional().nullable(),
  preferred_area: z.string().trim().max(200).optional().nullable(),
  budget_range: z.string().trim().max(200).optional().nullable(),
  property_type: z.string().trim().max(200).optional().nullable(),
  property_reference: z.string().trim().max(120).optional().nullable(),
  source_page: z.string().trim().max(500).optional().nullable(),
});

function esc(v: string | null | undefined): string {
  if (!v) return "";
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px;color:#6b6357;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:6px 12px;color:#241711;font-size:14px;">${esc(value).replace(/\n/g, "<br/>")}</td></tr>`;
}

export const sendLeadNotification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      // Email provider not configured yet — lead is already saved in DB by the client.
      return { sent: false, reason: "email_not_configured" as const };
    }

    const submittedAt = new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = data.property_reference
      ? `Nuova richiesta — ${data.property_reference} — ${data.full_name}`
      : `Nuova richiesta dal sito — ${data.full_name}`;

    const html = `<!doctype html><html><body style="margin:0;background:#f5ecdd;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <h1 style="margin:0 0 8px 0;font-size:22px;color:#241711;">Nuova richiesta dal sito</h1>
  <p style="margin:0 0 20px 0;color:#6b6357;font-size:13px;">${esc(submittedAt)}</p>
  <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e7dcc6;border-radius:4px;">
    ${row("Nome", data.full_name)}
    ${row("Email", data.email)}
    ${row("Telefono", data.phone)}
    ${row("Immobile", data.property_reference)}
    ${row("Zona", data.preferred_area)}
    ${row("Budget", data.budget_range)}
    ${row("Tipologia", data.property_type)}
    ${row("Messaggio", data.message)}
    ${row("Pagina", data.source_page)}
  </table>
  <p style="margin:18px 0 0 0;color:#6b6357;font-size:12px;">Email automatica generata dal sito Furia Immobiliare.</p>
</div>
</body></html>`;

    const text = [
      `Nuova richiesta dal sito — ${submittedAt}`,
      ``,
      `Nome: ${data.full_name}`,
      `Email: ${data.email}`,
      `Telefono: ${data.phone}`,
      data.property_reference ? `Immobile: ${data.property_reference}` : "",
      data.preferred_area ? `Zona: ${data.preferred_area}` : "",
      data.budget_range ? `Budget: ${data.budget_range}` : "",
      data.property_type ? `Tipologia: ${data.property_type}` : "",
      data.message ? `\nMessaggio:\n${data.message}` : "",
      data.source_page ? `\nPagina: ${data.source_page}` : "",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Furia Immobiliare <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: data.email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[sendLeadNotification] Resend gateway failed", res.status, body);
      return { sent: false, reason: "provider_error" as const, status: res.status };
    }
    return { sent: true } as const;
  });