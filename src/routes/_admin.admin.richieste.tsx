import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Home as HomeIcon,
  MessageSquare,
  Trash2,
  Megaphone,
  CalendarClock,
  CheckCheck,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

type LeadStatus = "new" | "contacted" | "in_progress" | "closed";
type Outcome = "deal" | "not_interested" | "no_response" | "not_qualified" | "other";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_area: string | null;
  budget_range: string | null;
  property_type: string | null;
  message: string | null;
  source: string | null;
  source_page: string | null;
  status: LeadStatus;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  property_id: string | null;
  contacted_at: string | null;
  appointment_at: string | null;
  outcome: string | null;
};

type PropertyRef = { id: string; reference_code: string | null; title: string };

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nuova",
  contacted: "Contattato",
  in_progress: "In lavorazione",
  closed: "Chiusa",
};

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  closed: "bg-muted text-muted-foreground border-border",
};

const OUTCOME_LABEL: Record<Outcome, string> = {
  deal: "Affare concluso",
  not_interested: "Non interessato",
  no_response: "Nessuna risposta",
  not_qualified: "Non qualificato",
  other: "Altro",
};

const OUTCOMES = Object.keys(OUTCOME_LABEL) as Outcome[];

/** Human labels for the form (`source`) that generated the lead. */
const MODULE_LABEL: Record<string, string> = {
  lead_form: "Modulo contatti",
  off_market: "Off Market",
  lead_magnet: "Guida Lunigiana",
  property_valuation: "Valutazione immobile",
  guided_search: "Ricerca guidata",
  property_inquiry: "Richiesta immobile",
};

const NO_ATTRIBUTION = "__none__";

const FILTERS: Array<{ key: "all" | LeadStatus; label: string }> = [
  { key: "all", label: "Tutte" },
  { key: "new", label: "Nuove" },
  { key: "contacted", label: "Contattate" },
  { key: "in_progress", label: "In lavorazione" },
  { key: "closed", label: "Chiuse" },
];

const PERIODS: Array<{ key: "all" | "7" | "30"; label: string }> = [
  { key: "all", label: "Tutti i periodi" },
  { key: "7", label: "Ultimi 7 giorni" },
  { key: "30", label: "Ultimi 30 giorni" },
];

export const Route = createFileRoute("/_admin/admin/richieste")({
  head: () => ({
    meta: [
      { title: "Admin · Richieste — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLeadsPage,
});

function moduleLabel(source: string | null): string {
  if (!source) return "Non specificato";
  return MODULE_LABEL[source] ?? source;
}

function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Record<string, PropertyRef>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [channel, setChannel] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("all");
  const [closing, setClosing] = useState<Lead | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Errore caricamento richieste");
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as unknown as Lead[];
    setLeads(rows);

    const ids = Array.from(
      new Set(rows.map((l) => l.property_id).filter((v): v is string => !!v)),
    );
    if (ids.length) {
      const { data: props } = await supabase
        .from("properties")
        .select("id, reference_code, title")
        .in("id", ids);
      const map: Record<string, PropertyRef> = {};
      for (const p of (props ?? []) as PropertyRef[]) map[p.id] = p;
      setProperties(map);
    } else {
      setProperties({});
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const channels = useMemo(() => {
    const set = new Set<string>();
    let hasNone = false;
    for (const l of leads) {
      if (l.utm_source) set.add(l.utm_source);
      else hasNone = true;
    }
    const list = Array.from(set).sort();
    return { list, hasNone };
  }, [leads]);

  const propertyOptions = useMemo(() => {
    const ids = Array.from(
      new Set(leads.map((l) => l.property_id).filter((v): v is string => !!v)),
    );
    return ids.map((id) => ({
      id,
      label: properties[id]
        ? `${properties[id].reference_code ?? "—"} · ${properties[id].title}`
        : id.slice(0, 8),
    }));
  }, [leads, properties]);

  const filtered = useMemo(() => {
    const since =
      period === "all" ? null : Date.now() - Number(period) * 24 * 60 * 60 * 1000;
    return leads.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (channel === NO_ATTRIBUTION && l.utm_source) return false;
      if (channel !== "all" && channel !== NO_ATTRIBUTION && l.utm_source !== channel)
        return false;
      if (propertyFilter !== "all" && l.property_id !== propertyFilter) return false;
      if (since && new Date(l.created_at).getTime() < since) return false;
      return true;
    });
  }, [leads, filter, channel, propertyFilter, period]);

  function patchLocal(id: string, patch: Partial<Lead>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function updateLead(id: string, patch: Partial<Lead>, okMsg: string) {
    const { error } = await supabase
      .from("leads")
      .update(patch as never)
      .eq("id", id);
    if (error) {
      toast.error("Errore aggiornamento");
      return false;
    }
    patchLocal(id, patch);
    toast.success(okMsg);
    return true;
  }

  async function markContacted(lead: Lead) {
    const patch: Partial<Lead> = { status: "contacted" };
    if (!lead.contacted_at) patch.contacted_at = new Date().toISOString();
    await updateLead(lead.id, patch, "Segnata come contattata");
  }

  async function markInProgress(lead: Lead) {
    // In lavorazione non crea mai un appuntamento.
    await updateLead(lead.id, { status: "in_progress" }, "Stato aggiornato");
  }

  async function reopen(lead: Lead) {
    // Riapertura: non cancella contacted_at né appointment_at.
    await updateLead(lead.id, { status: "new", outcome: null }, "Richiesta riaperta");
  }

  async function confirmClose(lead: Lead, outcome: Outcome) {
    const ok = await updateLead(
      lead.id,
      { status: "closed", outcome },
      "Richiesta chiusa",
    );
    if (ok) setClosing(null);
  }

  async function setAppointment(lead: Lead, value: string | null) {
    const iso = value ? new Date(value).toISOString() : null;
    await updateLead(
      lead.id,
      { appointment_at: iso },
      iso ? "Appuntamento salvato" : "Appuntamento rimosso",
    );
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questa richiesta? L'azione è irreversibile.")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error("Errore eliminazione");
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Richiesta eliminata");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink sm:text-3xl">Richieste</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lead ricevuti dai moduli del sito. Ordinati dal più recente.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "richiesta" : "richieste"}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              filter === f.key
                ? "border-ink bg-ink text-cream"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          aria-label="Filtra per canale"
        >
          <option value="all">Tutti i canali</option>
          {channels.hasNone && <option value={NO_ATTRIBUTION}>Non attribuito</option>}
          {channels.list.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="max-w-[16rem] rounded-sm border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          aria-label="Filtra per immobile"
        >
          <option value="all">Tutti gli immobili</option>
          {propertyOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          aria-label="Filtra per periodo"
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          Nessuna richiesta in questa vista.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((l) => (
            <LeadCard
              key={l.id}
              lead={l}
              property={l.property_id ? properties[l.property_id] : undefined}
              onContacted={markContacted}
              onInProgress={markInProgress}
              onReopen={reopen}
              onAskClose={setClosing}
              onAppointment={setAppointment}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {closing && (
        <CloseDialog
          lead={closing}
          onCancel={() => setClosing(null)}
          onConfirm={confirmClose}
        />
      )}
    </div>
  );
}

function CloseDialog({
  lead,
  onCancel,
  onConfirm,
}: {
  lead: Lead;
  onCancel: () => void;
  onConfirm: (lead: Lead, outcome: Outcome) => void;
}) {
  const [outcome, setOutcome] = useState<Outcome | "">("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-background p-5 shadow-lg">
        <h3 className="font-serif text-lg text-ink">Chiudere la richiesta</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Indica l'esito per {lead.full_name}. L'esito è obbligatorio.
        </p>
        <div className="mt-4 grid gap-2">
          {OUTCOMES.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="outcome"
                value={o}
                checked={outcome === o}
                onChange={() => setOutcome(o)}
                className="accent-primary"
              />
              {OUTCOME_LABEL[o]}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Annulla
          </button>
          <button
            disabled={!outcome}
            onClick={() => outcome && onConfirm(lead, outcome)}
            className="rounded-sm border border-ink bg-ink px-3 py-1.5 text-xs text-cream disabled:opacity-50"
          >
            Chiudi richiesta
          </button>
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function LeadCard({
  lead,
  property,
  onContacted,
  onInProgress,
  onReopen,
  onAskClose,
  onAppointment,
  onDelete,
}: {
  lead: Lead;
  property?: PropertyRef;
  onContacted: (l: Lead) => void;
  onInProgress: (l: Lead) => void;
  onReopen: (l: Lead) => void;
  onAskClose: (l: Lead) => void;
  onAppointment: (l: Lead, value: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const created = new Date(lead.created_at);
  const waUrl = `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Ciao ${lead.full_name.split(" ")[0]}, sono Elena di Furia Immobiliare. Ho ricevuto la tua richiesta.`,
  )}`;
  const outcome = lead.outcome as Outcome | null;

  return (
    <article className="rounded-sm border border-border bg-background p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink">{lead.full_name}</h2>
          <div className="mt-1 text-xs text-muted-foreground">
            {created.toLocaleString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {lead.source_page ? ` · da ${lead.source_page}` : ""}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {outcome && (
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
              {OUTCOME_LABEL[outcome] ?? outcome}
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] ${STATUS_BADGE[lead.status]}`}
          >
            {STATUS_LABEL[lead.status]}
          </span>
        </div>
      </header>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-ink hover:text-primary">
          <Mail size={14} className="text-muted-foreground" /> {lead.email}
        </a>
        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-ink hover:text-primary">
          <Phone size={14} className="text-muted-foreground" /> {lead.phone}
        </a>
        {lead.preferred_area && (
          <div className="flex items-center gap-2 text-foreground/80">
            <MapPin size={14} className="text-muted-foreground" /> {lead.preferred_area}
          </div>
        )}
        {lead.budget_range && (
          <div className="flex items-center gap-2 text-foreground/80">
            <Wallet size={14} className="text-muted-foreground" /> {lead.budget_range}
          </div>
        )}
        {lead.property_type && (
          <div className="flex items-center gap-2 text-foreground/80">
            <HomeIcon size={14} className="text-muted-foreground" /> {lead.property_type}
          </div>
        )}
      </div>

      {/* Provenienza */}
      <div className="mt-4 grid gap-2 rounded-sm border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-foreground/80">
          <Megaphone size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">Canale:</span>{" "}
          {lead.utm_source ?? "Non attribuito"}
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <MessageSquare size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">Modulo:</span> {moduleLabel(lead.source)}
        </div>
        {lead.utm_campaign && (
          <div className="text-foreground/80">
            <span className="text-muted-foreground">Campagna:</span> {lead.utm_campaign}
          </div>
        )}
        {lead.utm_content && (
          <div className="text-foreground/80">
            <span className="text-muted-foreground">Contenuto:</span> {lead.utm_content}
          </div>
        )}
        {lead.property_id && (
          <div className="flex items-center gap-2 text-foreground/80 sm:col-span-2">
            <Building2 size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Immobile:</span>{" "}
            {property
              ? `${property.reference_code ?? "—"} · ${property.title}`
              : "Scheda non disponibile"}
          </div>
        )}
      </div>

      {/* Follow-up */}
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-foreground/80">
          <CheckCheck size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">Contattato il:</span>{" "}
          {lead.contacted_at
            ? new Date(lead.contacted_at).toLocaleString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </div>
        <label className="flex flex-wrap items-center gap-2 text-foreground/80">
          <CalendarClock size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">Appuntamento:</span>
          <input
            type="datetime-local"
            value={toLocalInput(lead.appointment_at)}
            onChange={(e) => onAppointment(lead, e.target.value || null)}
            className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
          />
          {lead.appointment_at && (
            <button
              onClick={() => onAppointment(lead, null)}
              className="rounded-sm border border-border px-2 py-1 text-[0.7rem] hover:border-destructive/50"
            >
              Rimuovi
            </button>
          )}
        </label>
      </div>

      {lead.message && (
        <div className="mt-4 rounded-sm border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground/85">
          <div className="mb-1 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            <MessageSquare size={12} /> Messaggio
          </div>
          {lead.message}
        </div>
      )}

      <footer className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
        >
          WhatsApp
        </a>
        {lead.status !== "contacted" && (
          <button
            onClick={() => onContacted(lead)}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Segna contattato
          </button>
        )}
        {lead.status !== "in_progress" && (
          <button
            onClick={() => onInProgress(lead)}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            In lavorazione
          </button>
        )}
        {lead.status !== "closed" && (
          <button
            onClick={() => onAskClose(lead)}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Chiudi
          </button>
        )}
        {lead.status !== "new" && (
          <button
            onClick={() => onReopen(lead)}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Riapri
          </button>
        )}
        <button
          onClick={() => onDelete(lead.id)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-destructive hover:border-destructive/50"
        >
          <Trash2 size={12} /> Elimina
        </button>
      </footer>
    </article>
  );
}
