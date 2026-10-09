ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS default_latitude double precision,
  ADD COLUMN IF NOT EXISTS default_longitude double precision,
  ADD COLUMN IF NOT EXISTS default_location_label text;