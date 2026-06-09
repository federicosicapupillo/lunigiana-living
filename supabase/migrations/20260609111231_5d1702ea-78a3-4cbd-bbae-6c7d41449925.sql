ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS ai_input_type text,
  ADD COLUMN IF NOT EXISTS ai_audio_transcript text;