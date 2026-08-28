/**
 * Dati editoriali della guida /come-vendere-casa-lunigiana.
 *
 * Nota redazionale: nessun dato statistico proprietario. Il contenuto è
 * informativo e usa formulazioni prudenti ("in genere", "può servire",
 * "da verificare con notaio o tecnico"): obblighi e documenti dipendono dal
 * caso concreto e dalla normativa applicabile.
 */

export const VCL_META = {
  h1: "Come vendere casa in Lunigiana: guida pratica 2026",
  title: "Come vendere casa in Lunigiana: guida pratica 2026",
  description:
    "Come vendere casa in Lunigiana nel 2026: i passaggi dall'idea al rogito, quali documenti preparare prima, come scegliere il prezzo richiesto e come chiedere una valutazione.",
  isoDate: "2026-08-28",
  updatedLabel: "Guida aggiornata ad agosto 2026",
} as const;

export type VclStep = { title: string; body: string };

export const VCL_STEPS: VclStep[] = [
  {
    title: "Capire obiettivo e tempi",
    body:
      "Prima dei numeri serve chiarezza su cosa vuoi ottenere: vendere per comprare altro, liberare una casa ereditata, chiudere una situazione familiare. Obiettivi diversi portano a scelte diverse su prezzo richiesto, esposizione e disponibilità alle visite.",
  },
  {
    title: "Definire una fascia di richiesta motivata",
    body:
      "Non un numero calato dall'alto, ma una fascia che sappia spiegarsi: immobili confrontabili nella stessa microzona, stato dell'immobile, spazi esterni, garage, e cosa c'è in vendita in questo momento nella stessa fascia.",
  },
  {
    title: "Controllare la documentazione prima delle visite",
    body:
      "È il passaggio che più spesso viene rinviato. Riordinare atto di provenienza, dati catastali, planimetria e pratiche edilizie prima di far entrare le persone evita di scoprire un nodo quando c'è già un interessato al tavolo.",
  },
  {
    title: "Preparare casa, foto e testo",
    body:
      "Ordine, luce, spazi liberi, fotografie fatte con calma, una descrizione che dica cose utili e non solo aggettivi. Qui si decide anche dove e come pubblicare: sito, portali, canali social, oppure una diffusione più selettiva.",
  },
  {
    title: "Qualificare le richieste e organizzare le visite",
    body:
      "Non tutte le richieste sono uguali: c'è chi sta ancora esplorando e chi ha già un budget definito. Capire prima chi hai davanti rende le visite più ordinate e riduce i passaggi inutili per te e per chi visita.",
  },
  {
    title: "Gestire proposta e preliminare con professionisti competenti",
    body:
      "Quando arriva una proposta si entra in una fase con effetti giuridici. È il momento di lavorare insieme a notaio e, se serve, a un tecnico: contenuti, tempi e condizioni vanno impostati sul caso concreto, non su un modello generico.",
  },
  {
    title: "Arrivare al rogito con tutto allineato",
    body:
      "L'ultimo passaggio è di coordinamento: documentazione completa, eventuali situazioni da sistemare risolte, soggetti coinvolti informati sulle date. Il notaio svolge le proprie verifiche, comprese quelle catastali e ipotecarie.",
  },
];

export type VclCheck = { title: string; body: string };

export const VCL_CHECKLIST: VclCheck[] = [
  {
    title: "Atto di provenienza",
    body:
      "L'atto con cui la casa è entrata nel tuo patrimonio: acquisto, successione, donazione, divisione. È il punto di partenza per ricostruire la storia dell'immobile.",
  },
  {
    title: "Dati e planimetria catastale",
    body:
      "Negli atti di trasferimento di unità immobiliari urbane vanno indicati i dati catastali e il riferimento alle planimetrie; l'atto contiene una dichiarazione di conformità allo stato di fatto, che nei casi previsti può essere sostituita da un'attestazione di un tecnico abilitato. Vale la pena verificare prima che la planimetria corrisponda a come la casa è oggi.",
  },
  {
    title: "Situazione urbanistico-edilizia",
    body:
      "Quali pratiche esistono, cosa è stato realizzato e quando. Se ci sono stati interventi in epoche diverse, può servire l'aiuto di un tecnico per ricostruire il quadro.",
  },
  {
    title: "APE, quando richiesto",
    body:
      "In genere per vendere un immobile serve l'Attestato di Prestazione Energetica, salvo i casi esclusi dalla disciplina applicabile. Se ne hai già uno, controlla che sia ancora utilizzabile per la vendita.",
  },
  {
    title: "Ipoteche, gravami, diritti di terzi",
    body:
      "Un mutuo ancora iscritto, una servitù, un diritto d'uso: sono situazioni che si possono gestire, ma è meglio conoscerle prima di trattare. Il notaio svolge le verifiche catastali e ipotecarie del caso.",
  },
  {
    title: "Successione, donazione, usufrutto, comproprietà",
    body:
      "Se la casa arriva da una successione o da una donazione, o se ci sono più proprietari o un usufruttuario, i passaggi da coordinare aumentano. Meglio impostarli all'inizio che a trattativa avviata.",
  },
  {
    title: "Documentazione condominiale",
    body:
      "Quando l'immobile fa parte di un condominio possono servire regolamento, tabelle, informazioni sulla gestione e su eventuali lavori deliberati.",
  },
  {
    title: "Terreni, pertinenze e fabbricati accessori",
    body:
      "Molto frequente in Lunigiana: orti, corti, cantine, legnaie, piccoli fabbricati. Capire quali particelle sono comprese e come sono censite evita malintesi sul perimetro di quello che stai vendendo.",
  },
];

export type VclFactor = { title: string; body: string };

export const VCL_ERRORI: VclFactor[] = [
  {
    title: "Partire con una richiesta non motivata",
    body:
      "Un prezzo scelto per sentito dire è difficile da difendere in trattativa e complica anche le correzioni successive, perché l'immobile è già stato visto da chi cercava in quella fascia.",
  },
  {
    title: "Scoprire i documenti mancanti dopo un'offerta",
    body:
      "È il rischio pratico più comune: la trattativa si ferma nel momento peggiore, quando l'attenzione dell'acquirente è massima e ogni attesa pesa.",
  },
  {
    title: "Foto e descrizioni che promettono più di quanto c'è",
    body:
      "Chi arriva in visita con aspettative diverse dalla realtà se ne va, e resta la sensazione di aver perso tempo da entrambe le parti.",
  },
  {
    title: "Non chiarire pertinenze, terreni e garage",
    body:
      "Un posto auto dato per incluso, un terreno che in realtà è di un'altra particella: dettagli che possono far discutere proprio alla fine.",
  },
  {
    title: "Cambiare strategia ogni settimana",
    body:
      "Prezzo, foto e canali che cambiano continuamente rendono difficile capire cosa stia funzionando e cosa no.",
  },
  {
    title: "Confondere l'interesse online con l'intenzione di comprare",
    body:
      "Visualizzazioni e messaggi non sono offerte. Serve capire chi sta davvero valutando un acquisto e in quali tempi.",
  },
];

export type VclSource = { nome: string; url: string; nota: string };

export const VCL_FONTI: VclSource[] = [
  {
    nome: "Agenzia delle Entrate — Guida all'acquisto della casa",
    url: "https://www1.agenziaentrate.gov.it/web_app_entrate/guida_acquisto_casa.html",
    nota:
      "Ruolo del notaio e verifiche catastali e ipotecarie; indicazione di dati catastali e riferimento alle planimetrie negli atti di trasferimento, con dichiarazione di conformità allo stato di fatto; natura del contratto preliminare, accordo scritto che precede il definitivo e, quando concluso, soggetto a registrazione secondo la disciplina vigente.",
  },
  {
    nome: "Consiglio Nazionale del Notariato — Lista documenti per la compravendita",
    url: "https://www.notariato.it/it/casa/lista-documenti-da-fornire-caso-di-compravendita-immobiliare/",
    nota:
      "La documentazione richiesta dipende dal caso concreto e l'elenco generale non è esaustivo: il consiglio è di verificare con il notaio e, dove serve, con un tecnico.",
  },
  {
    nome: "Consiglio Nazionale del Notariato — Relazione Tecnica Integrata 2026",
    url: "https://www.notariato.it/it/news/cnd-forli-rimini-relazione-tecnica-integrata-2026/",
    nota:
      "Una relazione tecnica integrata di tipo urbanistico-catastale può essere uno strumento utile di tutela per le parti. Nei protocolli citati è presentata come una scelta e non come un obbligo generalizzato a livello nazionale.",
  },
  {
    nome: "ENEA — Attestato di Prestazione Energetica (APE)",
    url: "https://www.efficienzaenergetica.enea.it/pubblicazioni/attestato-prestazione-energetica-degli-edifici.html",
    nota:
      "Sintesi sull'APE: in genere necessario per vendere un immobile, salvo i casi e le esclusioni previsti dalla disciplina applicabile.",
  },
];
