/**
 * Dati editoriali della guida /seconda-casa-lunigiana.
 *
 * Nota redazionale:
 *  - I prezzi non vengono duplicati qui: la pagina legge `PZ_COMUNI` e
 *    `PZ_SOURCE` da `src/lib/prezzi-lunigiana.ts` (rilevazione Immobiliare.it
 *    luglio 2026, prezzi medi RICHIESTI dell'offerta pubblicata).
 *  - Nessuna media "Lunigiana" aggregata: il dato è sempre comunale.
 *  - Nessuna promessa di rendimento, rivalutazione, redditività da affitti
 *    brevi o crescita turistica. Nessun ranking ("migliore", "più richiesto").
 *  - I contenuti territoriali provengono dalle fonti ufficiali in SC_FONTI e
 *    restano informativi: non sono indicatori immobiliari.
 */

export const SC_META = {
  h1: "Seconda casa in Lunigiana: dove comprare e cosa valutare nel 2026",
  title: "Seconda casa in Lunigiana 2026: dove comprare e cosa valutare",
  description:
    "Seconda casa in Lunigiana nel 2026: come scegliere in base all'uso reale della casa, prezzi medi richiesti dei 14 comuni e costi di mantenimento.",
  isoDate: "2026-08-28",
  updatedLabel: "Guida aggiornata ad agosto 2026",
} as const;

/** Quattro profili d'uso. Non una classifica: nessun comune "perfetto". */
export type ScProfilo = {
  titolo: string;
  sintesi: string;
  daControllare: string[];
};

export const SC_PROFILI: ScProfilo[] = [
  {
    titolo: "Weekend frequenti, tutto l'anno",
    sintesi:
      "Se pensi di venire spesso e per poco tempo, il fattore che pesa più di tutti è la facilità con cui arrivi e riparti. Una casa splendida ma faticosa da raggiungere tende a essere usata meno di quanto immaginavi.",
    daControllare: [
      "Come arrivi realmente: auto, treno, chi guida, quanto bagaglio.",
      "Cosa trovi aperto nel fine settimana: spesa, farmacia, un posto per mangiare.",
      "Se la casa è pronta all'uso o richiede mezza giornata di lavoro ogni volta.",
      "Parcheggio: dove lasci l'auto, con quanta distanza a piedi e in che pendenza.",
      "Come si comporta d'inverno: riscaldamento, accessi, strada.",
    ],
  },
  {
    titolo: "Vacanze lunghe, vita lenta di borgo",
    sintesi:
      "Se resti settimane intere, cambia il peso delle cose: conta più la qualità della vita quotidiana del borgo che la rapidità dell'arrivo. Qui la casa diventa una base, non una tappa.",
    daControllare: [
      "Cosa c'è a piedi dal portone: forno, bar, alimentari, una panchina all'ombra.",
      "Quanto è vivo il paese fuori stagione, non solo ad agosto.",
      "Spazi per stare fuori: cortile, terrazzo, un pezzo di orto.",
      "Rumore, luce e ventilazione degli interni nei mesi caldi.",
      "Se il centro storico ha limitazioni di accesso o carico/scarico.",
    ],
  },
  {
    titolo: "Natura, terreno, rustico",
    sintesi:
      "Se cerchi spazio aperto, boschi e silenzio, il tema principale diventa la gestione: il terreno chiede tempo e la casa isolata chiede attenzione, anche quando non ci sei.",
    daControllare: [
      "Quanto terreno stai comprando e quante ore all'anno vuole davvero.",
      "Strada di accesso: fondo, larghezza, pendenza, chi la mantiene.",
      "Acqua, scarichi, allacciamenti e copertura di rete: verifiche puntuali, non ipotesi.",
      "Stato di tetto, murature e umidità sugli edifici rurali o storici.",
      "Cosa succede alla casa quando resta chiusa per mesi.",
    ],
  },
  {
    titolo: "Casa da ristrutturare come progetto personale",
    sintesi:
      "Comprare per recuperare è una scelta legittima, ma è un progetto: va valutata prima come cantiere e poi come casa. Il prezzo d'acquisto è solo una parte della spesa complessiva.",
    daControllare: [
      "Un tecnico che guardi l'immobile prima della proposta, non dopo.",
      "Accessibilità del cantiere: mezzi, ponteggi, spazio per il materiale.",
      "Documentazione, conformità e pratiche da verificare con i professionisti.",
      "Budget lavori con un margine, e tempi che dipendono da imprese e autorizzazioni.",
      "Dove alloggi, e come usi la casa, nel periodo in cui non è utilizzabile.",
    ],
  },
];

/**
 * Gruppi territoriali per stile di seconda casa. Criteri già verificati nella
 * guida /dove-comprare-casa-lunigiana, riformulati per l'uso "seconda casa".
 * `comuni` deve corrispondere esattamente a `nome` in PZ_COMUNI.
 */
export type ScGruppo = {
  titolo: string;
  body: string;
  attenzioni: string;
  comuni: string[];
};

export const SC_GRUPPI: ScGruppo[] = [
  {
    titolo: "Se vuoi collegamenti semplici e servizi aperti",
    body:
      "Pontremoli e Aulla sono i due comuni della Lunigiana con casello dell'A15 e stazione sulla linea Parma–La Spezia, e hanno negozi, scuole e uffici. Per una seconda casa da usare spesso e in ogni stagione è la condizione più comoda: si arriva, si fa la spesa, si riparte.",
    attenzioni:
      "Sono contesti urbani: valuta rumore, parcheggio e, nel centro storico, accessi e scale.",
    comuni: ["Pontremoli", "Aulla"],
  },
  {
    titolo: "Se vuoi il treno vicino ma un ambiente di paese",
    body:
      "Filattiera e Villafranca in Lunigiana hanno una fermata sulla linea (Filattiera e Villafranca-Bagnone) e si trovano lungo il fondovalle attraversato dalla SS62. Sono paesi: i servizi essenziali ci sono, per il resto si va verso Pontremoli o Aulla.",
    attenzioni:
      "Le frazioni collinari sopra il fondovalle sono un'altra cosa rispetto al centro: accesso ed esposizione vanno guardati caso per caso.",
    comuni: ["Filattiera", "Villafranca in Lunigiana"],
  },
  {
    titolo: "Se cerchi borgo e natura con il fondovalle a portata di mano",
    body:
      "Bagnone, Mulazzo, Licciana Nardi e Tresana mettono insieme case di pietra, frazioni e silenzio, con i servizi del fondovalle a breve distanza. È lo scenario tipico della casa di borgo usata per vacanze e periodi lunghi.",
    attenzioni:
      "L'auto qui serve quasi sempre. Guarda la strada di accesso, la manutenzione dell'edificio storico e come si vive quella casa d'inverno.",
    comuni: ["Bagnone", "Mulazzo", "Licciana Nardi", "Tresana"],
  },
  {
    titolo: "Se vuoi l'area appenninica e più isolamento",
    body:
      "Zeri, Comano e Casola in Lunigiana sono montagna e alta valle: paesaggi molto belli e prezzi medi richiesti spesso più bassi. Con budget contenuti si guarda più spesso a case intere con terreno che a un appartamento.",
    attenzioni:
      "Le distanze reali si allungano, i servizi quotidiani vanno verificati sul posto, e l'inverno — strade, sgombero neve, riscaldamento — va messo in conto senza illusioni.",
    comuni: ["Zeri", "Comano", "Casola in Lunigiana"],
  },
  {
    titolo: "Se guardi alla parte orientale e alla bassa Lunigiana",
    body:
      "Fivizzano, Fosdinovo e Podenzana sono tre realtà diverse e non vanno assimilate: Fivizzano è un centro storico importante con un presidio ospedaliero, Fosdinovo è collina panoramica, Podenzana è vicina al nodo di Aulla.",
    attenzioni:
      "Cambiano molto anche i prezzi medi richiesti: qui più che altrove il confronto va fatto sul singolo immobile e sulla singola frazione.",
    comuni: ["Fivizzano", "Fosdinovo", "Podenzana"],
  },
];

/** Costi ricorrenti: voci da mettere in conto, senza cifre inventate. */
export const SC_MANTENIMENTO: { title: string; body: string }[] = [
  {
    title: "Riscaldamento e riavvio dopo i periodi di chiusura",
    body:
      "Una casa chiusa per settimane va riportata in temperatura, e questo ha un costo che dipende da tipo di impianto, isolamento e stagione. Vale la pena chiedere al proprietario come è gestita oggi.",
  },
  {
    title: "Tetto, facciate, umidità",
    body:
      "Sugli edifici storici o rurali sono le voci che possono pesare di più. Non riguardano tutte le case, ma dove sono pertinenti conviene farle valutare da un tecnico prima della proposta.",
  },
  {
    title: "Terreno e giardino",
    body:
      "Sfalcio, potature, siepi, foglie: il verde è tempo o è una spesa. Un terreno grande e in pendenza chiede più di un cortile.",
  },
  {
    title: "Accessi e parcheggio",
    body:
      "Vialetti, cancelli, strade private e posti auto possono richiedere manutenzione o accordi con i vicini. Nei borghi il parcheggio è spesso il punto più concreto.",
  },
  {
    title: "Spese condominiali, se è un appartamento",
    body:
      "Chiedi il consuntivo e l'esistenza di lavori deliberati o in programma: sono informazioni che cambiano il quadro dei costi.",
  },
  {
    title: "Utenze e manutenzione degli impianti",
    body:
      "Contratti attivi anche nei mesi di non utilizzo, controlli periodici della caldaia, verifica di impianto elettrico e idrico dopo lunghe pause.",
  },
  {
    title: "Lavori da fare prima di poterla usare",
    body:
      "Anche in una casa abitabile può servire un intervento iniziale: bagno, infissi, impianti, imbiancatura. Meglio stimarlo prima di fissare il budget d'acquisto.",
  },
  {
    title: "Imposte e costi fiscali",
    body:
      "La fiscalità di una seconda casa dipende dalla tua situazione personale e dalle regole applicabili nel Comune: non forniamo aliquote né calcoli. Verifica con un professionista e con gli uffici comunali competenti.",
  },
];

/** Confronto tipologie: pro e attenzioni, senza previsioni di valore. */
export type ScTipologia = {
  nome: string;
  pro: string;
  attenzioni: string;
  /** Slug della landing tipologia, quando esiste. */
  slug?: string;
};

export const SC_TIPOLOGIE: ScTipologia[] = [
  {
    nome: "Casa di borgo",
    pro:
      "Sei dentro il paese: servizi e vita sociale a piedi, atmosfera dei centri storici, spesso metrature interessanti su più piani.",
    attenzioni:
      "Scale, parcheggio, muri in comune, luce naturale e umidità. Gli interventi su edifici storici richiedono verifiche e, in alcuni casi, pratiche specifiche.",
  },
  {
    nome: "Appartamento",
    pro:
      "È la soluzione più semplice da tenere quando non ci sei: meno superfici esterne da curare e nessun terreno da gestire.",
    attenzioni:
      "Spese condominiali, lavori deliberati, regolamento condominiale, spazi accessori e posto auto.",
    slug: "appartamenti",
  },
  {
    nome: "Rustico o casale da recuperare",
    pro:
      "Spazio, terreno e la possibilità di un progetto personale, con prezzi d'acquisto spesso più contenuti.",
    attenzioni:
      "È un cantiere prima di essere una casa: budget lavori, accessi, tecnici, documentazione e tempi vanno valutati prima della proposta.",
    slug: "rustici-casali",
  },
  {
    nome: "Casa indipendente",
    pro:
      "Autonomia, spazi esterni propri, nessuna spesa condominiale e più libertà nell'uso della casa.",
    attenzioni:
      "Tutta la manutenzione è tua: tetto, facciate, impianti, verde. E una casa isolata va pensata anche per i mesi in cui resta chiusa.",
    slug: "case-indipendenti",
  },
];

/** Checklist pre-proposta. Nessuna consulenza legale o fiscale. */
export const SC_CHECKLIST: string[] = [
  "Quante volte all'anno la userò davvero, e in quali stagioni?",
  "Come ci arrivo, con chi e con quanto bagaglio? È sostenibile per le mie abitudini?",
  "Quali servizi mi servono realmente vicino, e quali posso raggiungere in auto?",
  "Quanto lavoro chiede la casa quando resta chiusa per settimane?",
  "Dove parcheggio, e quanta strada a piedi comporta?",
  "Quanto tempo vogliono giardino, terreno o spazi esterni ogni anno?",
  "Qual è lo stato di tetto, impianti e serramenti, dove pertinente?",
  "Se è un appartamento: quali sono le spese condominiali e i lavori in programma?",
  "Quale documentazione e quali pratiche vanno verificate con notaio e tecnico?",
  "Il budget complessivo comprende acquisto, lavori iniziali e mantenimento annuale?",
];

/** Territorio e tempo libero: fatti dalle fonti ufficiali, senza claim immobiliari. */
export const SC_TERRITORIO: { title: string; body: string }[] = [
  {
    title: "La Via Francigena",
    body:
      "La Lunigiana è attraversata dalla Via Francigena, con un percorso che secondo Visit Tuscany si sviluppa dal Passo della Cisa verso Pontremoli, Filattiera, Villafranca, Aulla e poi in direzione di Sarzana.",
  },
  {
    title: "Borghi e castelli",
    body:
      "Visit Tuscany segnala la forte presenza di castelli e fortezze medievali, legati alla storia dei Malaspina e alla posizione strategica di questa terra di confine.",
  },
  {
    title: "Cammini e natura",
    body:
      "Il portale ufficiale della destinazione descrive la Lunigiana come territorio di incontro tra Toscana, Emilia e Liguria, con natura, borghi e cammini.",
  },
  {
    title: "Gastronomia",
    body:
      "Testaroli, panigacci, erbi, funghi, castagne: la cucina locale è una parte concreta del tempo libero qui, ed è raccontata anche dal portale ufficiale della destinazione.",
  },
];

export const SC_FONTI: { nome: string; url: string; nota: string }[] = [
  {
    nome: "Immobiliare.it — mercato immobiliare provincia di Massa-Carrara",
    url: "https://www.immobiliare.it/mercato-immobiliare/toscana/massa-carrara-provincia/",
    nota:
      "Rilevazione luglio 2026. I valori comunali in €/m² sono prezzi medi richiesti dell'offerta pubblicata in vendita, non prezzi di compravendita conclusi.",
  },
  {
    nome: "Visit Tuscany — Via Francigena in Lunigiana",
    url: "https://www.visittuscany.com/it/itinerari/via-francigena-in-lunigiana/",
    nota:
      "Portale turistico ufficiale della Regione Toscana: percorso della Francigena, borghi e riferimenti alla linea ferroviaria Parma–La Spezia con fermate a Pontremoli, Filattiera, Villafranca-Bagnone, Aulla e Sarzana.",
  },
  {
    nome: "Visit Tuscany — I castelli della Lunigiana",
    url: "https://www.visittuscany.com/it/idee/the-castles-in-lunigiana-which-ones-to-visit/",
    nota:
      "Presenza di castelli e fortezze medievali nel territorio e legame con la storia dei Malaspina.",
  },
  {
    nome: "Lunigiana.land — portale ufficiale della destinazione",
    url: "https://www.lunigiana.land/",
    nota:
      "Descrizione del territorio come incontro tra Toscana, Emilia e Liguria: natura, borghi, cammini e gastronomia. Contenuto informativo di promozione turistica.",
  },
];
