import { createFileRoute, Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PropertyCard } from "@/components/property-card";
import { listPublishedProperties, type PublicProperty } from "@/lib/public-properties.functions";
import { useMemo, useState } from "react";

type PropertyCategory = PublicProperty["category"];

const searchSchema = z.object({
  type: fallback(z.string(), "").default(""),
  comune: fallback(z.string(), "").default(""),
  price: fallback(z.string(), "").default(""),
  size: fallback(z.string(), "").default(""),
  rooms: fallback(z.string(), "").default(""),
  features: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/immobili/")({
  validateSearch: zodValidator(searchSchema),
  loader: () => listPublishedProperties(),
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

const CATEGORIES: { id: PropertyCategory | "tutti"; label: string }[] = [
  { id: "tutti", label: "Tutti" },
  { id: "vendita", label: "Vendite" },
  { id: "affitto", label: "Affitti" },
  { id: "scelti-per-voi", label: "Scelti per voi" },
];

type SortKey = "featured" | "price-asc" | "price-desc";

function ImmobiliPage() {
  const { properties: allProperties } = Route.useLoaderData() as { properties: PublicProperty[] };
  const urlSearch = Route.useSearch();
  const navigate = useNavigate({ from: "/immobili" });
  const uniqueLocations = useMemo(
    () => Array.from(new Set(allProperties.map((p) => p.location).filter(Boolean))).sort(),
    [allProperties],
  );
  const [category, setCategory] = useState<PropertyCategory | "tutti">("tutti");
  const [location, setLocation] = useState<string>("tutte");
  const [sort, setSort] = useState<SortKey>("featured");

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

  const hasUrlFilters = !!(
    urlSearch.type || urlSearch.comune || urlSearch.price ||
    urlSearch.size || urlSearch.rooms || urlSearch.features
  );

  const clearUrlFilters = () => {
    navigate({ search: {} });
  };

  const filtered = useMemo(() => {
    let list = allProperties;
    if (category !== "tutti") list = list.filter((p) => p.category === category);
    if (location !== "tutte") list = list.filter((p) => p.location === location);

    // URL-based filters from home search
    if (urlSearch.type) {
      const t = urlSearch.type.toLowerCase();
      list = list.filter((p) => (p.type || "").toLowerCase().includes(t));
    }
    if (urlSearch.comune) {
      const c = urlSearch.comune.toLowerCase();
      list = list.filter((p) => (p.location || "").toLowerCase().includes(c));
    }
    const [priceLo, priceHi] = parseRange(urlSearch.price);
    if (priceLo != null || priceHi != null) {
      list = list.filter((p) => {
        if (p.priceValue == null) return false;
        if (priceLo != null && p.priceValue < priceLo) return false;
        if (priceHi != null && p.priceValue > priceHi) return false;
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
    if (sort === "price-asc") sorted.sort((a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity));
    if (sort === "price-desc") sorted.sort((a, b) => (b.priceValue ?? -1) - (a.priceValue ?? -1));
    return sorted;
  }, [allProperties, category, location, sort, urlSearch.type, urlSearch.comune, urlSearch.price, urlSearch.size, urlSearch.rooms, urlSearch.features]);

  return (
    <>
      <section className="border-b border-border bg-muted/40 pb-12 pt-32 md:pt-40">
        <div className="container-editorial">
          <span className="eyebrow">Immobili</span>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-ink md:text-6xl">
            La nostra selezione di case in Lunigiana.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            {allProperties.length} immobili reali importati dal nostro archivio.
            Filtra per categoria o comune per trovare il tuo posto.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                    category === c.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-[0.6rem]">Comune</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-sm border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="tutte">Tutti i comuni</option>
                {uniqueLocations.map((l: string) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            {hasUrlFilters && (
              <button
                onClick={clearUrlFilters}
                className="rounded-sm border border-border bg-card px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
              >
                Rimuovi filtri ricerca
              </button>
            )}
          </div>
          {hasUrlFilters && (
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Filtri attivi dalla home: {[
                urlSearch.type,
                urlSearch.comune,
                urlSearch.price && "prezzo",
                urlSearch.size && "superficie",
                urlSearch.rooms && `${urlSearch.rooms}+ camere`,
                urlSearch.features,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </section>

      <section className="container-editorial py-20">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-serif text-lg text-ink">{filtered.length}</span>{" "}
            immobili disponibili
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-sm text-foreground focus:outline-none"
          >
            <option value="featured">In evidenza</option>
            <option value="price-asc">Prezzo crescente</option>
            <option value="price-desc">Prezzo decrescente</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-muted-foreground">
              Nessun immobile corrisponde ai filtri selezionati.
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}

        <div className="mt-24 text-center">
          <p className="font-serif text-2xl italic text-foreground/70">
            Non trovi quello che cerchi?
          </p>
          <Link
            to="/contatti"
            className="mt-5 inline-block rounded-sm bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground"
          >
            Raccontaci la casa che cerchi
          </Link>
        </div>
      </section>
    </>
  );
}
