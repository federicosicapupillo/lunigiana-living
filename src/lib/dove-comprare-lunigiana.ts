/**
 * Dati editoriali della guida /dove-comprare-casa-lunigiana.
 *
 * Nessun dato di prezzo è definito qui: i prezzi medi richiesti arrivano
 * SEMPRE da `PZ_COMUNI` in src/lib/prezzi-lunigiana.ts (fonte Immobiliare.it,
 * rilevazione luglio 2026), per evitare doppioni e disallineamenti.
 *
 * Le informazioni infrastrutturali (A15, ferrovia Parma–La Spezia, presidi
 * ospedalieri, SS62) provengono dalle fonti pubbliche elencate in DC_FONTI.
 * I giudizi "adatto soprattutto a" sono lettura editoriale Furia, non dati
 * statistici.
 */

export const DC_META = {
  h1: "Dove comprare casa in Lunigiana nel 2026?",
  title: "Dove comprare casa in Lunigiana nel 2026 | Furia Immobiliare",
  description:
    "Guida ai comuni della Lunigiana per scegliere dove comprare casa: prezzi richiesti, servizi, collegamenti, stile di vita e profilo ideale, con dati aggiornati al 2026.",
  updatedLabel: "Aggiornato al 28 agosto 2026",
  isoDate: "2026-08-28",
} as const;

export type Profilo = {
  titolo: string;
  comuni: string;
  body: string;
};

/** Cinque profili di scelta, non una classifica. */
export const DC_PROFILI: Profilo[] = [
  {
    titolo: "Se vuoi più servizi e collegamenti",
    comuni: "Pontremoli o Aulla",
    body:
      "Sono i due comuni della Lunigiana con casello dell'autostrada A15 e stazione sulla linea Parma–La Spezia. Hanno negozi, scuole, uffici e più scelta di case già abitabili. In cambio, si vive in un contesto più urbano e meno isolato di un borgo.",
  },
  {
    titolo: "Se vuoi la ferrovia ma un ambiente più raccolto",
    comuni: "Filattiera o Villafranca in Lunigiana",
    body:
      "Entrambi hanno una fermata sulla linea (Filattiera e Villafranca-Bagnone) e si trovano lungo il fondovalle attraversato dalla SS62. Sono paesi, non città: i servizi essenziali ci sono, per il resto si va a Pontremoli o ad Aulla.",
  },
  {
    titolo: "Se vuoi borgo e natura, con collegamenti verso il fondovalle",
    comuni: "Bagnone, Mulazzo, Licciana Nardi, Tresana",
    body:
      "Case di pietra, frazioni, silenzio, e il fondovalle con i suoi servizi a breve distanza. L'auto qui serve quasi sempre, e conviene guardare bene la strada di accesso e come si vive quella casa in inverno.",
  },
  {
    titolo: "Se cerchi l'area appenninica e più tranquillità",
    comuni: "Zeri, Comano, Casola in Lunigiana",
    body:
      "Sono ambienti di montagna e alta valle, con paesaggi molto belli e prezzi richiesti spesso più bassi. Le distanze reali si allungano, i servizi quotidiani vanno verificati sul posto e l'inverno va messo in conto senza illusioni.",
  },
  {
    titolo: "Se guardi alla parte orientale e alla bassa Lunigiana",
    comuni: "Fivizzano, Fosdinovo, Podenzana",
    body:
      "Sono tre realtà diverse fra loro e non vanno assimilate: Fivizzano è un centro storico importante con un presidio ospedaliero, Fosdinovo è collina panoramica verso il mare, Podenzana è vicina al nodo di Aulla. Le accomuna solo la posizione nella parte orientale e nella bassa Lunigiana.",
  },
];

export type ComuneScheda = {
  /** Deve corrispondere esattamente a `nome` in PZ_COMUNI. */
  nome: string;
  /** Collegamenti e servizi chiave, in forma sintetica per la tabella. */
  chiave: string;
  /** Lettura editoriale Furia, non un dato statistico. */
  adattoA: string;
  /** Scheda discorsiva, circa 100-160 parole. */
  paragrafi: string[];
};

/** Ordine geografico, da nord verso sud e poi versante orientale. */
export const DC_SCHEDE: ComuneScheda[] = [
  {
    nome: "Pontremoli",
    chiave: "Casello A15, stazione, presidio ospedaliero, SS62, scuole e negozi",
    adattoA: "chi vuole servizi quotidiani e non vuole dipendere sempre dall'auto",
    paragrafi: [
      "Pontremoli è la città della Lunigiana alta: portici, ponti sul Magra, un centro storico dove si vive davvero anche d'inverno. Ci sono scuole, negozi, mercato, uffici, un presidio ospedaliero, la stazione sulla linea Parma–La Spezia e un casello dell'A15.",
      "Il punto di forza pratico è proprio questo: è uno dei pochi posti della valle dove si può fare la spesa, portare i figli a scuola e prendere un treno senza programmare la giornata intorno agli spostamenti.",
      "Il compromesso è che si tratta di un contesto cittadino: più rumore, meno isolamento, parcheggio da valutare se si compra nel centro storico. Il prezzo medio richiesto nel 2026 resta comunque contenuto rispetto ai servizi disponibili.",
      "Ha senso soprattutto per chi si trasferisce tutto l'anno, per famiglie e per chi cerca una seconda casa utilizzabile in ogni stagione.",
    ],
  },
  {
    nome: "Zeri",
    chiave: "Area appenninica, strade di montagna, servizi a Pontremoli",
    adattoA: "chi cerca natura e silenzio e accetta distanze vere",
    paragrafi: [
      "Zeri è montagna, non collina: valli strette, boschi, borghi piccoli e sparsi, un paesaggio che cambia con le stagioni in modo netto. È il comune con il prezzo medio richiesto più basso fra i quattordici.",
      "Il punto di forza è la qualità dell'ambiente e il rapporto tra spesa e spazio: qui con budget contenuti si guarda a case intere con terreno, non a un appartamento.",
      "Il compromesso è concreto e va accettato prima di innamorarsi di una casa: strade di montagna, inverni impegnativi, servizi quotidiani da cercare più in basso, connettività e sgombero neve da verificare frazione per frazione.",
      "Ha senso per chi vuole davvero vivere in montagna, per chi cerca un rifugio di famiglia, o per chi ha un progetto di recupero e sa che i lavori peseranno.",
    ],
  },
  {
    nome: "Filattiera",
    chiave: "Fermata ferroviaria, SS62, fondovalle e frazioni collinari",
    adattoA: "chi vuole il treno vicino ma preferisce un paese",
    paragrafi: [
      "Filattiera unisce due cose che in Lunigiana raramente stanno insieme: una fermata sulla linea Parma–La Spezia e la dimensione tranquilla di un paese, con frazioni collinari sopra il fondovalle attraversato dalla SS62.",
      "Il punto di forza pratico è la posizione intermedia: Pontremoli è vicina per i servizi più strutturati, e la valle si percorre con facilità.",
      "Il compromesso è che i servizi quotidiani sono quelli di un piccolo comune, quindi per scuole superiori, uffici e spesa grande si esce. Le frazioni più alte sono belle ma vanno valutate per accesso e esposizione.",
      "Ha senso per chi cerca un buon equilibrio tra prezzo richiesto contenuto, collegamenti e vita di paese, e per chi vuole una casa con vista senza allontanarsi troppo dal fondovalle.",
    ],
  },
  {
    nome: "Mulazzo",
    chiave: "Borghi storici, vicinanza al fondovalle, servizi a Pontremoli e Aulla",
    adattoA: "chi cerca un borgo autentico con il fondovalle a portata di mano",
    paragrafi: [
      "Mulazzo è il comune dei borghi: nuclei di pietra come Montereggio, storie legate ai Malaspina e ai librai, un territorio che sale dal fondovalle verso la collina.",
      "Il punto di forza è la combinazione tra carattere dei luoghi e prezzi medi richiesti ancora bassi: il territorio comprende molti borghi e case in pietra, mentre disponibilità e stato degli immobili cambiano nel tempo.",
      "Il compromesso è la dipendenza dall'auto per quasi tutto, e la necessità di valutare con attenzione strade, pendenze e stato degli immobili storici, che spesso richiedono lavori significativi.",
      "Ha senso per chi vuole un borgo vero e non un centro abitato di servizio, per chi ama recuperare, e per chi accetta di spostarsi verso Pontremoli o Aulla per la vita pratica.",
    ],
  },
  {
    nome: "Villafranca in Lunigiana",
    chiave: "Stazione Villafranca-Bagnone, SS62, servizi di paese ben distribuiti",
    adattoA: "chi vuole comodità quotidiana senza vivere in città",
    paragrafi: [
      "Villafranca in Lunigiana è uno dei paesi più comodi della valle: fondovalle, SS62, la stazione di Villafranca-Bagnone, negozi e servizi di uso quotidiano concentrati in poco spazio.",
      "Il punto di forza è la praticità: si fanno molte cose a piedi e si raggiunge il resto della Lunigiana in tempi ragionevoli, in auto o in treno.",
      "Il compromesso è che il prezzo medio richiesto è superiore a quello di diversi comuni vicini. Chi cerca isolamento e panorami ampi deve guardare le frazioni, non il centro.",
      "Ha senso per famiglie, per chi lavora spostandosi lungo la valle e per chi vuole una seconda casa che funzioni anche senza auto sempre disponibile.",
    ],
  },
  {
    nome: "Bagnone",
    chiave: "Borgo storico con torrente, servizi essenziali, stazione a Villafranca-Bagnone",
    adattoA: "chi cerca un borgo curato con qualche servizio in loco",
    paragrafi: [
      "Bagnone è uno dei borghi più riconoscibili della Lunigiana: il torrente che attraversa il paese, i portici, il castello sopra l'abitato, e una parte alta di frazioni che sale verso l'Appennino.",
      "Il punto di forza è che unisce atmosfera da borgo e alcuni servizi in loco, cosa non frequente nei comuni collinari. La stazione di riferimento della linea è Villafranca-Bagnone.",
      "Il compromesso è il prezzo medio richiesto, superiore a quello di alcuni comuni limitrofi e interni, e la conformazione del territorio: alcune frazioni sono lontane e con strade strette.",
      "Ha senso per chi vuole un paese vivo e piacevole da abitare anche fuori stagione, e per chi cerca una casa di carattere accettando di curarla nel tempo.",
    ],
  },
  {
    nome: "Tresana",
    chiave: "Collina, vicinanza ad Aulla, servizi da verificare per frazione",
    adattoA: "chi cerca campagna a poca distanza dal nodo di Aulla",
    paragrafi: [
      "Tresana è un comune sparso, fatto di frazioni collinari e piccoli nuclei, con una campagna dolce e vista che in molti punti si apre verso la valle.",
      "Il punto di forza pratico è la posizione: si è in ambiente rurale ma il nodo di Aulla, con stazione, casello e servizi, non è lontano. Il prezzo medio richiesto è fra i più contenuti.",
      "Il compromesso è che i servizi in loco sono pochi e distribuiti: qui più che altrove conviene verificare la singola frazione, la strada e la distanza reale da spesa, medico e scuole.",
      "Ha senso per chi vuole spazio e terreno senza andare in montagna, e per chi mette al primo posto il rapporto tra budget e metri quadri.",
    ],
  },
  {
    nome: "Licciana Nardi",
    chiave: "SS62, collegamento da Terrarossa verso Comano, borghi e castelli",
    adattoA: "chi vuole un paese ordinato con buona viabilità",
    paragrafi: [
      "Licciana Nardi si sviluppa tra il fondovalle e la valle del Taverone, con borghi storici, castelli e paesi ben tenuti come Terrarossa, punto di passaggio verso Comano.",
      "Il punto di forza è la viabilità: la SS62 attraversa il comune e rende comodi gli spostamenti verso Aulla e verso l'alta valle, senza rinunciare a un contesto residenziale tranquillo.",
      "Il compromesso è il prezzo medio richiesto, sopra i mille euro al metro quadro, e il fatto che le zone più panoramiche sono anche le più lontane dai servizi.",
      "Ha senso per chi cerca una casa comoda da vivere tutto l'anno, per famiglie che si spostano in auto e per chi vuole restare vicino sia al fondovalle sia alla montagna.",
    ],
  },
  {
    nome: "Comano",
    chiave: "Valle del Taverone, area appenninica, servizi nel fondovalle",
    adattoA: "chi cerca montagna vicina e paesaggio aperto",
    paragrafi: [
      "Comano si trova nella valle del Taverone, in un'area appenninica dove il paesaggio è ampio, i prati salgono verso i crinali e i borghi restano piccoli.",
      "Il punto di forza è l'ambiente: pochi luoghi in Lunigiana danno la stessa sensazione di spazio, e i prezzi medi richiesti restano moderati.",
      "Il compromesso è la distanza dai servizi: per la spesa strutturata, gli uffici e le scuole si scende verso Licciana Nardi e Aulla, e in inverno la strada va considerata seriamente.",
      "Ha senso per chi ama la montagna e la vita all'aperto, per chi cerca una casa di vacanza da usare in più stagioni, e per chi non ha bisogno di servizi urbani ogni giorno.",
    ],
  },
  {
    nome: "Aulla",
    chiave: "Casello A15, stazione Aulla-Lunigiana, SS62, ampia offerta di servizi",
    adattoA: "chi mette al primo posto collegamenti e servizi quotidiani",
    paragrafi: [
      "Aulla è il nodo della bassa Lunigiana: qui si incontrano l'A15 con il suo casello, la stazione di Aulla-Lunigiana sulla linea Parma–La Spezia, la SS62 e le diramazioni verso Fivizzano e Casola.",
      "Il punto di forza è la comodità: supermercati, uffici, scuole, negozi e la vicinanza reale alla costa e a La Spezia. Può essere una delle scelte più pratiche per chi lavora fuori valle.",
      "Il compromesso è il carattere del luogo: è tra i contesti più urbani e trafficati della Lunigiana, con il prezzo medio richiesto tra i più alti, e non è il posto giusto per chi cerca il borgo di pietra.",
      "Ha senso per chi si trasferisce per lavoro, per famiglie che vogliono tutto vicino e per chi preferisce una casa recente e pronta.",
    ],
  },
  {
    nome: "Podenzana",
    chiave: "Collina sopra Aulla, vicinanza a casello e stazione",
    adattoA: "chi vuole vista e verde a pochi minuti dai servizi",
    paragrafi: [
      "Podenzana è collina residenziale sopra la bassa valle: case sparse, verde, panorami verso il fondovalle e, in alcuni punti, verso il mare in lontananza.",
      "Il punto di forza è la posizione: si vive in un contesto tranquillo restando molto vicini ai servizi e ai collegamenti di Aulla.",
      "Il compromesso è che questa comodità si riflette nel prezzo medio richiesto, sopra i mille euro al metro quadro, e che i servizi veri e propri si trovano a valle, quindi l'auto resta necessaria.",
      "Ha senso per chi cerca una casa con giardino e vista senza allontanarsi dai collegamenti, e per chi lavora ad Aulla o verso la costa.",
    ],
  },
  {
    nome: "Fivizzano",
    chiave: "Presidio ospedaliero, centro storico, collegamento da Aulla, area interna estesa",
    adattoA: "chi vuole un centro storico importante con servizi sanitari vicini",
    paragrafi: [
      "Fivizzano è uno dei centri storici più notevoli del territorio, con la sua piazza monumentale, e un comune molto esteso che arriva a toccare l'Appennino e le Apuane.",
      "Il punto di forza pratico è la presenza di un presidio ospedaliero e di servizi di riferimento per l'area orientale, con il collegamento verso Aulla per l'autostrada e il treno.",
      "Il compromesso è l'ampiezza del territorio: tra il centro e le frazioni più alte cambia tutto, dalle distanze al clima, e non esiste una risposta valida per l'intero comune.",
      "Ha senso per chi dà peso ai servizi sanitari e culturali, per chi cerca una casa storica in un centro vero, e per chi conosce già l'area e sa quale frazione vuole.",
    ],
  },
  {
    nome: "Casola in Lunigiana",
    chiave: "Alto corso dell'Aulella, tra Appennino e Apuane, servizi a Fivizzano",
    adattoA: "chi cerca montagna autentica e prezzi contenuti",
    paragrafi: [
      "Casola in Lunigiana si trova nell'alto corso dell'Aulella, in una posizione particolare tra Appennino e Alpi Apuane, con borghi in pietra e un paesaggio che cambia in poche curve.",
      "Il punto di forza è l'autenticità dei luoghi unita a un prezzo medio richiesto tra i più bassi del gruppo: qui il budget si traduce spesso in case intere.",
      "Il compromesso è la distanza: i servizi principali sono a Fivizzano e più giù ad Aulla, le strade sono di montagna e in inverno richiedono abitudine.",
      "Ha senso per chi cerca un rifugio in montagna, per chi vuole recuperare una casa di pietra con calma, e per chi non ha bisogno di servizi urbani nella vita di ogni giorno.",
    ],
  },
  {
    nome: "Fosdinovo",
    chiave: "Collina panoramica verso il mare, vicinanza alla costa, servizi da verificare",
    adattoA: "chi cerca panorama e vicinanza alla costa",
    paragrafi: [
      "Fosdinovo è il balcone della Lunigiana verso il mare: il borgo con il castello, i crinali coltivati, e in giornate limpide la vista che arriva fino al golfo.",
      "Il punto di forza è proprio il paesaggio, insieme alla vicinanza relativa alla costa e ai centri della piana.",
      "Il compromesso si legge nel prezzo medio richiesto, il più alto dei quattordici comuni, e nella conformazione collinare: strade tortuose, frazioni distanti fra loro, servizi quotidiani da verificare caso per caso.",
      "Ha senso per chi mette il panorama e la posizione al primo posto, per chi guarda anche alla costa e per chi cerca una casa con esterni curati.",
    ],
  },
];

/** Le cinque domande del percorso rapido. */
export const DC_DOMANDE: { domanda: string; body: string }[] = [
  {
    domanda: "Quanto puoi spendere in tutto, lavori compresi?",
    body:
      "Non solo il prezzo della casa: mettete nello stesso conto tetto, impianti, infissi e finiture. È il numero che restringe davvero la scelta dei comuni.",
  },
  {
    domanda: "Vuoi dipendere dall'auto o no?",
    body:
      "Se la risposta è no, la scelta si concentra sulle località servite dalla ferrovia e sui centri con servizi a piedi. Se l'auto non è un problema, si apre tutto il resto del territorio.",
  },
  {
    domanda: "Quali servizi ti servono ogni giorno?",
    body:
      "Spesa, farmacia, medico, scuole, palestra, banda larga. Scrivete i tre indispensabili: sono più utili di qualsiasi media di prezzo.",
  },
  {
    domanda: "Centro, paese, borgo o campagna?",
    body:
      "Sono quattro modi di vivere diversi, non gradi della stessa scala. Cambiano rumore, vicini, manutenzione, parcheggio e come si sta in casa d'inverno.",
  },
  {
    domanda: "Prima casa, seconda casa o trasferimento?",
    body:
      "Una casa usata due settimane l'anno tollera cose che una casa abitata tutti i giorni non perdona: strada, riscaldamento, distanze, servizi vicini.",
  },
];

export const DC_FONTI: { label: string; url: string }[] = [
  {
    label: "Visit Lunigiana — come arrivare (collegamenti stradali e ferroviari)",
    url: "https://visitlunigiana.it/la-lunigiana/come-arrivare/",
  },
  {
    label: "Lunigiana.land — come arrivare",
    url: "https://www.lunigiana.land/organizza/come-arrivare/",
  },
  {
    label: "Azienda USL Toscana Nord Ovest — ospedale di Pontremoli",
    url: "https://www.uslnordovest.toscana.it/ospedali/pontremoli",
  },
  {
    label: "Azienda USL Toscana Nord Ovest — ospedale di Fivizzano",
    url: "https://www.uslnordovest.toscana.it/ospedali/fivizzano",
  },
];
