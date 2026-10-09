-- ============================================================
-- MEDICATIONS TABLE RLS FIX - COMPLETE SOLUTION
-- ============================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Step 2: Set DEFAULT for user_id to auto-assign auth.uid()
-- This is CRITICAL - without this, inserts fail
ALTER TABLE public.medications 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Step 3: Rebuild RLS (disable and enable to refresh)
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Step 4: Recreate RLS policies
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

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
