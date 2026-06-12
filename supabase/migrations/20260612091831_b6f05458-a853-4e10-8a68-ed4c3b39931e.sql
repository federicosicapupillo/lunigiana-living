
ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS render_publish_mode text NOT NULL DEFAULT 'none';

ALTER TABLE public.property_images
  DROP CONSTRAINT IF EXISTS property_images_render_publish_mode_check;

ALTER TABLE public.property_images
  ADD CONSTRAINT property_images_render_publish_mode_check
  CHECK (render_publish_mode IN ('none','main','emotional'));

CREATE INDEX IF NOT EXISTS idx_property_images_render_publish_mode
  ON public.property_images (property_id, render_publish_mode);
