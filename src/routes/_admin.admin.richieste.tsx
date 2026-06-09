import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, MapPin, Wallet, Home as HomeIcon, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

type LeadStatus = "new" | "contacted" | "in_progress" | "closed";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_area: string | null;
  budget_range: string | null;
  property_type: string | null;
  message: string | null;
  source_page: string | null;
  status: LeadStatus;
  created_at: string;
};

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

const FILTERS: Array<{ key: "all" | LeadStatus; label: string }> = [
  { key: "all", label: "Tutte" },
  { key: "new", label: "Nuove" },
  { key: "contacted", label: "Contattate" },
  { key: "in_progress", label: "In lavorazione" },
  { key: "closed", label: "Chiuse" },
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

function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Errore caricamento richieste");
    else setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  async function updateStatus(id: string, status: LeadStatus) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("Errore aggiornamento");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success("Stato aggiornato");
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
            Lead ricevuti dal form della home page. Ordinati dal più recente.
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
            <LeadCard key={l.id} lead={l} onStatus={updateStatus} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  onStatus,
  onDelete,
}: {
  lead: Lead;
  onStatus: (id: string, s: LeadStatus) => void;
  onDelete: (id: string) => void;
}) {
  const created = new Date(lead.created_at);
  const waUrl = `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Ciao ${lead.full_name.split(" ")[0]}, sono Elena di Furia Immobiliare. Ho ricevuto la tua richiesta.`,
  )}`;

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
        <span
          className={`rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] ${STATUS_BADGE[lead.status]}`}
        >
          {STATUS_LABEL[lead.status]}
        </span>
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
            onClick={() => onStatus(lead.id, "contacted")}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Segna contattato
          </button>
        )}
        {lead.status !== "in_progress" && (
          <button
            onClick={() => onStatus(lead.id, "in_progress")}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            In lavorazione
          </button>
        )}
        {lead.status !== "closed" && (
          <button
            onClick={() => onStatus(lead.id, "closed")}
            className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-primary/50"
          >
            Chiudi
          </button>
        )}
        {lead.status !== "new" && (
          <button
            onClick={() => onStatus(lead.id, "new")}
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