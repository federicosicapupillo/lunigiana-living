/**
 * Utility condivise per la pipeline AI sulle immagini (render + enhance).
 * Nessun segreto qui: modulo puro, importabile ovunque.
 */

export const AI_IMAGE_MODEL = "google/gemini-3.1-flash-image";

/** Timeout di sicurezza per la chiamata al provider AI (ms). */
export const AI_IMAGE_TIMEOUT_MS = 120_000;

/**
 * Conversione binario → base64 a blocchi.
 * La versione precedente concatenava una stringa byte per byte
 * (`bin += String.fromCharCode(b)`): su una foto da 4–8 MB questo costava
 * decine di secondi di CPU nel worker. Con i chunk il costo è trascurabile.
 */
export function toBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(""));
}

export function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Logger di fase strutturato (nessun dato sensibile, nessuna chiave). */
export function createPhaseLogger(scope: string, ref: string) {
  const t0 = Date.now();
  let last = t0;
  return {
    phase(name: string, extra?: Record<string, string | number | boolean | null>) {
      const now = Date.now();
      console.info(
        JSON.stringify({
          scope,
          ref,
          phase: name,
          ms_since_prev: now - last,
          ms_total: now - t0,
          ...extra,
        }),
      );
      last = now;
    },
    total() {
      return Date.now() - t0;
    },
  };
}

/** fetch con timeout gestito (evita worker bloccati su provider lenti). */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = AI_IMAGE_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `Il provider AI non ha risposto entro ${Math.round(timeoutMs / 1000)} secondi. Riprova.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
