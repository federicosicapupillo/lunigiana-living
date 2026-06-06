# Furia Immobiliare — User Flows

## 1. Flussi utente pubblico

### 1.1 Visitatore cerca casa (mobile, prevalente)
1. Atterra su `/` (home) → vede hero, immobili in evidenza, territori.
2. Tocca "Vedi tutti gli immobili" o un comune → arriva su `/immobili`.
3. Filtra per categoria (vendita / affitto), comune, tipologia, prezzo.
4. Tocca una card → `/immobili/:id`.
5. Sfoglia la gallery, legge attributi e descrizione.
6. Tocca "Contatta l'agenzia" → `/contatti` (form precompilato con riferimento).

### 1.2 Visitatore istituzionale
- `/chi-siamo` → conosce Elena Furia e l'agenzia.
- `/servizi` → capisce cosa offre l'agenzia (compravendita, locazione, valutazioni, virtual staging).
- `/territori` → approfondisce i comuni della Lunigiana.

### 1.3 Contatto diretto
- Va a `/contatti` → compila form (nome, email, telefono, messaggio) → invio.
- Trova anche telefono / email in footer.

### 1.4 Accesso area riservata (link discreto)
- Footer → sezione "Naviga" → "Area riservata" → `/admin/login`.

## 2. Flussi admin (Elena / collaboratori)

### 2.1 Login
1. `/admin/login` → email + password Supabase.
2. Hook `useAdmin` verifica sessione + ruolo `admin` in `user_roles`.
3. Se non admin → bloccato. Se admin → redirect `/admin/immobili`.

### 2.2 Gestione catalogo
1. `/admin/immobili` → lista con filtri stato (Tutti / Bozza / Pronto / Pubblicato), ricerca testo.
2. Tap su card immobile → editor `/admin/immobili/:id`.
3. Tap "Nuovo immobile" → `/admin/immobili/nuovo` → crea bozza.

### 2.3 Creazione / modifica annuncio
1. **Anagrafica**: titolo, riferimento, tipologia, contratto, prezzo (o "su richiesta").
2. **Localizzazione**: regione → provincia → comune → CAP (cascata da `comuni.json`), indirizzo, coordinate.
3. **Caratteristiche**: superficie, camere, bagni, piani, classe energetica, condizione, flag (giardino, terrazzo, garage, ecc.).
4. **Immagini**: upload multiplo → impostazione cover → riordino → watermark automatico.
5. **Descrizione AI**: genera con Lovable AI (tono di voce, lunghezza, SEO focus) → modificabile manualmente.
6. **Stato**: Bozza → Pronto → Pubblicato (visibile sul sito pubblico).
7. Sticky bar mobile con "Salva" / "Pronto" / "Pubblica" sempre raggiungibile.

### 2.4 Funzione Rendering / Virtual Staging
1. Dall'editor immobile, sezione Immagini → "Rendering" su una foto.
2. Si apre pannello (sheet/modale mobile-friendly) per selezionare foto sorgente.
3. Lancio generazione AI → ricezione nuova immagine variant.
4. Conferma → la nuova immagine viene aggiunta alla gallery (originale preservata).

## 3. Gestione annunci — regole
- Solo annunci con `status = 'published'` sono visibili al pubblico (vincolato da RLS).
- `property_images`, `property_features`, `property_descriptions` sono leggibili pubblicamente **solo** se la `property` parent è published.
- Eliminazione annuncio → cascade su images / features / description.