# Furia Immobiliare — Database Overview

Backend: **Lovable Cloud (Supabase / Postgres)**. Schema `public`. RLS attiva su tutte le tabelle.

## Enum
- `app_role`: `admin`, `moderator`, `user`
- `property_status`: `draft`, `ready`, `published`

## Tabelle principali

### `properties` — anagrafica immobile
Campi chiave:
- `id` (uuid, PK)
- `title` (text, default "Nuovo immobile")
- `slug` (text, unique)
- `reference_code` (text, unique) — codice agenzia
- `property_type` (text) — es. "Appartamento", "Rustico"
- `contract_type` (text) — vendita / affitto
- `price` (numeric 12,2), `price_on_request` (bool)
- Localizzazione: `municipality`, `area_zone`, `address`, `postal_code`, `locality`, `province`, `region` (default Toscana), `country` (default Italia), `latitude`, `longitude`, `show_full_address`
- Caratteristiche: `size_sqm`, `bedrooms`, `bathrooms`, `floors`, `energy_class`, `condition`
- Flag booleani: `panoramic_view`, `historic_property`, `garden`, `terrace`, `balcony`, `garage`, `cellar`, `elevator`, `furnished`
- `short_notes`, `internal_notes`
- `status` (`property_status`, default `draft`)
- `featured` (bool) — slider home
- `created_by` (uuid → `auth.users`)
- `created_at`, `updated_at`

Indici: `status`, `municipality`, `featured` (partial), unique su `slug` e `reference_code`.

### `property_images`
- `id`, `property_id` (FK → properties, ON DELETE CASCADE)
- `image_url`, `storage_path`, `alt_text`
- `sort_order` (int), `is_cover` (bool)
- Index: `(property_id, sort_order)`

### `property_features` — chiavi/valori extra
- `id`, `property_id` (FK CASCADE)
- `feature_name`, `feature_value`

### `property_descriptions` — descrizione AI
- `id`, `property_id` (FK CASCADE, unique 1:1)
- `generated_description`, `edited_description`
- `tone_of_voice`, `language` (default `it`), `length_preference`, `seo_focus`
- `generated_at`, `updated_at`

### `user_roles` — gestione ruoli (no role sul profilo!)
- `id`, `user_id` (FK → `auth.users`), `role` (`app_role`)
- Unique `(user_id, role)`
- Letta tramite security-definer function `has_role(uid, role)` per evitare ricorsioni RLS.

## Relazioni

```
auth.users 1 ──< user_roles
auth.users 1 ──< properties (created_by)
properties 1 ──< property_images   (cascade)
properties 1 ──< property_features (cascade)
properties 1 ──1 property_descriptions (cascade)
```

## RLS — riassunto policy
- **properties**: admin gestisce tutto; pubblico (`anon` + `authenticated`) legge solo `status = published`.
- **property_images / features**: admin full; pubblico legge solo se la property parent è `published`.
- **property_descriptions**: gestione admin.
- **user_roles**: solo admin può leggere/gestire.

## Storage
- Bucket Supabase Storage dedicato alle foto degli immobili.
- Path salvato in `property_images.storage_path`; URL pubblico in `image_url`.
- Watermark applicato lato frontend tramite componente `<WatermarkedImage>` (`src/assets/furia-watermark.png`).

## Server functions / API
- `src/lib/public-properties.functions.ts` — fetch annunci pubblici (server function TanStack).
- `src/lib/ai-description.functions.ts` — generazione descrizione via Lovable AI Gateway (server function, protetta).
- `src/routes/api/virtual-staging.ts` — endpoint server route per rendering AI.
- Auth middleware: `requireSupabaseAuth` su tutte le server function che toccano dati admin.