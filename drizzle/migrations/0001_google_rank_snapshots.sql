CREATE TABLE public.google_rank_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 period_end date NOT NULL,
 site_url text NOT NULL,
 report jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (site_url, period_end)
);
GRANT SELECT ON public.google_rank_snapshots TO authenticated;
GRANT ALL ON public.google_rank_snapshots TO service_role;
ALTER TABLE public.google_rank_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read Google ranking history" ON public.google_rank_snapshots FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
