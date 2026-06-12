import { createFileRoute } from "@tanstack/react-router";
import {
  buildIdealistaFeedXml,
  getIdealistaFeedToken,
  touchIdealistaFeedTimestamp,
} from "@/lib/idealista.functions";

export const Route = createFileRoute("/api/public/idealista/feed.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const expected = await getIdealistaFeedToken();
        if (!expected || !token || token !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { xml } = await buildIdealistaFeedXml();
        await touchIdealistaFeedTimestamp();
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});