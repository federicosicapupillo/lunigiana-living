import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/**
 * /dove_siamo.asp (legacy ASP) → 301 verso /contatti, che contiene indirizzo,
 * mappa e recapiti dell'agenzia. Destinazione statica.
 */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/dove_siamo.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/dove_siamo.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
