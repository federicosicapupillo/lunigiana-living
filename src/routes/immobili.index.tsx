import { createFileRoute, Link } from "@tanstack/react-router";
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

const searchSchema = z.object({
  contract: fallback(z.string(), "").default(""),
  featured: fallback(z.string(), "").default(""),
  type: fallback(z.string(), "").default(""),
  comune: fallback(z.string(), "").default(""),
  price_min: fallback(z.string(), "").default(""),
  price_max: fallback(z.string(), "").default(""),
  size: fallback(z.string(), "").default(""),
  rooms: fallback(z.string(), "").default(""),
  features: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/immobili/")({
  validateSearch: zodValidator(searchSchema),
  loader: () => listPublishedPropertiesSummary(),
  head: () => ({
    meta: [
      { title: "Immobili in vendita in Lunigiana — Furia Immobiliare" },
      { name: "description", content: "Case, ville, rustici e appartamenti in vendita in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:title", content: "Immobili in Lunigiana — Furia Immobiliare" },
      { property: "og:description", content: "Una selezione curata di immobili in tutta la Lunigiana." },
    ],
    links: [{ rel: "canonical", href: "/immobili" }],
  }),
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
  const urlSearch = Route.useSearch();
  const uniqueLocations = useMemo(
    () => Array.from(new Set(allProperties.map((p) => p.location).filter(Boolean))).sort(),
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

  const filtered = useMemo(() => {
    let list = allProperties;

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
    if (urlSearch.comune) {
      const c = urlSearch.comune.toLowerCase();
      list = list.filter((p) => (p.location || "").toLowerCase().includes(c));
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
  }, [allProperties, sort, urlSearch.contract, urlSearch.featured, urlSearch.type, urlSearch.comune, urlSearch.price_min, urlSearch.price_max, urlSearch.size, urlSearch.rooms, urlSearch.features]);

  return (
    <>
      <section className="border-b border-border bg-muted/40 pb-12 pt-32 md:pt-40">
        <div className="container-editorial">
          <span className="eyebrow">{t("list.eyebrow")}</span>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-ink md:text-6xl">
            {t("list.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            {allProperties.length} {t("list.intro")}
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
          <p className="text-sm text-muted-foreground">
            <span className="font-serif text-lg text-ink">{filtered.length}</span>{" "}
            {t("list.count.available")}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-muted-foreground">
              {t("list.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
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
    </>
  );
}
