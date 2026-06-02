CREATE OR REPLACE FUNCTION public.ensure_single_cover()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.is_cover THEN
    UPDATE public.property_images
      SET is_cover = false
      WHERE property_id = NEW.property_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;