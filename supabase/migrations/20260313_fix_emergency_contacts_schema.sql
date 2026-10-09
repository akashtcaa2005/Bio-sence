-- ============================================================
-- PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR AND RUN IT
-- Fixes: "null value in column patient_id violates not-null constraint"
-- ============================================================

-- Step 1: If both patient_id and user_id exist, sync data then drop patient_id
DO $$
BEGIN
  -- Case A: patient_id exists, user_id exists → copy values, drop NOT NULL, then drop patient_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts' AND column_name = 'patient_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts' AND column_name = 'user_id'
  ) THEN
    -- Sync any rows where user_id is null but patient_id has a value
    UPDATE public.emergency_contacts SET user_id = patient_id WHERE user_id IS NULL AND patient_id IS NOT NULL;
    -- Remove the NOT NULL constraint from patient_id so inserts don't fail
    ALTER TABLE public.emergency_contacts ALTER COLUMN patient_id DROP NOT NULL;
    -- Drop policies that depend on patient_id (so we can drop the column)
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON public.emergency_contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own emergency contacts" ON public.emergency_contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON public.emergency_contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own emergency contacts" ON public.emergency_contacts';
    -- Drop the old patient_id column entirely
    ALTER TABLE public.emergency_contacts DROP COLUMN IF EXISTS patient_id CASCADE;

  -- Case B: patient_id exists, user_id does NOT exist → rename patient_id to user_id
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts' AND column_name = 'patient_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.emergency_contacts RENAME COLUMN patient_id TO user_id;
  END IF;
END$$;

-- Step 2: Create the contact_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_type') THEN
    CREATE TYPE public.contact_type AS ENUM ('doctor', 'family');
  END IF;
END$$;

-- Step 3: Create the table fresh only if it doesn't exist at all
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id                   UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  whatsapp             TEXT,
  contact_type         TEXT NOT NULL DEFAULT 'family',
  relationship         TEXT,
  verified             BOOLEAN NOT NULL DEFAULT false,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  notify_on_alerts     BOOLEAN NOT NULL DEFAULT true,
  otp_code             TEXT,
  otp_expires_at       TIMESTAMP WITH TIME ZONE,
  verification_sent_at TIMESTAMP WITH TIME ZONE,
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 4: Add any still-missing columns (all safe with IF NOT EXISTS)
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS name                 TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS email                TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS phone                TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS whatsapp             TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS contact_type         TEXT DEFAULT 'family';
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS relationship         TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS verified             BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS notify_on_alerts     BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS otp_code             TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS otp_expires_at       TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Step 5: Enable Row Level Security
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop all old policies and recreate cleanly
DROP POLICY IF EXISTS "Users can view their own contacts"     ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can create their own contacts"   ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts"   ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts"   ON public.emergency_contacts;
DROP POLICY IF EXISTS "Authenticated can select own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Authenticated can insert own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Authenticated can update own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Authenticated can delete own contacts" ON public.emergency_contacts;

CREATE POLICY "Users can view their own contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);
