type Variant = "gone" | "not-found";

const COPY: Record<Variant, { title: string; heading: string; body: string }> = {
  gone: {
    title: "Immobile non più disponibile — Furia Immobiliare",
    heading: "Questo immobile non è più disponibile",
    body: "L'annuncio che stai cercando è stato ritirato dal mercato. Puoi consultare gli immobili attualmente disponibili in Lunigiana o scriverci per una ricerca personalizzata.",
  },
  "not-found": {
    title: "Pagina non trovata — Furia Immobiliare",
    heading: "Pagina non trovata",
    body: "La pagina che stai cercando non esiste o è stata spostata. Puoi consultare gli immobili attualmente disponibili in Lunigiana.",
  },
};

/**
 * Pagina HTML autonoma (nessuna dipendenza dall'app) servita con lo status
 * reale della risposta: 410 per gli immobili rimossi, 404 per il resto.
 * Non esegue alcun redirect automatico e non simula una scheda immobile.
 */
export function renderLegacyStatusPage(variant: Variant): string {
  const { title, heading, body } = COPY[variant];
  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 16px/1.6 Inter, system-ui, -apple-system, sans-serif; background: #faf6f1; color: #2a211c; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 34rem; width: 100%; text-align: center; background: #fffdfa; border: 1px solid #e7ded4; border-radius: 6px; padding: 3rem 2rem; }
      .eyebrow { font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: #a1622f; }
      h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 2rem; font-weight: 500; margin: 0.75rem 0 1rem; }
      p { color: #5c504a; margin: 0 0 2rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a { padding: 0.9rem 1.75rem; border-radius: 3px; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #a1622f; color: #fffdfa; }
      .secondary { color: #2a211c; border-color: rgba(42,33,28,0.2); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="eyebrow">Furia Immobiliare</div>
      <h1>${heading}</h1>
      <p>${body}</p>
      <div class="actions">
        <a class="primary" href="/immobili">Immobili disponibili</a>
        <a class="secondary" href="/contatti">Contattaci</a>
      </div>
    </div>
  </body>
</html>`;
}

export function legacyStatusResponse(variant: Variant): Response {
  return new Response(renderLegacyStatusPage(variant), {
    status: variant === "gone" ? 410 : 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}