import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchBar } from "@/components/property-search-bar";
import { listPublishedPropertiesSummary, type PublicProperty } from "@/lib/public-properties.functions";
import { getLocalizedProperties } from "@/lib/property-i18n.functions";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { localizePropertyDynamic } from "@/lib/i18n/property-localize";
import { TIPOLOGIE_SEO, localizeTipologiaSeo } from "@/lib/seo-tipologie";
import { siteUrl } from "@/lib/site-url";
import { collectionPageGraph } from "@/lib/structured-data";
import { propertyPath } from "@/lib/property-url";
import { comuneKey, normalizeComune } from "@/lib/comuni-ms";

// Tutti i parametri sono opzionali: se assenti dalla URL restano assenti
// (nessuna query string vuota generata dalla normalizzazione del router).
const searchSchema = z.object({
  contract: fallback(z.string(), "").optional(),
  featured: fallback(z.string(), "").optional(),
  type: fallback(z.string(), "").optional(),
  comune: fallback(z.string(), "").optional(),
  price_min: fallback(z.string(), "").optional(),
  price_max: fallback(z.string(), "").optional(),
  size: fallback(z.string(), "").optional(),
  rooms: fallback(z.string(), "").optional(),
  features: fallback(z.string(), "").optional(),
  sort: fallback(z.string(), "").optional(),
});

// Rimuove dalla URL i parametri di valore vuoto (equivalenti all'assenza).
const EMPTY_SEARCH = {
  contract: "",
  featured: "",
  type: "",
  comune: "",
  price_min: "",
  price_max: "",
  size: "",
  rooms: "",
  features: "",
  sort: "",
} as const;

export const Route = createFileRoute("/immobili/")({
  validateSearch: zodValidator(searchSchema),
  search: { middlewares: [stripSearchParams(EMPTY_SEARCH)] },
  loader: () => listPublishedPropertiesSummary(),
  head: ({ loaderData, match }) => {
    const url = siteUrl("/immobili");
    const title = "Immobili in Lunigiana | Ricerca e filtri | Furia Immobiliare";
    const description =
      "Catalogo completo degli immobili in Lunigiana con ricerca e filtri: vendita e affitto a Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri.";
    // Le URL con query parameter non sono landing autonome (canonical verso
    // /immobili): se un filtro è attivo l'elenco visibile è un sottoinsieme,
    // quindi l'ItemList viene omessa invece di dichiarare un catalogo diverso.
    const search = (match?.search ?? {}) as Record<string, string | undefined>;
    const hasActiveFilter = [
      "contract",
      "featured",
      "type",
      "comune",
      "price_min",
      "price_max",
      "size",
      "rooms",
      "features",
    ].some((k) => (search[k] ?? "") !== "");
    // L'elenco SSR della pagina canonica (senza filtri) è il catalogo completo
    // restituito dal loader: nessuna paginazione, nessun troncamento.
    const items = hasActiveFilter
      ? []
      : (loaderData?.properties ?? []).map((p) => ({
          url: siteUrl(propertyPath(p)),
          name: p.title,
        }));
    const ld = collectionPageGraph({ canonical: url, name: title, description, items });
    return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: "Immobili in Lunigiana — Furia Immobiliare" },
      { property: "og:description", content: "Una selezione curata di immobili in tutta la Lunigiana." },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-editorial py-32 text-center">
      <p className="text-muted-foreground">Errore nel caricamento: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-editorial py-32 text-center">
      <p className="text-muted-foreground">Nessun immobile disponibile.</p>
    </div>
  ),
  component: ImmobiliPage,
});

function ImmobiliPage() {
  const t = useT();
  const { language } = useLanguage();
  useLocalizedHead("seo.immobili.title", "seo.immobili.desc");
  const { properties: allProperties } = Route.useLoaderData() as { properties: PublicProperty[] };
  const localizeMany = useServerFn(getLocalizedProperties);
  const localizedQuery = useQuery({
    queryKey: ["properties-localized", language, allProperties.map((p) => p.id).join(",")],
    queryFn: () => localizeMany({ data: { ids: allProperties.map((p) => p.id), lang: language } }),
    enabled: language === "en" && allProperties.length > 0,
    staleTime: 1000 * 60 * 60,
  });
  const localizedById = useMemo(
    () => new Map((localizedQuery.data?.properties ?? []).map((p) => [p.id, p as PublicProperty])),
    [localizedQuery.data?.properties],
  );
  const rawSearch = Route.useSearch();
  // Normalizza undefined -> "" per mantenere invariata la logica dei filtri.
  const urlSearch = useMemo(
    () => ({
      contract: rawSearch.contract ?? "",
      featured: rawSearch.featured ?? "",
      type: rawSearch.type ?? "",
      comune: rawSearch.comune ?? "",
      price_min: rawSearch.price_min ?? "",
      price_max: rawSearch.price_max ?? "",
      size: rawSearch.size ?? "",
      rooms: rawSearch.rooms ?? "",
      features: rawSearch.features ?? "",
      sort: rawSearch.sort ?? "",
    }),
    [rawSearch],
  );
  const uniqueLocations = useMemo(
    () =>
      Array.from(
        new Set(
          allProperties
            // Normalizza i nomi (punti finali, spazi, maiuscole, accenti, zone)
            .map((p) => normalizeComune(p.municipality || p.location))
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "it")),
    [allProperties],
  );

  const sort = urlSearch.sort || "recent";

  const parseRange = (v: string): [number | null, number | null] => {
    if (!v) return [null, null];
    const [a, b] = v.split("-");
    const lo = a ? Number(a) : null;
    const hi = b ? Number(b) : null;
    return [Number.isFinite(lo as number) ? lo : null, Number.isFinite(hi as number) ? hi : null];
  };

  const featureTokens: string[] = urlSearch.features
    ? urlSearch.features.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const applyFilters = (source: PublicProperty[], withComune: boolean) => {
    let list = source;

    if (urlSearch.contract === "vendita" || urlSearch.contract === "affitto") {
      list = list.filter((p) => p.category === urlSearch.contract);
    }
    if (urlSearch.featured === "1") {
      list = list.filter((p) => p.featured);
    }

    if (urlSearch.type) {
      const t = urlSearch.type.toLowerCase();
      list = list.filter((p) => (p.type || "").toLowerCase().includes(t));
    }
    if (withComune && urlSearch.comune) {
      const c = comuneKey(urlSearch.comune);
      list = list.filter(
        (p) => comuneKey(p.municipality || p.location) === c,
      );
    }
    const priceLo = urlSearch.price_min ? Number(urlSearch.price_min) : null;
    const priceHi = urlSearch.price_max ? Number(urlSearch.price_max) : null;
    if (priceLo != null || priceHi != null) {
      list = list.filter((p) => {
        if (p.priceValue == null) return false;
        if (priceLo != null && Number.isFinite(priceLo) && p.priceValue < priceLo) return false;
        if (priceHi != null && Number.isFinite(priceHi) && p.priceValue > priceHi) return false;
        return true;
      });
    }
    const [sizeLo, sizeHi] = parseRange(urlSearch.size);
    if (sizeLo != null || sizeHi != null) {
      list = list.filter((p) => {
        if (p.sqm == null) return false;
        if (sizeLo != null && p.sqm < sizeLo) return false;
        if (sizeHi != null && p.sqm > sizeHi) return false;
        return true;
      });
    }
    if (urlSearch.rooms) {
      const n = Number(urlSearch.rooms);
      if (Number.isFinite(n)) {
        list = list.filter((p) => (p.rooms ?? -1) >= n);
      }
    }
    if (featureTokens.length) {
      list = list.filter((p) => {
        const haystack = [
          ...(p.amenities ?? []),
          ...(p.highlights ?? []).flatMap((h) => h.items),
          p.tag ?? "",
          p.type ?? "",
        ].join(" ").toLowerCase();
        return featureTokens.every((tok: string) => haystack.includes(tok));
      });
    }

    const sorted = [...list];
    if (sort === "recent") sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    if (sort === "price-asc") sorted.sort((a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity));
    if (sort === "price-desc") sorted.sort((a, b) => (b.priceValue ?? -1) - (a.priceValue ?? -1));
    if (sort === "size-asc") sorted.sort((a, b) => (a.sqm ?? Infinity) - (b.sqm ?? Infinity));
    if (sort === "size-desc") sorted.sort((a, b) => (b.sqm ?? -1) - (a.sqm ?? -1));
    return sorted;
  };

  const filtered = useMemo(
    () => applyFilters(allProperties, true),
    [allProperties, sort, urlSearch.contract, urlSearch.featured, urlSearch.type, urlSearch.comune, urlSearch.price_min, urlSearch.price_max, urlSearch.size, urlSearch.rooms, urlSearch.features],
  );

  // Nessun immobile nel comune scelto: proponiamo le altre disponibilità.
  const fallbackList = useMemo(
    () => (urlSearch.comune && filtered.length === 0 ? applyFilters(allProperties, false) : []),
    [filtered.length, allProperties, sort, urlSearch.contract, urlSearch.featured, urlSearch.type, urlSearch.comune, urlSearch.price_min, urlSearch.price_max, urlSearch.size, urlSearch.rooms, urlSearch.features],
  );
  const comuneLabel = normalizeComune(urlSearch.comune);
  const showFallback = fallbackList.length > 0;
  const visible = filtered.length > 0 ? filtered : showFallback ? fallbackList : [];

  return (
    <>
      <section className="border-b border-border bg-muted/40 pb-12 pt-32 md:pt-40">
        <div className="container-editorial">
          <span className="eyebrow">{t("list.eyebrow")}</span>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-ink md:text-6xl">
            {t("list.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            {t("list.intro")}
          </p>

          <div className="mt-10">
            <PropertySearchBar
              comuni={uniqueLocations}
              initial={{
                contract: (urlSearch.contract === "vendita" || urlSearch.contract === "affitto") ? urlSearch.contract : "",
                featured: urlSearch.featured === "1",
                type: urlSearch.type,
                comune: urlSearch.comune,
                price_min: urlSearch.price_min,
                price_max: urlSearch.price_max,
                size: urlSearch.size,
                rooms: urlSearch.rooms,
                features: urlSearch.features ? urlSearch.features.split(",").filter(Boolean) : [],
                sort: urlSearch.sort || "recent",
              }}
            />
          </div>
        </div>
      </section>

      <section className="container-editorial py-20">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-5">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            {t("list.count.available")}
          </p>
        </div>

        {showFallback && (
          <div className="mb-12 rounded-sm border border-warm-border bg-warm-ivory/70 px-6 py-7 text-center sm:px-10">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">
              {t("list.noneInComune.title").replace("{comune}", comuneLabel)}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground/75">
              {t("list.noneInComune.body")}
            </p>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-muted-foreground">
              {t("list.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <PropertyCard key={p.id} p={localizedById.get(p.id) ?? localizePropertyDynamic(p, language)} />
            ))}
          </div>
        )}

        <div className="mt-24 text-center">
          <p className="font-serif text-2xl italic text-foreground/70">
            {t("list.notFound")}
          </p>
          <Link
            to="/contatti"
            className="mt-5 inline-block rounded-sm bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground"
          >
            {t("list.tellUs")}
          </Link>
        </div>
      </section>

      {/* Cerca per tipologia — link interni alle pagine SEO tipologia */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow">{t("immobili.byType.eyebrow")}</span>
              <h2 className="mt-2 font-serif text-2xl text-ink md:text-3xl">
                {t("immobili.byType.title")}
              </h2>
            </div>
            <Link
              to="/case-in-vendita-lunigiana"
              className="text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] hover:underline"
            >
              {t("immobili.byType.viewAll")}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {TIPOLOGIE_SEO.map((tp) => {
              const L = localizeTipologiaSeo(tp, language);
              return (
                <Link
                  key={tp.slug}
                  to="/case-in-vendita-lunigiana/$tipologia"
                  params={{ tipologia: tp.slug }}
                  className="rounded-sm border border-border bg-background px-5 py-3 text-xs uppercase tracking-[0.18em] text-ink transition hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                >
                  {L.fullName}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trova la tua casa ideale — link discreto */}
      <section className="border-t border-border bg-warm-ivory/60 py-14">
        <div className="container-editorial flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl text-ink sm:text-2xl">{t("guided.linkBlock.title")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">
              {t("guided.linkBlock.body")}
            </p>
          </div>
          <Link
            to="/trova-casa-lunigiana"
            className="inline-flex items-center gap-2 rounded-sm bg-terracotta px-5 py-3 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-terracotta/90"
          >
            {t("guided.linkBlock.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
