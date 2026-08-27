import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/**
 * /affitti-residenziali-case-vacanze.asp (legacy ASP) → 301 verso il catalogo
 * immobili filtrato sul contratto di locazione. Destinazione statica.
 */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/affitti-residenziali-case-vacanze.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/affitti-residenziali-case-vacanze.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
