import { createFileRoute, Link } from "@tanstack/react-router";
import { PropertySearch } from "@/components/property-search";
import { PropertyCard } from "@/components/property-card";
import { allProperties } from "@/lib/properties";

export const Route = createFileRoute("/immobili")({
  head: () => ({
    meta: [
      { title: "Immobili in vendita in Lunigiana — Furia Immobiliare" },
      { name: "description", content: "Case, ville, rustici e appartamenti in vendita in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:title", content: "Immobili in Lunigiana — Furia Immobiliare" },
      { property: "og:description", content: "Una selezione curata di immobili in tutta la Lunigiana." },
    ],
    links: [{ rel: "canonical", href: "/immobili" }],
  }),
  component: ImmobiliPage,
});

function ImmobiliPage() {
  return (
    <>
      <section className="border-b border-border bg-muted/40 pb-12 pt-32 md:pt-40">
        <div className="container-editorial">
          <span className="eyebrow">Immobili</span>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-ink md:text-6xl">
            La nostra selezione di case in Lunigiana.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            Una raccolta curata di immobili, scelti per posizione, carattere e
            qualità del vivere. Affina la ricerca per trovare il tuo posto.
          </p>
          <div className="mt-10">
            <PropertySearch variant="page" />
          </div>
        </div>
      </section>

      <section className="container-editorial py-20">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-serif text-lg text-ink">{allProperties.length}</span>{" "}
            immobili disponibili
          </p>
          <select className="bg-transparent text-sm text-foreground focus:outline-none">
            <option>Più recenti</option>
            <option>Prezzo crescente</option>
            <option>Prezzo decrescente</option>
          </select>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {allProperties.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>

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