/**
 * Contenuti editoriali della pagina /off-market (Furia Off Market).
 *
 * Regole rispettate:
 *  - nessuna promessa di accesso esclusivo, immobili segreti o garanzie;
 *  - nessun dato inventato (clienti, richieste, statistiche, recensioni);
 *  - tono consulenziale: riservatezza + selezione + ricerca + matching.
 */

export const OM_META = {
  title: "Immobili Off Market in Toscana | Furia Immobiliare",
  description:
    "Furia Off Market: ricerca riservata per chi cerca casa e vendita riservata per chi preferisce non pubblicizzare subito il proprio immobile.",
  ogTitle: "Furia Off Market — Non tutte le case si vedono",
  ogDescription:
    "Ricerca riservata per gli acquirenti, vendita riservata per i proprietari. Riservatezza, selezione e incontro tra domanda e offerta.",
};

export const OM_HERO = {
  eyebrow: "Furia Off Market",
  h1: "Non tutte le case in vendita sono online.",
  body:
    "Alcuni proprietari preferiscono vendere con discrezione. Alcuni acquirenti stanno cercando qualcosa di molto preciso. Furia Off Market crea il punto d'incontro tra queste due esigenze.",
  ctaBuyer: "Sto cercando casa",
  ctaSeller: "Sto pensando di vendere",
};

export const OM_WHAT = {
  title: "Cos'è un immobile Off Market?",
  body:
    "È una proprietà disponibile alla vendita che, per scelta del proprietario o per strategia commerciale, non viene pubblicizzata sui normali portali oppure viene presentata inizialmente soltanto a potenziali acquirenti compatibili.",
  claim:
    "Off Market non significa necessariamente lusso. Significa soprattutto riservatezza e selezione.",
};

export const OM_PATHS = [
  {
    id: "buyer" as const,
    label: "Ricerca riservata",
    title: "Cerchi casa e non trovi quella giusta?",
    body:
      "Raccontaci cosa stai cercando. Possiamo registrare la tua richiesta e considerare anche proprietà gestite fuori dai normali canali pubblicitari.",
    cta: "Attiva la Ricerca Riservata",
  },
  {
    id: "seller" as const,
    label: "Vendita riservata",
    title: "Stai pensando di vendere senza pubblicare subito la tua casa?",
    body:
      "Possiamo valutare insieme una strategia riservata e verificare se tra le richieste che seguiamo esistono già acquirenti compatibili.",
    cta: "Scopri la Vendita Riservata",
  },
];

export const OM_STEPS = [
  {
    title: "Raccontaci la tua esigenza",
    body: "Cerchi un immobile oppure stai pensando di vendere.",
  },
  {
    title: "Furia analizza la richiesta",
    body: "Raccogliamo le informazioni realmente utili.",
  },
  {
    title: "Verifichiamo le compatibilità",
    body:
      "Mettiamo in relazione domanda e offerta quando esistono condizioni coerenti.",
  },
  {
    title: "Ti contattiamo direttamente",
    body:
      "Niente invii indiscriminati. Solo quando esiste un motivo concreto per approfondire.",
  },
];

export const OM_BUYER = {
  title: "La casa che cerchi potrebbe non essere ancora online.",
  body:
    "I portali mostrano gli immobili pubblicizzati. Una ricerca Furia può invece partire dalle tue esigenze.",
  points: [
    "Ricerca profilata sulle tue reali esigenze",
    "Accesso anche a eventuali proprietà non pubblicizzate",
    "Contatto diretto con l'agenzia, senza filtri",
    "Meno proposte casuali, più tempo risparmiato",
  ],
  cta: "Raccontaci cosa stai cercando",
};

export const OM_SELLER = {
  title: "Vendere casa non significa necessariamente pubblicarla subito.",
  body:
    "Alcuni proprietari preferiscono iniziare con discrezione, limitare l'esposizione dell'immobile oppure verificare prima la presenza di potenziali acquirenti compatibili.",
  points: [
    "Privacy sulla decisione di vendere",
    "Esposizione dell'immobile controllata",
    "Selezione dei contatti e delle visite",
    "Possibilità di valutare successivamente anche il mercato pubblico",
  ],
  cta: "Parliamone in modo riservato",
};

export const OM_PRINCIPLE = {
  claim: "Prima match. Poi, se serve, mercato.",
  body:
    "Per alcuni immobili possiamo iniziare verificando le richieste già presenti nel nostro network. Se la strategia Off Market non è quella più adatta, valuteremo insieme una commercializzazione tradizionale.",
};

export const OM_FAQ: { q: string; a: string }[] = [
  {
    q: "Cos'è un immobile Off Market?",
    a: "È un immobile disponibile alla vendita che non viene pubblicizzato sui normali portali, oppure che viene presentato inizialmente soltanto a potenziali acquirenti compatibili. La scelta dipende dal proprietario e dalla strategia concordata.",
  },
  {
    q: "Gli immobili Off Market sono necessariamente di lusso?",
    a: "No. Off Market indica il modo in cui l'immobile viene trattato, non la sua fascia di prezzo: riguarda riservatezza e selezione, non il livello dell'immobile.",
  },
  {
    q: "Iscrivendomi alla Ricerca Riservata ho la garanzia di ricevere immobili?",
    a: "No. La Ricerca Riservata permette a Furia Immobiliare di registrare le tue esigenze e di contattarti quando emerge una possibile compatibilità. Non è una garanzia di disponibilità di immobili.",
  },
  {
    q: "Posso vendere senza pubblicare fotografie e prezzo sui portali?",
    a: "Può essere valutata una strategia di vendita riservata, con esposizione limitata o assente sui portali. La fattibilità dipende dall'immobile, dal mercato di riferimento e dalle esigenze del proprietario: ne parliamo prima insieme.",
  },
  {
    q: "L'Off Market è sempre la scelta migliore per vendere?",
    a: "No. Alcuni immobili ottengono risultati migliori con una normale esposizione pubblica. Per questo valutiamo caso per caso e, se la vendita riservata non è la strada più adatta, lo diciamo chiaramente.",
  },
  {
    q: "Come faccio a entrare nella Ricerca Riservata?",
    a: "Compila il modulo dedicato agli acquirenti in questa pagina, indicando zona, tipologia e fascia di budget. Ti ricontattiamo per capire meglio la tua ricerca prima di qualsiasi proposta.",
  },
];

export const OM_FINAL = {
  title: "Da quale parte sei?",
  subtitle: "Stai cercando una casa o stai pensando di venderne una?",
};
