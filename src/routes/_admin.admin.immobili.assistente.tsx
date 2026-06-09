import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Sparkles, Send, Loader2, Wand2, CheckCircle2, RefreshCw, X, Mic, Square, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import {
  aiAssistantReply,
  aiAssistantFinalize,
  aiAssistantApplyDraft,
  aiAssistantTranscribeAudio,
  aiAssistantDraftFromText,
  type AiDraft,
} from "@/lib/ai-assistant.functions";

export const Route = createFileRoute("/_admin/admin/immobili/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente IA annuncio — Admin Furia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    audio: s.audio === 1 || s.audio === "1" ? 1 : undefined,
  }),
  component: AssistentePage,
});

type Msg = { role: "user" | "assistant"; content: string };

const FIRST_TURN: Msg = {
  role: "assistant",
  content:
    "Ciao Elena 👋 Sono l'assistente IA di Furia Immobiliare. Ti aiuto a creare la bozza di un nuovo annuncio.\n\nPartiamo dalle basi:\n• Si tratta di una **vendita** o di un **affitto**?\n• Che tipo di immobile è (appartamento, villa, rustico, villetta a schiera, terreno, fondo commerciale…)?",
};

const STEPS = [
  "Tipo operazione",
  "Localizzazione",
  "Prezzo",
  "Caratteristiche",
  "Descrizione",
  "Riepilogo",
];

function estimateProgress(messages: Msg[]): number {
  const turns = messages.filter((m) => m.role === "user").length;
  if (turns === 0) return 5;
  return Math.min(95, 10 + turns * 12);
}

function AssistentePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [messages, setMessages] = useState<Msg[]>([FIRST_TURN]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [audioOpen, setAudioOpen] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const replyFn = useServerFn(aiAssistantReply);
  const finalizeFn = useServerFn(aiAssistantFinalize);
  const applyFn = useServerFn(aiAssistantApplyDraft);
  const transcribeFn = useServerFn(aiAssistantTranscribeAudio);
  const draftFromTextFn = useServerFn(aiAssistantDraftFromText);

  useEffect(() => {
    if (search.audio === 1) setAudioOpen(true);
  }, [search.audio]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thinking, draft]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking || draft) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const { reply } = await replyFn({ data: { messages: next } });
      setMessages((prev) => [...prev, { role: "assistant", content: reply.replace(/\[PRONTO_PER_RIEPILOGO\]/g, "").trim() }]);
      if (/\[PRONTO_PER_RIEPILOGO\]/.test(reply)) {
        // Auto-trigger generation hint
        toast.info("L'assistente è pronto per generare la bozza. Clicca \"Genera bozza\" in alto.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore IA");
    } finally {
      setThinking(false);
    }
  };

  const generate = async () => {
    if (generating || thinking) return;
    if (messages.filter((m) => m.role === "user").length < 2) {
      toast.error("Rispondi ad almeno un paio di domande prima di generare la bozza.");
      return;
    }
    setGenerating(true);
    try {
      const { draft: d } = await finalizeFn({ data: { messages } });
      setDraft(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore generazione bozza");
    } finally {
      setGenerating(false);
    }
  };

  const apply = async () => {
    if (!draft) return;
    setApplying(true);
    try {
      const { propertyId } = await applyFn({
        data: {
          draft: draft as unknown as Record<string, unknown>,
          messages: audioTranscript
            ? [{ role: "user" as const, content: audioTranscript.slice(0, 8000) }]
            : messages,
          aiInputType: audioTranscript ? "audio" : "text",
          audioTranscript: audioTranscript ?? undefined,
        },
      });
      toast.success("Bozza creata! Ora carica le foto e rivedi i dettagli.");
      navigate({ to: "/admin/immobili/$id", params: { id: propertyId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore salvataggio");
    } finally {
      setApplying(false);
    }
  };

  const handleAudioDraft = async (transcript: string) => {
    const text = transcript.trim();
    if (text.length < 20) {
      toast.error("Trascrizione troppo breve.");
      return;
    }
    setGenerating(true);
    try {
      const { draft: d } = await draftFromTextFn({ data: { text } });
      setAudioTranscript(text);
      setDraft(d);
      setAudioOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore generazione bozza");
    } finally {
      setGenerating(false);
    }
  };

  const progress = draft ? 100 : estimateProgress(messages);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/immobili"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-ink"
          >
            <ArrowLeft size={14} /> Immobili
          </Link>
          <h1 className="flex items-center gap-2 font-serif text-2xl text-ink sm:text-3xl">
            <Sparkles className="text-primary" size={22} />
            Assistente IA annuncio
          </h1>
        </div>
        {!draft && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAudioOpen(true)}
              disabled={generating || thinking}
              className="inline-flex items-center gap-2 rounded-sm border border-primary bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              <Mic size={14} /> Detta annuncio con audio
            </button>
            <button
              onClick={generate}
              disabled={generating || thinking}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Genera bozza
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="rounded-sm border border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Completamento annuncio</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 hidden flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground sm:flex">
          {STEPS.map((s, i) => {
            const pct = (i + 1) * (100 / STEPS.length);
            const active = progress >= pct - 100 / STEPS.length;
            return (
              <span key={s} className={active ? "text-primary" : ""}>
                {i + 1}. {s}
                {i < STEPS.length - 1 && " ·"}
              </span>
            );
          })}
        </div>
      </div>

      {draft ? (
        <DraftReview
          draft={draft}
          onApply={apply}
          onEdit={() => setDraft(null)}
          onCancel={() => navigate({ to: "/admin/immobili" })}
          applying={applying}
        />
      ) : (
        <>
          <div
            ref={scrollRef}
            className="h-[55vh] min-h-[420px] overflow-y-auto rounded-sm border border-border bg-card p-4"
          >
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.content} />
              ))}
              {thinking && (
                <Bubble role="assistant" text="..." />
              )}
            </div>
          </div>
          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Rispondi all'assistente… (Invio per inviare, Shift+Invio per andare a capo)"
                className="min-h-[48px] flex-1 resize-none rounded-sm border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                disabled={thinking}
              />
              <button
                onClick={send}
                disabled={thinking || !input.trim()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                aria-label="Invia"
              >
                {thinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              L'IA non pubblica mai automaticamente. Quando hai finito, clicca <strong>Genera bozza</strong>: potrai rivedere i dati prima di applicarli al form.
            </p>
          </div>
        </>
      )}

      {audioOpen && (
        <AudioDictationModal
          onClose={() => setAudioOpen(false)}
          onTranscribe={async (b64, format) => {
            const { transcript } = await transcribeFn({ data: { audioBase64: b64, format } });
            return transcript;
          }}
          onAnalyze={handleAudioDraft}
          analyzing={generating}
        />
      )}
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-sm px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-ink"
        }`}
      >
        {text === "..." ? (
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
          </span>
        ) : (
          text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
            seg.startsWith("**") && seg.endsWith("**") ? (
              <strong key={i}>{seg.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{seg}</span>
            ),
          )
        )}
      </div>
    </div>
  );
}

function DraftReview({
  draft,
  onApply,
  onEdit,
  onCancel,
  applying,
}: {
  draft: AiDraft;
  onApply: () => void;
  onEdit: () => void;
  onCancel: () => void;
  applying: boolean;
}) {
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => {
    const empty = v == null || v === "" || v === false;
    return (
      <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 text-sm last:border-0">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
        <span className={`text-right ${empty ? "italic text-muted-foreground/60" : "text-ink"}`}>
          {empty ? "—" : v}
        </span>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <CheckCircle2 size={16} className="text-primary" /> Ecco la bozza dell'annuncio generata dall'IA
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Controlla i dati prima di applicarli al form. Lo stato resterà <strong>Bozza</strong>: niente verrà pubblicato.
        </p>
      </div>

      <Section title="Dati principali">
        <Row k="Titolo" v={draft.title} />
        <Row k="Tipologia" v={draft.property_type} />
        <Row k="Contratto" v={draft.contract_type} />
      </Section>
      <Section title="Localizzazione">
        <Row k="Regione" v={draft.region} />
        <Row k="Provincia" v={draft.province} />
        <Row k="Comune" v={draft.municipality} />
        <Row k="Località/Frazione" v={draft.locality} />
        <Row k="Zona/Quartiere" v={draft.area_zone} />
        <Row k="CAP" v={draft.postal_code} />
        <Row k="Indirizzo" v={draft.address} />
        <Row k="Indirizzo pubblico" v={draft.show_full_address ? "Sì" : "No"} />
      </Section>
      <Section title="Prezzo">
        <Row k="Prezzo (€)" v={draft.price != null ? draft.price.toLocaleString("it-IT") : null} />
        <Row k="Prezzo su richiesta" v={draft.price_on_request ? "Sì (nascosto al pubblico)" : "No"} />
      </Section>
      <Section title="Caratteristiche">
        <Row k="Superficie (m²)" v={draft.size_sqm} />
        <Row k="Camere" v={draft.bedrooms} />
        <Row k="Bagni" v={draft.bathrooms} />
        <Row k="Piani" v={draft.floors} />
        <Row k="Stato" v={draft.condition} />
        <Row k="Classe energetica" v={draft.energy_class} />
        <Row k="Arredato" v={draft.furnished ? "Sì" : "No"} />
        <Row
          k="Dotazioni"
          v={
            [
              draft.garden && "giardino",
              draft.terrace && "terrazza",
              draft.balcony && "balcone",
              draft.garage && "garage",
              draft.cellar && "cantina",
              draft.elevator && "ascensore",
              draft.panoramic_view && "vista panoramica",
              draft.historic_property && "storico",
            ]
              .filter(Boolean)
              .join(", ") || null
          }
        />
      </Section>
      <Section title="Descrizione pubblica">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {draft.public_description || <span className="italic text-muted-foreground">—</span>}
        </p>
        {draft.short_preview && (
          <p className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <strong>Anteprima:</strong> {draft.short_preview}
          </p>
        )}
        {draft.meta_description && (
          <p className="mt-1 text-xs text-muted-foreground">
            <strong>Meta SEO:</strong> {draft.meta_description}
          </p>
        )}
      </Section>
      {draft.internal_notes && (
        <Section title="Note private agenzia (non pubblicate)">
          <p className="whitespace-pre-wrap text-sm text-ink">{draft.internal_notes}</p>
        </Section>
      )}

      <div className="sticky bottom-0 flex flex-wrap gap-2 rounded-sm border border-border bg-background/95 p-3 backdrop-blur">
        <button
          onClick={onApply}
          disabled={applying}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {applying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Applica al form (salva come bozza)
        </button>
        <button
          onClick={onEdit}
          disabled={applying}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
        >
          <RefreshCw size={14} /> Modifica risposte
        </button>
        <button
          onClick={onCancel}
          disabled={applying}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-xs uppercase tracking-wider hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
        >
          <X size={14} /> Annulla
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <h3 className="mb-2 font-serif text-lg text-ink">{title}</h3>
      <div>{children}</div>
    </div>
  );
}