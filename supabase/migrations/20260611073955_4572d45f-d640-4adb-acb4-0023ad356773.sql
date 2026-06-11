ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS subtitle_en text,
  ADD COLUMN IF NOT EXISTS summary_en text,
  ADD COLUMN IF NOT EXISTS location_description_en text;

ALTER TABLE public.property_descriptions
  ADD COLUMN IF NOT EXISTS description_en text;