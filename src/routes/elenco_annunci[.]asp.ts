import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/** /elenco_annunci.asp (legacy ASP) → 301 verso il catalogo immobili. */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/elenco_annunci.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/elenco_annunci.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
