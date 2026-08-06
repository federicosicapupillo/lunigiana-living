import { createFileRoute } from "@tanstack/react-router";

import { LEGACY_STATIC_REDIRECTS } from "@/lib/legacy-redirects";

function handle() {
  return new Response(null, {
    status: 301,
    headers: {
      location: LEGACY_STATIC_REDIRECTS["/index.asp"]!,
      "cache-control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/index.asp")({
  server: {
    handlers: { GET: handle, HEAD: handle },
  },
});
