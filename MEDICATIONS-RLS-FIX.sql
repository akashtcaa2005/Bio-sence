-- ============================================================
-- COMPLETE MEDICATIONS TABLE FIX
-- Copy and paste everything below into Supabase SQL Editor
-- ============================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Step 2: Set DEFAULT for user_id column (auto-assigns auth.uid())
ALTER TABLE public.medications 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Step 3: Disable and re-enable RLS to refresh policies
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive RLS policies
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create performance index
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);

-- ============================================================
-- Verification query - run this after to confirm fix
-- ============================================================
-- SELECT 
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   qual
-- FROM pg_policies 
-- WHERE tablename = 'medications';
