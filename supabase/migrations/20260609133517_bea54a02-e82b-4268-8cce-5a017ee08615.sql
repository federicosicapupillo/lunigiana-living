
-- 1. Remove broad public SELECT policies on properties and related tables.
--    Public reads are performed via server functions using the service role.
DROP POLICY IF EXISTS "Public can read published properties" ON public.properties;
DROP POLICY IF EXISTS "Public can read images of published properties" ON public.property_images;
DROP POLICY IF EXISTS "Public read descriptions of published" ON public.property_descriptions;
DROP POLICY IF EXISTS "Public read features of published" ON public.property_features;

-- Revoke anon table-level privileges; only admins (via has_role) read these.
REVOKE SELECT ON public.properties FROM anon;
REVOKE SELECT ON public.property_images FROM anon;
REVOKE SELECT ON public.property_descriptions FROM anon;
REVOKE SELECT ON public.property_features FROM anon;

-- 2. site_settings: remove public read; keep admin-only management.
DROP POLICY IF EXISTS "site_settings readable by all" ON public.site_settings;
REVOKE SELECT ON public.site_settings FROM anon;

-- 3. Storage: restrict public read on property-images bucket to objects whose
--    first path segment matches a published property id.
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;

CREATE POLICY "Public can view images of published properties"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id::text = split_part(storage.objects.name, '/', 1)
      AND p.status = 'published'
  )
);
