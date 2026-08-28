// Config unica per il benchmark AI Visibility (admin-only).
// I 20 prompt sono fissi: NON aggiungere/rimuovere senza decisione esplicita,
// altrimenti i confronti storici perdono senso.

export type AiPlatform = "chatgpt" | "perplexity" | "gemini";

export const AI_PLATFORMS: Array<{ key: AiPlatform; label: string }> = [
  { key: "chatgpt", label: "ChatGPT" },
  { key: "perplexity", label: "Perplexity" },
  { key: "gemini", label: "Gemini" },
];

export type AiResultStatus = "not_mentioned" | "mentioned" | "recommended" | "cited";

export const AI_STATUSES: Array<{
  key: AiResultStatus;
  score: 0 | 1 | 2 | 3;
  label: string;
  short: string;
}> = [
  { key: "not_mentioned", score: 0, label: "0 — Furia non compare", short: "0" },
  { key: "mentioned", score: 1, label: "1 — Furia è menzionata", short: "1" },
  { key: "recommended", score: 2, label: "2 — Furia tra le raccomandazioni", short: "2" },
  { key: "cited", score: 3, label: "3 — Cita una pagina furiaimmobiliare.it", short: "3" },
];

export const MAX_SCORE = 3;

// Denominatori FISSI del benchmark: 20 prompt × 3 piattaforme = 60 test, max 3 punti ciascuno.
export const EXPECTED_TESTS_PER_PLATFORM = 20;
export const EXPECTED_TESTS_TOTAL = 60;
export const MAX_SCORE_PER_PLATFORM = EXPECTED_TESTS_PER_PLATFORM * MAX_SCORE; // 60
export const MAX_SCORE_TOTAL = EXPECTED_TESTS_TOTAL * MAX_SCORE; // 180

export function scoreForStatus(status: AiResultStatus): 0 | 1 | 2 | 3 {
  return AI_STATUSES.find((s) => s.key === status)!.score;
}


export type AiCategory =
  | "Brand / Agenzie"
  | "Acquisto / Territorio"
  | "Tipologie / Immobili"
  | "Vendita / Valutazione"
  | "Dati / Autorità";

export const AI_CATEGORIES: AiCategory[] = [
  "Brand / Agenzie",
  "Acquisto / Territorio",
  "Tipologie / Immobili",
  "Vendita / Valutazione",
  "Dati / Autorità",
];

export type AiPrompt = { key: string; category: AiCategory; text: string };

export const AI_PROMPTS: AiPrompt[] = [
  { key: "brand-agenzia-pontremoli", category: "Brand / Agenzie", text: "agenzia immobiliare Pontremoli" },
  { key: "brand-migliori-agenzie-pontremoli", category: "Brand / Agenzie", text: "migliori agenzie immobiliari a Pontremoli" },
  { key: "brand-agenzia-lunigiana", category: "Brand / Agenzie", text: "agenzia immobiliare in Lunigiana" },
  { key: "brand-migliori-agenzie-lunigiana", category: "Brand / Agenzie", text: "migliori agenzie immobiliari in Lunigiana" },

  { key: "acq-dove-comprare-lunigiana", category: "Acquisto / Territorio", text: "dove comprare casa in Lunigiana" },
  { key: "acq-quanto-costa-2026", category: "Acquisto / Territorio", text: "quanto costa comprare casa in Lunigiana nel 2026" },
  { key: "acq-comuni-economici", category: "Acquisto / Territorio", text: "quali sono i comuni più economici della Lunigiana per comprare casa" },
  { key: "acq-pontremoli-conviene", category: "Acquisto / Territorio", text: "comprare casa a Pontremoli conviene?" },
  { key: "acq-dove-vivere", category: "Acquisto / Territorio", text: "dove vivere in Lunigiana" },
  { key: "acq-seconda-casa", category: "Acquisto / Territorio", text: "migliori comuni della Lunigiana per una seconda casa" },

  { key: "tip-rustici", category: "Tipologie / Immobili", text: "rustici in vendita in Lunigiana" },
  { key: "tip-case-pietra", category: "Tipologie / Immobili", text: "case in pietra in vendita in Lunigiana" },
  { key: "tip-ville", category: "Tipologie / Immobili", text: "ville in vendita in Lunigiana" },
  { key: "tip-sotto-100k", category: "Tipologie / Immobili", text: "case economiche in Lunigiana sotto 100.000 euro" },
  { key: "tip-case-pontremoli", category: "Tipologie / Immobili", text: "case in vendita a Pontremoli" },

  { key: "ven-quanto-vale-pontremoli", category: "Vendita / Valutazione", text: "quanto vale una casa a Pontremoli" },
  { key: "ven-come-vendere", category: "Vendita / Valutazione", text: "come vendere casa in Lunigiana" },
  { key: "ven-agenzia-valutazione", category: "Vendita / Valutazione", text: "agenzia per valutare una casa a Pontremoli" },

  { key: "dati-prezzi-2026", category: "Dati / Autorità", text: "prezzi immobiliari in Lunigiana nel 2026" },
  { key: "dati-osservatorio", category: "Dati / Autorità", text: "osservatorio immobiliare Lunigiana" },
];

export type AiCheckRow = {
  id: string;
  run_date: string;
  platform: AiPlatform;
  prompt_key: string;
  prompt_text: string;
  category: string;
  result_status: AiResultStatus;
  score: number;
  furia_position: number | null;
  cited_url: string | null;
  competitors: string[];
  notes: string | null;
};

export function parseCompetitors(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export type RunStats = {
  runDate: string;
  /** Test effettivamente registrati (max 60). */
  total: number;
  score: number;
  /** Massimo teorico fisso del benchmark completo (180). */
  maxScore: number;
  /** true solo quando tutti i 60 test attesi sono registrati. */
  complete: boolean;
  completionPct: number;
  /** Percentuali calcolate SOLO sui test completati. */
  presentPct: number;
  recommendedPct: number;
  citedPct: number;
  byPlatform: Record<AiPlatform, { count: number; score: number; complete: boolean }>;
};

export function computeRunStats(runDate: string, rows: AiCheckRow[]): RunStats {
  const byPlatform = {
    chatgpt: { count: 0, score: 0, complete: false },
    perplexity: { count: 0, score: 0, complete: false },
    gemini: { count: 0, score: 0, complete: false },
  } as Record<AiPlatform, { count: number; score: number; complete: boolean }>;
  let score = 0;
  let present = 0;
  let recommended = 0;
  let cited = 0;
  for (const r of rows) {
    score += r.score;
    if (r.score >= 1) present += 1;
    if (r.score >= 2) recommended += 1;
    if (r.score >= 3) cited += 1;
    const p = byPlatform[r.platform];
    if (p) {
      p.count += 1;
      p.score += r.score;
    }
  }
  for (const p of AI_PLATFORMS) {
    byPlatform[p.key].complete = byPlatform[p.key].count >= EXPECTED_TESTS_PER_PLATFORM;
  }
  const total = rows.length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  return {
    runDate,
    total,
    score,
    maxScore: MAX_SCORE_TOTAL,
    complete: total >= EXPECTED_TESTS_TOTAL,
    completionPct: Math.round((Math.min(total, EXPECTED_TESTS_TOTAL) / EXPECTED_TESTS_TOTAL) * 100),
    presentPct: pct(present),
    recommendedPct: pct(recommended),
    citedPct: pct(cited),
    byPlatform,
  };
}


export function toCsv(rows: AiCheckRow[]): string {
  const header = [
    "run_date",
    "platform",
    "category",
    "prompt_key",
    "prompt_text",
    "result_status",
    "score",
    "furia_position",
    "cited_url",
    "competitors",
    "notes",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.run_date,
        r.platform,
        r.category,
        r.prompt_key,
        r.prompt_text,
        r.result_status,
        r.score,
        r.furia_position ?? "",
        r.cited_url ?? "",
        (r.competitors ?? []).join(" | "),
        r.notes ?? "",
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}
