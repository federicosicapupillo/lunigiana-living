## Obiettivo
Rendere la pagina `/immobili/$id` più chiara, persuasiva e veloce. Aggiungere sezioni editoriali "Perché è interessante", "Ideale per", "Il contesto", box contatto rafforzato e CTA sticky mobile. Ottimizzare le immagini su tutto il sito (card, dettaglio, miniature) tramite una utility centralizzata.

## Cosa NON tocchiamo
Backend admin, schema DB, policy RLS, upload, cartello A3 (`window-flyer-dialog.tsx`), generazione rendering, traduzioni esistenti, form contatti del componente `LeadForm`, `occasione_settings`.

## Parte 1 — Nuove sezioni nella pagina dettaglio

File: `src/routes/immobili.$id.tsx`, `src/lib/i18n/translations.ts`.

1. **Hero** — invariato strutturalmente (codice, tipo, titolo, comune, prezzo, badge Occasione già presenti). Aggiunta due CTA inline visibili sotto il prezzo: "Richiedi informazioni" (scroll al form) + "WhatsApp".
2. **Blocco "In sintesi"** — già presente come *Quick facts* a 4 colonne. Lo ampliamo a 8 voci condizionali (superficie, locali, camere, bagni, piano, classe energetica, IPE, contratto). Nascondiamo le voci senza dato invece di mostrare "—".
3. **Blocco "Perché è interessante"** — nuovo. Genera 2-4 bullet leggibili a partire da: `commercialHighlights`, `panoramicView`, `historicProperty`, `garden`, `terrace`, `centro storico` (parole chiave su location), prezzo competitivo. Solo regole locali, niente AI call.
4. **Blocco "Ideale per"** — nuovo. Chip leggeri derivati dal campo `highlights.target` se presente, altrimenti inferenza basata su tipologia + dimensioni + giardino.
5. **Descrizione migliorata** — sanitizziamo l'output: rimuoviamo `**` non chiusi e marker markdown rotti, normalizziamo doppi spazi, paragrafiamo su doppia newline mantenendo `whitespace-pre-line`. Nessuna modifica al contenuto in DB.
6. **Blocco "Il contesto"** — nuovo. Mostra `p.locationDescription` se presente in DB; altrimenti fallback statico per i comuni più comuni della Lunigiana (Pontremoli, Bagnone, Filattiera, Mulazzo, Villafranca, Zeri, Aulla, Fivizzano) mappato in IT/EN.
7. **Box contatto rafforzato** — restyling della aside: nuovo headline "Vuoi capire se questa casa fa per te?", testo "Scrivi a Elena…", CTA primaria + WhatsApp. Form invariato.
8. **CTA sticky mobile** — barra fissa in basso solo `< md`: "WhatsApp" + "Info" (scroll al form). Padding-bottom su `<article>` per non coprire il footer.
9. **i18n** — nuove chiavi sia IT sia EN:
   - `detail.whyTitle`, `detail.idealForTitle`, `detail.contextTitle`
   - `detail.contactStrongTitle`, `detail.contactStrongBody`, `detail.contactStrongCta`
   - `detail.mobileInfo`, `detail.mobileWa`
   - `detail.idealFamilies`, `detail.idealSecondHome`, `detail.idealVacation`, `detail.idealInvestment`, `detail.idealNature`, `detail.idealQuiet`

## Parte 2 — Ottimizzazione immagini

File nuovo: `src/lib/image-url.ts`. File toccati: `src/lib/public-properties.functions.ts` (server-side transform), `src/components/property-card.tsx`, `src/routes/immobili.$id.tsx`, `src/components/watermarked-image.tsx`.

1. **Utility `image-url.ts`** — wrapper che, dato un URL signed di Supabase, costruisce varianti con `?width=…&quality=…&resize=contain`. Supabase Image Transformations sono disponibili sui signed URL: basta appendere i parametri (l'edge li ignora se non supportati, quindi fallback sicuro). Funzioni esposte:
   - `imgVariant(url, preset)` con preset `card | thumb | hero | renderHero | original`
   - `imgSrcSet(url, widths)` per generare `srcSet`
2. **Server-side transform sui signed URL** in `public-properties.functions.ts` — passiamo `transform: { width: 1600, quality: 75 }` al `createSignedUrls` per la gallery, abbattendo il peso al primo download. La firma è valida solo per i parametri firmati: quindi generiamo l'URL "originale" come oggi e, in più, esponiamo `gallery` con varianti pre-computate `{ src, srcSet, thumbSrc }`. Alternativa più sicura: lasciare il signed URL invariato e applicare le trasformazioni client-side appendendo i query param (Supabase Image Transformations accetta query param firmati o no a seconda della config; verifichiamo con un fetch di test in dev — se restituisce immagine ridotta usiamo la via client, altrimenti aggiungiamo `transform` nel createSignedUrl).
3. **Responsive `<img>`** — `WatermarkedImage` accetta già `sizes`; aggiungiamo prop `srcSet`. Card immobile: `sizes="(max-width:768px) 100vw, 33vw"` + srcSet 400/600/800. Hero dettaglio: srcSet 800/1200/1600 con `fetchPriority="high"`. Thumbnails: src=160w.
4. **Lazy loading intelligente** — gallery thumbs già `loading="lazy"`. Sezione rendering già `loading="lazy"`. Hero invariata `fetchPriority="high"`.
5. **Skeleton & no layout shift** — la hero ha già `Skeleton`. Aggiungiamo `aspect-[4/3]` esplicito alle card e alle thumbnails (già presenti). Verifichiamo CLS.
6. **Quality**: preset hero quality 80, card quality 75, thumb quality 60.

## Cosa NON cambia nel pipeline immagini
- `WatermarkedImage` resta il componente di rendering: nessuna modifica al watermark.
- A3 (`window-flyer-dialog.tsx`): continua a usare gli URL originali (preset `original`).
- Rendering AI: usano gli stessi signed URL, nessuna ricompressione.
- Schema DB invariato.

## Rischi e mitigazioni
- **Supabase Image Transformations non attive sul piano** → l'append di `?width=&quality=` viene ignorato e si serve l'originale: nessuna rottura, solo nessuna velocizzazione. Fallback safe.
- **Signed URL con transform** richiede `transform` passato a `createSignedUrl` ed è bloccato dalla firma se aggiunto client-side. Strategia: prima provare client-side append; se in produzione non funziona, secondo step server-side (richiede refactoring di `public-properties.functions.ts` ma è isolato).
- **Layout shift** sulla nuova sezione "Perché è interessante" se condizionale → impostiamo regole `min-h` solo quando ha contenuto, niente placeholder se vuota.
- **CTA sticky mobile** può coprire il chat-bubble WhatsApp già presente (`WhatsAppFloat`): nascondiamo `WhatsAppFloat` sulla pagina dettaglio mobile per non duplicare.

## File modificati
- `src/lib/image-url.ts` (nuovo)
- `src/lib/i18n/translations.ts` (aggiunte chiavi IT/EN)
- `src/routes/immobili.$id.tsx` (nuove sezioni, sticky CTA, hero CTA, descrizione sanitizzata, in-sintesi ampliato)
- `src/components/property-card.tsx` (srcSet + sizes)
- `src/components/watermarked-image.tsx` (accetta srcSet)

## Verifica finale
1. Typecheck/build automatico
2. Test visivo desktop + mobile di una scheda con: foto chiare, foto scure, descrizione lunga, descrizione corta, presenza/assenza badge Occasione, presenza/assenza rendering
3. Controllo che A3 dialog continui a usare immagini originali full quality
4. Controllo console per errori di img onError
