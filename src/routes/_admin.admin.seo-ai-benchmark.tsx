import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Download, Loader2, Save, Sparkles } from "lucide-react";
import {
  AI_CATEGORIES,
  AI_PLATFORMS,
  AI_PROMPTS,
  AI_STATUSES,
  MAX_SCORE,
  computeRunStats,
  parseCompetitors,
  scoreForStatus,
  toCsv,
  type AiCheckRow,
  type AiPlatform,
  type AiResultStatus,
  type RunStats,
} from "@/lib/ai-visibility";

export const Route = createFileRoute("/_admin/admin/seo-ai-benchmark")({
  head: () => ({
    meta: [
      { title: "Admin · AI Visibility — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AiBenchmarkPage,
});

type Draft = {
  /** "" = test non ancora eseguito: non salvabile, nessuna riga DB. */
  status: AiResultStatus | "";
  position: string;
  citedUrl: string;
  competitors: string;
  notes: string;
  saving: boolean;
  existing: boolean;
};

const emptyDraft = (): Draft => ({
  status: "",
  position: "",
  citedUrl: "",
  competitors: "",
  notes: "",
  saving: false,
  existing: false,
});


function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Copia non disponibile su questo browser");
  }
}

function AiBenchmarkPage() {
  const [runDate, setRunDate] = useState(todayIso());
  const [platform, setPlatform] = useState<AiPlatform>("chatgpt");
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState<AiCheckRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_visibility_checks")
      .select(
        "id, run_date, platform, prompt_key, prompt_text, category, result_status, score, furia_position, cited_url, competitors, notes",
      )
      .order("run_date", { ascending: false });
    if (error) {
      toast.error("Errore caricamento benchmark");
      setLoading(false);
      return;
    }
    setAllRows((data ?? []) as unknown as AiCheckRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Ricostruisce le bozze quando cambia il run selezionato o i dati.
  useEffect(() => {
    const next: Record<string, Draft> = {};
    for (const p of AI_PROMPTS) {
      const row = allRows.find(
        (r) => r.run_date === runDate && r.platform === platform && r.prompt_key === p.key,
      );
      next[p.key] = row
        ? {
            status: row.result_status,
            position: row.furia_position ? String(row.furia_position) : "",
            citedUrl: row.cited_url ?? "",
            competitors: (row.competitors ?? []).join(", "),
            notes: row.notes ?? "",
            saving: false,
            existing: true,
          }
        : emptyDraft();

    }
    setDrafts(next);
  }, [allRows, runDate, platform]);

  const currentRunRows = useMemo(
    () => allRows.filter((r) => r.run_date === runDate),
    [allRows, runDate],
  );

  const runDates = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.run_date))).sort((a, b) => (a < b ? 1 : -1)),
    [allRows],
  );

  const history: RunStats[] = useMemo(
    () => runDates.map((d) => computeRunStats(d, allRows.filter((r) => r.run_date === d))),
    [runDates, allRows],
  );

  const stats = useMemo(() => computeRunStats(runDate, currentRunRows), [runDate, currentRunRows]);
  const previous = useMemo(() => {
    const older = history.filter((h) => h.runDate < runDate);
    return older.length > 0 ? older[0] : null;
  }, [history, runDate]);

  const visiblePrompts = useMemo(
    () => AI_PROMPTS.filter((p) => category === "all" || p.category === category),
    [category],
  );

  const setDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  // Delta metodologicamente validi solo fra due run completi (60/60).
  const comparable = previous !== null && stats.complete && previous.complete;
  const overallDelta = (cur: number, prev: number) => (comparable ? cur - prev : null);

  const saveRow = async (key: string) => {
    const prompt = AI_PROMPTS.find((p) => p.key === key)!;
    const draft = drafts[key];
    if (!draft) return;
    if (draft.status === "") {
      toast.error("Seleziona l'esito del test");
      return;
    }
    const positionRaw = draft.position.trim();
    const position = positionRaw === "" ? null : Number.parseInt(positionRaw, 10);
    if (position !== null && (!Number.isInteger(position) || position < 1)) {
      toast.error("La posizione deve essere un numero intero positivo");
      return;
    }
    const score = scoreForStatus(draft.status);

    if (score === 3 && draft.citedUrl.trim() === "") {
      toast.warning("Score 3 senza URL citata: salvato comunque");
    }
    setDrafts((d) => ({ ...d, [key]: { ...d[key], saving: true } }));
    const { error } = await supabase.from("ai_visibility_checks").upsert(
      {
        run_date: runDate,
        platform,
        prompt_key: key,
        prompt_text: prompt.text,
        category: prompt.category,
        result_status: draft.status,
        score,
        furia_position: position,
        cited_url: draft.citedUrl.trim() || null,
        competitors: parseCompetitors(draft.competitors),
        notes: draft.notes.trim() || null,
      },
      { onConflict: "run_date,platform,prompt_key" },
    );
    if (error) {
      toast.error("Salvataggio non riuscito");
      setDrafts((d) => ({ ...d, [key]: { ...d[key], saving: false } }));
      return;
    }
    toast.success("Riga salvata");
    await load();
  };

  const exportCsv = () => {
    const rows = allRows.filter(
      (r) =>
        r.run_date === runDate &&
        r.platform === platform &&
        (category === "all" || r.category === category),
    );
    if (rows.length === 0) {
      toast.error("Nessun risultato da esportare con i filtri correnti");
      return;
    }
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-visibility-${runDate}-${platform}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () =>
    copyText(
      AI_PROMPTS.map((p, i) => `${i + 1}. ${p.text}`).join("\n"),
      "20 prompt copiati",
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl">
          <Sparkles className="h-5 w-5 text-primary" /> AI Visibility — Furia Immobiliare
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Benchmark manuale per ChatGPT, Perplexity e Gemini. Esegui gli stessi 20 prompt su ogni
          piattaforma e registra qui l&apos;esito: 0 non compare, 1 menzionata, 2 tra le
          raccomandazioni, 3 con citazione di una pagina di furiaimmobiliare.it.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-sm border border-border bg-background p-4">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Data del test
          <input
            type="date"
            value={runDate}
            onChange={(e) => setRunDate(e.target.value)}
            className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Piattaforma
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as AiPlatform)}
            className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
          >
            {AI_PLATFORMS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Categoria
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
          >
            <option value="all">Tutte</option>
            {AI_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs hover:border-primary/50"
          >
            <Copy className="h-3.5 w-3.5" /> Copia tutti i prompt
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs hover:border-primary/50"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label={`Score run ${runDate}`}
          value={`${stats.score} / ${MAX_SCORE_TOTAL}`}
          delta={overallDelta(stats.score, previous?.score ?? 0)}
          deltaNote={deltaNote}
        />
        <Kpi
          label="Test completati"
          value={`${stats.total} / ${EXPECTED_TESTS_TOTAL}`}
          delta={null}
          deltaNote={`${stats.completionPct}% del benchmark`}
        />
        <Kpi
          label="Furia presente (≥1)"
          value={`${stats.presentPct}%`}
          delta={overallDelta(stats.presentPct, previous?.presentPct ?? 0)}
          deltaNote={pctNote}
        />
        <Kpi
          label="Raccomandata (≥2)"
          value={`${stats.recommendedPct}%`}
          delta={overallDelta(stats.recommendedPct, previous?.recommendedPct ?? 0)}
          deltaNote={pctNote}
        />
        <Kpi
          label="Citata (=3)"
          value={`${stats.citedPct}%`}
          delta={overallDelta(stats.citedPct, previous?.citedPct ?? 0)}
          deltaNote={pctNote}
        />
        {AI_PLATFORMS.map((p) => {
          const cur = stats.byPlatform[p.key];
          const prv = previous?.byPlatform[p.key];
          const platformComparable = !!prv && cur.complete && prv.complete;
          return (
            <Kpi
              key={p.key}
              label={`${p.label} — score`}
              value={`${cur.score} / ${MAX_SCORE_PER_PLATFORM}`}
              delta={platformComparable ? cur.score - prv.score : null}
              deltaNote={
                platformComparable
                  ? undefined
                  : `${cur.count} / ${EXPECTED_TESTS_PER_PLATFORM} test — Δ non confrontabile`
              }
            />
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        Presenza, raccomandazione e citazione sono calcolate <strong>sui test completati</strong>
        {stats.total === 0 ? " — nessun test registrato per questo run." : "."} Il benchmark completo
        è {EXPECTED_TESTS_TOTAL} test ({EXPECTED_TESTS_PER_PLATFORM} prompt × {AI_PLATFORMS.length}{" "}
        piattaforme), massimo {MAX_SCORE_TOTAL} punti. I delta compaiono solo quando il run corrente e
        quello precedente sono entrambi completi ({EXPECTED_TESTS_TOTAL}/{EXPECTED_TESTS_TOTAL}).
      </p>


      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Caricamento…
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="font-serif text-lg text-ink">
            20 prompt · {AI_PLATFORMS.find((p) => p.key === platform)?.label} · {runDate}
          </h2>
          <div className="space-y-3">
            {visiblePrompts.map((p, i) => {
              const d = drafts[p.key] ?? emptyDraft();
              return (
                <article key={p.key} className="rounded-sm border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {AI_PROMPTS.indexOf(p) + 1}. {p.category}
                      </div>
                      <p className="mt-1 text-sm text-ink">{p.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.existing && (
                        <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] text-emerald-800">
                          registrato
                        </span>
                      )}
                      <button
                        onClick={() => copyText(p.text, "Prompt copiato")}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs hover:border-primary/50"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copia prompt
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Esito
                      <select
                        value={d.status}
                        onChange={(e) => setDraft(p.key, { status: e.target.value as AiResultStatus })}
                        className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
                      >
                        {AI_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Posizione Furia (opzionale)
                      <input
                        inputMode="numeric"
                        value={d.position}
                        onChange={(e) => setDraft(p.key, { position: e.target.value })}
                        placeholder="es. 2"
                        className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      URL citata (opzionale)
                      <input
                        value={d.citedUrl}
                        onChange={(e) => setDraft(p.key, { citedUrl: e.target.value })}
                        placeholder="https://furiaimmobiliare.it/…"
                        className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Concorrenti (virgola)
                      <input
                        value={d.competitors}
                        onChange={(e) => setDraft(p.key, { competitors: e.target.value })}
                        placeholder="Agenzia X, Agenzia Y"
                        className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
                      />
                    </label>
                  </div>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="flex flex-1 flex-col gap-1 text-xs text-muted-foreground">
                      Note
                      <textarea
                        rows={2}
                        value={d.notes}
                        onChange={(e) => setDraft(p.key, { notes: e.target.value })}
                        className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-ink"
                      />
                    </label>
                    <button
                      onClick={() => saveRow(p.key)}
                      disabled={d.saving}
                      className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60"
                    >
                      {d.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salva riga
                    </button>
                  </div>
                  {i === visiblePrompts.length - 1 && null}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Storico benchmark</h2>
        {history.length === 0 ? (
          <p className="rounded-sm border border-border bg-background p-4 text-sm text-muted-foreground">
            Nessun benchmark registrato.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-border bg-background">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Test</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Δ vs precedente</th>
                  <th className="px-3 py-2 font-medium">Presenza</th>
                  <th className="px-3 py-2 font-medium">Citazioni</th>
                  <th className="px-3 py-2 font-medium">ChatGPT</th>
                  <th className="px-3 py-2 font-medium">Perplexity</th>
                  <th className="px-3 py-2 font-medium">Gemini</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => {
                  const prev = history[idx + 1];
                  return (
                    <tr key={h.runDate} className="border-t border-border">
                      <td className="px-3 py-2 text-ink">{h.runDate}</td>
                      <td className="px-3 py-2">{h.total}</td>
                      <td className="px-3 py-2">
                        {h.score} / {h.maxScore}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {prev ? fmtDelta(h.score - prev.score) : "—"}
                      </td>
                      <td className="px-3 py-2">{h.presentPct}%</td>
                      <td className="px-3 py-2">{h.citedPct}%</td>
                      <td className="px-3 py-2">{h.byPlatform.chatgpt.score}</td>
                      <td className="px-3 py-2">{h.byPlatform.perplexity.score}</td>
                      <td className="px-3 py-2">{h.byPlatform.gemini.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function fmtDelta(n: number) {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : String(n);
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: number | null }) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl text-ink">{value}</div>
      <div className="text-xs text-muted-foreground">
        {delta === null ? "nessun run precedente" : `Δ ${fmtDelta(delta)}`}
      </div>
    </div>
  );
}
