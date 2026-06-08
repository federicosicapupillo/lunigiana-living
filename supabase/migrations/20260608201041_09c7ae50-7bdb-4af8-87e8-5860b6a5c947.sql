ALTER TABLE public.property_images
  ADD COLUMN IF NOT EXISTS photo_type TEXT,
  ADD COLUMN IF NOT EXISTS photo_category TEXT,
  ADD COLUMN IF NOT EXISTS render_goal TEXT,
  ADD COLUMN IF NOT EXISTS room_condition TEXT,
  ADD COLUMN IF NOT EXISTS intervention_level TEXT,
  ADD COLUMN IF NOT EXISTS preserve_structure BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS desired_lighting TEXT,
  ADD COLUMN IF NOT EXISTS visual_target TEXT,
  ADD COLUMN IF NOT EXISTS render_notes TEXT;