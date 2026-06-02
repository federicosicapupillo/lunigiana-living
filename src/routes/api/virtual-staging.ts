import { createFileRoute } from "@tanstack/react-router";

type Intensity = "decisa" | "delicata";

const STRUCTURE_RULE =
  "STRUCTURAL FIDELITY (mandatory): keep the original photograph's architecture, perspective, camera angle, focal length, framing and proportions IDENTICAL. Do not move, add or remove walls, ceilings, floors, windows, doors, stairs, columns, beams or openings. Do not turn an outdoor space into an indoor one or vice versa, and do not change the function/typology of the space. Preserve the view beyond windows or railings and the structural materials of walls, floor and ceiling (or the sky for outdoor spaces).";

const TRANSFORM_RULE_STRONG =
  "TRANSFORMATION INTENSITY (mandatory, strong): this is a full RESTYLING, not a light retouch. The result must look obviously and unmistakably different from the source photo while remaining the same room. REMOVE every existing piece of furniture, every decorative object, every textile, every plant and every accessory from the original image, and REPLACE them with a complete, cohesive new set in the chosen style. Re-do the entire interior styling: new furniture layout coherent with the room's geometry, new color palette, new perceived finishes on furniture and soft surfaces, new lighting fixtures and lighting mood, new textiles, new art and accessories. Avoid timid edits, partial swaps or leaving original items in place. A side-by-side comparison with the original must immediately read as 'completely restyled in the new style'.";

const TRANSFORM_RULE_LIGHT =
  "TRANSFORMATION INTENSITY (medium): perform a clear restyling but keep a softer hand. Replace most furniture and decor with new pieces in the chosen style, refresh the palette, textiles and lighting, but you may preserve one or two characteristic existing elements if they fit the new style. The result must still be clearly different from the original at a glance.";

const INDOOR_STYLES: Record<string, string> = {
  minimal:
    "STYLE — Minimal contemporary Italian interior. Strip the room down: only a few essential, low-profile pieces of furniture. Warm whites, soft greys, pale oak and matte black accents. Smooth matte finishes, clean lines, no clutter, generous empty space. One large statement piece (sofa, dining table or bed) plus a maximum of two-three accessories. Architectural soft natural daylight, almost no decoration on the walls except one understated artwork. Editorial photorealistic interior photography, Scandinavian-Italian sensibility.",
  rustico:
    "STYLE — Elegant rustic Lunigiana interior. Warm and authentic atmosphere with strong material presence: aged oak and chestnut wood furniture with visible grain, exposed stone or stone-effect accents, natural linen and wool textiles in cream, terracotta and olive tones, handcrafted ceramics, woven baskets, wrought iron details. Visible wooden beams or terracotta floor styling where appropriate. Soft warm tungsten lighting, candles or lanterns, a glowing fireplace mood if a fireplace is visible. Inviting, lived-in but refined. Editorial photorealistic interior photography.",
  luxury:
    "STYLE — Sophisticated luxury contemporary interior. Premium designer furniture (sculptural sofa in bouclé or velvet, marble or travertine coffee/dining table, designer lounge chairs), refined deep neutral palette with brass, bronze or smoked-glass accents. Layered curated lighting: floor lamp, table lamp, decorative pendant. Rich textured rugs, oversized art piece, hardback design books, sculptural objects. Polished plaster or stone-effect feature wall where appropriate. Cinematic depth of field, warm golden-hour interior light, high-end editorial photorealistic photography, the kind of image you would see in Architectural Digest.",
};

const OUTDOOR_STYLES: Record<string, string> = {
  minimal:
    "STYLE — Minimal contemporary outdoor lounge. KEEP THE SPACE OPEN to sky and landscape. Remove every existing outdoor element and replace with: low-profile teak or powder-coated lounge seating in neutral tones, slim outdoor coffee table, a few large simple planters with sculptural greenery, an outdoor rug in oatmeal, discreet linear outdoor lighting. Almost monochromatic palette of warm white, sand and matte black. Editorial outdoor architectural photography, soft natural daylight.",
  rustico:
    "STYLE — Warm rustic Lunigiana outdoor area. KEEP THE SPACE OPEN. Replace existing outdoor furniture with: solid chestnut or oak table set for outdoor dining, wrought-iron chairs with linen cushions in cream and terracotta, large terracotta planters with olive trees, lavender, rosemary and geraniums, hanging lanterns or string lights, a woven outdoor rug. Mediterranean palette, warm late-afternoon natural light, photorealistic outdoor photography with a lived-in welcoming feel.",
  luxury:
    "STYLE — Refined luxury outdoor area. KEEP THE SPACE OPEN to sky and landscape. Replace all outdoor elements with: designer modular outdoor sofa in performance fabric (greige or graphite), travertine or stone outdoor coffee table, sculptural lounge chairs, oversized architectural planters with mature olive trees or topiary, layered outdoor lighting (linear ground lights, sculptural floor lamps, festoon overhead), an outdoor rug in muted neutral. Bronze and stone accents, cinematic warm sunset light, editorial outdoor photorealistic photography.",
};

function buildPrompt(
  space: "interno" | "esterno",
  style: string,
  intensity: Intensity,
): string | null {
  const map = space === "esterno" ? OUTDOOR_STYLES : INDOOR_STYLES;
  if (!map[style]) return null;
  const transform =
    intensity === "delicata" ? TRANSFORM_RULE_LIGHT : TRANSFORM_RULE_STRONG;
  return `${STRUCTURE_RULE}\n\n${transform}\n\n${map[style]}\n\nFINAL CHECK: the result must keep the exact same room (same walls, openings, perspective) but the styling, furniture, palette and atmosphere must be clearly and obviously transformed compared to the source photo. If the output would look only marginally different from the source, push the restyling further within these structural constraints.`;
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
          const { imageUrl, style, space, intensity } = (await request.json()) as {
            imageUrl?: string;
            style?: string;
            space?: "interno" | "esterno";
            intensity?: Intensity;
          };
          const spaceType: "interno" | "esterno" =
            space === "esterno" ? "esterno" : "interno";
          const intensityValue: Intensity =
            intensity === "delicata" ? "delicata" : "decisa";
          const prompt =
            imageUrl && style ? buildPrompt(spaceType, style, intensityValue) : null;
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