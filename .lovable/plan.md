## Obiettivo
Sito EN completamente automatico. L'admin lavora solo in italiano. Le traduzioni vengono generate on-demand la prima volta, salvate in cache e riusate sempre, con fallback IT se manca/fallisce.

## Architettura

### 1. Cache traduzioni (DB)
- I campi `*_en` già esistenti su `properties` e `property_descriptions` diventano **cache tecnica** (non lavoro manuale).
- Nuova tabella `translation_cache` per stringhe corte ripetute (accessori, dotazioni, caratteristiche, badge, highlights):
  ```
  translation_cache(
    source_hash text,        -- sha256(lower(trim(source)))
    target_lang text,        -- 'en'
    source_text text,
    translated_text text,
    created_at timestamptz,
    PRIMARY KEY (source_hash, target_lang)
  )
  ```
  RLS: lettura pubblica (anon+authenticated), scrittura solo service_role (via server fn).

### 2. Server functions pubbliche (no auth richiesta)
- `ensurePropertyEnglish(propertyId)`: se mancano `title_en/subtitle_en/summary_en/location_description_en/description_en`, chiama Lovable AI (`google/gemini-3-flash-preview`) UNA volta, salva i risultati nei campi `_en` con `supabaseAdmin`, restituisce la property già localizzata. Idempotente: se i campi esistono, no-op.
- `translateStrings({ texts: string[], lang: 'en' })`: lookup batch su `translation_cache` per hash; per i missing fa un'unica chiamata AI batch (JSON in/out), salva tutto in cache, restituisce mappa `{ source → translated }`.
- Rate-limit soft: throttle interno + try/catch → fallback all'italiano (mai rompe la pagina).

### 3. Integrazione frontend
- **Dettaglio immobile** (`immobili.$id.tsx`): nel loader, se `language==='en'` → `await ensurePropertyEnglish(id)`. Poi `translateStrings` per `amenities + features + highlights.items + tag`. Tutto con fallback IT.
- **Lista immobili** (`immobili.index.tsx` + `PropertyCard`): il loader pubblico già porta i `*_en`. Per le card non chiamiamo AI per ogni card (costoso); usiamo solo quanto già in cache DB. Quando l'utente apre la scheda, la traduzione completa viene generata e salvata, così la prossima visita la card mostrerà tutto in EN.
  - Per le card NON ancora visitate in EN: titolo IT come fallback (richiesta utente: "fallback senza rompere").
  - Etichette UI (`/mese → /month`, rooms, m², badge "Nuovo/In evidenza") già gestite via dizionario `t()`.
- **Pagine statiche, menu, footer, form, filtri, SEO**: già coperte dal dizionario `useT()` (verifico copertura e completo eventuali stringhe rimaste).

### 4. Admin: rimozione del lavoro manuale
- In `_admin.admin.immobili.nuovo.tsx` e `_admin.admin.immobili.$id.tsx`: la sezione "Versione inglese" viene **rimossa dal flusso normale**. Sostituita da un piccolo box info: *"Le traduzioni inglesi vengono generate automaticamente quando un utente visita la scheda in EN. Nessuna azione richiesta."*
- I campi `_en` restano nel DB (cache), ma non più nel form. Eventuale pulsante avanzato "Rigenera traduzione EN" opzionale, fuori dal flusso principale (solo se serve).

### 5. Performance
- Cache permanente su DB → la traduzione di un immobile costa AI una sola volta.
- Stringhe ripetute (es. "Giardino", "Parcheggio") condivise via `translation_cache` tra tutti gli immobili: dopo i primi annunci il costo crolla a quasi zero.
- Nessuna chiamata AI per utenti che restano in IT.
- Nessuna chiamata AI in lista (solo dettaglio), così la home/lista resta velocissima.

## File modificati / nuovi

**Nuovi**
- `supabase/migrations/<ts>_translation_cache.sql` — tabella + RLS + GRANT
- `src/lib/translation-cache.functions.ts` — `translateStrings`
- `src/lib/property-i18n.functions.ts` — `ensurePropertyEnglish` (pubblica, usa supabaseAdmin internamente)

**Modificati**
- `src/routes/immobili.$id.tsx` — loader chiama `ensurePropertyEnglish` + `translateStrings` quando lang=EN; render con fallback
- `src/components/property-card.tsx` — usa già `pickLocalized`, ok
- `src/routes/_admin.admin.immobili.nuovo.tsx` + `$id.tsx` — rimuovo sezione EN, aggiungo info-box
- `src/lib/i18n/translations.ts` — completo chiavi mancanti (badge, "Cover in uso", messaggi form, ecc.)
- Verifiche minori su form/filtri/footer per stringhe rimaste

## Fuori scope
- Nessun cambio a URL, auth, routing, upload immagini, logica di ricerca, schema immobili oltre la cache.
- Niente hreflang con URL separati (mantenuto come da decisione precedente).
- Niente traduzione di campi numerici/strutturati (prezzo, m², EPI).

## Rischi & mitigazioni
- **Costo AI** prima visita EN di un immobile → mitigato da cache permanente.
- **AI down / 402 / 429** → try/catch nel server fn, ritorna IT, log lato server, UI non rotta.
- **Stringhe lunghe** (description) → un'unica chiamata per immobile, salvata su `description_en`.
