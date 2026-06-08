ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'suspended';
ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'sold';
ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'rented';
ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE public.property_status ADD VALUE IF NOT EXISTS 'deleted';

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_note text;

-- Backfill published_at for existing published listings so they keep their order
UPDATE public.properties
  SET published_at = COALESCE(published_at, updated_at)
  WHERE status = 'published' AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON public.properties (deleted_at);