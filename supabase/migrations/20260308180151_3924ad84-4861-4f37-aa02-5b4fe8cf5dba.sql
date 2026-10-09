ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS body_weight numeric NULL,
  ADD COLUMN IF NOT EXISTS height numeric NULL,
  ADD COLUMN IF NOT EXISTS height_unit text NOT NULL DEFAULT 'cm';
