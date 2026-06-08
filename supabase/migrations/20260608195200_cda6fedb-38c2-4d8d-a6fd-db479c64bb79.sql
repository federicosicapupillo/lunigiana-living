ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS energy_performance_index_status TEXT,
  ADD COLUMN IF NOT EXISTS energy_performance_index_value NUMERIC(10,2);