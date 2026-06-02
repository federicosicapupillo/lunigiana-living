ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.ensure_single_cover() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;