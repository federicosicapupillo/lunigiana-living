import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Home,
  MapPin,
  Eye,
  Handshake,
  Camera,
  BookOpen,
  Printer,
  Inbox,
  FileCheck,
  Calculator,
  Globe,
  MessageCircle,
  Mail,
  Ear,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { trackClick } from "@/lib/analytics";
import { LeadMagnetBlock } from "@/components/lead-magnet-block";
import { ReviewsTrustBlock } from "@/components/reviews-trust-block";

const WA_URL =
  "https://wa.me/393207019985?text=Ciao%20Elena,%20vorrei%20ricevere%20un%20primo%20orientamento%20sui%20vostri%20servizi.";

export const Route = createFileRoute("/servizi")({
  head: () => ({
    meta: [
      { title: "Servizi — Furia Immobiliare in Lunigiana" },
      { name: "description", content: "Ricerca su misura, consulenza, valutazioni, assistenza alla vendita e accompagnamento all'acquisto in Lunigiana." },
      { property: "og:title", content: "Servizi — Furia Immobiliare" },
      { property: "og:description", content: "Un servizio sartoriale, una conoscenza locale." },
    ],
    links: [{ rel: "canonical", href: "/servizi" }],
  }),
  component: ServiziPage,
});

function ServiziPage() {
  const t = useT();
  useLocalizedHead("seo.servizi.title", "seo.servizi.desc");

  const buyCards = [
    { icon: Compass, t: t("srv.buy.c1.t"), b: t("srv.buy.c1.b") },
    { icon: Home, t: t("srv.buy.c2.t"), b: t("srv.buy.c2.b") },
    { icon: Eye, t: t("srv.buy.c3.t"), b: t("srv.buy.c3.b") },
    { icon: MapPin, t: t("srv.buy.c4.t"), b: t("srv.buy.c4.b") },
    { icon: Handshake, t: t("srv.buy.c5.t"), b: t("srv.buy.c5.b") },
  ];

  const sellCards = [
    { icon: Calculator, t: t("srv.sell.c1.t"), b: t("srv.sell.c1.b") },
    { icon: Camera, t: t("srv.sell.c2.t"), b: t("srv.sell.c2.b") },
    { icon: BookOpen, t: t("srv.sell.c3.t"), b: t("srv.sell.c3.b") },
    { icon: Printer, t: t("srv.sell.c4.t"), b: t("srv.sell.c4.b") },
    { icon: Inbox, t: t("srv.sell.c5.t"), b: t("srv.sell.c5.b") },
    { icon: FileCheck, t: t("srv.sell.c6.t"), b: t("srv.sell.c6.b") },
  ];

  const abroadPoints = [
    t("srv.abroad.p1"),
    t("srv.abroad.p2"),
    t("srv.abroad.p3"),
    t("srv.abroad.p4"),
    t("srv.abroad.p5"),
    t("srv.abroad.p6"),
  ];

  const methodSteps = [
    { icon: Ear, t: t("srv.method.s1.t"), b: t("srv.method.s1.b") },
    { icon: MapPin, t: t("srv.method.s2.t"), b: t("srv.method.s2.b") },
    { icon: Search, t: t("srv.method.s3.t"), b: t("srv.method.s3.b") },
    { icon: Handshake, t: t("srv.method.s4.t"), b: t("srv.method.s4.b") },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--cream)] pb-20 pt-32 md:pt-40">
        <div className="container-editorial relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex h-16 w-12 items-center justify-center rounded-t-[28px] border border-[var(--terracotta)]/40 bg-[var(--warm-ivory)]/60 font-serif text-[1rem] tracking-[0.12em] text-[var(--terracotta)]">
              FI
            </div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
              {t("srv.hero.title")}
            </h1>
            <div className="mx-auto mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-[var(--terracotta)]/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[var(--terracotta)]" />
              <span className="h-px w-16 bg-[var(--terracotta)]/50" />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
              {t("srv.hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/contatti"
                data-track="services_cta_buy"
                onClick={() => trackClick("services_cta_buy", { source: "hero" })}
                className="inline-block rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
              >
                {t("srv.hero.ctaBuy")}
              </Link>
              <Link
                to="/contatti"
                data-track="services_cta_valuation"
                onClick={() => trackClick("services_cta_valuation", { source: "hero" })}
                className="inline-block rounded-sm border border-ink/30 bg-transparent px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
              >
                {t("srv.hero.ctaValuation")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOR BUYERS */}
      <section className="bg-[var(--warm-ivory)] py-24">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">{t("srv.buy.title")}</h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
              {t("srv.buy.intro")}
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {buyCards.map((c) => (
              <article
                key={c.t}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7 shadow-[0_10px_24px_-22px_rgba(36,23,17,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--terracotta)]/30 bg-[var(--warm-ivory)]">
                  <c.icon size={20} strokeWidth={1.5} className="text-[var(--terracotta)]" />
                </div>
                <h3 className="mt-5 font-serif text-xl leading-snug text-ink">{c.t}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">{c.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOR SELLERS */}
      <section className="bg-[var(--cream)] py-24">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">{t("srv.sell.title")}</h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
              {t("srv.sell.intro")}
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sellCards.map((c) => (
              <article
                key={c.t}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7 shadow-[0_10px_24px_-22px_rgba(36,23,17,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--terracotta)]/30 bg-[var(--cream)]">
                  <c.icon size={20} strokeWidth={1.5} className="text-[var(--terracotta)]" />
                </div>
                <h3 className="mt-5 font-serif text-xl leading-snug text-ink">{c.t}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">{c.b}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/contatti"
              data-track="services_cta_valuation"
              onClick={() => trackClick("services_cta_valuation", { source: "sell_section" })}
              className="inline-block rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              {t("srv.hero.ctaValuation")}
            </Link>
          </div>
        </div>
      </section>

      {/* ABROAD */}
      <section className="bg-[var(--warm-ivory)] py-24">
        <div className="container-editorial">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--terracotta)]/30 bg-[var(--cream)]">
                <Globe size={22} strokeWidth={1.4} className="text-[var(--terracotta)]" />
              </div>
              <h2 className="mt-5 font-serif text-3xl text-ink md:text-4xl">
                {t("srv.abroad.title")}
              </h2>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
                {t("srv.abroad.body")}
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track="services_cta_abroad"
                onClick={() =>
                  trackClick("services_cta_abroad", { source: "abroad_section", channel: "whatsapp" })
                }
                className="mt-8 inline-block rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
              >
                {t("srv.abroad.cta")}
              </a>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {abroadPoints.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-4"
                >
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-[var(--terracotta)]"
                  />
                  <span className="text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="bg-[var(--cream)] py-24">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">{t("srv.method.title")}</h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
              {t("srv.method.subtitle")}
            </p>
          </div>
          <ol className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((s, i) => (
              <li
                key={s.t}
                className="relative rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-[var(--terracotta)]/30" />
                </div>
                <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--terracotta)]/30 bg-[var(--cream)]">
                  <s.icon size={20} strokeWidth={1.5} className="text-[var(--terracotta)]" />
                </div>
                <h3 className="mt-5 font-serif text-lg leading-snug text-ink">{s.t}</h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-editorial pb-32 pt-8">
        <div className="mb-12">
          <ReviewsTrustBlock variant="compact" source="servizi" className="rounded-2xl bg-[var(--warm-ivory)] py-14 sm:py-16" />
        </div>
        <div className="mb-12">
          <LeadMagnetBlock source="servizi" />
        </div>
        <div className="rounded-sm bg-ink px-6 py-16 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            {t("srv.final.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            {t("srv.final.body")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="services_final_whatsapp"
              onClick={() =>
                trackClick("services_final_whatsapp", { source: "services_final", channel: "whatsapp" })
              }
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {t("srv.final.ctaWhatsapp")}
            </a>
            <Link
              to="/contatti"
              data-track="services_final_contact"
              onClick={() => trackClick("services_final_contact", { source: "services_final" })}
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              <Mail size={16} strokeWidth={1.8} />
              {t("srv.final.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}