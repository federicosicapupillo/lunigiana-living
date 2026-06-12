import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLiveDataReport } from "@/lib/live-data.functions";
import { Loader2, RefreshCw, ShieldCheck, AlertTriangle, Database, Image as ImageIcon, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/dati-live")({
  component: LiveDataPage,
});

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtAgo(iso: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ora";
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h fa`;
  const d = Math.floor(h / 24);
  return `${d}g fa`;
}

function LiveDataPage() {
  const fetchReport = useServerFn(getLiveDataReport);
  const qc = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["live-data-report"],
    queryFn: () => fetchReport(),
    staleTime: 30_000,
  });

  const onSync = async () => {
    await refetch();
    qc.invalidateQueries();
    toast.success("Dati live sincronizzati");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-3xl">Dati live</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stato del database online degli immobili. La pubblicazione del progetto Lovable aggiorna solo il codice: i dati restano qui.
          </p>
        </div>
        <button
          onClick={onSync}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm hover:border-primary/50 disabled:opacity-60"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sincronizza dati live
        </button>
      </div>

      <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Protezione attiva</p>
            <p className="mt-1 text-emerald-800">
              Pubblicare il progetto Lovable aggiorna solo codice e layout. Gli immobili, foto, descrizioni, prezzi, rendering e dati Idealista non vengono mai sovrascritti dal deploy. Le uniche modifiche distruttive possibili sono migrazioni database, che richiedono la tua approvazione esplicita.
            </p>
          </div>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Caricamento report…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={<Database className="h-4 w-4" />} label="Immobili totali" value={data.totals.properties} />
            <StatTile icon={<ShieldCheck className="h-4 w-4" />} label="Pubblicati" value={data.totals.published} />
            <StatTile icon={<FileText className="h-4 w-4" />} label="Bozze" value={data.totals.draft} />
            <StatTile icon={<ImageIcon className="h-4 w-4" />} label="Foto totali" value={data.totals.images} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-border bg-background p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Ultimi 30 giorni</div>
              <div className="mt-2 font-serif text-2xl text-ink">{data.recentImages}</div>
              <div className="text-xs text-muted-foreground">foto caricate</div>
            </div>
            <div className="rounded-sm border border-border bg-background p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Ultimi 30 giorni</div>
              <div className="mt-2 font-serif text-2xl text-ink">{data.recentDescriptions}</div>
              <div className="text-xs text-muted-foreground">descrizioni aggiornate</div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-medium text-ink">Ultime modifiche online</div>
              <div className="text-xs text-muted-foreground">Report generato {fmtAgo(data.generatedAt)}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Immobile</th>
                    <th className="px-4 py-2 font-medium">Stato</th>
                    <th className="px-4 py-2 font-medium">Aggiornato</th>
                    <th className="px-4 py-2 font-medium">Foto (30g)</th>
                    <th className="px-4 py-2 font-medium">Descrizione</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-2">
                        <div className="font-medium text-ink">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.reference ?? p.id.slice(0, 8)} {p.municipality ? `· ${p.municipality}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span className="rounded-sm border border-border bg-muted/40 px-1.5 py-0.5">{p.status}</span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div>{fmtAgo(p.updatedAt)}</div>
                        <div className="text-muted-foreground">{fmtDate(p.updatedAt)}</div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {p.imagesCount > 0 ? (
                          <span className="text-ink">+{p.imagesCount} ({fmtAgo(p.lastImageAt)})</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {p.hasDescription ? (
                          <span className="text-ink">{fmtAgo(p.descriptionUpdatedAt)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          to="/admin/immobili/$id"
                          params={{ id: p.id }}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Apri <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nessun immobile presente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Prima di approvare una migrazione database</p>
                <p className="mt-1 text-amber-800">
                  Le migrazioni sono l'unico modo per modificare dati immobiliari live. Vedi <code className="rounded bg-amber-100 px-1">MIGRATION_SAFETY.md</code>: nessuna migration deve contenere <code className="rounded bg-amber-100 px-1">TRUNCATE</code>, <code className="rounded bg-amber-100 px-1">DELETE</code> o <code className="rounded bg-amber-100 px-1">UPDATE</code> senza filtro sicuro su tabelle <code className="rounded bg-amber-100 px-1">properties</code>, <code className="rounded bg-amber-100 px-1">property_images</code>, <code className="rounded bg-amber-100 px-1">property_descriptions</code>, <code className="rounded bg-amber-100 px-1">property_features</code>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-serif text-2xl text-ink">{value}</div>
    </div>
  );
}