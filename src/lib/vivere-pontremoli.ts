/**
 * BLOCCO SEO 2A — Contenuto editoriale della pagina /vivere-a-pontremoli.
 *
 * Pagina informazionale (relocation / territorio), complementare — non
 * sovrapposta — alla landing commerciale /case-in-vendita/pontremoli.
 *
 * Regola redazionale: si usano soltanto fatti territoriali già verificati
 * nel progetto (Lunigiana, centro storico, fiume Magra, Castello del
 * Piagnaro, stazione, linea Parma–La Spezia, casello A15, frazioni e
 * zone collinari). Nessun dato inventato: no tempi di percorrenza, no
 * prezzi, no €/m², no statistiche, no numeri di scuole o servizi.
 */

export const VP_META = {
  title: "Vivere a Pontremoli: guida per chi vuole trasferirsi | Furia Immobiliare",
  description:
    "Vivere a Pontremoli, in Lunigiana: come orientarsi tra centro storico, zone residenziali e frazioni prima di trasferirsi o comprare casa, spiegato da chi lavora qui.",
  h1: "Vivere a Pontremoli: cosa sapere prima di scegliere casa",
} as const;

export const VP_INTRO: string[] = [
  "Pontremoli è la porta nord della Lunigiana: un centro con una vita urbana propria, circondato da frazioni e da un territorio collinare che cambia carattere in pochi chilometri. Chi ci arriva da fuori lo fa in genere per tre motivi: cercare una quotidianità più raccolta senza rinunciare ai servizi di un centro, tornare in un luogo a cui è legato da radici familiari, oppure trovare una casa da usare per periodi dell'anno.",
  "Per questo scegliere casa qui non è soltanto scegliere un immobile: è scegliere anche una posizione. Vivere nel centro storico, in una zona residenziale ai margini del nucleo urbano o in una frazione di collina sono tre esperienze abitative diverse, con vantaggi differenti in termini di vicinanza ai servizi, di tranquillità e di indipendenza. Questa pagina serve a mettere in ordine quelle differenze prima di guardare gli annunci: quando la posizione è chiara, la ricerca diventa molto più rapida e le visite più utili.",
];

export interface VpSection {
  id: string;
  h2: string;
  paragraphs: string[];
  subsections?: { h3: string; paragraphs: string[] }[];
}

export const VP_SECTIONS: VpSection[] = [
  {
    id: "lunigiana",
    h2: "Pontremoli e la Lunigiana",
    paragraphs: [
      "La Lunigiana è la parte più interna e settentrionale della Toscana, un sistema di valli che si sviluppa lungo il fiume Magra e i suoi affluenti, tra Appennino e Alpi Apuane. Non è un'area omogenea: ogni comune ha una scala diversa, un rapporto diverso con il fondovalle e una densità di servizi diversa. Pontremoli è il riferimento della parte alta di questo territorio.",
      "Il nucleo urbano si è formato lungo la via di transito storica e si legge ancora oggi in questo modo: un centro storico compatto, sviluppato in lunghezza tra i corsi d'acqua, con portici, palazzi, piazze e attività al piano strada. Sopra, il Castello del Piagnaro chiude il profilo del paese e ne racconta la funzione di controllo del passo. È un impianto che dà al centro una vita reale, non stagionale.",
      "Attorno al centro, il territorio comunale comprende frazioni e zone collinari con caratteri molto diversi tra loro: alcune sono piccoli nuclei abitati, altre gruppi di case più isolate, con la campagna e il bosco che iniziano subito dopo. Questa alternanza tra nucleo urbano e territorio circostante è la prima cosa da capire: a Pontremoli si può vivere in modo quasi cittadino oppure in modo completamente appartato, restando nello stesso comune.",
    ],
  },
  {
    id: "zone",
    h2: "Centro storico, zone residenziali o collina?",
    paragraphs: [
      "È la scelta che pesa più di tutte, più della metratura e spesso più del prezzo. Vale la pena farla in modo consapevole, perché determina il modo in cui si userà la casa ogni giorno.",
    ],
    subsections: [
      {
        h3: "Centro storico",
        paragraphs: [
          "Vivere nel centro storico significa avere il paese a portata di piedi: le attività, i servizi, la vita quotidiana si svolgono in gran parte senza usare l'auto. Gli immobili sono in prevalenza appartamenti e porzioni di edifici storici, spesso su più livelli, con affacci e altezze che cambiano molto da unità a unità.",
          "Sono soluzioni adatte a chi cerca comodità e relazione con il paese, a chi vive da solo o in coppia, e a chi vuole una casa che si usi anche solo per periodi senza doversi occupare di terreno e verde. Da valutare con attenzione, invece, i temi tipici degli edifici storici: parcheggio nelle vicinanze, accessi e scale, stato degli impianti e coerenza tra la distribuzione degli spazi e il modo in cui si intende vivere la casa.",
        ],
      },
      {
        h3: "Zone residenziali",
        paragraphs: [
          "Ai margini del nucleo urbano si trovano le zone residenziali: qui gli edifici sono più recenti o comunque meno vincolati dall'impianto storico, e più spesso compaiono spazi esterni propri, posti auto e distribuzioni interne su un unico piano.",
          "È la fascia che funziona meglio per chi cerca un equilibrio: restare vicino ai servizi del centro e alla viabilità, ma con più aria attorno alla casa. Tipicamente interessa famiglie, chi lavora fuori e ha bisogno di uscire e rientrare in modo pratico, e chi vuole una casa indipendente o semi-indipendente senza allontanarsi dal paese.",
        ],
      },
      {
        h3: "Frazioni e collina",
        paragraphs: [
          "Salendo verso le frazioni e le zone collinari cambia tutto: più silenzio, più spazio, più autonomia. Qui si trovano case indipendenti, rustici e casali, immobili con terreno e proprietà con vista aperta sulla valle.",
          "È la scelta di chi mette al primo posto la tranquillità, il rapporto con il paesaggio e l'indipendenza, ed è disposto a organizzare la propria giornata intorno all'uso dell'auto. Sono elementi concreti da verificare in fase di visita: come si raggiunge la casa, com'è tenuta la strada di accesso, quanto spazio esterno si è realmente disposti a mantenere e quali lavori l'immobile richiede. È spesso la fascia più interessante per una seconda casa, ma può funzionare benissimo anche come abitazione principale per chi ha questa attitudine.",
        ],
      },
    ],
  },
  {
    id: "collegamenti",
    h2: "Collegamenti e vita quotidiana",
    paragraphs: [
      "Pontremoli è servita dalla stazione ferroviaria sulla linea che collega Parma a La Spezia: un elemento che conta sia per chi si muove verso la pianura emiliana sia per chi scende verso la costa, e che rende possibile una parte degli spostamenti senza auto. Il territorio è inoltre servito dal casello dell'autostrada A15, quindi l'accesso alla rete autostradale non richiede lunghi trasferimenti su strade secondarie.",
      "Nella pratica, la differenza quotidiana non la fa tanto la distanza in chilometri quanto la posizione della casa rispetto al centro urbano e agli accessi. Chi abita nel centro o nelle zone residenziali vicine svolge molte attività a piedi o con spostamenti brevi; chi abita in frazione o in collina usa l'auto in modo sistematico e programma di conseguenza spesa, scuola, lavoro e tempo libero.",
      "Il consiglio pratico è semplice: prima di decidere, provate il percorso che farete davvero. Non un tempo di percorrenza teorico, ma il vostro tragitto reale, nell'orario in cui lo farete, verso il lavoro, la scuola o la stazione. È il test che chiarisce meglio di qualsiasi descrizione se una posizione è adatta a voi.",
    ],
  },
  {
    id: "prima-seconda",
    h2: "Pontremoli come prima casa o seconda casa",
    paragraphs: [
      "Le due esigenze portano a case diverse, e non è raro che una ricerca si blocchi proprio perché non si è deciso quale delle due si sta seguendo.",
      "Per una prima casa contano la quotidianità e la vicinanza a ciò che si usa ogni giorno: accessibilità dell'ingresso e delle scale, organizzazione degli spazi rispetto al numero di persone, spazio per lavorare o studiare, praticità nel rientrare la sera. In questo caso centro storico e zone residenziali sono spesso le prime da valutare, perché riducono gli spostamenti obbligati.",
      "Per una seconda casa il criterio si sposta sull'uso periodico: indipendenza dell'immobile, quantità di manutenzione che si è disposti ad assumersi, presenza e dimensione dello spazio esterno, facilità di chiudere e riaprire la casa dopo un'assenza. Qui frazioni e collina diventano interessanti, ma la manutenzione va messa in conto da subito e in modo realistico: un terreno ampio è un valore solo se qualcuno se ne occupa.",
      "In entrambi i casi, il nostro lavoro è mettere in chiaro pro e contro reali dell'immobile prima della trattativa. Per gli aspetti fiscali e finanziari il riferimento resta il vostro consulente: noi ci occupiamo della casa, della posizione e delle condizioni.",
    ],
  },
];

export const VP_CHECKLIST: { title: string; body: string }[] = [
  { title: "Posizione", body: "Centro, zona residenziale o frazione: è la scelta che condiziona tutte le altre." },
  { title: "Accessibilità", body: "Strada di accesso, ingresso, scale, ascensore dove presente: verificateli di persona." },
  { title: "Condizioni dell'immobile", body: "Struttura, coperture, serramenti, impianti: guardate lo stato reale, non le impressioni." },
  { title: "Lavori necessari", body: "Distinguete tra ciò che serve subito e ciò che può aspettare, e mettetelo in ordine di priorità." },
  { title: "Spazio esterno", body: "Giardino, corte o terreno sono un valore se corrispondono al tempo che potete dedicarvi." },
  { title: "Parcheggio", body: "Nel centro storico è un tema concreto: chiedete dove si posteggia davvero, ogni giorno." },
  { title: "Utilizzo previsto", body: "Abitazione principale, uso periodico o casa per la famiglia: cambiano i requisiti minimi." },
  { title: "Distanze quotidiane", body: "Lavoro, scuola, stazione, spesa: valutate il tragitto che farete realmente." },
];

export const VP_FAQ: { q: string; a: string }[] = [
  {
    q: "È meglio cercare casa nel centro storico o fuori Pontremoli?",
    a: "Dipende da come volete vivere. Il centro storico riduce gli spostamenti e mette servizi e vita del paese a portata di piedi; fuori dal centro si guadagnano spazio, indipendenza e spesso uno spazio esterno, ma l'auto diventa parte della giornata. Conviene decidere questa priorità prima di guardare gli immobili.",
  },
  {
    q: "Che tipi di immobili si trovano a Pontremoli?",
    a: "Il catalogo comprende appartamenti, case indipendenti, ville, rustici e casali, immobili con giardino e soluzioni di fascia più economica. La distribuzione cambia molto tra centro, zone residenziali e frazioni, e la disponibilità varia nel tempo.",
  },
  {
    q: "Pontremoli può essere adatta anche come seconda casa?",
    a: "Sì, ed è una richiesta frequente. In questo caso pesano soprattutto l'indipendenza dell'immobile, la manutenzione da sostenere, lo spazio esterno e la facilità di raggiungere la casa: sono i punti che valutiamo insieme prima di procedere.",
  },
  {
    q: "Come posso cercare una casa con giardino a Pontremoli?",
    a: "Partite dalla selezione delle case con giardino in Lunigiana e dalla pagina dedicata agli immobili in vendita a Pontremoli: se non trovate la soluzione giusta, scriveteci indicando zona e spazio esterno desiderato e vi segnaliamo ciò che rientra nei vostri criteri.",
  },
  {
    q: "Furia Immobiliare può aiutarmi se sul sito non trovo la casa giusta?",
    a: "Sì. Il sito mostra ciò che è disponibile in questo momento, ma non tutto passa dalla vetrina e la disponibilità cambia. Raccontateci che casa cercate e in quale zona: vi contattiamo quando compare qualcosa di coerente.",
  },
];

/** Tipologie realmente presenti a catalogo, con anchor contestuali. */
export const VP_TYPE_LINKS: { slug: string; anchor: string; note: string }[] = [
  { slug: "appartamenti", anchor: "Appartamenti in vendita in Lunigiana", note: "Soluzioni pratiche, frequenti nel centro storico e nelle zone residenziali." },
  { slug: "case-indipendenti", anchor: "Case indipendenti in vendita in Lunigiana", note: "Più autonomia e in molti casi uno spazio esterno proprio." },
  { slug: "rustici-casali", anchor: "Rustici e casali in Lunigiana", note: "Immobili di carattere, spesso in collina e con lavori da programmare." },
  { slug: "ville", anchor: "Ville in vendita in Lunigiana", note: "Proprietà più ampie, dove contano gestione e manutenzione." },
  { slug: "case-con-giardino", anchor: "Case con giardino in Lunigiana", note: "Per chi mette lo spazio esterno al primo posto." },
  { slug: "seconde-case", anchor: "Seconde case in Lunigiana", note: "Immobili adatti a un uso periodico dell'anno." },
  { slug: "case-economiche", anchor: "Case economiche in Lunigiana", note: "Fascia di prezzo più contenuta, da valutare con attenzione sui lavori." },
];
