import { supabase } from "@/integrations/supabase/client";

export const REFERENCE_DUPLICATE_MESSAGE =
  "Questo codice annuncio è già utilizzato. Inserisci un codice diverso.";

export const REFERENCE_REQUIRED_MESSAGE = "Il codice annuncio è obbligatorio.";

export const REFERENCE_FORMAT_MESSAGE =
  "Il codice annuncio può contenere solo lettere, numeri, trattini e underscore.";

const VALID_RE = /^[A-Za-z0-9_-]+$/;

/** Rimuove spazi iniziali/finali (e spazi interni superflui non ammessi dal formato). */
export function normalizeReferenceCode(raw: string | null | undefined): string {
  return (raw ?? "").trim();
}

/** Ritorna null se valido, altrimenti il messaggio d'errore da mostrare. */
export function validateReferenceCode(raw: string | null | undefined): string | null {
  const code = normalizeReferenceCode(raw);
  if (!code) return REFERENCE_REQUIRED_MESSAGE;
  if (!VALID_RE.test(code)) return REFERENCE_FORMAT_MESSAGE;
  if (code.length > 40) return "Il codice annuncio è troppo lungo (max 40 caratteri).";
  return null;
}

/** Riconosce l'errore Postgres di violazione unicità sul codice annuncio. */
export function isDuplicateReferenceError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  if (!e) return false;
  const msg = (e.message ?? "").toLowerCase();
  return e.code === "23505" && msg.includes("reference_code");
}

/**
 * Verifica lato database che il codice non sia già usato da un altro immobile.
 * `excludeId` esclude l'immobile corrente (modifica).
 */
export async function isReferenceCodeTaken(code: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from("properties").select("id").eq("reference_code", code).limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return Boolean(data && data.length > 0);
}

/**
 * Propone il prossimo codice progressivo nel formato FURIA-0000,
 * coerente con il default generato dal database.
 */
export async function suggestNextReferenceCode(): Promise<string> {
  const { data } = await supabase
    .from("properties")
    .select("reference_code")
    .like("reference_code", "FURIA-%")
    .order("reference_code", { ascending: false })
    .limit(1);
  const last = data?.[0]?.reference_code ?? null;
  const n = last ? parseInt(last.replace(/^FURIA-/, ""), 10) : 0;
  const next = Number.isFinite(n) ? n + 1 : 1;
  return `FURIA-${String(next).padStart(4, "0")}`;
}