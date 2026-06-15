import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedProperties } from "@/lib/public-properties.functions";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { getSiteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = getSiteUrl();
        const { properties } = await listPublishedProperties();
        const paths = [
          "/", "/immobili", "/territori", "/servizi", "/chi-siamo", "/contatti",
          "/case-in-vendita",
          ...COMUNE_SEO.map((c) => `/case-in-vendita/${c.slug}`),
          ...properties.map((p) => `/immobili/${p.slug || p.id}`),
        ];
        const urls = paths.map(
          (p) => `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});