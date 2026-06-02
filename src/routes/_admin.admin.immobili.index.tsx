import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS } from "@/lib/admin/property-constants";

type Row = {
  id: string;
  title: string;
  municipality: string | null;
  property_type: string | null;
  price: number | null;
  price_on_request: boolean;
  status: "draft" | "ready" | "published";
  updated_at: string;
  cover_url: string | null;
};

export const Route = createFileRoute("/_admin/admin/immobili/")({
  head: () => ({
    meta: [
      { title: "Admin · Immobili — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPropertiesPage,
});

function AdminPropertiesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "ready" | "published">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select(
        `id, title, municipality, property_type, price, price_on_request, status, updated_at,
         property_images!left ( image_url, is_cover, sort_order )`,
      )
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error(`Errore caricamento: ${error.message}`);
      setLoading(false);
      return;
    }
    const mapped: Row[] = (data ?? []).map((p: Record<string, unknown>) => {
      const imgs = (p.property_images ?? []) as Array<{
        image_url: string;
        is_cover: boolean;
        sort_order: number;
      }>;
      const cover =
        imgs.find((i) => i.is_cover)?.image_url ??
        imgs.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ??
        null;
      return {
        id: p.id as string,
        title: p.title as string,
        municipality: p.municipality as string | null,
        property_type: p.property_type as string | null,
        price: p.price as number | null,
        price_on_request: p.price_on_request as boolean,
        status: p.status as Row["status"],
        updated_at: p.updated_at as string,
        cover_url: cover,
      };
    });
    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        r.title.toLowerCase().includes(needle) ||
        (r.municipality ?? "").toLowerCase().includes(needle) ||
        (r.property_type ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, statusFilter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      draft: rows.filter((r) => r.status === "draft").length,
      ready: rows.filter((r) => r.status === "ready").length,
      published: rows.filter((r) => r.status === "published").length,
    }),
    [rows],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-ink">Immobili</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.all} totali · {counts.published} pubblicati · {counts.ready} pronti · {counts.draft} in bozza
          </p>
        </div>
        <Link
          to="/admin/immobili/nuovo"
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={15} /> Nuovo immobile
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <div className="relative min-w-64 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca per titolo, comune, tipologia..."
            className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "draft", "ready", "published"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                statusFilter === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s === "all" ? "Tutti" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border bg-card py-20 text-center">
          <p className="font-serif text-xl text-muted-foreground">
            {rows.length === 0 ? "Nessun immobile ancora. Inizia con \"Nuovo immobile\"." : "Nessun risultato per i filtri attuali."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((r) => (
            <Link
              key={r.id}
              to="/admin/immobili/$id"
              params={{ id: r.id }}
              className="group flex items-center gap-5 rounded-sm border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-sm bg-muted">
                {r.cover_url ? (
                  <img src={r.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="truncate font-serif text-lg text-ink">{r.title}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[r.property_type, r.municipality].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="text-ink">
                  {r.price_on_request
                    ? "Su richiesta"
                    : r.price
                      ? `€ ${r.price.toLocaleString("it-IT")}`
                      : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  agg. {new Date(r.updated_at).toLocaleDateString("it-IT")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "ready" | "published" }) {
  const cls =
    status === "published"
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : status === "ready"
        ? "bg-blue-100 text-blue-900 border-blue-200"
        : "bg-amber-100 text-amber-900 border-amber-200";
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}