import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, TrainFront, Car } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const railJourneys = [
  { route: "Pontremoli → La Spezia", time: { it: "Circa 49 minuti in media; 45 minuti per i collegamenti più veloci.", en: "Around 49 minutes on average; 45 minutes for the fastest services." }, source: "https://www.thetrainline.com/it/orari-treni/pontremoli-a-la-spezia" },
  { route: "Pontremoli → Parma", time: { it: "Circa 1 ora e 44 minuti in media; 1 ora e 22 minuti per i collegamenti più veloci.", en: "Around 1 hour 44 minutes on average; 1 hour 22 minutes for the fastest services." }, source: "https://www.thetrainline.com/it/orari-treni/pontremoli-a-parma" },
];

const guides = [
  { to: "/vivere-in-lunigiana", title: "Vivere in Lunigiana", body: { it: "Servizi, comuni e aspetti da valutare prima di trasferirsi.", en: "Services, towns and practical considerations before moving." } },
  { to: "/vivere-a-pontremoli", title: "Vivere a Pontremoli", body: { it: "Centro storico, zone residenziali e frazioni a confronto.", en: "Compare the historic centre, residential areas and outlying villages." } },
  { to: "/dove-comprare-casa-lunigiana", title: "Dove comprare casa in Lunigiana", body: { it: "Confronta le zone in base alle tue esigenze e alla ricerca della casa.", en: "Compare areas against your needs and property search." } },
] as const;

export function TerritoryConnections() {
  const { language } = useLanguage();
  const en = language === "en";
  return (
    <>
      <section aria-labelledby="territory-connections" className="bg-warm-ivory py-16 md:py-20">
        <div className="container-editorial">
          <span className="eyebrow">{en ? "Getting around" : "Come arrivare e spostarsi"}</span>
          <h2 id="territory-connections" className="mt-3 font-serif text-3xl text-ink md:text-4xl">{en ? "Lunigiana: roads, trains and journey times" : "Lunigiana: collegamenti e tempi di viaggio"}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-3 font-serif text-2xl text-ink"><Car size={22} className="text-primary" />{en ? "By car: A15 and SS62" : "In auto: A15 e SS62"}</h3>
              <p className="mt-4 leading-relaxed text-foreground/85">{en ? "From Parma, the A15 Cisa motorway leads towards La Spezia, with exits at Pontremoli and Aulla. From the coast, take the A12 and join the A15 towards Parma near La Spezia. The SS62 follows the Magra valley through Aulla, Villafranca and Filattiera to Pontremoli and the Cisa pass." : "Da Parma l'autostrada A15 della Cisa conduce verso La Spezia, con uscite a Pontremoli e Aulla. Dalla costa si arriva tramite la A12, imboccando la A15 verso Parma nei pressi della Spezia. La SS62 attraversa il fondovalle del Magra passando per Aulla, Villafranca e Filattiera fino a Pontremoli e al Passo della Cisa."}</p>
              <p className="mt-4 leading-relaxed text-foreground/85">{en ? "Driving times depend on the exact address, traffic and the final roads into hillside villages. Check the full route to the property, not just the motorway exit: a house in the valley and one in a remote hamlet have different access times." : "I tempi in auto dipendono dall'indirizzo preciso, dal traffico e dall'ultimo tratto verso le frazioni collinari. Verifica il percorso fino all'immobile, non solo al casello: una casa nel fondovalle e una in una frazione isolata hanno accessi diversi."}</p>
              <a href="https://visitlunigiana.it/la-lunigiana/come-arrivare/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-primary underline hover:no-underline">VisitLunigiana: {en ? "how to get there" : "come arrivare"}<ExternalLink size={14} /></a>
            </div>
            <div>
              <h3 className="flex items-center gap-3 font-serif text-2xl text-ink"><TrainFront size={22} className="text-primary" />{en ? "By train: the Parma–La Spezia line" : "In treno: la linea Parma–La Spezia"}</h3>
              <p className="mt-4 leading-relaxed text-foreground/85">{en ? "The Pontremolese line serves Pontremoli, Filattiera, Villafranca-Bagnone and Aulla Lunigiana. These stations are starting points for onward travel: not every hillside village is served directly by rail." : "La linea Pontremolese serve Pontremoli, Filattiera, Villafranca-Bagnone e Aulla Lunigiana. Le stazioni sono punti di partenza per gli spostamenti locali: non tutte le frazioni collinari sono raggiunte direttamente dalla ferrovia."}</p>
              <dl className="mt-5 divide-y divide-warm-border">
                {railJourneys.map((journey) => <div key={journey.route} className="py-4">
                  <dt className="font-semibold text-ink">{journey.route}</dt>
                  <dd className="mt-2 leading-relaxed text-foreground/85">{journey.time[language]} <a href={journey.source} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{en ? "Source: Trainline" : "Fonte: Trainline"}</a></dd>
                </div>)}
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{en ? "Indicative station-to-station times checked on 14 November 2026, not guaranteed timetables. They exclude waiting and travel to/from the station; services, stops and engineering works may change the journey." : "Tempi indicativi da stazione a stazione, consultati il 14 novembre 2026: non sono orari garantiti. Escludono attese e tragitti da e per la stazione; corse, fermate e lavori possono modificarli."}</p>
              <a href="https://www.trenitalia.com/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-primary underline hover:no-underline">{en ? "Check current services on Trenitalia" : "Verifica le corse aggiornate su Trenitalia"}<ExternalLink size={14} /></a>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="territory-guides" className="bg-warm-cream py-16 md:py-20">
        <div className="container-editorial">
          <span className="eyebrow">{en ? "Local guides · Italian" : "Guide locali"}</span>
          <h2 id="territory-guides" className="mt-3 font-serif text-3xl text-ink md:text-4xl">{en ? "Choose where to live in Lunigiana" : "Dove vivere e cercare casa in Lunigiana"}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {guides.map((guide) => <div key={guide.to} className="border-t border-warm-border pt-5">
              <h3 className="font-serif text-2xl text-ink"><Link to={guide.to} className="hover:text-primary">{guide.title}</Link></h3>
              <p className="mt-3 leading-relaxed text-foreground/85">{guide.body[language]}</p>
              <Link to={guide.to} className="mt-4 inline-flex items-center gap-2 text-primary underline hover:no-underline">{en ? "Read the guide in Italian" : "Leggi la guida"}<ArrowRight size={16} /></Link>
            </div>)}
          </div>
        </div>
      </section>
    </>
  );
}