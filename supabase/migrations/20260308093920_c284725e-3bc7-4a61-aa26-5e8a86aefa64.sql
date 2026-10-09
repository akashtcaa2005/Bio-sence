
-- Table to store phone OTP codes for custom phone auth
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps(phone);

-- Table to map phone number to Supabase user_id
CREATE TABLE IF NOT EXISTS public.phone_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own phone record" ON public.phone_users;
CREATE POLICY "Users can view their own phone record"
  ON public.phone_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
