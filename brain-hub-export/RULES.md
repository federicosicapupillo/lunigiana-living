# Furia Immobiliare — Rules

## Regole globali progetto

- **Mobile-first sempre**: ogni modifica deve essere prima verificata su smartphone, poi su desktop. Non rompere mai il desktop.
- **Nessuno scroll orizzontale** ammesso su nessuna pagina, mobile o desktop.
- **Nessun testo tagliato**, nessuna immagine deformata.
- **Performance immagini**: lazy loading, dimensioni responsive, formati ottimizzati. Niente immagini originali pesanti servite direttamente.
- **SEO base obbligatorio**: ogni route ha il suo `head()` con `title`, `meta description`, og tag. Single H1 per pagina.
- **Accessibilità**: contrasti adeguati, target tap ≥ 44px su mobile, alt text su immagini.

## Vincoli di design

- Stile: elegante, sobrio, "Apple-like", caldo. Ispirazione: Lunigiana, tramonti, oliveti, borghi di pietra.
- Tipografia: serif per heading istituzionali (`font-serif text-ink`), sans per body.
- Usare **solo token semantici** definiti in `src/styles.css` (`--background`, `--foreground`, `--primary`, `--ink`, ecc.). **Mai** colori hardcoded tipo `text-white`, `bg-black`.
- Colori CSS in formato `oklch`.
- Watermark dell'agenzia su tutte le foto pubbliche.
- Logo `furia-logo.png` non va modificato.
- Header pulito: niente CTA invadenti.
- "Area riservata" è una voce **discreta** nel footer, non un pulsante in evidenza.

## Vincoli commerciali

- Il sito rappresenta **l'agenzia Furia Immobiliare** (Elena Furia, Lunigiana).
- Target principale: clienti italiani e stranieri interessati alla Lunigiana.
- Il prezzo può essere "Su richiesta" → mostrare etichetta dedicata, non `€ —` o `0`.
- I contatti dell'agenzia (telefono, email, indirizzo) devono restare sempre visibili nel footer.
- Gli annunci visibili al pubblico sono **solo quelli con `status = published`**.
- Le foto degli immobili sono asset dell'agenzia: niente cancellazioni o sovrascritture senza richiesta esplicita.

## Vincoli tecnici / cosa NON modificare

- **NON modificare** file auto-generati:
  - `src/routeTree.gen.ts`
  - `src/integrations/supabase/client.ts`
  - `src/integrations/supabase/client.server.ts`
  - `src/integrations/supabase/auth-middleware.ts`
  - `src/integrations/supabase/auth-attacher.ts`
  - `src/integrations/supabase/types.ts`
  - `.env` (chiavi Supabase)
  - `supabase/config.toml`
- **NON toccare** schemi Supabase interni: `auth`, `storage`, `realtime`, `supabase_functions`, `vault`.
- **NON usare** `src/pages/` (convenzione altro framework). Routing solo in `src/routes/` (file-based TanStack).
- **NON storare ruoli** sul profilo utente: solo su `user_roles` + `has_role()`.
- **NON esporre** chiavi API o `service_role` lato client.
- Per ogni nuova tabella `public.*` in migration: **sempre** `GRANT` + `ENABLE RLS` + policy.

## Regole di workflow

- Cambi UI → restare in codice frontend, non toccare logica di business o DB senza richiesta esplicita.
- Non re-introdurre il pulsante "Parla con noi" nell'header (decisione presa).
- Non re-aggiungere "Area riservata" nell'header (sta nel footer).
- Non duplicare immagini quando si genera rendering AI: la foto originale resta, la variante si aggiunge.
- Backend: mantenere la struttura attuale, non rinominare route admin.

## Verifica finale per ogni modifica significativa

- ✅ Home, listing immobili, scheda immobile, backend perfetti da smartphone.
- ✅ Desktop ancora corretto.
- ✅ Menu mobile funzionante.
- ✅ Form contatti leggibile.
- ✅ Nessuno scroll orizzontale, nessun contenuto tagliato.
- ✅ Login admin protetto, RLS attive.