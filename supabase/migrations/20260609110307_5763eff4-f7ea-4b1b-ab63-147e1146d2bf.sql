
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS homepage_order integer,
  ADD COLUMN IF NOT EXISTS featured_at timestamptz;

CREATE INDEX IF NOT EXISTS properties_homepage_idx
  ON public.properties (featured, homepage_order, featured_at DESC)
  WHERE featured = true;

-- Trigger: keep featured_at in sync with the featured flag.
CREATE OR REPLACE FUNCTION public.sync_featured_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.featured IS TRUE AND (OLD IS NULL OR OLD.featured IS DISTINCT FROM NEW.featured) THEN
    NEW.featured_at := now();
  ELSIF NEW.featured IS NOT TRUE THEN
    NEW.featured_at := NULL;
    NEW.homepage_order := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_sync_featured_at ON public.properties;
CREATE TRIGGER properties_sync_featured_at
  BEFORE INSERT OR UPDATE OF featured ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.sync_featured_at();

-- Backfill featured_at for existing featured rows.
UPDATE public.properties
  SET featured_at = COALESCE(featured_at, updated_at, now())
  WHERE featured = true AND featured_at IS NULL;
