import { createFileRoute } from "@tanstack/react-router";

const STRUCTURE_RULE =
  "ABSOLUTE STRUCTURAL FIDELITY: preserve the original photograph's architecture, perspective, camera angle, focal length, framing, proportions and spatial nature EXACTLY. Do NOT close open spaces, do NOT add walls, ceilings, windows, doors or openings that are not already in the photo, do NOT remove existing openings, do NOT transform outdoor spaces into indoor rooms or vice versa, do NOT change the function or typology of the space. Keep existing walls, floors, ceilings (or sky), railings, columns, beams, structural elements, views and landscape outside windows or beyond railings identical. Only restyle: furniture, decor, textiles, finishes, lighting, plants and small accessories that are coherent with the existing space.";

const INDOOR_STYLES: Record<string, string> = {
  minimal:
    "Restage this INTERIOR room as a minimal, bright, contemporary Italian interior: neutral palette (warm whites, soft greys, pale oak), essential furniture, clean lines, airy and uncluttered, refined Scandinavian-Italian sensibility, soft natural daylight. Photorealistic interior photography.",
  rustico:
    "Restage this INTERIOR room as an elegant rustic interior in a characterful Lunigiana home: warm and authentic, natural materials, aged oak and chestnut wood, exposed stone accents, linen and wool textiles, handcrafted ceramics, soft warm lighting, cozy and welcoming. Photorealistic interior photography.",
  luxury:
    "Restage this INTERIOR room as a sophisticated luxury interior: premium designer furniture, refined palette (deep neutrals, brass and bronze accents), marble and travertine details, fine upholstery in velvet and bouclé, layered curated lighting, high-end contemporary editorial look. Photorealistic interior photography.",
};

const OUTDOOR_STYLES: Record<string, string> = {
  minimal:
    "Restyle this OUTDOOR space (terrace, balcony, loggia, portico, courtyard, garden or external area) as a minimal contemporary outdoor lounge: keep the space fully OPEN to the sky/landscape, preserve railings, parapets, columns, paving, existing walls and the view beyond. Add only outdoor-appropriate elements: low-profile teak or powder-coated furniture, neutral outdoor textiles, simple potted greenery, discreet outdoor lighting. Natural daylight, photorealistic outdoor architectural photography.",
  rustico:
    "Restyle this OUTDOOR space as a warm rustic Lunigiana outdoor area: keep the space fully OPEN, preserve stone walls, terracotta or stone paving, railings, beams, pergolas and the surrounding landscape. Add only outdoor elements: solid wood or wrought-iron furniture, linen cushions, terracotta planters with Mediterranean plants (olive, lavender, rosemary), lanterns, a wooden table set for outdoor dining. Warm natural light, photorealistic outdoor photography.",
  luxury:
    "Restyle this OUTDOOR space as a refined luxury outdoor area: keep it fully OPEN to sky and landscape, preserve all structural elements (railings, columns, parapets, paving, pergolas, view). Add only premium outdoor elements: designer outdoor sofas in performance fabric, travertine or stone coffee tables, sculptural planters, layered outdoor lighting, refined neutral palette with bronze accents. Editorial outdoor photography, natural light.",
};

function buildPrompt(space: "interno" | "esterno", style: string): string | null {
  const map = space === "esterno" ? OUTDOOR_STYLES : INDOOR_STYLES;
  if (!map[style]) return null;
  return `${STRUCTURE_RULE}\n\n${map[style]}`;
}

async function fetchAsDataUrl(url: string, origin: string): Promise<string> {
  const absolute = url.startsWith("http") ? url : new URL(url, origin).toString();
  const res = await fetch(absolute);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  const b64 = btoa(binary);
  return `data:${contentType};base64,${b64}`;
}

export const Route = createFileRoute("/api/virtual-staging")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { imageUrl, style, space } = (await request.json()) as {
            imageUrl?: string;
            style?: string;
            space?: "interno" | "esterno";
          };
          const spaceType: "interno" | "esterno" =
            space === "esterno" ? "esterno" : "interno";
          const prompt = imageUrl && style ? buildPrompt(spaceType, style) : null;
          if (!imageUrl || !style || !prompt) {
            return new Response(
              JSON.stringify({
                error:
                  "imageUrl, space (interno | esterno) e style (minimal | rustico | luxury) richiesti",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "AI non configurata" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const dataUrl = await fetchAsDataUrl(imageUrl, new URL(request.url).origin);

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/images/generations",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3.1-flash-image-preview",
                modalities: ["image", "text"],
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: prompt },
                      { type: "image_url", image_url: { url: dataUrl } },
                    ],
                  },
                ],
              }),
            },
          );

          if (!upstream.ok) {
            const text = await upstream.text();
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Troppe richieste, riprova fra poco." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "Crediti AI esauriti. Contatta l'amministratore." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(
              JSON.stringify({ error: "Errore generazione", detail: text.slice(0, 300) }),
              { status: upstream.status, headers: { "Content-Type": "application/json" } },
            );
          }

          const json = (await upstream.json()) as {
            data?: Array<{ b64_json?: string }>;
          };
          const b64 = json.data?.[0]?.b64_json;
          if (!b64) {
            return new Response(
              JSON.stringify({ error: "Nessuna immagine generata" }),
              { status: 502, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({ image: `data:image/png;base64,${b64}` }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Errore" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});