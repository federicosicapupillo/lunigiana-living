import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedProperty, type PublicProperty } from "@/lib/public-properties.functions";
import { ArrowLeft, MapPin, Maximize2, BedDouble, Bath, Building2 } from "lucide-react";
import { useState } from "react";
import { VirtualStaging } from "@/components/virtual-staging";
import { WatermarkedImage } from "@/components/watermarked-image";

export const Route = createFileRoute("/immobili/$id")({
  loader: async ({ params }) => {
    const { property } = await getPublishedProperty({ data: { id: params.id } });
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.property;
    if (!p) return { meta: [{ title: "Immobile — Furia Immobiliare" }] };
    return {
      meta: [
        { title: `${p.title} a ${p.location} — ${p.reference} | Furia Immobiliare` },
        { name: "description", content: `${p.title} a ${p.location}. ${p.sqm ? p.sqm + ' m². ' : ''}${p.rooms ? p.rooms + ' locali. ' : ''}${p.price}.` },
        { property: "og:title", content: `${p.title} — ${p.location}` },
        { property: "og:description", content: p.description.slice(0, 200) },
        ...(p.image ? [{ property: "og:image", content: p.image }] : []),
      ],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <div className="container-editorial py-32 text-center">
      <p className="text-muted-foreground">Errore: {error.message}</p>
    </div>
  ),
  component: PropertyDetail,
});

function NotFound() {
  return (
    <div className="container-editorial py-32 text-center">
      <h1 className="font-serif text-4xl text-ink">Immobile non trovato</h1>
      <p className="mt-4 text-muted-foreground">L'annuncio che cerchi non è più disponibile.</p>
      <Link to="/immobili" className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground">
        Torna agli immobili
      </Link>
    </div>
  );
}

const DETAIL_KEYS = [
  "Tipologia", "Superficie", "Locali", "Camere", "Bagni", "Piano",
  "Riscaldamento", "Cucina", "Stato", "Arredamento", "Box", "Posto auto",
  "Giardino", "Terrazzo", "Balcone", "Cantina", "Ascensore",
  "Infissi interni", "Infissi esterni", "Classe energetica",
];

function PropertyDetail() {
  const { property: p } = Route.useLoaderData() as { property: PublicProperty };
  const [active, setActive] = useState(0);
  const main = p.gallery[active] || p.image;

  return (
    <article className="pb-24">
      {/* Header */}
      <header className="border-b border-border bg-muted/40 pb-8 pt-24 sm:pb-10 sm:pt-28 md:pt-36">
        <div className="container-editorial">
          <Link to="/immobili" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-ink">
            <ArrowLeft size={14} /> Torna agli immobili
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">{p.reference} · {p.type}</span>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">{p.title}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} /> {p.location}
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-muted-foreground">{p.category === "affitto" ? "Affitto" : "Prezzo"}</div>
              <div className="mt-2 font-serif text-2xl text-primary sm:text-3xl md:text-4xl">{p.price}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <section className="container-editorial mt-8 sm:mt-10">
        <div className="overflow-hidden rounded-sm bg-muted">
          <WatermarkedImage
            src={main}
            alt={p.title}
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 70vw"
            watermarkSize="lg"
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
          />
        </div>
        {p.gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
            {p.gallery.map((g: string, i: number) => (
              <button
                key={g + i}
                onClick={() => setActive(i)}
                className={`aspect-[4/3] overflow-hidden rounded-sm bg-muted transition ${
                  i === active ? "ring-2 ring-primary" : "opacity-75 hover:opacity-100"
                }`}
              >
                <WatermarkedImage src={g} alt="" loading="lazy" sizes="120px" watermark={false} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {/* Virtual staging AI CTA — subito dopo la galleria */}
        <VirtualStaging gallery={p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]} />
      </section>

      {/* Body */}
      <section className="container-editorial mt-12 grid gap-12 sm:mt-16 sm:gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="eyebrow">Descrizione</span>
          <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">L'immobile</h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
            {p.description || "Descrizione disponibile in agenzia."}
          </p>

          {/* Quick facts */}
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border md:grid-cols-4">
            {[
              { icon: Maximize2, label: "Superficie", value: p.sqmLabel ?? (p.sqm ? `${p.sqm} m²` : "—") },
              { icon: BedDouble, label: "Camere", value: p.roomsLabel ?? "—" },
              { icon: Bath, label: "Bagni", value: p.bathroomsLabel ?? "—" },
              { icon: Building2, label: "Piano", value: p.floor || "—" },
            ].map((f) => (
              <div key={f.label} className="bg-card p-5">
                <f.icon size={18} className="text-primary" />
                <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                <div className="mt-1 font-serif text-xl text-ink">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Full attributes */}
          <div className="mt-12">
            <span className="eyebrow">Dettagli</span>
            <h2 className="mt-3 font-serif text-3xl text-ink">Caratteristiche</h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {DETAIL_KEYS.filter((k) => p.attributes[k] && p.attributes[k].toLowerCase() !== "non indicato").map((k) => (
                <div key={k} className="flex justify-between border-b border-border py-3 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right text-ink">{p.attributes[k]}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Dotazioni */}
          {(p.amenities.length > 0 || p.altreDotazioni) && (
            <div className="mt-12">
              <span className="eyebrow">Dotazioni</span>
              <h2 className="mt-3 font-serif text-3xl text-ink">Cosa offre</h2>
              {p.amenities.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <li
                      key={a}
                      className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-wider text-ink"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              {p.altreDotazioni && (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                  {p.altreDotazioni}
                </p>
              )}
            </div>
          )}

          {/* Highlights: punti di forza, target, atmosfera, architettonici */}
          {p.highlights && p.highlights.length > 0 && (
            <div className="mt-12 space-y-8">
              {p.highlights.map((h) => (
                <div key={h.key}>
                  <span className="eyebrow">{h.label}</span>
                  {h.items.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {h.items.map((it) => (
                        <li
                          key={it}
                          className="rounded-sm border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs tracking-wide text-ink"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                  {h.note && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                      {h.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact card */}
        <aside className="md:col-span-5">
          <div className="sticky top-28 rounded-sm border border-border bg-card p-8">
            <div className="eyebrow">Contattaci</div>
            <h3 className="mt-3 font-serif text-2xl text-ink">
              Richiedi informazioni o una visita per <em className="italic">{p.reference}</em>
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Rispondiamo personalmente, di solito entro la giornata.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const body = encodeURIComponent(
                  `Richiesta informazioni per: ${p.reference} — ${p.title} (${p.location})\n\n` +
                  `Nome: ${data.get("nome")}\nEmail: ${data.get("email")}\nTelefono: ${data.get("telefono")}\n\nMessaggio:\n${data.get("messaggio")}`,
                );
                window.location.href = `mailto:furiaimmobiliare@libero.it?subject=Richiesta ${p.reference}&body=${body}`;
              }}
              className="mt-6 space-y-3"
            >
              <input name="nome" required placeholder="Nome e cognome" className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <input name="email" type="email" required placeholder="Email" className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <input name="telefono" placeholder="Telefono (facoltativo)" className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <textarea name="messaggio" rows={4} placeholder="Vorrei avere maggiori informazioni..." className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
              <button type="submit" className="w-full rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90">
                Richiedi informazioni o visita
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
              <div>oppure chiamaci</div>
              <a href="tel:+390187830229" className="mt-1 block font-serif text-xl text-ink">0187 830229</a>
              <a href="tel:+393207019985" className="block font-serif text-xl text-ink">320 7019985</a>
            </div>
          </div>
        </aside>
      </section>
    </article>
  );
}