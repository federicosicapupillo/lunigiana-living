import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/** /vendite.asp (legacy ASP) → 301 verso l'hub delle case in vendita. */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/vendite.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/vendite.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
