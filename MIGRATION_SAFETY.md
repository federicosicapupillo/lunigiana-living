# Migration safety — Furia Immobiliare

Il database online è la **fonte primaria** per immobili, foto, descrizioni, prezzi, rendering, cartelli vetrina e dati Idealista. Una pubblicazione del progetto Lovable aggiorna **solo il codice**: i dati restano intatti.

L'unico modo per perdere dati immobiliari è una migrazione SQL distruttiva. Le regole sotto si applicano ad ogni nuovo file in `supabase/migrations/`.

## Tabelle protette

- `properties`
- `property_images`
- `property_descriptions`
- `property_features`
- `idealista_publish_logs`
- `site_settings` (chiavi `idealista_*`)

## Operazioni VIETATE

Su qualsiasi tabella protetta:

- `TRUNCATE`
- `DELETE` senza `WHERE` mirato (mai `DELETE FROM properties;`)
- `UPDATE` senza `WHERE` mirato (mai `UPDATE properties SET ...`)
- `DROP TABLE`
- `DROP COLUMN` se la colonna contiene dati reali
- Reset / re-seed da file statici (`src/data/properties.json` è solo legacy frontend, non va mai reimportato nel DB)
- Sostituzione di immagini esistenti tramite `UPDATE` di `storage_path` / `image_url` senza filtro `id = ...`

## Operazioni AMMESSE

- `CREATE TABLE`, `ALTER TABLE ADD COLUMN`, `CREATE INDEX`, `CREATE POLICY`, `GRANT`
- `ALTER COLUMN ... SET DEFAULT` / `DROP DEFAULT` (non distruttivo)
- `UPDATE` con `WHERE` mirato per back-fill di nuove colonne (es. impostare valore iniziale solo dove `colonna IS NULL`)
- Aggiunta di nuove righe in `site_settings` per nuove feature

## Procedura prima di ogni migrazione

1. Aprire `/admin/dati-live` e annotare totali (immobili, foto, descrizioni).
2. Verificare che la migration non contenga nessuna operazione vietata.
3. Approvare la migration.
4. Tornare su `/admin/dati-live`, cliccare **Sincronizza dati live**, verificare che i totali siano identici (o solo cresciuti).

## Cosa NON fa una pubblicazione Lovable

- non esegue migrazioni
- non scrive su `properties`, `property_images`, `property_descriptions`, `property_features`
- non tocca lo storage `property-images`
- non resetta token Idealista
- non altera `site_settings`

Le modifiche che Elena fa online sono già protette per design. Questo documento serve solo come checklist per le migrazioni future.