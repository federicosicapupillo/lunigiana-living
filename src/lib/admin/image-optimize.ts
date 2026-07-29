/**
 * Ottimizzazione immagini lato client, senza librerie esterne.
 * Usa createImageBitmap (rispetta l'orientamento EXIF) + canvas.
 * Le foto immobiliari restano di alta qualità: lato lungo max 2560px, JPEG q. 0.86.
 */

export const MAX_LONG_SIDE = 2560;
export const JPEG_QUALITY = 0.86;
/** Sotto questa soglia (e con dimensioni contenute) la foto viene caricata così com'è. */
const SKIP_BELOW_BYTES = 900 * 1024;

export type OptimizeResult = {
  blob: Blob;
  filename: string;
  contentType: string;
  bytesBefore: number;
  bytesAfter: number;
  optimized: boolean;
};

function canUseCanvas() {
  return typeof document !== "undefined" && typeof createImageBitmap === "function";
}

export async function optimizeImage(file: File): Promise<OptimizeResult> {
  const base: OptimizeResult = {
    blob: file,
    filename: file.name,
    contentType: file.type || "image/jpeg",
    bytesBefore: file.size,
    bytesAfter: file.size,
    optimized: false,
  };
  if (!canUseCanvas()) return base;

  let bitmap: ImageBitmap;
  try {
    // imageOrientation: "from-image" applica la rotazione EXIF una volta sola.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Formati non decodificabili dal browser (es. HEIC su Chrome): upload originale.
    return base;
  }

  const longSide = Math.max(bitmap.width, bitmap.height);
  const needsResize = longSide > MAX_LONG_SIDE;
  const needsRecompress = file.size > SKIP_BELOW_BYTES;
  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  if (!needsResize && !needsRecompress && !isHeic) {
    bitmap.close();
    return base;
  }

  const scale = needsResize ? MAX_LONG_SIDE / longSide : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return base;
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return base;
  // Se l'ottimizzazione non conviene (e non serviva conversione), tieni l'originale.
  if (!isHeic && !needsResize && blob.size >= file.size) return base;

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
    contentType: "image/jpeg",
    bytesBefore: file.size,
    bytesAfter: blob.size,
    optimized: true,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Esegue i task con concorrenza limitata (default 4 upload simultanei). */
export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit = 4,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const index = cursor++;
      results[index] = await tasks[index]();
    }
  });
  await Promise.all(workers);
  return results;
}
