
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'in_progress', 'closed');

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_area text,
  budget_range text,
  property_type text,
  message text,
  source_page text,
  status public.lead_status NOT NULL DEFAULT 'new',
  privacy_accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_full_name_len CHECK (char_length(full_name) BETWEEN 1 AND 200),
  CONSTRAINT leads_email_len CHECK (char_length(email) BETWEEN 3 AND 320),
  CONSTRAINT leads_phone_len CHECK (char_length(phone) BETWEEN 3 AND 50),
  CONSTRAINT leads_message_len CHECK (message IS NULL OR char_length(message) <= 3000),
  CONSTRAINT leads_privacy_required CHECK (privacy_accepted = true)
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead with privacy accepted"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (privacy_accepted = true);

CREATE POLICY "Admins can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
