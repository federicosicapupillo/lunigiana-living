import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedPropertySitemapRows } from "@/lib/public-properties.functions";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import { getSiteUrl } from "@/lib/site-url";
import { propertyPath } from "@/lib/property-url";

/** Solo timestamp reali del database, normalizzati a data ISO (YYYY-MM-DD). */
function isoDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = getSiteUrl();
        const { rows } = await listPublishedPropertySitemapRows();
        // Pagine statiche/editoriali: nessun lastmod, non esiste un timestamp
        // di contenuto affidabile nel progetto.
        const staticPaths = [
          "/", "/immobili", "/territori", "/servizi", "/chi-siamo", "/contatti",
          "/case-in-vendita",
          ...COMUNE_SEO.map((c) => `/case-in-vendita/${c.slug}`),
          "/case-in-vendita-lunigiana",
          ...TIPOLOGIE_SEO.map((t) => `/case-in-vendita-lunigiana/${t.slug}`),
          "/trova-casa-lunigiana",
          "/valuta-casa",
          "/off-market",
          "/vivere-a-pontremoli",
          "/prezzi-case-lunigiana",
          "/dove-comprare-casa-lunigiana",
          "/osservatorio-immobiliare-lunigiana",
          "/quanto-vale-casa-pontremoli",
          "/come-vendere-casa-lunigiana",


          "/vivere-in-lunigiana",
        ];
        const entries: { path: string; lastmod?: string }[] = [
          ...staticPaths.map((path) => ({ path })),
          ...rows.map((r) => {
            const lastmod = isoDate(r.updatedAt);
            return lastmod
              ? { path: propertyPath(r), lastmod }
              : { path: propertyPath(r) };
          }),
        ];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            `    <changefreq>weekly</changefreq>`,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});