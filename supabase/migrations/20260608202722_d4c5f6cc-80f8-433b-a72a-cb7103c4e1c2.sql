ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS original_image_url text,
  ADD COLUMN IF NOT EXISTS rendered_image_url text,
  ADD COLUMN IF NOT EXISTS published_image_url text;

ALTER TABLE public.property_images
  ALTER COLUMN render_status SET DEFAULT 'not_generated',
  ALTER COLUMN import_status SET DEFAULT 'synced_to_storage';