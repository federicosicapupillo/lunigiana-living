import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n/LanguageContext";
import { Search, KeyRound, Home as HomeIcon, Globe, ArrowRight } from "lucide-react";

const WA_URL = "https://wa.me/393207019985?text=Ciao%20Elena,%20vorrei%20ricevere%20informazioni%20sulla%20Lunigiana%20e%20gli%20immobili.";

export function GuidedChoiceSection() {
  const t = useT();

  const cards = [
    {
      icon: Search,
      title: t("home.guided.card1.title"),
      body: t("home.guided.card1.body"),
      cta: t("home.guided.card1.cta"),
      href: "/contatti",
      track: "guided_choice_buy",
    },
    {
      icon: KeyRound,
      title: t("home.guided.card2.title"),
      body: t("home.guided.card2.body"),
      cta: t("home.guided.card2.cta"),
      href: "/contatti",
      track: "guided_choice_sell",
    },
    {
      icon: HomeIcon,
      title: t("home.guided.card3.title"),
      body: t("home.guided.card3.body"),
      cta: t("home.guided.card3.cta"),
      href: "/territori",
      track: "guided_choice_second_home",
    },
    {
      icon: Globe,
      title: t("home.guided.card4.title"),
      body: t("home.guided.card4.body"),
      cta: t("home.guided.card4.cta"),
      href: WA_URL,
      track: "guided_choice_abroad",
    },
  ];

  return (
    <section className="section-ivory border-y border-warm-border/40 py-16 sm:py-20 md:py-24">
      <div className="container-editorial">
        <div className="text-center">
          <span className="eyebrow">{t("home.guided.eyebrow")}</span>
          <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
            {t("home.guided.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70">
            {t("home.guided.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const isExternal = c.href.startsWith("http");
            const Cta = isExternal ? "a" : Link;
            const ctaProps = isExternal
              ? { href: c.href, target: "_blank", rel: "noopener noreferrer" }
              : { to: c.href };

            return (
              <div key={c.track} className="card-service flex flex-col text-left">
                <div className="icon-badge">
                  <c.icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-xl leading-snug text-ink">{c.title}</h3>
                <span className="title-rule" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">{c.body}</p>
                <Cta
                  {...ctaProps}
                  data-track={c.track}
                  className="btn-ghost mt-5 w-full text-center"
                >
                  {c.cta} <ArrowRight size={14} />
                </Cta>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
