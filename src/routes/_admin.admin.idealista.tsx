import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getIdealistaOverview,
  setIdealistaStatus,
  setIdealistaImageIncluded,
  getIdealistaPropertyImages,
  rotateIdealistaFeedToken,
  getIdealistaAccount,
  setIdealistaAccount,
  type IdealistaStatus,
} from "@/lib/idealista.functions";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Save,
  Info,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_admin/admin/idealista")({
  component: IdealistaAdminPage,
});

const STATUS_LABELS: Record<IdealistaStatus, string> = {
  not_published: "Non inviato a Idealista",
  to_publish: "Pronto per Idealista",
  published: "Incluso nel feed Idealista",
  error: "Errore dati mancanti",
  to_update: "Da aggiornare",
  removed: "Escluso da Idealista",
};

const STATUS_CLASSES: Record<IdealistaStatus, string> = {
  not_published: "bg-zinc-100 text-zinc-700 border-zinc-200",
  to_publish: "bg-amber-100 text-amber-900 border-amber-200",
  published: "bg-emerald-100 text-emerald-900 border-emerald-200",
  error: "bg-red-100 text-red-900 border-red-200",
  to_update: "bg-blue-100 text-blue-900 border-blue-200",
  removed: "bg-zinc-200 text-zinc-600 border-zinc-300",
};

function IdealistaAdminPage() {
  const fetchOverview = useServerFn(getIdealistaOverview);
  const updateStatus = useServerFn(setIdealistaStatus);
  const rotateToken = useServerFn(rotateIdealistaFeedToken);
  const fetchAccount = useServerFn(getIdealistaAccount);
  const saveAccount = useServerFn(setIdealistaAccount);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["idealista-overview"],
    queryFn: () => fetchOverview(),
  });

  const accountQuery = useQuery({
    queryKey: ["idealista-account"],
    queryFn: () => fetchAccount(),
  });

  const [emailDraft, setEmailDraft] = useState("");
  const [emailDirty, setEmailDirty] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (accountQuery.data && !emailDirty) {
      setEmailDraft(accountQuery.data.account.email ?? "");
    }
  }, [accountQuery.data, emailDirty]);

  const [photoForProperty, setPhotoForProperty] = useState<string | null>(null);

  const properties = data?.properties ?? [];
  const feed = data?.feed;

  const buckets = useMemo(() => {
    const ready: any[] = [];
    const errors: any[] = [];
    const excluded: any[] = [];
    const notSent: any[] = [];
    const included: any[] = [];
    for (const p of properties) {
      if (p.idealista_status === "removed") excluded.push(p);
      else if (p.missing.length > 0 && p.idealista_status !== "not_published") errors.push(p);
      else if (p.idealista_status === "to_publish" || p.idealista_status === "to_update") ready.push(p);
      else if (p.idealista_status === "published") included.push(p);
      else notSent.push(p);
    }
    return { ready, errors, excluded, notSent, included };
  }, [properties]);

  const feedUrl =
    typeof window !== "undefined" && feed?.token
      ? `${window.location.origin}/api/public/idealista/feed.xml?token=${feed.token}`
      : "";

  const onSetStatus = async (propertyId: string, status: IdealistaStatus) => {
    await updateStatus({ data: { propertyId, status } });
    toast.success("Stato Idealista aggiornato");
    refetch();
  };

  const onCopyFeed = async () => {
    if (!feedUrl) return;
    await navigator.clipboard.writeText(feedUrl);
    toast.success("Link feed copiato");
  };

  const onRotate = async () => {
    if (!confirm("Rigenerare il token rende invalido il vecchio URL. Continuare?")) return;
    await rotateToken();
    toast.success("Token rigenerato");
    refetch();
  };

  const onSaveEmail = async () => {
    if (!emailDraft.trim()) {
      toast.error("Inserisci una email valida");
      return;
    }
    setSavingEmail(true);
    try {
      await saveAccount({ data: { email: emailDraft.trim() } });
      toast.success("Email Idealista salvata");
      setEmailDirty(false);
      accountQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Errore salvataggio");
    } finally {
      setSavingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const configReady = !!accountQuery.data?.account.email && !!feed?.token;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-3xl">Collegamento Idealista</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esportazione automatica degli annunci verso Idealista tramite feed XML.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-wider hover:border-primary/50"
        >
          {isFetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Aggiorna
        </button>
      </div>

      {/* Feed card */}
      <section className="mb-8 rounded-md border border-border bg-background p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configurazione Idealista
          </h2>
          <span
            className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              configReady
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {configReady ? "Pronto" : "Da completare"}
          </span>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="mb-1 block text-muted-foreground">Email account Idealista</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => {
                  setEmailDraft(e.target.value);
                  setEmailDirty(true);
                }}
                placeholder="account@esempio.it"
                className="flex-1 rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
              />
              <button
                onClick={onSaveEmail}
                disabled={savingEmail || !emailDirty}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/50 disabled:opacity-50"
              >
                {savingEmail ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Salva
              </button>
            </div>
            <span className="mt-1 block text-[10px] text-muted-foreground">
              Nessuna password viene salvata. La pubblicazione avviene tramite feed XML.
            </span>
          </label>

          <div className="block text-xs">
            <span className="mb-1 block text-muted-foreground">Token feed XML</span>
            <div className="flex gap-2">
              <input
                readOnly
                value={feed?.token ?? ""}
                className="flex-1 rounded-sm border border-border bg-muted/30 px-2 py-1.5 font-mono text-xs"
              />
              <button
                onClick={onRotate}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/50"
              >
                <RefreshCw size={12} /> Rigenera
              </button>
            </div>
            <span className="mt-1 block text-[10px] text-muted-foreground">
              Il token protegge il feed XML. Rigenerandolo, il vecchio URL non funzionerà più.
            </span>
          </div>
        </div>

        <div className="mb-2 text-xs text-muted-foreground">URL feed XML</div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={feedUrl}
            className="flex-1 min-w-[260px] rounded-sm border border-border bg-muted/30 px-2 py-1.5 text-xs"
          />
          <button
            onClick={onCopyFeed}
            disabled={!feedUrl}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50 disabled:opacity-50"
          >
            <Copy size={12} /> Copia URL feed
          </button>
          <a
            href={feedUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            <ExternalLink size={12} /> Apri feed
          </a>
        </div>

        <div className="mb-3 flex items-start gap-2 rounded-sm border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Comunica questo URL feed al supporto Idealista o al referente Idealista per l’import
            automatico degli annunci.
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Ultima generazione:{" "}
          {feed?.last_generated_at
            ? new Date(feed.last_generated_at).toLocaleString("it-IT")
            : "mai"}{" "}
          · Immobili inclusi nel feed:{" "}
          <strong className="text-ink">{buckets.ready.length + buckets.included.length}</strong>
        </p>
      </section>

      {/* Summary tiles */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tile label="Pronti" value={buckets.ready.length} className="border-amber-200 bg-amber-50" />
        <Tile label="Inclusi" value={buckets.included.length} className="border-emerald-200 bg-emerald-50" />
        <Tile label="Errori" value={buckets.errors.length} className="border-red-200 bg-red-50" />
        <Tile label="Esclusi" value={buckets.excluded.length} className="border-zinc-200 bg-zinc-100" />
        <Tile label="Non inviati" value={buckets.notSent.length} className="border-zinc-200 bg-background" />
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Annuncio</th>
              <th className="px-3 py-2 text-left">Stato</th>
              <th className="px-3 py-2 text-left">Campi mancanti</th>
              <th className="px-3 py-2 text-left">Foto</th>
              <th className="px-3 py-2 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Nessun annuncio.
                </td>
              </tr>
            )}
            {properties.map((p: any) => {
              const status = (p.idealista_status as IdealistaStatus) ?? "not_published";
              const hasMissing = p.missing.length > 0;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-3 align-top">
                    <div className="font-medium text-ink">{p.title || "—"}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.reference_code} · {p.municipality || "—"} ({p.province || "—"})
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        STATUS_CLASSES[status] ?? STATUS_CLASSES.not_published
                      }`}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    {hasMissing ? (
                      <div className="flex items-start gap-1 text-amber-800">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        <span>{p.missing.join(", ")}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={12} /> Tutti i campi presenti
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    <button
                      onClick={() => setPhotoForProperty(p.id)}
                      className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] hover:border-primary/50"
                    >
                      <ImageIcon size={11} />
                      {p.photos_included}/{p.photos_total} incluse
                    </button>
                  </td>
                  <td className="px-3 py-3 align-top text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-1">
                      <button
                        onClick={() => onSetStatus(p.id, "to_publish")}
                        disabled={hasMissing}
                        className="rounded-sm border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-900 hover:border-amber-500 disabled:opacity-40"
                      >
                        Pronto
                      </button>
                      <button
                        onClick={() => onSetStatus(p.id, "removed")}
                        className="rounded-sm border border-border bg-background px-2 py-1 text-[11px] hover:border-primary/50"
                      >
                        Escludi
                      </button>
                      <button
                        onClick={() => onSetStatus(p.id, "not_published")}
                        className="rounded-sm border border-border bg-background px-2 py-1 text-[11px] hover:border-primary/50"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {photoForProperty && (
        <PhotoPickerDialog
          propertyId={photoForProperty}
          onClose={() => {
            setPhotoForProperty(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function Tile({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-md border p-3 ${className}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function PhotoPickerDialog({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const fetchImgs = useServerFn(getIdealistaPropertyImages);
  const toggleImg = useServerFn(setIdealistaImageIncluded);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchImgs({ data: { propertyId } }).then((r) => {
      if (!mounted) return;
      setImages(r.images);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [propertyId, fetchImgs]);

  const onToggle = async (id: string, val: boolean) => {
    setImages((arr) => arr.map((i) => (i.id === id ? { ...i, idealista_included: val } : i)));
    await toggleImg({ data: { imageId: id, included: val } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Foto da includere nel feed</h3>
          <button onClick={onClose} className="rounded-sm p-1 hover:bg-muted">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                I rendering AI sono esclusi per default. Includili solo se autorizzato.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img) => {
                  const isRender = img.render_status === "completed" && !!img.rendered_image_url;
                  const url =
                    img.use_enhanced && img.enhanced_image_url ? img.enhanced_image_url : img.image_url;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => onToggle(img.id, !img.idealista_included)}
                      className={`relative overflow-hidden rounded-sm border-2 ${
                        img.idealista_included ? "border-primary" : "border-transparent opacity-60"
                      }`}
                    >
                      <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                      {isRender && (
                        <span className="absolute left-1 top-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white">
                          Rendering AI
                        </span>
                      )}
                      {img.is_cover && (
                        <span className="absolute right-1 top-1 rounded-sm bg-primary/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary-foreground">
                          Cover
                        </span>
                      )}
                      {img.idealista_included && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}