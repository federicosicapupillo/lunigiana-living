ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS idealista_included boolean NOT NULL DEFAULT true;

-- Default: escludi i rendering AI esistenti dal feed Idealista
UPDATE public.property_images
  SET idealista_included = false
  WHERE render_status = 'completed' AND rendered_image_url IS NOT NULL AND use_rendered = true;

-- Salva chiave feed + timestamp generazione nel site_settings (key/value JSON)
INSERT INTO public.site_settings (key, value)
VALUES ('idealista_feed', jsonb_build_object(
  'token', encode(gen_random_bytes(16), 'hex'),
  'last_generated_at', null
))
ON CONFLICT (key) DO NOTHING;
