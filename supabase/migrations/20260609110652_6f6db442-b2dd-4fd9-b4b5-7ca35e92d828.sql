
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS created_with_ai boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS ai_generation_notes jsonb;
