# Roadmap backend immobili (nessuna pubblicazione)

## IA (dal piano precedente)
- [ ] Prompt immagine: aggiungere contesto immobile (tipologia, comune/zona, stato, mq, dotazioni, parametri narrativi/commerciali) in `buildPrompt`
- [ ] Comando evidente "Genera foto con IA" nel pannello render
- [ ] "Note libere" fuori dal percorso principale (opzioni avanzate, facoltativo)

## Nuovo blocco correzioni
- [ ] 1. Rimuovere dalla UI "Visibilità" (privato/qualificati/pubblico) e "Visibilità indirizzo"; show_full_address=false sui nuovi; rinominare sezione in "Promozione in home"
- [ ] 2. Nascondere Latitudine/Longitudine dalla UI (colonne e valori intatti)
- [ ] 3. Numeri come scelte guidate (superficie, locali, bagni, piano, piani, ordine home 1-6, prezzo con "Altro importo", IPE già ok); valori storici fuori elenco = valore preciso
- [ ] 4. Anteprima grafica: popup mobile-first con cover, titolo, codice come "Cod. annuncio", comune, prezzo, mq, camere, bagni, descrizione, stato; pulsante anche in modifica; niente JSON/UUID/markup
- [ ] 5. Velocizzare generazione immagini: un'unica azione server (salva+genera), letture parallele, no risync inutile, copia di lavoro ridimensionata, stato immediato e anti doppio click
- [ ] 6. Non regressione: typecheck/build, nessun cambio DB/RLS/route/SEO, backend italiano mobile-first, NON pubblicare
