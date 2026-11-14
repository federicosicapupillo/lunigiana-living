import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Editorial answers only; availability remains owned by the existing catalogue. */
export function PropertySearchAnswers({ area }: { area: "lunigiana" | "pontremoli" }) {
  const { language } = useLanguage();
  const en = language === "en";
  const pontremoli = area === "pontremoli";
  return (
    <section className="bg-warm-ivory py-16 md:py-20">
      <div className="container-editorial max-w-3xl">
        <h2 className="font-serif text-3xl text-ink md:text-4xl">
          {en ? "Finding your home: practical answers" : "Cercare casa: risposte pratiche"}
        </h2>
        <div className="mt-8 space-y-8 text-foreground/85">
          <div>
            <h3 className="font-serif text-2xl text-ink">
              {pontremoli
                ? (en ? "Where can I see homes for sale in Pontremoli?" : "Dove trovo le case in vendita a Pontremoli?")
                : (en ? "How can I search for homes in Lunigiana?" : "Come cerco una casa in vendita in Lunigiana?")}
            </h3>
            <p className="mt-3 leading-relaxed">
              {pontremoli
                ? (en ? "The listings above show published homes for sale in the municipality of Pontremoli. Each property page includes its location, photos, details and asking price, when disclosed. To compare other areas, browse " : "Gli annunci sopra mostrano gli immobili pubblicati in vendita nel comune di Pontremoli. Ogni scheda riporta località, foto, caratteristiche e prezzo richiesto, quando dichiarato. Per confrontare altre zone, consulta ")
                : (en ? "This page groups the search by property type: apartments, detached homes, villas, rustic houses and country homes. If location matters most, start with " : "Questa pagina raccoglie i percorsi per tipologia: appartamenti, case indipendenti, ville, rustici e casali. Se conta soprattutto la zona, parti dalle ")}
              <Link to="/case-in-vendita" className="text-primary underline hover:no-underline">
                {en ? "homes for sale by municipality" : "case in vendita per comune"}
              </Link>.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-ink">
              {pontremoli
                ? (en ? "How do I compare the town centre and hillside hamlets?" : "Come confronto centro e frazioni di Pontremoli?")
                : (en ? "Where can I compare listings and asking prices?" : "Dove confronto annunci e prezzi richiesti?")}
            </h3>
            <p className="mt-3 leading-relaxed">
              {pontremoli ? <>
                {en ? "Check the location of each listing, then compare everyday services, access and how you plan to use the home. The guide to " : "Controlla la località di ogni annuncio e confronta servizi quotidiani, accesso e uso previsto della casa. La guida per "}
                <Link to="/vivere-a-pontremoli" className="text-primary underline hover:no-underline">{en ? "living in Pontremoli" : "vivere a Pontremoli"}</Link>
                {en ? " covers the historic centre, residential areas and hamlets. For a specific property, ask the agency for details before arranging a viewing." : " presenta centro storico, zone residenziali e frazioni. Per un immobile specifico chiedi i dettagli all'agenzia prima di organizzare una visita."}
              </> : <>
                {en ? "The " : "Il "}
                <Link to="/immobili" className="text-primary underline hover:no-underline">{en ? "property catalogue" : "catalogo immobili"}</Link>
                {en ? " has filters for area, property type and price. Check the contract type on each listing: the catalogue also includes rentals. For context, read about " : " offre filtri per zona, tipologia e prezzo. Controlla il tipo di contratto nella scheda: il catalogo comprende anche locazioni. Per orientarti, leggi la guida ai "}
                <Link to="/prezzi-case-lunigiana" className="text-primary underline hover:no-underline">{en ? "asking prices in Lunigiana" : "prezzi richiesti in Lunigiana"}</Link>
                {en ? "; area averages are not valuations of individual homes." : ": le medie di zona non sono valutazioni di singole case."}
              </>}
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-ink">{en ? "How do I request information or a valuation?" : "Come chiedo informazioni o una valutazione?"}</h3>
            <p className="mt-3 leading-relaxed">
              {en ? "Use the contact options on the property page, or tell the agency what you need through the " : "Usa i contatti nella scheda dell'immobile oppure racconta all'agenzia cosa cerchi con la "}
              <Link to="/trova-casa-lunigiana" className="text-primary underline hover:no-underline">{en ? "guided home search" : "ricerca guidata"}</Link>.
              {en ? " If you want to sell, you can " : " Se vuoi vendere, puoi "}
              <Link to="/valuta-casa" className="text-primary underline hover:no-underline">{en ? "request a property valuation" : "richiedere una valutazione"}</Link>
              {en ? " by providing your property's details." : " indicando i dati della tua casa."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}