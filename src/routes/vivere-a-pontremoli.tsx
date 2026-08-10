import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/components/whatsapp-float";
import { siteUrl } from "@/lib/site-url";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import {
  VP_CHECKLIST,
  VP_FAQ,
  VP_INTRO,
  VP_META,
  VP_SECTIONS,
  VP_TYPE_LINKS,
} from "@/lib/vivere-pontremoli";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/vivere-a-pontremoli");

export const Route = createFileRoute("/vivere-a-pontremoli")({
  head: () => {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Territori", item: siteUrl("/territori") },
        { "@type": "ListItem", position: 3, name: "Vivere a Pontremoli", item: PAGE_URL },
      ],
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: VP_META.title,
      description: VP_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": `${siteUrl("/")}#website` },
      about: { "@type": "Place", name: "Pontremoli, Lunigiana" },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    };
    return {
      meta: [
        { title: VP_META.title },
        { name: "description", content: VP_META.description },
        { property: "og:title", content: VP_META.title },
        { property: "og:description", content: VP_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        {
          type: "application/ld+json",
          children: JSON.stringify({ ...breadcrumbLd, "@id": `${PAGE_URL}#breadcrumb` }),
        },
      ],
    };
  },
  component: ViverePontremoliPage,
});

function ViverePontremoliPage() {
  const waHref = whatsappUrl(
    "Ciao Elena, sto valutando di trasferirmi a Pontremoli. Mi aiuti a capire da quale zona partire?",
  );
  const typeLinks = VP_TYPE_LINKS.filter((l) => TIPOLOGIE_SEO.some((t) => t.slug === l.slug));
  const zone = VP_SECTIONS.find((s) => s.id === "zone");
  const others = VP_SECTIONS.filter((s) => s.id !== "zone");

  return (
    <>
      {/* HERO + BREADCRUMB */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/territori" className="hover:text-[var(--terracotta)]">Territori</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Vivere a Pontremoli</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <MapPin size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Pontremoli, Lunigiana</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {VP_META.h1}
          </h1>
          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            {VP_INTRO.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* PONTREMOLI E LA LUNIGIANA */}
      {others
        .filter((s) => s.id === "lunigiana")
        .map((s) => (
          <section key={s.id} className="bg-[var(--warm-ivory)] py-20">
            <div className="container-editorial max-w-3xl">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">{s.h2}</h2>
              <div className="mt-6 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* CENTRO / RESIDENZIALE / COLLINA */}
      {zone && (
        <section className="bg-[var(--cream)] py-20">
          <div className="container-editorial">
            <div className="max-w-3xl">
              <h2 className="font-serif text-3xl text-ink md:text-4xl">{zone.h2}</h2>
              <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
                {zone.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(zone.subsections ?? []).map((sub) => (
                <div
                  key={sub.h3}
                  className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
                >
                  <h3 className="font-serif text-2xl text-ink">{sub.h3}</h3>
                  <div className="mt-4 space-y-3 text-[0.96rem] leading-[1.75] text-[var(--ink-soft)]">
                    {sub.paragraphs.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CHE TIPO DI CASA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Che tipo di casa scegliere a Pontremoli
            </h2>
            <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              <p>
                A Pontremoli e nel resto della Lunigiana il catalogo comprende famiglie di immobili
                molto diverse tra loro: appartamenti, case indipendenti, ville, rustici e casali,
                case con giardino, immobili adatti a un uso come seconda casa e soluzioni di fascia
                più economica. Non sono etichette commerciali: corrispondono a modi diversi di
                vivere la casa e a impegni di gestione diversi.
              </p>
              <p>
                Una regola utile è partire dall'uso e non dalla tipologia. Se la priorità è la
                praticità quotidiana, appartamenti e case in zona residenziale sono il punto di
                partenza naturale. Se contano spazio, verde e indipendenza, si guarda verso case
                indipendenti, rustici e proprietà con giardino, mettendo però in conto la
                manutenzione. La disponibilità cambia nel tempo, quindi le selezioni qui sotto
                riflettono ciò che è realmente in catalogo in questo momento.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typeLinks.map((l) => (
              <Link
                key={l.slug}
                to="/case-in-vendita-lunigiana/$tipologia"
                params={{ tipologia: l.slug }}
                data-track="vivere_type_click"
                onClick={() => trackClick("vivere_type_click", { to: l.slug })}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
              >
                <div className="flex items-center gap-2 text-[var(--terracotta)]">
                  <Compass size={15} strokeWidth={1.6} />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em]">Tipologia</span>
                </div>
                <h3 className="mt-3 font-serif text-xl leading-snug text-ink">{l.anchor}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">{l.note}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  Vedi la selezione <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            Per una vista d'insieme puoi partire dalle{" "}
            <Link to="/case-in-vendita-lunigiana" className="text-[var(--terracotta)] underline hover:no-underline">
              case in vendita in Lunigiana per tipologia
            </Link>{" "}
            oppure dai{" "}
            <Link to="/case-in-vendita" className="text-[var(--terracotta)] underline hover:no-underline">
              comuni della Lunigiana
            </Link>
            .
          </p>
        </div>
      </section>

      {/* COLLEGAMENTI + PRIMA/SECONDA CASA */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl space-y-14">
          {others
            .filter((s) => s.id !== "lunigiana")
            .map((s) => (
              <div key={s.id}>
                <h2 className="font-serif text-3xl text-ink md:text-4xl">{s.h2}</h2>
                <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
                  {s.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Cosa valutare prima di comprare casa
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Non è una lista tecnica, ma l'ordine con cui conviene ragionare durante le visite.
              Ogni punto va verificato sull'immobile reale, non sulla descrizione.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VP_CHECKLIST.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-5"
              >
                <CheckCircle2 size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--terracotta)]" />
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">{item.title}.</strong> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BLOCCO COMMERCIALE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Case in vendita a Pontremoli</h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Quando la zona e l'uso sono chiari, il passo successivo è guardare cosa è disponibile
            oggi. La pagina dedicata raccoglie gli immobili in vendita a Pontremoli, dal centro
            storico alle frazioni: la disponibilità varia nel tempo, quindi vale la pena tornare a
            controllarla o farsi segnalare le novità.
          </p>
          <Link
            to="/case-in-vendita/$comune"
            params={{ comune: "pontremoli" }}
            data-track="vivere_to_landing_click"
            onClick={() => trackClick("vivere_to_landing_click", { comune: "pontremoli" })}
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
          >
            Guarda le case in vendita a Pontremoli <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FAQ (HTML, nessun FAQPage JSON-LD) */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Domande frequenti</h2>
          <div className="mt-8 space-y-6">
            {VP_FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-xl leading-snug text-ink">{f.q}</h3>
                <p className="mt-3 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            Se vuoi conoscere meglio anche gli altri borghi della zona, la nostra{" "}
            <Link to="/territori" className="text-[var(--terracotta)] underline hover:no-underline">
              guida ai territori della Lunigiana
            </Link>{" "}
            è il punto di partenza, mentre la guida su{" "}
            <Link to="/vivere-in-lunigiana" className="text-[var(--terracotta)] underline hover:no-underline">
              vivere in Lunigiana
            </Link>{" "}
            allarga il confronto all&apos;intero comprensorio.
          </p>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Non trovi quello che stai cercando?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            Non tutto passa dalla vetrina e la disponibilità cambia. Raccontaci zona, uso previsto e
            caratteristiche indispensabili: ti scriviamo quando compare una casa coerente.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/trova-casa-lunigiana"
              data-track="vivere_finder_click"
              onClick={() => trackClick("vivere_finder_click", { source: "vivere_pontremoli" })}
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              Raccontaci che casa stai cercando a Pontremoli <ArrowRight size={14} />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="vivere_whatsapp_click"
              onClick={() => trackClick("vivere_whatsapp_click", { source: "vivere_pontremoli" })}
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              <MessageCircle size={16} strokeWidth={1.8} /> Scrivi a Elena
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
