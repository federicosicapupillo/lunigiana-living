import { createFileRoute } from "@tanstack/react-router";

const STYLE_PROMPTS: Record<string, string> = {
  minimal:
    "Restage this exact room as a minimal, bright, contemporary interior: neutral palette (warm whites, soft greys, pale oak), essential furniture, clean lines, airy and uncluttered, refined Scandinavian-Italian sensibility. Keep the original architecture, walls, windows, ceiling height, floor layout and camera angle perfectly identical — only change furniture, decor, textiles, lighting and finishes. Photorealistic interior photography, soft natural daylight.",
  rustico:
    "Restage this exact room as an elegant rustic interior in a characterful Lunigiana home: warm and authentic, natural materials, aged oak and chestnut wood, exposed stone accents, linen and wool textiles, handcrafted ceramics, soft warm lighting, cozy and welcoming atmosphere. Keep the original architecture, walls, windows, ceiling height, floor layout and camera angle perfectly identical — only change furniture, decor, textiles, lighting and finishes. Photorealistic interior photography.",
  luxury:
    "Restage this exact room as a sophisticated luxury interior: premium designer furniture, refined palette (deep neutrals, brass and bronze accents), marble and travertine details, fine upholstery in velvet and bouclé, layered curated lighting, high-end contemporary look. Keep the original architecture, walls, windows, ceiling height, floor layout and camera angle perfectly identical — only change furniture, decor, textiles, lighting and finishes. Photorealistic editorial interior photography.",
};

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
          const { imageUrl, style } = (await request.json()) as {
            imageUrl?: string;
            style?: string;
          };
          if (!imageUrl || !style || !STYLE_PROMPTS[style]) {
            return new Response(
              JSON.stringify({ error: "imageUrl e style (minimal | rustico | luxury) richiesti" }),
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
                      { type: "text", text: STYLE_PROMPTS[style] },
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