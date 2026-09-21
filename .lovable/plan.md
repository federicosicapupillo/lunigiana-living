# Backend immobili: testo e foto IA senza prompt manuali

## Cosa esiste già (verificato nel codice)

- **Testo annuncio automatico: già fatto.** `src/lib/ai-description.functions.ts` costruisce il prompt da solo partendo dai dati immobile, dalle dotazioni, dalle note rapide, dai parametri narrativi (`property_features`) e dalle frasi commerciali salvate. L'admin scegli solo lunghezza, tono ed eventuale focus SEO. Nessun campo prompt. Nella scheda esistono "Genera descrizione", "Genera nuova versione" (proposta che non sovrascrive), "Mantieni attuale" / "Usa nuova" e salvataggio della versione modificata. Il titolo ha la stessa logica (`ai-title.functions.ts`).
- **Foto IA: già fatta a metà.** `RenderSettingsPanel` offre già tutti i parametri guidati a tendina (interno/esterno, ambiente, stile, obiettivo, stato attuale, livello intervento, luminosità, target) e "Mantieni struttura originale" è sempre attivo. `property-render.functions.ts` scarica la foto originale, chiama il modello immagine e salva la variante in un percorso separato (`<property>/rendered/...`) su `rendered_storage_path` / `rendered_image_url`. L'originale non viene mai toccato e la variante entra nel pubblico solo se l'admin attiva `use_rendered` (esiste anche il ripristino "Rendering scartato").
- **Nessun cambio di stato immobile**, nessuna pubblicazione automatica: confermato.

## Cosa manca davvero (le sole 3 modifiche)

1. **Il prompt immagine ignora l'immobile.** `buildPrompt(settings)` usa solo i parametri della foto: non riceve tipologia, comune/zona, stato, superficie, dotazioni, né i parametri narrativi/commerciali. Serve passargli anche il contesto immobile.
2. **Il comando non è evidente.** Le etichette attuali sono "Crea rendering" / "Configura rendering" / "Genera rendering". Va resa una voce chiara: **"Genera foto con IA"**.
3. **"Note libere" è in vista nel percorso principale.** Va spostata fuori dal flusso guidato (chiusa in "Opzioni avanzate", facoltativa) senza perdere i valori già salvati.

## Interventi previsti

### 1. Contesto immobile nel prompt foto
- In `property-render.functions.ts`, dentro l'handler già esistente, leggere la riga `properties` collegata (tipologia, contratto, comune/zona/provincia, superficie, camere, bagni, stato, dotazioni booleane, note rapide, frasi commerciali) e le `property_features` narrative.
- Estendere `buildPrompt` con un blocco "PROPERTY CONTEXT" costruito da quei dati, con la regola esplicita: il contesto guida solo stile e atmosfera, non autorizza a inventare elementi non presenti nella foto. Le regole di fedeltà strutturale restano intatte e prioritarie.
- Nessuna colonna nuova, nessuna migrazione: i dati sono già tutti a database.

### 2. Comando evidente nella sezione Foto
- In `render-settings-panel.tsx`: etichetta del pannello e del pulsante → "Genera foto con IA" (e "Rigenera foto con IA" quando una variante esiste già), icona Sparkles, pulsante a piena larghezza già presente, target tap adeguato su mobile.
- Nessun cambio di layout della griglia foto, nessun nuovo componente: si riusa il pannello esistente.

### 3. Note libere fuori dal percorso principale
- Il campo resta nel codice e nel database (nessun dato perso) ma finisce dietro un "Opzioni avanzate" chiuso per default, non obbligatorio.
- Obbligatorio resta solo "Tipo foto" come oggi; se stile/obiettivo/luminosità non vengono scelti, la funzione già applica i valori neutri predefiniti.

## Fuori perimetro (non si tocca)

Schema DB, RLS, auth, routing, URL, frontend pubblico, immagini esistenti, file auto-generati, CRM, analytics. Nessuna nuova funzione AI: si riusano quelle presenti. Backend solo italiano.

## Verifica al termine

- Da mobile: nella sezione Foto il comando "Genera foto con IA" è visibile e cliccabile; la variante appare accanto all'originale e l'originale resta identico.
- Il testo annuncio si genera senza scrivere prompt e resta bozza modificabile.
- La variante non compare sul sito pubblico finché l'admin non la sceglie.
- Controllo tipi pulito. Nessuna pubblicazione.
