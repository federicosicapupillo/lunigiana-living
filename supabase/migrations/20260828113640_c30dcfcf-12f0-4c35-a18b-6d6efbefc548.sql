CREATE TABLE public.ai_visibility_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL DEFAULT current_date,
  platform text NOT NULL CHECK (platform IN ('chatgpt','perplexity','gemini')),
  prompt_key text NOT NULL,
  prompt_text text NOT NULL,
  category text NOT NULL,
  result_status text NOT NULL CHECK (result_status IN ('not_mentioned','mentioned','recommended','cited')),
  score smallint NOT NULL CHECK (score BETWEEN 0 AND 3),
  furia_position smallint CHECK (furia_position IS NULL OR furia_position > 0),
  cited_url text,
  competitors text[] NOT NULL DEFAULT '{}'::text[],
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_visibility_checks_unique_run UNIQUE (run_date, platform, prompt_key),
  CONSTRAINT ai_visibility_checks_score_status CHECK (
    (result_status = 'not_mentioned' AND score = 0)
    OR (result_status = 'mentioned' AND score = 1)
    OR (result_status = 'recommended' AND score = 2)
    OR (result_status = 'cited' AND score = 3)
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_visibility_checks TO authenticated;
GRANT ALL ON public.ai_visibility_checks TO service_role;

ALTER TABLE public.ai_visibility_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ai visibility checks"
ON public.ai_visibility_checks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_visibility_checks_run ON public.ai_visibility_checks (run_date DESC, platform);

CREATE TRIGGER trg_ai_visibility_checks_updated_at
BEFORE UPDATE ON public.ai_visibility_checks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();