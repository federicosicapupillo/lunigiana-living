import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

/** /contatti.asp (legacy ASP) → 301 verso /contatti. Destinazione statica. */
function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/contatti.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/contatti.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
