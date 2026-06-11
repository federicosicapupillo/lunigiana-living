CREATE TABLE IF NOT EXISTS public.translation_cache (
  source_hash text NOT NULL,
  target_lang text NOT NULL,
  source_text text NOT NULL,
  translated_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_hash, target_lang)
);

GRANT SELECT ON public.translation_cache TO anon, authenticated;
GRANT ALL ON public.translation_cache TO service_role;

ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_cache_public_read"
  ON public.translation_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);
