/**
 * BLOCCO SEO 1B — contenuto editoriale delle pagine hub e delle due
 * landing locali principali (Pontremoli, Aulla).
 *
 * Regole rispettate:
 *  - nessun dato inventato (prezzi, distanze, tempi, statistiche);
 *  - nessun conteggio hardcoded di immobili nel testo editoriale;
 *  - FAQ come normale contenuto HTML (nessun FAQPage JSON-LD);
 *  - solo affermazioni geografiche generali già presenti nel progetto.
 */

export type Lang = "it" | "en";
export type Localized<T> = { it: T; en: T };
export type EditorialSection = { h2: string; paragraphs: string[]; id?: "types" };
export type Faq = { q: string; a: string };
export type ComuneLongform = { sections: EditorialSection[]; faq: Faq[] };

export function pick<T>(v: Localized<T>, lang: Lang): T {
  return lang === "en" ? v.en : v.it;
}

// ── HUB COMUNI (/case-in-vendita) ──────────────────────────────────────

export const HUB_COMUNI_INTRO: Localized<string[]> = {
  it: [
    "La Lunigiana non è un mercato unico: è un insieme di valli, borghi e paesi che si vivono in modo molto diverso tra loro. Scegliere prima la zona, e solo dopo l'immobile, è il modo più rapido per non perdere tempo su case che non corrispondono davvero al tipo di vita che hai in mente.",
    "Un appartamento in un centro storico servito, con negozi e stazione a piedi, risponde a esigenze diverse rispetto a una casa di collina circondata dal verde o a una proprietà di montagna più isolata. Cambia la quotidianità: la spesa, gli spostamenti, la manutenzione, la gestione dell'immobile quando non ci sei.",
    "Cambia anche l'uso che ne farai. Per un'abitazione principale contano i servizi quotidiani, i collegamenti e la vicinanza al lavoro; per una seconda casa pesano di più il paesaggio, la tranquillità e la facilità di gestione a distanza. Qui trovi i comuni in cui seguiamo abitualmente compravendite, ciascuno con il suo carattere.",
  ],
  en: [
    "Lunigiana is not a single market: it's a set of valleys, villages and small towns that are lived in very different ways. Choosing the area first, and the property second, is the fastest way to avoid spending time on homes that don't match the life you have in mind.",
    "An apartment in a well-served historic centre, with shops and the station within walking distance, answers different needs than a hillside house surrounded by greenery or a more secluded mountain property. Everyday life changes: shopping, travel, maintenance, looking after the house when you're away.",
    "The intended use matters too. For a main home, everyday services, connections and distance from work come first; for a second home, landscape, quiet and easy long-distance management weigh more. Below are the municipalities where we regularly follow sales, each with its own character.",
  ],
};

/** Microcopy unico per ciascun comune, mostrato nelle tile dell'hub. */
export const COMUNE_HUB_COPY: Record<string, Localized<string>> = {
  pontremoli: {
    it: "Il centro principale della Lunigiana: portici, pietra e un centro storico che si vive tutti i giorni, con servizi, scuole, stazione e casello autostradale. È la scelta di chi vuole restare in un contesto urbano raccolto senza rinunciare alla comodità degli spostamenti, sia come casa principale sia come seconda casa abitabile tutto l'anno.",
    en: "The main town of Lunigiana: arcades, stone and a historic centre that is genuinely lived in every day, with services, schools, a railway station and a motorway exit. The choice for those who want a compact urban setting without giving up easy travel, either as a main home or as a second home usable all year round.",
  },
  bagnone: {
    it: "Un borgo raccolto e ben tenuto, con il torrente che scorre tra le case e il mercato settimanale che porta vita in piazza. Il contesto è più intimo rispetto a Pontremoli: chi sceglie qui cerca in genere una casa con carattere, ritmi lenti e una comunità di paese in cui ci si riconosce.",
    en: "A compact, well-kept village, with the stream running between the houses and a weekly market that brings the square to life. The setting is more intimate than Pontremoli: buyers here usually look for a home with character, slower rhythms and a village community where people know each other.",
  },
  villafranca: {
    it: "Posizione centrale nella valle e carattere prevalentemente residenziale: Villafranca in Lunigiana è comoda per chi si muove spesso tra i comuni della zona e preferisce abitazioni pratiche, con spazi regolari e accesso semplice alle strade principali della vallata.",
    en: "A central position in the valley and a mainly residential character: Villafranca in Lunigiana suits those who move often between the local municipalities and prefer practical homes, with regular spaces and easy access to the valley's main roads.",
  },
  filattiera: {
    it: "Borghi, pievi e campagna abitata in modo discreto. Filattiera è la zona giusta per chi immagina una casa immersa nel paesaggio rurale, con verde attorno e nuclei abitati piccoli, restando comunque all'interno del fondovalle e delle sue direttrici principali.",
    en: "Villages, Romanesque churches and quietly inhabited countryside. Filattiera suits those imagining a home set in a rural landscape, with greenery around and small settlements, while still remaining close to the valley floor and its main routes.",
  },
  mulazzo: {
    it: "Territorio collinare fatto di piccoli nuclei e case sparse, con scorci lunghi sulla vallata. È una scelta coerente per chi mette al primo posto panorama e silenzio, ed è disposto a una vita più appartata, spesso legata a case indipendenti o rustici da recuperare.",
    en: "Hill country made of small hamlets and scattered houses, with long views over the valley. A coherent choice for those who put landscape and silence first, and accept a more secluded life, often in detached houses or rustic properties to restore.",
  },
  zeri: {
    it: "La Lunigiana di montagna: boschi, pascoli, frazioni distanti tra loro e un isolamento maggiore rispetto al fondovalle. Chi sceglie Zeri cerca natura vera e disponibilità a gestire una casa in un contesto montano, spesso con terreno o annessi.",
    en: "The mountain side of Lunigiana: woods, pastures, hamlets far from one another and a greater sense of isolation than the valley floor. Buyers here look for real nature and are ready to manage a home in a mountain setting, often with land or outbuildings.",
  },
  aulla: {
    it: "Il punto di accesso della Lunigiana: qui convergono la ferrovia, il casello autostradale e le strade che portano verso la costa e la Toscana. È la zona di chi mette al primo posto i collegamenti e i servizi quotidiani, più che il contesto di borgo.",
    en: "The gateway to Lunigiana: the railway, the motorway exit and the roads towards the coast and Tuscany all meet here. It suits those who put connections and everyday services first, rather than a village setting.",
  },
};

// ── HUB TIPOLOGIE (/case-in-vendita-lunigiana) ─────────────────────────

export const HUB_TIPOLOGIE_INTRO: Localized<string[]> = {
  it: [
    "Il tipo di immobile giusto dipende quasi sempre da come intendi usarlo. Prima ancora del numero di stanze o della metratura, conviene chiedersi se stai cercando l'abitazione in cui vivere tutto l'anno, una casa da usare nei fine settimana e in estate, oppure una proprietà su cui intervenire con calma nel tempo.",
    "Per un'abitazione principale contano i servizi a portata di mano, il riscaldamento, la manutenzione ordinaria e la facilità di spostamento. Per una seconda casa pesano di più la gestione a distanza, la sicurezza nei mesi in cui non ci sei e la sostenibilità dei lavori. Chi si trasferisce, invece, guarda spesso all'indipendenza degli spazi e alla possibilità di adattarli nel tempo.",
    "Cambia anche il rapporto con l'esterno. Un appartamento in centro storico riduce le incombenze e ti mette a due passi da tutto; una casa indipendente o un rustico ti danno autonomia, spazio e più libertà di intervento, ma richiedono attenzione e una manutenzione costante. Uno spazio esterno reale — corte, orto, giardino — cambia radicalmente il modo di abitare.",
    "Qui sotto trovi le tipologie in cui suddividiamo gli immobili in vendita che seguiamo in Lunigiana. Ogni pagina raccoglie solo proprietà coerenti con quella categoria, così puoi partire dall'uso che hai in mente invece che dal singolo annuncio.",
  ],
  en: [
    "The right kind of property almost always depends on how you intend to use it. Even before rooms and square metres, it's worth asking whether you're looking for a home to live in all year, a house for weekends and summers, or a property to work on gradually over time.",
    "For a main home, nearby services, heating, routine maintenance and easy travel come first. For a second home, long-distance management, security during the months you're away and the feasibility of any works matter more. Those relocating often look instead at independent spaces and the freedom to adapt them over the years.",
    "The relationship with the outdoors changes too. An apartment in a historic centre reduces chores and puts you within walking distance of everything; a detached house or a rustic property gives you autonomy, space and more freedom to intervene, but calls for constant care. Real outdoor space — a courtyard, a kitchen garden, a lawn — changes the way you live entirely.",
    "Below are the categories we use for the properties for sale we follow in Lunigiana. Each page gathers only homes that genuinely belong to that category, so you can start from the use you have in mind rather than from a single listing.",
  ],
};

/** Microcopy unico per ciascuna landing tipologica (hub tile). */
export const TIPOLOGIA_HUB_COPY: Record<string, Localized<string>> = {
  "rustici-casali": {
    it: "Case in pietra, casali e abitazioni storiche di borgo: immobili con carattere rurale, spesso da recuperare in tutto o in parte. Adatti a chi vuole riportare in vita un edificio antico e accetta un percorso di ristrutturazione con tempi e scelte progettuali proprie.",
    en: "Stone houses, farmhouses and historic village homes: properties with a rural character, often to be restored in whole or in part. Suited to those who want to bring an old building back to life and accept a renovation path with its own timing and design choices.",
  },
  "case-indipendenti": {
    it: "Abitazioni senza spazi condivisi, con accessi propri e in genere pertinenze esterne. La scelta di chi cerca autonomia, spazio e libertà di intervenire sulla casa senza dipendere da decisioni condominiali.",
    en: "Homes with no shared spaces, their own entrances and usually some outdoor area. The choice for those seeking autonomy, space and the freedom to work on the house without depending on condominium decisions.",
  },
  appartamenti: {
    it: "Soluzioni in centro o in contesti serviti, con manutenzione più contenuta e spese prevedibili. Funzionano bene come prima casa pratica, come base per chi si sposta spesso e come seconda casa facile da lasciare chiusa.",
    en: "Homes in town centres or well-served settings, with lighter maintenance and predictable running costs. They work well as a practical first home, as a base for frequent travellers and as a second home that's easy to leave closed.",
  },
  ville: {
    it: "Proprietà di metratura importante, con spazi esterni ampi e maggiore riservatezza. Per chi cerca una casa di rappresentanza o semplicemente più respiro, dentro e fuori, e può gestirne la cura nel tempo.",
    en: "Larger properties, with generous outdoor space and greater privacy. For those looking for a statement home, or simply for more room inside and out, and able to look after it over time.",
  },
  "case-con-giardino": {
    it: "Immobili con spazio esterno di proprietà: corte, orto o giardino vero, non solo un balcone. Selezione basata sul dato di scheda dell'immobile, utile a chi ha bambini, animali o semplicemente vuole vivere all'aperto.",
    en: "Properties with their own outdoor space: a courtyard, a kitchen garden or a real garden, not just a balcony. The selection is based on the property record, useful for families, pet owners or anyone who wants to live outdoors.",
  },
  "case-economiche": {
    it: "Selezione di immobili in vendita con prezzo richiesto fino a 100.000 €. Sono in genere case da rivedere o soluzioni compatte: il criterio è solo il prezzo, non lo stato di conservazione, quindi vanno valutate una per una.",
    en: "A selection of properties for sale with an asking price up to €100,000. Usually homes to refresh or compact solutions: the criterion is price alone, not condition, so each one deserves an individual assessment.",
  },
  "seconde-case": {
    it: "Immobili la cui descrizione suggerisce un uso come casa vacanza o abitazione di fine settimana. È una lettura indicativa e non una categoria catastale: se hai un'esigenza precisa, verifichiamo insieme se la casa è davvero adatta.",
    en: "Properties whose description suggests use as a holiday or weekend home. It is an indicative reading rather than a formal category: if you have a precise need, we can check together whether the house really fits.",
  },
};

// ── LANDING LOCALI (Pontremoli, Aulla) ─────────────────────────────────

export const COMUNE_LONGFORM: Record<string, Localized<ComuneLongform>> = {
  pontremoli: {
    it: {
      sections: [
        {
          h2: "Comprare casa a Pontremoli",
          paragraphs: [
            "Chi cerca casa a Pontremoli si trova davanti a scenari abitativi piuttosto diversi tra loro, e la scelta iniziale conta più di quanto sembri. Nel centro storico si trovano soprattutto appartamenti e case di paese in pietra, spesso su più livelli, con la comodità di avere negozi, uffici e vita quotidiana a pochi passi dalla porta di casa.",
            "Le zone residenziali attorno al centro offrono invece soluzioni più regolari, con spazi distribuiti in modo lineare, posti auto più semplici da gestire e talvolta un piccolo esterno di pertinenza. Sono una risposta pratica per chi vuole restare in città senza le caratteristiche tipiche degli edifici storici.",
            "Salendo verso le frazioni e la collina il rapporto si ribalta: prevalgono case indipendenti, rustici e proprietà con terreno, con più verde attorno e maggiore riservatezza. In cambio serve mettere in conto spostamenti in auto per i servizi quotidiani e una manutenzione più impegnativa.",
            "L'uso che farai della casa orienta la decisione. Per un'abitazione principale contano scuole, sanità, collegamenti e riscaldamento; per una seconda casa pesano di più la facilità di gestione a distanza e la possibilità di lasciarla chiusa senza preoccupazioni per lunghi periodi.",
          ],
        },
        {
          h2: "Che tipo di immobili puoi trovare",
          id: "types",
          paragraphs: [
            "L'offerta di Pontremoli è la più varia della Lunigiana: qui trovi sia soluzioni pronte da abitare sia immobili su cui intervenire. Da queste pagine puoi partire dalla tipologia che ti interessa e vedere le proprietà coerenti in tutta la valle, Pontremoli inclusa.",
          ],
        },
        {
          h2: "Vivere a Pontremoli",
          paragraphs: [
            "Pontremoli è una piccola città di pietra e portici attraversata dal Magra, con un centro storico che non è una quinta scenografica ma un luogo abitato: botteghe, servizi, scuole e una comunità che riempie le piazze durante l'anno. Sopra il centro domina il Castello del Piagnaro, che resta il riferimento visivo di tutta la valle.",
            "Sul piano dei collegamenti, la città ha una stazione ferroviaria sulla linea Parma–La Spezia e un casello autostradale sulla A15, che la rendono raggiungibile sia dalla costa ligure sia dalla pianura padana. È uno dei motivi per cui molti acquirenti, anche stranieri, scelgono Pontremoli come base fissa invece di una località più isolata.",
            "Il resto lo fa il contesto: mercati, feste tradizionali, il fiume e i sentieri che partono dalla valle. È una città in cui si può vivere tutto l'anno, e questo la rende adatta anche a chi compra una seconda casa ma non vuole un paese che si svuota fuori stagione.",
          ],
        },
      ],
      faq: [
        {
          q: "Quali tipi di case si trovano a Pontremoli?",
          a: "Soprattutto appartamenti e case di paese nel centro storico, soluzioni residenziali nelle zone attorno al centro e case indipendenti, rustici o proprietà con terreno nelle frazioni e in collina. La disponibilità cambia nel tempo: le proprietà che seguiamo in questo momento sono elencate qui sopra.",
        },
        {
          q: "Posso cercare una casa con giardino a Pontremoli?",
          a: "Sì. Le case con spazio esterno di proprietà sono più frequenti nelle frazioni e in collina, ma capitano anche vicino al centro. Se è un requisito irrinunciabile, dillo subito: filtriamo la ricerca su questo criterio invece di farti vedere tutto.",
        },
        {
          q: "Furia Immobiliare può cercare anche immobili non presenti sul sito?",
          a: "Sì. Il sito mostra le proprietà attualmente in pubblicazione, ma parte del lavoro consiste nel cercare la casa giusta sul territorio a partire dalla tua richiesta. Se ci racconti cosa stai cercando, ti diciamo con franchezza se è realistico e cosa possiamo fare.",
        },
      ],
    },
    en: {
      sections: [
        {
          h2: "Buying a home in Pontremoli",
          paragraphs: [
            "Anyone looking for a home in Pontremoli faces quite different scenarios, and that first choice matters more than it seems. The historic centre mostly offers apartments and stone town houses, often on several levels, with shops, offices and daily life a few steps from the front door.",
            "The residential areas around the centre offer more regular layouts, easier parking and sometimes a small private outdoor area. A practical answer for those who want to stay in town without the typical features of historic buildings.",
            "Moving up towards the hamlets and the hills the balance reverses: detached houses, rustic properties and homes with land prevail, with more greenery and greater privacy. In exchange, you should count on driving for everyday services and on heavier maintenance.",
            "How you'll use the house guides the decision. For a main home, schools, healthcare, connections and heating matter; for a second home, easy long-distance management and being able to leave it closed for long periods weigh more.",
          ],
        },
        {
          h2: "What kind of properties you can find",
          id: "types",
          paragraphs: [
            "Pontremoli has the most varied offer in Lunigiana: both move-in-ready homes and properties to work on. From these pages you can start from the category you're interested in and see coherent properties across the whole valley, Pontremoli included.",
          ],
        },
        {
          h2: "Living in Pontremoli",
          paragraphs: [
            "Pontremoli is a small stone town of arcades crossed by the Magra river, with a historic centre that is not a stage set but a lived-in place: shops, services, schools and a community that fills the squares through the year. Above it stands the Castello del Piagnaro, the visual landmark of the whole valley.",
            "In terms of connections, the town has a railway station on the Parma–La Spezia line and an exit on the A15 motorway, which make it reachable both from the Ligurian coast and from the Po valley. It's one of the reasons many buyers, including foreign ones, choose Pontremoli as a permanent base rather than a more isolated village.",
            "The rest is context: markets, traditional festivals, the river and the trails that start from the valley. It's a town you can live in all year, which also makes it suitable for second-home buyers who don't want a village that empties out of season.",
          ],
        },
      ],
      faq: [
        {
          q: "What kind of homes can you find in Pontremoli?",
          a: "Mostly apartments and town houses in the historic centre, residential homes in the areas around it, and detached houses, rustic properties or homes with land in the hamlets and hills. Availability changes over time: the properties we currently follow are listed above.",
        },
        {
          q: "Can I look for a house with a garden in Pontremoli?",
          a: "Yes. Homes with their own outdoor space are more frequent in the hamlets and on the hills, but they also come up near the centre. If it's a must-have, tell us straight away: we filter the search on that criterion instead of showing you everything.",
        },
        {
          q: "Can Furia Immobiliare also look for properties that aren't on the website?",
          a: "Yes. The site shows the properties currently published, but part of our work is searching the area for the right house starting from your request. Tell us what you're looking for and we'll say frankly whether it's realistic and what we can do.",
        },
      ],
    },
  },

  aulla: {
    it: {
      sections: [
        {
          h2: "Vivere ad Aulla",
          paragraphs: [
            "Aulla si trova nella parte bassa della Lunigiana, dove il torrente Aulella confluisce nel fiume Magra: una posizione che ne ha fatto storicamente un punto di passaggio e che ancora oggi ne definisce il carattere. È il luogo in cui le direttrici della valle si incontrano prima di proseguire verso la costa o verso l'interno.",
            "Questa funzione di nodo si riflette nella vita quotidiana. Aulla dispone di una stazione ferroviaria e di un casello sulla A15: chi si sposta spesso tra Lunigiana, costa ligure e Toscana trova qui una comodità che nei borghi collinari non esiste. È un aspetto che pesa molto per chi lavora fuori zona o riceve ospiti con frequenza.",
            "Sul piano storico e paesaggistico i due riferimenti sono l'Abbazia di San Caprasio, nel centro, e la Fortezza della Brunella, che domina l'abitato dall'alto. Attorno al centro il territorio comunale comprende frazioni più tranquille, con un contesto meno urbano e più vicino alla campagna lunigianese.",
          ],
        },
        {
          h2: "Che tipo di casa cercare ad Aulla",
          paragraphs: [
            "In una zona di fondovalle e di collegamento come questa, le esigenze più frequenti riguardano abitazioni pratiche: appartamenti in contesti serviti, case semindipendenti, soluzioni con posto auto e con spazi facili da gestire tutto l'anno. Chi cerca casa ad Aulla di solito parte proprio dalla comodità degli spostamenti.",
            "Nelle frazioni il quadro cambia: prevalgono soluzioni più isolate, case indipendenti o proprietà con un po' di terreno, con più verde attorno e meno servizi a piedi. È la scelta di chi vuole i collegamenti del fondovalle ma preferisce vivere in un contesto più quieto.",
            "Vale la pena chiarire fin dall'inizio l'uso previsto. Per un'abitazione principale conteranno i servizi e la vicinanza al lavoro; per una seconda casa o per un investimento le priorità saranno altre, a partire dalla gestione dell'immobile nei periodi in cui resta chiuso.",
          ],
        },
      ],
      faq: [
        {
          q: "Cosa posso fare se non ci sono immobili disponibili ad Aulla?",
          a: "Puoi lasciarci la tua richiesta: registriamo cosa stai cercando e ti avvisiamo quando arriva una proprietà coerente. Nel frattempo possiamo mostrarti soluzioni simili nei comuni vicini, se la posizione non è un vincolo assoluto.",
        },
        {
          q: "Posso lasciare una richiesta per una casa ad Aulla?",
          a: "Sì. Il percorso guidato ti chiede in pochi passaggi tipo di casa, zona e budget: da lì ti ricontattiamo direttamente, senza intasarti di annunci fuori tema.",
        },
        {
          q: "Posso valutare anche i comuni vicini?",
          a: "Spesso è la mossa più utile. Qui sotto trovi i comuni della Lunigiana in cui abbiamo immobili in vendita disponibili in questo momento: cambia il contesto, ma non necessariamente il tipo di casa che stai cercando.",
        },
      ],
    },
    en: {
      sections: [
        {
          h2: "Living in Aulla",
          paragraphs: [
            "Aulla lies in the lower part of Lunigiana, where the Aulella stream flows into the Magra river: a position that historically made it a crossing point and still defines its character today. It's where the valley's main routes meet before continuing towards the coast or inland.",
            "That role as a hub shows in daily life. Aulla has a railway station and an exit on the A15 motorway: anyone moving regularly between Lunigiana, the Ligurian coast and Tuscany finds here a convenience that hill villages simply don't offer. It matters a lot for those working out of the area or hosting guests often.",
            "Historically and visually, the two landmarks are the Abbey of San Caprasio, in the centre, and the Brunella Fortress, overlooking the town from above. Around the centre, the municipality includes quieter hamlets, with a less urban setting closer to the Lunigiana countryside.",
          ],
        },
        {
          h2: "What kind of home to look for in Aulla",
          paragraphs: [
            "In a valley-floor, well-connected area like this one, the most frequent needs concern practical homes: apartments in serviced settings, semi-detached houses, properties with parking and spaces that are easy to manage all year. People looking in Aulla usually start precisely from travel convenience.",
            "In the hamlets the picture changes: more secluded homes prevail, detached houses or properties with some land, with more greenery around and fewer services within walking distance. The choice for those who want valley-floor connections but prefer a quieter setting.",
            "It's worth clarifying the intended use from the start. For a main home, services and distance from work will matter; for a second home or an investment the priorities differ, starting with how the property is looked after while it stays closed.",
          ],
        },
      ],
      faq: [
        {
          q: "What can I do if there are no properties available in Aulla?",
          a: "You can leave us your request: we record what you're looking for and let you know when a suitable property comes up. Meanwhile we can show you similar homes in nearby municipalities, if the location isn't an absolute constraint.",
        },
        {
          q: "Can I register a request for a home in Aulla?",
          a: "Yes. The guided path asks you in a few steps about the kind of home, the area and the budget: from there we contact you directly, without flooding you with irrelevant listings.",
        },
        {
          q: "Should I also consider nearby municipalities?",
          a: "It's often the most useful move. Below you'll find the Lunigiana municipalities where we currently have properties for sale: the setting changes, but not necessarily the kind of home you're looking for.",
        },
      ],
    },
  },
};

export function getComuneLongform(slug: string, lang: Lang): ComuneLongform | undefined {
  const entry = COMUNE_LONGFORM[slug];
  return entry ? pick(entry, lang) : undefined;
}

// ── etichette UI condivise dal blocco 1B ───────────────────────────────

export const SEO_1B_UI = {
  hubComuni: {
    whereH2: { it: "Dove cercare casa in Lunigiana", en: "Where to look for a home in Lunigiana" },
    helpH2: { it: "Non sai ancora quale zona scegliere?", en: "Not sure which area to choose yet?" },
    helpBody: {
      it: "Raccontaci che casa stai cercando: zona, tipo di immobile, budget e come pensi di viverla. Ti rispondiamo con una selezione ragionata, e ti diciamo con franchezza cosa è realistico trovare in Lunigiana.",
      en: "Tell us what you're looking for: area, type of property, budget and how you plan to live in it. We reply with a considered selection, and we tell you frankly what is realistic to find in Lunigiana.",
    },
    helpCta: {
      it: "Fatti aiutare a trovare casa in Lunigiana",
      en: "Get help finding a home in Lunigiana",
    },
    byTypeLead: {
      it: "Se hai già chiaro il tipo di immobile, esplora le case per tipologia:",
      en: "If you already know the kind of property you want, browse homes by type:",
    },
    byTypeAnchor: {
      it: "Case in vendita in Lunigiana per tipologia",
      en: "Homes for sale in Lunigiana by type",
    },
  },
  hubTipologie: {
    liveH2: {
      it: "Scegli la casa in base a come vuoi viverla",
      en: "Choose a home based on how you want to live in it",
    },
    areaH2: { it: "Preferisci partire dalla zona?", en: "Would you rather start from the area?" },
    areaBody: {
      it: "Ogni comune della Lunigiana offre un contesto abitativo diverso: centro storico servito, collina, borghi raccolti, montagna. Se la posizione conta più della tipologia, conviene partire da lì.",
      en: "Each Lunigiana municipality offers a different living context: a serviced historic centre, hills, compact villages, mountains. If location matters more than property type, it's better to start there.",
    },
    areaAnchor: {
      it: "Scopri le case in vendita comune per comune",
      en: "Explore homes for sale municipality by municipality",
    },
    finalH2: { it: "Non trovi ancora la casa giusta?", en: "Still haven't found the right home?" },
    finalBody: {
      it: "Le proprietà cambiano nel tempo e non tutto passa dal sito. Dicci cosa cerchi: seguiamo la ricerca sul territorio e ti avvisiamo quando arriva qualcosa di coerente.",
      en: "Properties change over time and not everything goes through the website. Tell us what you're after: we follow the search locally and let you know when something suitable comes up.",
    },
    finalCta: {
      it: "Trova la tua casa in Lunigiana",
      en: "Find your home in Lunigiana",
    },
  },
  comune: {
    typesLinkPrefix: { it: "Vedi:", en: "See:" },
    specificH2: { it: "Cerchi qualcosa di specifico?", en: "Looking for something specific?" },
    specificBody: {
      it: "Casa con giardino, appartamento in centro storico, rustico da recuperare, villa con spazio esterno, un budget preciso o un'esigenza particolare: raccontaci cosa serve e ci muoviamo su quello.",
      en: "A house with a garden, an apartment in the historic centre, a rustic property to restore, a villa with outdoor space, a set budget or a specific requirement: tell us what you need and we work on that.",
    },
    faqH2: { it: "Domande frequenti", en: "Frequently asked questions" },
    territoriLead: {
      it: "Vuoi capire meglio il territorio prima di scegliere?",
      en: "Want to understand the area better before choosing?",
    },
    territoriAnchor: {
      it: "Guida ai territori della Lunigiana",
      en: "Guide to the Lunigiana territories",
    },
    nearbyH2: { it: "Valuta anche i comuni vicini", en: "Consider nearby municipalities too" },
  },
} as const;