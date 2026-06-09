ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS enhanced_storage_path text,
  ADD COLUMN IF NOT EXISTS enhanced_image_url text,
  ADD COLUMN IF NOT EXISTS enhancement_status text NOT NULL DEFAULT 'not_enhanced',
  ADD COLUMN IF NOT EXISTS enhancement_error text,
  ADD COLUMN IF NOT EXISTS enhancement_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS use_enhanced boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_property_images_enhancement_status
  ON public.property_images (enhancement_status);