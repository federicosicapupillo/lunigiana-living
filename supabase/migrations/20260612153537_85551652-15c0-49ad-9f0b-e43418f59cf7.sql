CREATE POLICY "Admins can view all property images in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-images'
  AND public.has_role(auth.uid(), 'admin')
);