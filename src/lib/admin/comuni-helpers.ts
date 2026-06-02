import comuniData from "./data/comuni.json";

export type ComuneRaw = {
  /** nome comune */
  n: string;
  /** sigla provincia (es. "MS") */
  s: string;
  /** nome provincia (es. "Massa-Carrara") */
  p: string;
  /** nome regione */
  r: string;
  /** CAP collegati */
  c: string[];
};

export const COMUNI = comuniData as ComuneRaw[];

/** Tutte le regioni italiane, ordinate alfabeticamente. */
export const REGIONI_IT: string[] = Array.from(
  new Set(COMUNI.map((c) => c.r)),
).sort((a, b) => a.localeCompare(b, "it"));

/** Province (sigla + nome + regione) ordinate per nome. */
export type ProvinciaRecord = { code: string; name: string; region: string };
export const PROVINCE_IT: ProvinciaRecord[] = (() => {
  const map = new Map<string, ProvinciaRecord>();
  for (const c of COMUNI) {
    if (!map.has(c.s)) map.set(c.s, { code: c.s, name: c.p, region: c.r });
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "it"));
})();

/** Province di una regione (per cascata Regione → Provincia). */
export function provinceByRegion(region: string | null | undefined): ProvinciaRecord[] {
  if (!region) return PROVINCE_IT;
  return PROVINCE_IT.filter((p) => p.region === region);
}

/** Comuni di una provincia (per sigla). */
export function comuniByProvincia(sigla: string | null | undefined): ComuneRaw[] {
  if (!sigla) return [];
  return COMUNI.filter((c) => c.s === sigla).sort((a, b) =>
    a.n.localeCompare(b.n, "it"),
  );
}

/** Trova il record comune per nome + sigla provincia. */
export function findComune(
  nome: string | null | undefined,
  sigla: string | null | undefined,
): ComuneRaw | undefined {
  if (!nome) return undefined;
  const target = nome.trim().toLowerCase();
  return COMUNI.find(
    (c) =>
      c.n.toLowerCase() === target && (!sigla || c.s === sigla),
  );
}

/** Restituisce i CAP collegati a un comune (per cascata Comune → CAP). */
export function capByComune(
  nome: string | null | undefined,
  sigla: string | null | undefined,
): string[] {
  return findComune(nome, sigla)?.c ?? [];
}

/** Deduce regione/provincia a partire dal solo nome comune (best-effort). */
export function inferFromComune(nome: string | null | undefined): ComuneRaw | undefined {
  if (!nome) return undefined;
  const target = nome.trim().toLowerCase();
  return COMUNI.find((c) => c.n.toLowerCase() === target);
}