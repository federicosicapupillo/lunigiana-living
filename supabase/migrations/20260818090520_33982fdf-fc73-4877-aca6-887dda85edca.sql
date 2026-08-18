ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS details jsonb;
COMMENT ON COLUMN public.leads.source IS 'Funnel di origine del lead (es. property_valuation, off_market, guided_search).';
COMMENT ON COLUMN public.leads.details IS 'Dati strutturati specifici del funnel (es. dettagli immobile per la valutazione), pronti per integrazione CRM.';