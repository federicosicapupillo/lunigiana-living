import { createFileRoute } from "@tanstack/react-router";

import { legacyStatusResponse } from "@/lib/legacy-gone-page";
import { resolveLegacyProperty } from "@/lib/legacy-redirects";

function handle({ request }: { request: Request }) {
  const resolution = resolveLegacyProperty(new URL(request.url));
  if (resolution.kind === "redirect") {
    return new Response(null, {
      status: 301,
      headers: { location: resolution.location, "cache-control": "public, max-age=3600" },
    });
  }
  return legacyStatusResponse(resolution.kind === "gone" ? "gone" : "not-found");
}

export const Route = createFileRoute("/annuncio.asp")({
  server: {
    handlers: {
      GET: handle,
      HEAD: handle,
    },
  },
});