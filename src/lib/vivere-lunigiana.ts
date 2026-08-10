/**
 * BLOCCO SEO 2B — Contenuto editoriale della pagina /vivere-in-lunigiana.
 *
 * Pagina pilastro informativa e orientativa sul territorio. Non è una
 * landing commerciale (quella è /case-in-vendita-lunigiana) e non è la
 * guida locale su Pontremoli (/vivere-a-pontremoli): qui si ragiona a
 * scala di comprensorio, mettendo a confronto contesti diversi.
 *
 * Regola redazionale: solo fatti territoriali verificabili e già presenti
 * nel progetto (valle del Magra, Appennino e Alpi Apuane, A15, linea
 * ferroviaria Parma–La Spezia, comuni realmente coperti dal catalogo).
 * Nessun prezzo, nessun tempo di percorrenza, nessuna statistica,
 * nessuna promessa di rivalutazione.
 */

export const VL_META = {
  title: "Vivere in Lunigiana: guida per trasferirsi | Furia Immobiliare",
  description:
    "Vivere in Lunigiana: borghi, servizi, collegamenti, vantaggi e aspetti da valutare prima di trasferirsi o comprare casa in questo territorio.",
  h1: "Vivere in Lunigiana: cosa sapere prima di trasferirsi",
} as const;

export const VL_INTRO: string[] = [
  "La Lunigiana non è un luogo unico, ma un insieme di valli, paesi e frazioni che si somigliano da lontano e si differenziano molto da vicino. Chi arriva qui pensando a un solo scenario — il borgo di pietra, la casa con il terreno, il silenzio — di solito scopre in poche settimane che le possibilità sono più articolate: si può vivere in un centro con negozi e stazione, in una zona residenziale di fondovalle, in un paese di collina raccolto attorno a una piazza oppure in una casa isolata a fine strada.",
  "Questa pagina serve a mettere ordine prima di guardare gli immobili. Non racconta la Lunigiana come una cartolina e non promette una qualità della vita uguale per tutti: prova invece a spiegare che cosa cambia davvero da un contesto all'altro, quali domande conviene farsi e come capire se questo territorio è adatto alle proprie esigenze. Se cercate già case da vedere, il punto di partenza è un altro; se state ancora decidendo, il tempo speso qui vi farà risparmiare visite inutili.",
];

export interface VlSection {
  id: string;
  h2: string;
  paragraphs: string[];
  subsections?: { h3: string; paragraphs: string[] }[];
}

export const VL_SECTIONS_TOP: VlSection[] = [
  {
    id: "dove",
    h2: "Dove si trova la Lunigiana e che territorio è",
    paragraphs: [
      "La Lunigiana è l'estremità settentrionale della Toscana, in provincia di Massa-Carrara, al confine con Liguria ed Emilia. È il bacino del fiume Magra e dei suoi affluenti: un fondovalle principale, dove si concentrano i centri più grandi e le infrastrutture, e una serie di valli laterali che salgono verso l'Appennino da un lato e verso le Alpi Apuane dall'altro.",
      "Questa geografia spiega quasi tutto. Chi abita nel fondovalle ha vicino strade, ferrovia e servizi; chi abita nelle valli laterali guadagna paesaggio, spazio e quiete, ma organizza la giornata attorno all'automobile. Non è una gerarchia di qualità, è una differenza di stile di vita: entrambe le scelte sono legittime, ma vanno fatte con consapevolezza.",
      "L'altro elemento che caratterizza la zona è la densità di piccoli nuclei abitati: borghi storici, paesi di poche vie, frazioni composte da un gruppo di case. Molti hanno un'identità forte e una vita associativa attiva; altri sono più appartati e, fuori stagione, decisamente silenziosi. Anche questo è un fattore da valutare prima di scegliere, perché incide sulla quotidianità più di quanto si immagini durante una visita estiva.",
    ],
  },
  {
    id: "per-chi",
    h2: "Per chi può essere una scelta adatta",
    paragraphs: [
      "Nel nostro lavoro incontriamo soprattutto quattro profili. Il primo è chi lascia una città e cerca una dimensione più raccolta, con spazi più ampi a parità di budget e un rapporto diretto con la natura. Il secondo è chi ha legami familiari con la zona e torna, spesso su una casa da recuperare. Il terzo è chi cerca una seconda casa da usare per periodi dell'anno. Il quarto è chi arriva dall'estero, attratto dall'Italia interna e dai borghi, e ha bisogno di essere accompagnato passo per passo.",
      "In tutti questi casi il denominatore comune di chi si trova bene è la disponibilità ad adattarsi al ritmo del posto: meno servizi a portata immediata, più organizzazione, più relazioni dirette con le persone. Chi invece dà per scontata la disponibilità continua di tutto — negozi aperti fino a tardi, trasporti frequenti, alternative a ogni ora — rischia di vivere il trasferimento come una rinuncia.",
      "Vale la pena essere espliciti su un punto: la Lunigiana funziona molto bene per alcune esigenze e molto meno per altre. Se avete necessità sanitarie frequenti, orari rigidi legati a una città lontana o figli con attività quotidiane sparse sul territorio, la posizione della casa non è un dettaglio ma la variabile decisiva.",
    ],
  },
  {
    id: "quotidiana",
    h2: "La vita quotidiana tra borghi, natura e centri abitati",
    paragraphs: [
      "La giornata tipo cambia in modo netto a seconda di dove si abita. Nei centri principali si fa la spesa a piedi, si incontra gente conosciuta, si usano servizi e attività senza spostamenti lunghi. Nei paesi minori la vita è più raccolta: qualche esercizio di prossimità, un ritmo più lento, e spostamenti programmati per tutto il resto. Nelle case isolate l'autonomia è massima e l'auto è indispensabile, anche per necessità banali.",
      "La natura è parte del quotidiano, non un'escursione occasionale: sentieri, fiumi, boschi e crinali sono a ridosso dei paesi. Questo è uno dei motivi principali per cui le persone scelgono la Lunigiana, e resta valido tutto l'anno. Va però tenuto presente che l'inverno in collina e in Appennino è una stagione vera, con freddo, umidità e manutenzioni da mettere in conto: riscaldamento, strade di accesso, cura del verde.",
      "Un consiglio pratico che diamo sempre: se potete, visitate la zona che vi interessa in un giorno feriale e fuori dalla bella stagione. È il modo più onesto per capire se il silenzio vi piace o vi pesa, e per vedere il paese nella sua condizione ordinaria, non in quella delle sagre e dell'estate.",
    ],
  },
];

/** Confronto tra comuni: ogni voce rimanda alla landing comunale esistente. */
export const VL_COMUNI: { slug: string; nome: string; paragraphs: string[] }[] = [
  {
    slug: "pontremoli",
    nome: "Pontremoli",
    paragraphs: [
      "È il riferimento della Lunigiana settentrionale: un centro storico compatto e vissuto, con attività al piano strada, e attorno zone residenziali e frazioni di collina. Ha stazione ferroviaria e casello autostradale, quindi è una delle soluzioni più comode per chi si muove verso l'Emilia o verso la costa.",
      "È la scelta tipica di chi vuole una vita di paese ma con una certa densità di servizi e la possibilità di fare molte cose a piedi.",
    ],
  },
  {
    slug: "aulla",
    nome: "Aulla",
    paragraphs: [
      "Aulla si trova nella parte bassa della valle, in posizione di snodo tra la Lunigiana, la costa e la direttrice verso La Spezia. Ha un carattere più di fondovalle e meno di borgo storico, con un tessuto urbano più recente e una funzione di servizio per l'intero comprensorio.",
      "È indicata per chi mette al primo posto la comodità dei collegamenti e la vicinanza a servizi e attività, accettando un contesto meno pittoresco rispetto ai paesi dell'interno.",
    ],
  },
  {
    slug: "bagnone",
    nome: "Bagnone",
    paragraphs: [
      "Bagnone è uno dei borghi più riconoscibili della zona, con il nucleo storico raccolto attorno al torrente e una parte bassa più recente. Il territorio comunale sale verso l'Appennino e comprende frazioni con caratteri molto diversi tra loro.",
      "Funziona bene per chi cerca un paese con identità e vita propria, mantenendo però la possibilità di scendere rapidamente verso il fondovalle.",
    ],
  },
  {
    slug: "villafranca-in-lunigiana",
    nome: "Villafranca in Lunigiana",
    paragraphs: [
      "Villafranca è in posizione centrale rispetto alla valle ed è storicamente un punto di passaggio lungo la via che attraversa la Lunigiana. Il centro è di dimensioni contenute ma ordinato attorno a un nucleo abitato con servizi di base.",
      "È una scelta equilibrata per chi vuole restare vicino a più comuni senza allontanarsi dalle strade principali: utile a chi si sposta spesso all'interno del comprensorio.",
    ],
  },
];

export const VL_ALTRI: string[] = [
  "Oltre ai centri maggiori, la Lunigiana comprende comuni e frazioni di dimensioni minori — tra quelli che seguiamo più spesso ci sono Mulazzo, Filattiera e Zeri — dove il rapporto con il paesaggio è più diretto e la disponibilità di servizi più limitata. Sono contesti che chi cerca tranquillità apprezza molto, e che chiedono in cambio più autonomia negli spostamenti.",
  "Una distinzione utile è quella tra borgo, frazione e casa isolata. Il borgo ha una vita collettiva e in genere qualche servizio di prossimità. La frazione è un gruppo di case con un'identità propria ma pochi o nessun servizio. La casa isolata offre il massimo dell'indipendenza e nessuna rete di prossimità immediata: è una scelta ottima per chi la desidera davvero, difficile per chi la subisce.",
];

export const VL_SECTIONS_MID: VlSection[] = [
  {
    id: "collegamenti",
    h2: "Servizi, collegamenti e mobilità",
    paragraphs: [
      "La Lunigiana è attraversata dall'autostrada A15, che collega Parma a La Spezia, e dalla ferrovia che segue la stessa direttrice: sono i due assi che rendono il territorio raggiungibile senza dipendere solo da strade secondarie. I centri di fondovalle beneficiano in modo diretto di questa infrastruttura; i paesi delle valli laterali vi si collegano tramite strade provinciali e comunali.",
      "I servizi essenziali — scuole, presidi sanitari, esercizi commerciali, uffici — sono distribuiti in modo disomogeneo e si concentrano nei comuni più grandi. Nella pratica significa che molte famiglie combinano casa in un paese e servizi in un altro. Non è un problema, ma va progettato: conviene elencare i luoghi che frequenterete ogni settimana e verificare come li raggiungerete davvero.",
      "Il trasporto pubblico esiste ma è pensato principalmente per le esigenze scolastiche e per i collegamenti principali: chi non guida deve verificare con attenzione la propria situazione prima di scegliere una posizione appartata. Su questi aspetti evitiamo di dare numeri: orari e servizi cambiano e vanno controllati alla fonte al momento della scelta.",
    ],
  },
  {
    id: "lavoro",
    h2: "Lavoro da remoto, pendolarismo e vita professionale",
    paragraphs: [
      "Una parte crescente di chi si trasferisce lavora da remoto, almeno per alcuni giorni alla settimana. In questo caso i requisiti concreti sono pochi ma non negoziabili: una connessione stabile, un ambiente della casa che possa diventare uno spazio di lavoro, e la possibilità di raggiungere in tempi ragionevoli una stazione o un casello quando serve andare in sede.",
      "La qualità della connessione va verificata sull'indirizzo specifico, non sul comune: nella stessa zona possono esserci situazioni molto diverse. È una delle prime cose che consigliamo di controllare durante la visita, insieme alla copertura del telefono, soprattutto nelle case più isolate.",
      "Per chi fa pendolarismo verso la costa o verso l'Emilia, la posizione rispetto alla ferrovia e all'autostrada pesa più della bellezza della casa. Chi invece lavora sul territorio — professioni locali, ricettività, attività artigianali — ha esigenze diverse e spesso privilegia la vicinanza al proprio bacino di clienti.",
    ],
  },
  {
    id: "prima-seconda",
    h2: "Prima casa o seconda casa: due ricerche diverse",
    paragraphs: [
      "Sono due percorsi che si confondono facilmente e che portano a immobili molto diversi. Per una prima casa contano la vicinanza ai servizi usati ogni giorno, l'accessibilità dell'ingresso, la distribuzione degli spazi rispetto al numero di persone e la praticità degli spostamenti abituali. È una scelta che si giudica sul mese tipo, non sulla settimana di vacanza.",
      "Per una seconda casa il criterio si sposta sull'uso periodico: quanto è semplice chiudere e riaprire l'immobile, quanta manutenzione richiede, quanto spazio esterno si è realmente disposti a curare, quanto è agevole raggiungerlo anche in inverno. In questa fascia i rustici, le case indipendenti e le proprietà con terreno sono spesso i più interessanti, purché la manutenzione sia messa in conto fin dall'inizio.",
      "Non entriamo in valutazioni fiscali o di rendimento: per quelle il riferimento resta il vostro consulente. Il nostro contributo riguarda la casa, la posizione e le condizioni reali dell'immobile.",
    ],
  },
];

export const VL_TYPE_LINKS: { slug: string; anchor: string; note: string }[] = [
  { slug: "appartamenti", anchor: "Appartamenti", note: "Soluzioni pratiche, più frequenti nei centri e nelle zone residenziali di fondovalle." },
  { slug: "case-indipendenti", anchor: "Case indipendenti", note: "Autonomia completa e, in molti casi, uno spazio esterno di proprietà." },
  { slug: "rustici-casali", anchor: "Rustici e casali", note: "Immobili di carattere, spesso in collina e con lavori da programmare." },
  { slug: "ville", anchor: "Ville", note: "Proprietà più ampie, dove pesano gestione e manutenzione ordinaria." },
  { slug: "case-con-giardino", anchor: "Case con giardino", note: "Per chi mette lo spazio esterno tra i requisiti non rinunciabili." },
  { slug: "seconde-case", anchor: "Seconde case", note: "Immobili adatti a un uso per periodi dell'anno." },
  { slug: "case-economiche", anchor: "Case economiche", note: "Fascia più contenuta: da valutare con attenzione sullo stato dei lavori." },
];

export const VL_TIPOLOGIE_INTRO: string[] = [
  "Il patrimonio edilizio della Lunigiana è vario e stratificato: appartamenti nei centri, case indipendenti e semi-indipendenti nei paesi, rustici e casali in collina, ville, immobili con giardino e soluzioni da ristrutturare in ogni fascia. La differenza principale non è estetica ma gestionale: quanto tempo e quante risorse richiede la casa dopo l'acquisto.",
  "Gli immobili da ristrutturare meritano un discorso a parte. Sono numerosi e possono essere un'ottima occasione, ma vanno affrontati con un progetto e con professionisti del posto: struttura, coperture, umidità, impianti e accessi sono i temi ricorrenti. Consigliamo sempre di distinguere i lavori indispensabili da quelli rinviabili prima di formulare una proposta.",
];

export const VL_PROS: { title: string; body: string }[] = [
  { title: "Spazio e rapporto qualità-vita", body: "A parità di esigenze si trovano metrature, spazi esterni e affacci difficilmente disponibili in contesti urbani." },
  { title: "Natura vicina tutto l'anno", body: "Fiumi, boschi, sentieri e crinali sono a ridosso dei paesi e fanno parte della vita ordinaria." },
  { title: "Comunità riconoscibili", body: "Nei borghi le relazioni sono dirette e chi si rende disponibile viene integrato in fretta." },
  { title: "Posizione tra mare e Appennino", body: "Il territorio è collocato tra la costa ligure-toscana e i valichi verso l'Emilia." },
  { title: "Patrimonio edilizio vario", body: "Dalle case di paese ai casali di collina: si può scegliere in base all'uso e non solo al budget." },
  { title: "Ritmo sostenibile", body: "Spostamenti brevi nel quotidiano e una giornata meno frammentata, se la posizione è scelta bene." },
];

export const VL_CONS: { title: string; body: string }[] = [
  { title: "Servizi distribuiti", body: "Non tutto è presente in ogni comune: alcuni spostamenti settimanali sono inevitabili." },
  { title: "Dipendenza dall'auto", body: "Fuori dai centri principali, muoversi senza automobile è complicato: valutatelo con onestà." },
  { title: "Inverni reali", body: "Freddo, umidità e manutenzione stagionale incidono su costi di gestione e comfort." },
  { title: "Manutenzione del verde", body: "Terreni e giardini ampi sono un valore solo se qualcuno se ne occupa con continuità." },
  { title: "Immobili da recuperare", body: "Molte occasioni richiedono lavori: servono progetto, imprese locali e tempi realistici." },
  { title: "Stagionalità dei paesi minori", body: "Alcune frazioni sono molto vive d'estate e decisamente silenziose il resto dell'anno." },
];

export const VL_METODO: string[] = [
  "Il percorso che funziona meglio parte dall'uso e non dall'immobile. Prima si definisce come si vivrà la casa: tutto l'anno o per periodi, con quante persone, con quali spostamenti fissi e con quale disponibilità alla manutenzione. Poi si sceglie il tipo di contesto — centro, fondovalle, borgo, frazione — e solo alla fine si guarda la tipologia e la singola casa.",
  "Il secondo passaggio è restringere l'area. Vale la pena individuare due o tre comuni compatibili con le proprie esigenze e conoscerli davvero, invece di cercare ovunque: la Lunigiana è abbastanza varia da rendere dispersiva una ricerca senza confini. Le pagine dedicate ai singoli comuni servono proprio a questo confronto.",
  "Il terzo è la verifica sul posto. Nessuna descrizione sostituisce una visita fatta con attenzione: strada di accesso, esposizione, stato della struttura, impianti, rumore, connessione, parcheggio. È il momento in cui il nostro ruolo è dire anche ciò che non funziona, perché una trattativa consapevole è l'unica che regge nel tempo.",
];

export const VL_FAQ: { q: string; a: string }[] = [
  {
    q: "Com'è vivere in Lunigiana tutto l'anno?",
    a: "Molto diverso a seconda di dove si abita. Nei centri principali la vita quotidiana è continua, con servizi e attività aperti durante l'anno. Nei paesi minori e nelle frazioni il ritmo è più lento e l'inverno è una stagione vera: freddo, umidità e strade di collina fanno parte dell'esperienza. Conviene visitare la zona anche fuori dalla bella stagione prima di decidere.",
  },
  {
    q: "Quali comuni sono più comodi per i servizi?",
    a: "In generale i centri di maggiori dimensioni e quelli di fondovalle, perché concentrano esercizi, uffici e collegamenti. Pontremoli e Aulla sono i riferimenti abituali rispettivamente per la parte alta e per la parte bassa della valle. Nei comuni minori i servizi essenziali ci sono ma sono più limitati, e alcune necessità richiedono uno spostamento.",
  },
  {
    q: "La Lunigiana è adatta a chi lavora da remoto?",
    a: "Può esserlo, a condizione di verificare la connessione sull'indirizzo preciso e non sul comune, perché la situazione varia anche a poca distanza. Servono inoltre uno spazio della casa utilizzabile come postazione e, se si va in sede saltuariamente, una posizione ragionevole rispetto alla ferrovia o al casello autostradale.",
  },
  {
    q: "È meglio scegliere un borgo, una frazione o un centro abitato?",
    a: "Dipende da quanta autonomia si vuole. Il centro abitato riduce gli spostamenti e mantiene servizi vicini; il borgo offre identità e vita di comunità con qualche servizio di prossimità; la frazione o la casa isolata danno spazio e quiete massimi, ma rendono l'auto indispensabile. È la prima decisione da prendere, prima ancora della tipologia di immobile.",
  },
  {
    q: "Cosa controllare prima di comprare casa in Lunigiana?",
    a: "Strada e modalità di accesso, esposizione, stato della struttura e delle coperture, umidità, impianti, riscaldamento, spazio esterno e relativa manutenzione, parcheggio, connessione e copertura telefonica. Vanno poi verificati con un tecnico gli aspetti documentali e urbanistici dell'immobile. Consigliamo di distinguere fin da subito i lavori necessari da quelli rinviabili.",
  },
];
