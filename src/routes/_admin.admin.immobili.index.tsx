import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Loader2, ImageOff, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS, STATUS_BADGE_CLASSES, type PropertyStatus } from "@/lib/admin/property-constants";
import {
  availableActions,
  applyStatusTransition,
  ACTION_LABELS,
  CONFIRM_COPY,
  type StatusAction,
} from "@/lib/admin/property-status";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type Row = {
  id: string;
  title: string;
  municipality: string | null;
  property_type: string | null;
  price: number | null;
  price_on_request: boolean;
  status: PropertyStatus;
  updated_at: string;
  cover_url: string | null;
};

type Filter =
  | "all"
  | "published"
  | "draft"
  | "suspended"
  | "sold"
  | "rented"
  | "archived"
  | "deleted";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Tutti" },
  { key: "published", label: "Pubblicati" },
  { key: "draft", label: "Bozze" },
  { key: "suspended", label: "Sospesi" },
  { key: "sold", label: "Venduti" },
  { key: "rented", label: "Affittati" },
  { key: "archived", label: "Archiviati" },
  { key: "deleted", label: "Cestino" },
];

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
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; action: StatusAction } | null>(null);
  const [busy, setBusy] = useState(false);

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
      if (statusFilter === "all") {
        // Default view hides the trash
        if (r.status === "deleted") return false;
      } else if (r.status !== statusFilter) {
        return false;
      }
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        r.title.toLowerCase().includes(needle) ||
        (r.municipality ?? "").toLowerCase().includes(needle) ||
        (r.property_type ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: rows.filter((r) => r.status !== "deleted").length,
      published: 0,
      draft: 0,
      suspended: 0,
      sold: 0,
      rented: 0,
      archived: 0,
      deleted: 0,
    };
    for (const r of rows) {
      if (r.status in c) c[r.status as Filter] = (c[r.status as Filter] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const requestAction = (id: string, action: StatusAction) => {
    setOpenMenu(null);
    if (!CONFIRM_COPY[action]) {
      void runAction(id, action);
      return;
    }
    setPending({ id, action });
  };

  const runAction = async (id: string, action: StatusAction) => {
    setBusy(true);
    const res = await applyStatusTransition(id, action);
    setBusy(false);
    setPending(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(`${ACTION_LABELS[action]} ✓`);
    await load();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-4xl">Immobili</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {counts.all} totali · {counts.published} pubblicati · {counts.draft} bozze · {counts.suspended} sospesi · {counts.deleted} nel cestino
          </p>
        </div>
        <Link
          to="/admin/immobili/nuovo"
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-5 sm:py-2.5"
        >
          <Plus size={15} /> Nuovo immobile
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-b border-border pb-4 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-64 sm:flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca per titolo, comune, tipologia..."
            className="w-full rounded-sm border border-border bg-background py-2.5 pl-9 pr-3 text-base focus:border-primary focus:outline-none sm:py-2 sm:text-sm"
          />
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                statusFilter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {f.label} ({counts[f.key] ?? 0})
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
        <div className="mt-6 grid gap-3 sm:gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group relative flex items-center gap-3 rounded-sm border border-border bg-card p-3 transition hover:border-primary/50 hover:shadow-sm sm:gap-5 sm:p-4"
            >
              <Link
                to="/admin/immobili/$id"
                params={{ id: r.id }}
                className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:h-20 sm:w-28">
                  {r.cover_url ? (
                    <img src={r.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="min-w-0 flex-1 truncate font-serif text-base text-ink sm:text-lg">{r.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {[r.property_type, r.municipality].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="mt-1 text-sm text-ink sm:hidden">
                    {r.price_on_request
                      ? "Su richiesta"
                      : r.price
                        ? `€ ${r.price.toLocaleString("it-IT")}`
                        : "—"}
                  </div>
                </div>
                <div className="hidden text-right text-sm sm:block">
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
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenu(openMenu === r.id ? null : r.id);
                  }}
                  aria-label="Azioni"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:border-primary/50 hover:text-ink"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === r.id && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-sm border border-border bg-card shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {availableActions(r.status).map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => requestAction(r.id, act)}
                        className={`block w-full px-3 py-2 text-left text-xs uppercase tracking-wider hover:bg-muted ${
                          act === "delete" || act === "hard_delete" ? "text-red-700" : "text-ink"
                        }`}
                      >
                        {ACTION_LABELS[act]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        busy={busy}
        title={pending ? CONFIRM_COPY[pending.action]?.title ?? "" : ""}
        body={pending ? CONFIRM_COPY[pending.action]?.body ?? "" : ""}
        cancel={pending ? CONFIRM_COPY[pending.action]?.cancel ?? "Annulla" : "Annulla"}
        confirm={pending ? CONFIRM_COPY[pending.action]?.confirm ?? "Conferma" : "Conferma"}
        danger={pending ? CONFIRM_COPY[pending.action]?.danger : false}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && runAction(pending.id, pending.action)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  const cls = STATUS_BADGE_CLASSES[status] ?? "bg-zinc-100 text-zinc-800 border-zinc-200";
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}