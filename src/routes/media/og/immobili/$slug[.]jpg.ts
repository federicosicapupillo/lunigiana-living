import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { publishedImagePath } from "@/lib/property-image-source";
import { siteUrl } from "@/lib/site-url";

/**
 * Immagine Open Graph stabile per le schede immobile.
 *
 *   /media/og/immobili/<slug>.jpg
 *
 * L'unico identificatore accettato è lo slug pubblico: nessun percorso
 * storage, nessuna URL esterna, nessun proxy generico. Il bucket resta
 * privato: la signed URL viene usata solo internamente e mai restituita
 * al client (rispondiamo con lo stream dell'immagine trasformata).
 */

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_QUALITY = 78;
// Cache prudente e revocabile: un immobile può essere sospeso o rimosso.
const CACHE_CONTROL = "public, max-age=300, s-maxage=3600";
const FALLBACK_URL = siteUrl("/og/furia-immobiliare.jpg");

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,120}$/i;

function fallbackRedirect(): Response {
  // Asset statico sul dominio canonico (nessun token, nessun dominio preview).
  return Response.redirect(FALLBACK_URL, 302);
}

export const Route = createFileRoute("/media/og/immobili/$slug.jpg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params.slug ?? "").trim();
        const slug = raw.replace(/\.(jpg|jpeg)$/i, "");
        console.log("[media/og] slug", JSON.stringify({ raw, slug }));
        if (!slug || !SLUG_RE.test(slug)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: prop, error } = await supabaseAdmin
          .from("properties")
          .select("id, status")
          .eq("slug", slug)
          .maybeSingle();
        if (error) {
          console.error("[media/og] db error", { slug, error: error.message });
          return new Response("Not found", { status: 404 });
        }
        if (!prop) return new Response("Not found", { status: 404 });
        // Solo gli immobili pubblicati hanno una preview social. Gli stati
        // ritirati (sold/rented/archived/deleted) rispondono 410 Gone, gli
        // altri (draft/ready/suspended) 404: mai un'immagine privata.
        if (prop.status !== "published") {
          const gone = ["sold", "rented", "archived", "deleted"].includes(prop.status);
          return new Response(gone ? "Gone" : "Not found", { status: gone ? 410 : 404 });
        }

        const { data: images } = await supabaseAdmin
          .from("property_images")
          .select(
            "property_id, published_image_url, storage_path, rendered_storage_path, rendered_image_url, render_publish_mode, use_rendered, enhanced_storage_path, enhanced_image_url, use_enhanced, sort_order, is_cover",
          )
          .eq("property_id", prop.id)
          .order("is_cover", { ascending: false })
          .order("sort_order", { ascending: true })
          .limit(1);

        const cover = images?.[0];
        // Vincolo di appartenenza: la riga arriva dalla query filtrata per
        // property_id e il percorso deve iniziare con l'id dell'immobile.
        const path = cover ? publishedImagePath(cover) : null;
        if (!cover || !path || cover.property_id !== prop.id || !path.startsWith(`${prop.id}/`)) {
          return fallbackRedirect();
        }

        const { data: signed, error: signError } = await supabaseAdmin.storage
          .from("property-images")
          .createSignedUrl(path, 60, {
            transform: { width: OG_WIDTH, height: OG_HEIGHT, resize: "cover", quality: OG_QUALITY },
          });
        if (signError || !signed?.signedUrl) return fallbackRedirect();

        const upstream = await fetch(signed.signedUrl);
        if (!upstream.ok || !upstream.body) return fallbackRedirect();

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "image/jpeg",
            "cache-control": CACHE_CONTROL,
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
