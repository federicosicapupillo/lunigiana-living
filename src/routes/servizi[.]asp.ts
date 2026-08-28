import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/** /servizi.asp (legacy ASP) → 301 verso /servizi. Destinazione statica. */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/servizi.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/servizi.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
