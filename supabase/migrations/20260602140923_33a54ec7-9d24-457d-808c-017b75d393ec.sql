ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties (featured) WHERE featured;
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);