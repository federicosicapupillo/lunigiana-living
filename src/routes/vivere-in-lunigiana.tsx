import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Compass,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { whatsappUrl } from "@/components/whatsapp-float";
import { siteUrl } from "@/lib/site-url";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import {
  VL_ALTRI,
  VL_COMUNI,
  VL_CONS,
  VL_FAQ,
  VL_INTRO,
  VL_META,
  VL_METODO,
  VL_PROS,
  VL_SECTIONS_MID,
  VL_SECTIONS_TOP,
  VL_TIPOLOGIE_INTRO,
  VL_TYPE_LINKS,
} from "@/lib/vivere-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/vivere-in-lunigiana");

export const Route = createFileRoute("/vivere-in-lunigiana")({
  head: () => {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Territori", item: siteUrl("/territori") },
        { "@type": "ListItem", position: 3, name: "Vivere in Lunigiana", item: PAGE_URL },
      ],
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: VL_META.title,
      description: VL_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": `${siteUrl("/")}#website` },
      about: { "@id": `${PAGE_URL}#place` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    };
    const placeLd = {
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": `${PAGE_URL}#place`,
      name: "Lunigiana",
      description:
        "Area più settentrionale della Toscana, in provincia di Massa-Carrara, lungo la valle del fiume Magra tra Appennino e Alpi Apuane.",
    };
    return {
      meta: [
        { title: VL_META.title },
        { name: "description", content: VL_META.description },
        { property: "og:title", content: VL_META.title },
        { property: "og:description", content: VL_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(placeLd) },
      ],
    };
  },
  component: VivereLunigianaPage,
});

function VivereLunigianaPage() {
  const waHref = whatsappUrl(
    "Ciao Elena, sto valutando di trasferirmi in Lunigiana. Mi aiuti a capire da quale zona partire?",
  );
  const typeLinks = VL_TYPE_LINKS.filter((l) => TIPOLOGIE_SEO.some((t) => t.slug === l.slug));
  const comuni = VL_COMUNI.filter((c) => COMUNE_SEO.some((k) => k.slug === c.slug));

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
            <span className="text-ink">Vivere in Lunigiana</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <MapPin size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Lunigiana, Toscana</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {VL_META.h1}
          </h1>
          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            {VL_INTRO.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* DOVE / PER CHI / QUOTIDIANA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl space-y-14">
          {VL_SECTIONS_TOP.map((s) => (
            <div key={s.id}>
              <h2 className="font-serif text-3xl text-ink md:text-4xl">{s.h2}</h2>
              <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            Se il vostro interesse è già concentrato sulla parte alta della valle, la guida su{" "}
            <Link
              to="/vivere-a-pontremoli"
              data-track="vl_to_pontremoli_click"
              onClick={() => trackClick("vl_to_pontremoli_click", { source: "vivere_lunigiana" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              vivere a Pontremoli
            </Link>{" "}
            entra nel dettaglio di centro storico, zone residenziali e frazioni.
          </p>
        </div>
      </section>

      {/* DIFFERENZE TRA COMUNI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Le differenze tra i comuni della Lunigiana
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Dire &laquo;Lunigiana&raquo; non basta a orientare una ricerca: i comuni hanno scale,
              servizi e caratteri diversi. Qui sotto i riferimenti più frequenti nel nostro lavoro,
              con il taglio utile a capire quale può corrispondere alle vostre esigenze.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {comuni.map((c) => (
              <div
                key={c.slug}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-2xl text-ink">{c.nome}</h3>
                <div className="mt-4 space-y-3 text-[0.96rem] leading-[1.75] text-[var(--ink-soft)]">
                  {c.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <Link
                  to="/case-in-vendita/$comune"
                  params={{ comune: c.slug }}
                  data-track="vl_comune_click"
                  onClick={() => trackClick("vl_comune_click", { comune: c.slug })}
                  className="mt-5 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] hover:underline"
                >
                  Immobili a {c.nome} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-3xl">
            <h3 className="font-serif text-2xl text-ink">Altri borghi e frazioni</h3>
            <div className="mt-4 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              {VL_ALTRI.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Per un quadro d&apos;insieme del territorio può essere utile la{" "}
              <Link to="/territori" className="text-[var(--terracotta)] underline hover:no-underline">
                guida ai territori della Lunigiana
              </Link>
              , mentre l&apos;elenco completo dei{" "}
              <Link to="/case-in-vendita" className="text-[var(--terracotta)] underline hover:no-underline">
                comuni con immobili in vendita
              </Link>{" "}
              mostra dove c&apos;è disponibilità in questo momento.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Se la scelta della zona dipende anche dal budget, consulta i{" "}
              <Link
                to="/prezzi-case-lunigiana"
                data-track="vl_to_prezzi_click"
                onClick={() => trackClick("vl_to_prezzi_click", { source: "vivere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                prezzi delle case in Lunigiana nel 2026
              </Link>
              , comune per comune.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Se invece possiedi già una casa qui e stai pensando di venderla, la guida su{" "}
              <Link
                to="/come-vendere-casa-lunigiana"
                onClick={() => trackClick("vl_to_vendere_click", { source: "vivere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                come vendere casa in Lunigiana
              </Link>{" "}
              spiega i passaggi e cosa conviene controllare prima di iniziare.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Per capire quale comune si adatta meglio al tuo modo di vivere — servizi, collegamenti,
              borgo o fondovalle — abbiamo raccolto tutto nella guida su{" "}
              <Link
                to="/dove-comprare-casa-lunigiana"
                data-track="vl_to_dove_click"
                onClick={() => trackClick("vl_to_dove_click", { source: "vivere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                dove comprare casa in Lunigiana
              </Link>
              .
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Tutti i dati in un posto solo — quotazioni richieste e fotografia del nostro
              portafoglio, con metodologia e fonti — sono nell&apos;{" "}
              <Link
                to="/osservatorio-immobiliare-lunigiana"
                data-track="vl_to_osservatorio_click"
                onClick={() => trackClick("vl_to_osservatorio_click", { source: "vivere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                Osservatorio Immobiliare Lunigiana
              </Link>
              .
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Se invece stai pensando a una casa per weekend e vacanze, e non a un trasferimento,
              parti dalla guida su{" "}
              <Link
                to="/seconda-casa-lunigiana"
                data-track="vl_to_seconda_casa_click"
                onClick={() => trackClick("vl_to_seconda_casa_click", { source: "vivere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                la seconda casa in Lunigiana
              </Link>
              .
            </p>


          </div>
        </div>
      </section>

      {/* COLLEGAMENTI / LAVORO / PRIMA-SECONDA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl space-y-14">
          {VL_SECTIONS_MID.map((s) => (
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

      {/* TIPOLOGIE + CTA INTERMEDIA */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Che tipo di immobili si incontrano
            </h2>
            <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              {VL_TIPOLOGIE_INTRO.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typeLinks.map((l) => (
              <Link
                key={l.slug}
                to="/case-in-vendita-lunigiana/$tipologia"
                params={{ tipologia: l.slug }}
                data-track="vl_type_click"
                onClick={() => trackClick("vl_type_click", { to: l.slug })}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
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
          <Link
            to="/case-in-vendita-lunigiana"
            data-track="vl_to_hub_click"
            onClick={() => trackClick("vl_to_hub_click", { source: "vivere_lunigiana" })}
            className="mt-10 inline-flex items-center gap-2 rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
          >
            Vedi le case in vendita in Lunigiana <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* VANTAGGI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              I vantaggi reali del vivere in Lunigiana
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Sono i motivi che sentiamo ripetere più spesso da chi si è trasferito e, dopo qualche
              anno, rifarebbe la stessa scelta.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VL_PROS.map((item) => (
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

      {/* CRITICITÀ */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Criticità e aspetti da valutare
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Preferiamo dirle prima: conoscerle in anticipo evita scelte sbagliate e, quasi sempre,
              porta a una casa più adatta.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VL_CONS.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-5"
              >
                <AlertTriangle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--terracotta)]" />
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">{item.title}.</strong> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* METODO */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Come individuare comune e immobile più adatti
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            {VL_METODO.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <p className="mt-6 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            Se preferite partire dalle vostre esigenze anziché dagli annunci, il percorso guidato{" "}
            <Link
              to="/trova-casa-lunigiana"
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              trova casa in Lunigiana
            </Link>{" "}
            raccoglie zona, uso previsto e requisiti indispensabili.
          </p>
        </div>
      </section>

      {/* FAQ (HTML, nessun FAQPage JSON-LD) */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Domande frequenti</h2>
          <div className="mt-8 space-y-6">
            {VL_FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-xl leading-snug text-ink">{f.q}</h3>
                <p className="mt-3 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Vi accompagniamo nella scelta
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            Raccontateci come volete vivere la casa, in quale zona vi state orientando e quali sono i
            requisiti a cui non rinunciate: vi indichiamo cosa guardare e vi segnaliamo gli immobili
            coerenti, anche quando non sono in vetrina.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/immobili"
              data-track="vl_properties_click"
              onClick={() => trackClick("vl_properties_click", { source: "vivere_lunigiana" })}
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              Cerca tra gli immobili <ArrowRight size={14} />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="vl_whatsapp_click"
              onClick={() => trackClick("vl_whatsapp_click", { source: "vivere_lunigiana" })}
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} /> Scrivi a Elena
            </a>
            <Link
              to="/contatti"
              className="text-xs uppercase tracking-[0.22em] text-cream/75 transition hover:text-cream"
            >
              Contatta Furia Immobiliare
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
