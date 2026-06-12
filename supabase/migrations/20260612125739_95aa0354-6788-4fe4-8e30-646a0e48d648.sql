
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS idealista_status text NOT NULL DEFAULT 'not_published',
  ADD COLUMN IF NOT EXISTS idealista_external_id text,
  ADD COLUMN IF NOT EXISTS idealista_url text,
  ADD COLUMN IF NOT EXISTS idealista_last_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS idealista_last_error text;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_idealista_status_check;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_idealista_status_check
  CHECK (idealista_status IN ('not_published','to_publish','published','error','to_update','removed'));

CREATE TABLE IF NOT EXISTS public.idealista_publish_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  image_ids uuid[] NOT NULL DEFAULT '{}',
  outcome text NOT NULL DEFAULT 'queued',
  error_message text,
  external_id text,
  external_url text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.idealista_publish_logs TO authenticated;
GRANT ALL ON public.idealista_publish_logs TO service_role;

ALTER TABLE public.idealista_publish_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage idealista logs" ON public.idealista_publish_logs;
CREATE POLICY "Admins manage idealista logs"
  ON public.idealista_publish_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_idealista_logs_property ON public.idealista_publish_logs(property_id, created_at DESC);
