DROP POLICY IF EXISTS translation_cache_public_read ON public.translation_cache;
REVOKE SELECT ON public.translation_cache FROM anon, authenticated;