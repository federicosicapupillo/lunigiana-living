# Monitoraggio settimanale Google

## Risultato
- Ogni lunedì raccogliere le posizioni medie Google in Italia per «furia immobiliare», «agenzia immobiliare pontremoli», «case in vendita lunigiana» e «case in vendita pontremoli».
- Usare Google Search Console già collegato, senza richiedere un altro servizio.
- Conservare uno storico privato nell’area amministrativa con posizione, clic, impressioni e confronto con i sette giorni precedenti.
- Distinguere assenza di dati da mancata presenza in Google: le posizioni sono medie osservate, non una verifica istantanea della prima pagina.

## Dettagli tecnici
- Una raccolta settimanale idempotente, con due intervalli consecutivi di sette giorni e margine per il ritardo di Search Console.
- A ogni raccolta elencare e verificare nuovamente le proprietà Google accessibili; se più proprietà corrispondono, richiedere una scelta esplicita prima di interrogare i dati.
- Salvare snapshot in una tabella privata con lettura riservata agli amministratori; la pagina legge lo storico senza interrogare Google.
- Callback autenticata con il helper gestito già predisposto. Testare le quattro query esatte, i periodi, i dati mancanti e il confronto.

## Blocco all’attivazione
Gli strumenti per creare la pianificazione gestita non sono disponibili in questa sessione, anche dopo il ripristino dell’autenticazione. Non è ancora attivo alcun controllo automatico. La preparazione dello storico è possibile, ma l’attivazione richiede che questi strumenti tornino disponibili e che il callback sia pubblicato con autorizzazione.