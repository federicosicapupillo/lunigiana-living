ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS imported_source_url text,
  ADD COLUMN IF NOT EXISTS is_imported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS import_status text;

-- Backfill: legacy rows where storage_path is an external URL
UPDATE public.property_images
  SET imported_source_url = COALESCE(imported_source_url, storage_path),
      is_imported = true,
      import_status = COALESCE(import_status, 'imported_external_only')
  WHERE storage_path ~ '^https?://'
    AND import_status IS NULL;

-- Rows already sitting in the bucket are considered synced
UPDATE public.property_images
  SET import_status = 'synced_to_storage'
  WHERE storage_path !~ '^https?://'
    AND import_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_property_images_import_status
  ON public.property_images (import_status);