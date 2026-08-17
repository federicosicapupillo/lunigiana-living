import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/**
 * /affitti.asp (legacy ASP) → 301 verso il catalogo immobili filtrato "Affitto".
 * Destinazione statica: nessun parametro legacy viene propagato.
 */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/affitti.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/affitti.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
