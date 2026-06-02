-- Nuovi campi localizzazione e visibilità indirizzo
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS locality text,
  ADD COLUMN IF NOT EXISTS show_full_address boolean NOT NULL DEFAULT false;

-- Sequenza per riferimento progressivo FURIA-NNNN
CREATE SEQUENCE IF NOT EXISTS public.property_reference_seq START 1;

-- Allinea sequenza al massimo riferimento esistente in formato FURIA-NNNN
DO $$
DECLARE v_max int;
BEGIN
  SELECT COALESCE(MAX((regexp_replace(reference_code,'^FURIA-',''))::int), 0)
    INTO v_max
    FROM public.properties
   WHERE reference_code ~ '^FURIA-\d+$';
  IF v_max > 0 THEN
    PERFORM setval('public.property_reference_seq', v_max, true);
  ELSE
    PERFORM setval('public.property_reference_seq', 1, false);
  END IF;
END $$;

-- Funzione + trigger: assegna FURIA-NNNN se non già impostato
CREATE OR REPLACE FUNCTION public.assign_property_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.reference_code IS NULL OR btrim(NEW.reference_code) = '' THEN
    NEW.reference_code := 'FURIA-' || LPAD(nextval('public.property_reference_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_assign_property_reference ON public.properties;
CREATE TRIGGER trg_assign_property_reference
BEFORE INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.assign_property_reference();

-- Backfill riferimento per eventuali annunci già presenti senza FURIA-NNNN
UPDATE public.properties
   SET reference_code = 'FURIA-' || LPAD(nextval('public.property_reference_seq')::text, 4, '0')
 WHERE reference_code IS NULL
    OR btrim(reference_code) = ''
    OR reference_code !~ '^FURIA-\d+$';

-- Unicità del riferimento (solo per valori non nulli)
CREATE UNIQUE INDEX IF NOT EXISTS properties_reference_code_unique
  ON public.properties (reference_code)
  WHERE reference_code IS NOT NULL;