/**
 * Dati della pagina-hub /osservatorio-immobiliare-lunigiana.
 *
 * Nessun valore di mercato viene duplicato: le quotazioni richieste dei 14
 * comuni e la fotografia del portafoglio Furia sono importate da
 * `@/lib/prezzi-lunigiana` (PZ_COMUNI, PZ_SOURCE, PZ_FURIA, PZ_FASCE,
 * PZ_TIPOLOGIE). Qui vivono solo:
 *  - i metadati della pagina;
 *  - la presenza Furia per comune (estrazione aggregata dal database immobili
 *    al 28/08/2026: status published, contract_type = vendita, escluso Massa);
 *  - piccoli helper derivati da PZ_COMUNI (min, max, conteggio YoY).
 *
 * I dati del portafoglio sono una fotografia congelata alla data indicata,
 * non un indicatore del mercato complessivo della Lunigiana.
 */
import { PZ_COMUNI } from "@/lib/prezzi-lunigiana";

export const OSS_META = {
  h1: "Osservatorio Immobiliare Lunigiana — Furia Immobiliare",
  title:
    "Osservatorio Immobiliare Lunigiana: prezzi e dati 2026 | Furia Immobiliare",
  description:
    "Dati e prezzi immobiliari della Lunigiana: quotazioni richieste comune per comune e fotografia aggiornata del portafoglio Furia, con metodologia e fonti.",
  updatedLabel: "Aggiornato al 28 agosto 2026",
  isoDate: "2026-08-28",
  /** Copertura temporale del dataset: rilevazione esterna + snapshot interno. */
  temporalCoverage: "2026-07/2026-08-28",
} as const;

export type PresenzaComune = {
  nome: string;
  /** Numero di annunci in vendita con prezzo pubblicato. */
  campione: number;
  medianaPrezzo: number;
  /** Mediana €/m² sui soli annunci con superficie valida. */
  medianaEurM2: number;
  slug?: string;
};

/**
 * Presenza Furia per comune al 28/08/2026 (solo annunci con prezzo pubblicato).
 * Campioni molto piccoli: descrivono il nostro portafoglio, non il mercato.
 */
export const OSS_PRESENZA_COMUNI: PresenzaComune[] = [
  { nome: "Pontremoli", campione: 31, medianaPrezzo: 125000, medianaEurM2: 1163, slug: "pontremoli" },
  { nome: "Zeri", campione: 5, medianaPrezzo: 70000, medianaEurM2: 583, slug: "zeri" },
  { nome: "Bagnone", campione: 3, medianaPrezzo: 240000, medianaEurM2: 1286, slug: "bagnone" },
  { nome: "Mulazzo", campione: 2, medianaPrezzo: 44500, medianaEurM2: 392, slug: "mulazzo" },
  { nome: "Filattiera", campione: 1, medianaPrezzo: 115000, medianaEurM2: 1018, slug: "filattiera" },
  {
    nome: "Villafranca in Lunigiana",
    campione: 1,
    medianaPrezzo: 230000,
    medianaEurM2: 1533,
    slug: "villafranca-in-lunigiana",
  },
];

/** Fatti calcolabili dai 14 comuni, senza medie non ponderate. */
export function mercatoFacts() {
  const ordered = [...PZ_COMUNI].sort((a, b) => a.eurM2 - b.eurM2);
  const min = ordered[0];
  const max = ordered[ordered.length - 1];
  const inCrescita = PZ_COMUNI.filter((c) => c.varYoY > 0).length;
  const inCalo = PZ_COMUNI.filter((c) => c.varYoY < 0).length;
  const stabili = PZ_COMUNI.length - inCrescita - inCalo;
  return { totale: PZ_COMUNI.length, min, max, inCrescita, inCalo, stabili };
}
