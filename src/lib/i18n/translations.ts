export type Language = "it" | "en";

export const DEFAULT_LANGUAGE: Language = "it";

type Dict = Record<string, string>;

const it: Dict = {
  // Header / Nav
  "nav.home": "Home",
  "nav.immobili": "Immobili",
  "nav.territori": "Vivere in Lunigiana",
  "nav.servizi": "Servizi",
  "nav.chiSiamo": "Chi siamo",
  "nav.contatti": "Contatti",
  "nav.openMenu": "Apri menu",

  // Footer
  "footer.intro":
    "Da Pontremoli, accompagniamo chi cerca una casa di carattere in Lunigiana. Conosciamo i borghi, le pietre, le valli — e il loro modo di vivere.",
  "footer.contacts": "Contatti",
  "footer.navigate": "Naviga",
  "footer.adminArea": "Area riservata",
  "footer.rights": "Tutti i diritti riservati.",

  // CTA generic
  "cta.viewProperties": "Vedi gli immobili",
  "cta.discoverProperties": "Scopri gli immobili",
  "cta.searchYourHome": "Cerca la tua casa",
  "cta.allProperties": "Tutti gli immobili",
  "cta.contactUs": "Contattaci",
  "cta.talkToElena": "Parla con Elena",
  "cta.talkToElenaWA": "Parla con Elena su WhatsApp",
  "cta.requestInfo": "Richiedi informazioni",
  "cta.openListing": "Apri scheda",
  "cta.viewProperty": "Vedi immobile",
  "cta.infoOnWhatsapp": "Info su WhatsApp",
  "cta.writeOnWhatsapp": "Scrivi su WhatsApp",
  "cta.writeToElena": "Scrivi a Elena",
  "cta.exploreTerritory": "Esplora il territorio",
  "cta.ourStory": "La nostra storia",
  "cta.bookConsultation": "Prenota una consulenza",
  "cta.tellUsHome": "Raccontaci la casa che cerchi",

  // WhatsApp
  "wa.aria": "Scrivi a Elena su WhatsApp",
  "wa.defaultMsg":
    "Ciao Elena, sto cercando casa in Lunigiana e vorrei ricevere maggiori informazioni.",
  "wa.propertyMsgPrefix": "Ciao Elena, vorrei ricevere informazioni su questo immobile:",

  // Home
  "home.eyebrow": "Agenzia immobiliare · Pontremoli · Lunigiana",
  "home.hero.title1": "Case in vendita in Lunigiana,",
  "home.hero.title2": "scelte una per una.",
  "home.hero.lead":
    "Da 18 anni a Pontremoli. Elena e Cometa ti accompagnano a trovare la casa giusta in Lunigiana: visite sul posto, conoscenza reale dei borghi, nessuna pressione di vendita.",
  "home.hero.leadAlt":
    "Da 18 anni a Pontremoli. Case di pietra, ville panoramiche e dimore di carattere in tutta la Lunigiana — selezionate da chi questa terra la abita davvero.",
  "home.trust.years": "a Pontremoli",
  "home.trust.properties": "immobili trattati",
  "home.trust.comuni": "della Lunigiana",
  "home.trust.fiaip": "agenzia iscritta",
  "home.brand.eyebrow": "Chi siamo",
  "home.brand.title1": "Abitare la Lunigiana,",
  "home.brand.title2": "non solo comprarci casa.",
  "home.brand.p1":
    "Da anni a Pontremoli, Furia Immobiliare nasce da un legame profondo con questa terra di confine tra Toscana, Liguria ed Emilia. Conosciamo le pietre dei borghi, sappiamo dove la luce arriva la mattina, dove il bosco fa ombra in agosto.",
  "home.brand.p2":
    "Accompagniamo chi cerca casa con uno sguardo onesto: ti aiutiamo a scegliere non solo l'immobile, ma il contesto di vita giusto.",
  "home.featured.eyebrow": "Scelti per voi",
  "home.featured.title": "Immobili del momento",
  "home.lead.eyebrow": "Cerchi casa",
  "home.lead.title1": "Cerchi una casa",
  "home.lead.title2": "in Lunigiana?",
  "home.lead.subtitle":
    "Racconta a Elena cosa stai cercando. Ti aiuterà a capire quali immobili possono davvero fare al caso tuo.",
  "home.why.eyebrow": "Vivere in Lunigiana",
  "home.why.title": "Una terra che si misura in passi, non in orari.",
  "home.why.body":
    "Borghi medievali, castelli sulle colline, pievi romaniche, cammini storici, boschi di castagno e una cucina che racconta secoli di passaggi. La Lunigiana è una scelta di vita, prima ancora che una destinazione.",
  "home.territories.eyebrow": "Territori",
  "home.territories.title": "Sei modi diversi di abitare la stessa terra.",

  // Lead form
  "form.fullName": "Nome e cognome *",
  "form.email": "Email *",
  "form.phone": "Telefono / WhatsApp *",
  "form.area": "Comune o zona di interesse",
  "form.areaPh": "Es. Pontremoli, Val di Magra…",
  "form.budget": "Budget indicativo",
  "form.propertyType": "Tipologia desiderata",
  "form.message": "Messaggio",
  "form.messagePh":
    "Es. cerco una casa con giardino vicino a Pontremoli, possibilmente abitabile e con vista…",
  "form.select": "— Seleziona —",
  "form.privacy":
    "Acconsento al trattamento dei dati personali per essere ricontattato da Furia Immobiliare in merito alla mia richiesta.",
  "form.submit": "Invia la tua richiesta a Elena",
  "form.submitting": "Invio in corso…",
  "form.askQuick": "Preferisci fare prima una domanda veloce?",
  "form.thanks": "Grazie.",
  "form.thanksBody":
    "La tua richiesta è stata inviata. Elena ti ricontatterà appena possibile.",
  "form.err.required": "Compila i campi obbligatori.",
  "form.err.email": "Email non valida.",
  "form.err.privacy": "Devi accettare l'informativa privacy.",
  "form.err.tooFast": "Invio troppo rapido, riprova.",
  "form.err.generic": "Si è verificato un problema. Riprova o scrivici su WhatsApp.",

  // Search bar
  "search.tab.all": "Tutti",
  "search.tab.sale": "Vendita",
  "search.tab.rent": "Affitto",
  "search.featured": "Solo scelti per voi",
  "search.label.type": "Tipologia",
  "search.label.allTypes": "Tutte",
  "search.label.comune": "Comune",
  "search.label.allComuni": "Tutti i comuni",
  "search.label.priceMin": "Prezzo da",
  "search.label.priceMax": "Prezzo a",
  "search.label.rentMin": "Canone mensile da",
  "search.label.rentMax": "Canone mensile a",
  "search.label.size": "Superficie",
  "search.label.rooms": "Camere",
  "search.label.features": "Caratteristiche",
  "search.label.sort": "Ordina per",
  "search.featAll": "Tutte",
  "search.featSelected": "selezionate",
  "search.moreOptions": "Altri filtri",
  "search.search": "Cerca",
  "search.reset": "Cancella filtri",
  "search.clean": "Pulisci",
  "search.confirm": "Conferma",
  "search.errRange": "Controlla il range prezzo inserito.",
  "search.priceNoMin": "Nessun minimo",
  "search.priceNoMax": "Nessun massimo",

  // Property card
  "card.rooms": "locali",
  "card.epi": "IPE",

  // Contatti
  "contatti.eyebrow": "Contatti",
  "contatti.title1": "Raccontaci che casa",
  "contatti.title2": "stai cercando.",
  "contatti.lead":
    "Scrivi a Elena: ti aiuterà a capire quali immobili possono fare al caso tuo. Rispondiamo a tutti, di persona.",
  "contatti.agency": "Agenzia",
  "contatti.phone": "Telefono · Cellulare",
  "contatti.email": "Email",
  "contatti.wa": "WhatsApp",
  "contatti.waTitle": "Parla direttamente con Elena",
  "contatti.waBody":
    "Hai visto una casa che ti interessa o vuoi raccontarci cosa stai cercando? Scrivi a Elena su WhatsApp: ti risponderà appena possibile.",

  // Chi siamo
  "chi.eyebrow": "Chi siamo",
  "chi.title1": "Elena, Cometa",
  "chi.title2": "e le case che sanno di casa.",

  // Immobili list
  "list.eyebrow": "Immobili",
  "list.title": "La nostra selezione di case in Lunigiana.",
  "list.intro": "immobili reali importati dal nostro archivio. Filtra per categoria o comune per trovare il tuo posto.",
  "list.count.available": "immobili disponibili",
  "list.empty": "Nessun immobile corrisponde ai filtri selezionati.",
  "list.notFound": "Non trovi quello che cerchi?",

  // Servizi
  "servizi.title": "I nostri servizi",
  "servizi.subtitle":
    "Un metodo su misura, radicato nella Lunigiana. Ogni servizio è pensato per offrirti chiarezza, cura e risultati concreti, in ogni fase del tuo percorso immobiliare.",
  "servizi.ctaTitle": "Parliamone, senza fretta.",
};

const en: Dict = {
  // Header / Nav
  "nav.home": "Home",
  "nav.immobili": "Properties",
  "nav.territori": "Living in Lunigiana",
  "nav.servizi": "Services",
  "nav.chiSiamo": "About us",
  "nav.contatti": "Contact",
  "nav.openMenu": "Open menu",

  // Footer
  "footer.intro":
    "From Pontremoli, we help people find a home with character in Lunigiana. We know the villages, the stones, the valleys — and the way they live.",
  "footer.contacts": "Contact",
  "footer.navigate": "Navigate",
  "footer.adminArea": "Admin area",
  "footer.rights": "All rights reserved.",

  // CTA generic
  "cta.viewProperties": "View properties",
  "cta.discoverProperties": "Discover our properties",
  "cta.searchYourHome": "Find your home",
  "cta.allProperties": "All properties",
  "cta.contactUs": "Contact us",
  "cta.talkToElena": "Talk to Elena",
  "cta.talkToElenaWA": "Message Elena on WhatsApp",
  "cta.requestInfo": "Request information",
  "cta.openListing": "Open listing",
  "cta.viewProperty": "View property",
  "cta.infoOnWhatsapp": "Info on WhatsApp",
  "cta.writeOnWhatsapp": "Message on WhatsApp",
  "cta.writeToElena": "Message Elena",
  "cta.exploreTerritory": "Explore the area",
  "cta.ourStory": "Our story",
  "cta.bookConsultation": "Book a consultation",
  "cta.tellUsHome": "Tell us about the home you're looking for",

  // WhatsApp
  "wa.aria": "Message Elena on WhatsApp",
  "wa.defaultMsg":
    "Hi Elena, I'm looking for a home in Lunigiana and would love some more information.",
  "wa.propertyMsgPrefix": "Hi Elena, I'd like more information about this property:",

  // Home
  "home.eyebrow": "Real estate agency · Pontremoli · Lunigiana",
  "home.hero.title1": "Homes for sale in Lunigiana,",
  "home.hero.title2": "selected one by one.",
  "home.hero.lead":
    "18 years in Pontremoli. Elena and Cometa guide you to the right home in Lunigiana: in-person visits, real knowledge of the villages, no sales pressure.",
  "home.hero.leadAlt":
    "18 years in Pontremoli. Stone houses, panoramic villas and homes with character across Lunigiana — chosen by people who truly live in this land.",
  "home.trust.years": "in Pontremoli",
  "home.trust.properties": "properties handled",
  "home.trust.comuni": "of Lunigiana",
  "home.trust.fiaip": "registered agency",
  "home.brand.eyebrow": "About us",
  "home.brand.title1": "Living in Lunigiana,",
  "home.brand.title2": "not just buying a house here.",
  "home.brand.p1":
    "Based in Pontremoli for years, Furia Immobiliare was born from a deep bond with this borderland between Tuscany, Liguria and Emilia. We know the stones of the villages, where the morning light arrives, where the woods cast shade in August.",
  "home.brand.p2":
    "We guide buyers with an honest eye: helping you choose not just the property, but the right context for your life.",
  "home.featured.eyebrow": "Featured",
  "home.featured.title": "Properties of the moment",
  "home.lead.eyebrow": "Looking for a home",
  "home.lead.title1": "Looking for a home",
  "home.lead.title2": "in Lunigiana?",
  "home.lead.subtitle":
    "Tell Elena what you're looking for. She'll help you understand which properties truly suit you.",
  "home.why.eyebrow": "Living in Lunigiana",
  "home.why.title": "A land measured in footsteps, not in schedules.",
  "home.why.body":
    "Medieval villages, hilltop castles, Romanesque parishes, historic trails, chestnut forests and a cuisine that tells centuries of passage. Lunigiana is a way of life, before it is a destination.",
  "home.territories.eyebrow": "Territories",
  "home.territories.title": "Six different ways to inhabit the same land.",

  // Lead form
  "form.fullName": "Full name *",
  "form.email": "Email *",
  "form.phone": "Phone / WhatsApp *",
  "form.area": "Town or area of interest",
  "form.areaPh": "E.g. Pontremoli, Magra Valley…",
  "form.budget": "Indicative budget",
  "form.propertyType": "Property type",
  "form.message": "Message",
  "form.messagePh":
    "E.g. I'm looking for a house with a garden near Pontremoli, ideally move-in ready and with a view…",
  "form.select": "— Select —",
  "form.privacy":
    "I consent to the processing of my personal data so Furia Immobiliare can contact me regarding my request.",
  "form.submit": "Send your request to Elena",
  "form.submitting": "Sending…",
  "form.askQuick": "Prefer to ask a quick question first?",
  "form.thanks": "Thank you.",
  "form.thanksBody":
    "Your request has been sent. Elena will get back to you as soon as possible.",
  "form.err.required": "Please fill in the required fields.",
  "form.err.email": "Invalid email.",
  "form.err.privacy": "You must accept the privacy policy.",
  "form.err.tooFast": "Submitted too quickly, please try again.",
  "form.err.generic": "Something went wrong. Please try again or write to us on WhatsApp.",

  // Search bar
  "search.tab.all": "All",
  "search.tab.sale": "Sale",
  "search.tab.rent": "Rent",
  "search.featured": "Featured only",
  "search.label.type": "Property type",
  "search.label.allTypes": "All",
  "search.label.comune": "Location",
  "search.label.allComuni": "All locations",
  "search.label.priceMin": "Price from",
  "search.label.priceMax": "Price to",
  "search.label.rentMin": "Monthly rent from",
  "search.label.rentMax": "Monthly rent to",
  "search.label.size": "Surface area",
  "search.label.rooms": "Bedrooms",
  "search.label.features": "Features",
  "search.label.sort": "Sort by",
  "search.featAll": "All",
  "search.featSelected": "selected",
  "search.moreOptions": "More filters",
  "search.search": "Search",
  "search.reset": "Clear filters",
  "search.clean": "Clear",
  "search.confirm": "Confirm",
  "search.errRange": "Please check the price range.",
  "search.priceNoMin": "No minimum",
  "search.priceNoMax": "No maximum",

  // Property card
  "card.rooms": "rooms",
  "card.epi": "EPI",

  // Contatti
  "contatti.eyebrow": "Contact",
  "contatti.title1": "Tell us about the home",
  "contatti.title2": "you're looking for.",
  "contatti.lead":
    "Write to Elena: she'll help you understand which properties might suit you. We reply to everyone, personally.",
  "contatti.agency": "Agency",
  "contatti.phone": "Phone · Mobile",
  "contatti.email": "Email",
  "contatti.wa": "WhatsApp",
  "contatti.waTitle": "Talk directly to Elena",
  "contatti.waBody":
    "Have you seen a property that interests you, or want to tell us what you're looking for? Message Elena on WhatsApp: she'll reply as soon as possible.",

  // Chi siamo
  "chi.eyebrow": "About us",
  "chi.title1": "Elena, Cometa",
  "chi.title2": "and homes that truly feel like home.",

  // Immobili list
  "list.eyebrow": "Properties",
  "list.title": "Our selection of homes in Lunigiana.",
  "list.intro": "real properties from our archive. Filter by category or location to find your place.",
  "list.count.available": "properties available",
  "list.empty": "No properties match your selected filters.",
  "list.notFound": "Can't find what you're looking for?",

  // Servizi
  "servizi.title": "Our services",
  "servizi.subtitle":
    "A tailored method, rooted in Lunigiana. Every service is designed to give you clarity, care and concrete results at every stage of your real estate journey.",
  "servizi.ctaTitle": "Let's talk, without rush.",
};

const DICTS: Record<Language, Dict> = { it, en };

export function translate(key: string, lang: Language): string {
  const v = DICTS[lang]?.[key];
  if (v !== undefined) return v;
  // Fallback to Italian, then key
  return DICTS.it[key] ?? key;
}

/** Pick the right language version of a database field. Falls back to IT. */
export function pickLocalized<T extends string | null | undefined>(
  it: T,
  en: T,
  lang: Language,
): T {
  if (lang === "en" && en && String(en).trim().length > 0) return en;
  return it;
}