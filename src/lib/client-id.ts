/**
 * Client-safe UUID v4 generator.
 *
 * Used to mint a lead id BEFORE the insert, so the freshly created lead can be
 * referenced by analytics events without a `.select("id")` (which the public
 * client cannot do: SELECT on leads is admin-only).
 *
 * Returns null when no secure randomness is available — callers must treat the
 * id as optional and let the database default kick in.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function createClientUuid(): string | null {
  try {
    if (typeof crypto === "undefined") return null;
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      // RFC 4122 version 4 + variant bits.
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return null;
  } catch {
    return null;
  }
}
