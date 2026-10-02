CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'jarvis_internal_key') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'jarvis_internal_key');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.jarvis_internal_key()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'jarvis_internal_key' LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.jarvis_internal_key() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.jarvis_internal_key() TO service_role;

CREATE OR REPLACE FUNCTION public.jarvis_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k text;
  t text := CASE WHEN TG_TABLE_NAME = 'leads' THEN 'lead' ELSE 'clic' END;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO k FROM vault.decrypted_secrets WHERE name = 'jarvis_internal_key' LIMIT 1;
    IF k IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://furiaimmobiliare.it/api/public/jarvis-notify',
        body := jsonb_build_object('tipo', t, 'id', NEW.id),
        headers := jsonb_build_object('Content-Type', 'application/json', 'X-Jarvis-Internal', k),
        timeout_milliseconds := 5000
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'jarvis_notify failed: %', SQLERRM;
  END;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.jarvis_notify() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER leads_jarvis_notify
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.jarvis_notify();

CREATE TRIGGER site_events_jarvis_notify
AFTER INSERT ON public.site_events
FOR EACH ROW
WHEN (NEW.event_name IN ('property_detail_whatsapp_click','whatsapp_click','contact_whatsapp_fallback_click','phone_click','property_detail_mobile_sticky_click','property_detail_request_info_click'))
EXECUTE FUNCTION public.jarvis_notify();