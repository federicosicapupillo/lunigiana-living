## Obiettivo

Estendere il sistema i18n già avviato a tutto il sito Furia Immobiliare. Stessi URL, lingua via selettore. Nessuna modifica a logica immobili, DB esistente (le colonne `_en` ci sono già), auth, immagini, filtri di ricerca.

## 1. Dizionario traduzioni completo

Estendere `src/lib/i18n/translations.ts` con tutte le chiavi mancanti, raggruppate per area:

- `home.*` — hero, sezioni servizi, territori, CTA, testimonianze
- `chiSiamo.*` — titoli, paragrafi, blockquote, statistiche
- `servizi.*` — tutte le card servizi e descrizioni
- `territori.*` — intro, schede comuni (Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri)
- `contatti.*` — già parziale, completare
- `immobili.*` — pagina lista, filtri, badge, etichette (€/mese vs prezzo, locali, mq, ecc.)
- `propertyDetail.*` — sezioni scheda immobile (descrizione, caratteristiche, classe energetica, contattaci)
- `form.*` — placeholder, label, validazione, messaggi di successo/errore, toast
- `common.*` — pulsanti generici (chiudi, indietro, salva, conferma, annulla, scopri di più, ecc.)
- `seo.*` — title e description per ogni pagina

Helper `t(key, lang)` con fallback automatico IT.

## 2. Pagine statiche da convertire

Sostituire stringhe hardcoded con `useT()` in:

- `src/routes/index.tsx` (Home)
- `src/routes/chi-siamo.tsx`
- `src/routes/servizi.tsx`
- `src/routes/territori.tsx`
- `src/routes/contatti.tsx` (completare)
- `src/routes/immobili.index.tsx`
- `src/routes/immobili.$id.tsx`
- `src/routes/immobili.tsx` (layout)

## 3. Componenti UI

- Completare componenti non ancora toccati: badge "In evidenza", "Nuovo", stati immobile (Disponibile, Venduto, Affittato), classe energetica, "Cover in uso", testi vuoti ("Nessun immobile trovato"), pulsanti "Vedi tutti", "Scopri di più".
- Aggiornare toast/sonner messages e validazione `lead-form` con le chiavi `form.*`.

## 4. SEO multilingua (client-side)

Nuovo hook `useLocalizedHead({ titleKey, descriptionKey })` che:

- aggiorna `document.title` quando cambia la lingua
- aggiorna `<meta name="description">` via DOM
- aggiorna `<html lang="...">` (già fatto)
- aggiunge tag `<link rel="alternate" hreflang="it">` e `hreflang="en">` puntando allo stesso URL con query `?lang=en` (best-effort, dato che URL non cambia)

Applicato in ogni route page tramite `useEffect`. I valori SSR restano in italiano (accettabile: il selettore lingua è client-side).

## 5. Immobili: campi EN già in DB

Colonne già presenti:
- `properties.title_en, subtitle_en, summary_en, location_description_en`
- `property_descriptions.description_en`

Frontend (`property-card`, `immobili.$id`, `immobili.index`) usa helper `pickLocalized(it, en, lang)` che ritorna EN se presente, altrimenti IT. Già parzialmente fatto, da completare per tutti i campi sopra.

## 6. Admin: input EN + traduzione AI

In `src/routes/_admin.admin.immobili.nuovo.tsx` e `_admin.admin.immobili.$id.tsx`:

- Nuova sezione "Versione inglese (opzionale)" con campi:
  - Titolo EN
  - Sottotitolo EN
  - Riassunto EN (textarea)
  - Descrizione zona EN (textarea)
  - Descrizione lunga EN (textarea, su `property_descriptions.description_en`)
- Pulsante "Traduci con AI" accanto a ciascun campo EN (o uno globale "Traduci tutto"): chiama nuova server function `translatePropertyToEnglish` che usa Lovable AI Gateway (modello `google/gemini-3-flash-preview`) per tradurre i campi IT corrispondenti e popola gli input EN. L'admin può poi rivedere e salvare.

Nuovo file: `src/lib/property-translate.functions.ts` con `createServerFn` protetto da `requireSupabaseAuth` + check ruolo admin via `has_role`. Input: tutti i campi IT da tradurre. Output: oggetto con i corrispettivi EN.

## 7. Fallback

Helper `pickLocalized(it, en, lang)`:
```
if (lang === 'en' && en?.trim()) return en;
return it;
```
Usato ovunque vengano mostrati campi immobile.

## 8. Performance e safety

- Nessuna modifica a route, URL, query Supabase, filtri.
- Nessun cambiamento a immagini, auth, storage.
- SSR non rallenta: il dizionario è un singolo file statico importato lazy nel context client.

## Sezione tecnica

### File nuovi
- `src/hooks/use-localized-head.ts`
- `src/lib/property-translate.functions.ts`
- `src/lib/i18n/pick-localized.ts`

### File modificati
- `src/lib/i18n/translations.ts` (espansione massiccia dizionario)
- 8 route pages elencate sopra
- ~5 componenti residui (badge, toast, validazione form)
- 2 file admin (input EN + pulsante AI)

### Stima
~20 file toccati, ~1 file di traduzioni esteso significativamente, 1 server function nuova per la traduzione AI.

### Fuori scope (confermato)
- URL `/en/...` (mantenuti gli stessi)
- hreflang con URL distinti (impossibile senza route separate; aggiungiamo solo `<html lang>` e meta description tradotta)
- Modifiche a logica immobili, filtri, DB, auth, immagini
