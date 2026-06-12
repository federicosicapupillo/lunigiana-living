DROP POLICY IF EXISTS "Admins can view all property images in storage" ON storage.objects;

CREATE POLICY "Admins can view all property images in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);