ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS occasione_settings jsonb NOT NULL DEFAULT '{}'::jsonb;