#!/usr/bin/env node
/**
 * MEDICATIONS RLS FIX - APPLY NOW
 * 
 * The anon key cannot execute DDL statements.
 * You need to apply this SQL in Supabase Dashboard.
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║           🏥 MEDICATIONS TABLE RLS FIX - APPLY NOW                ║
╚════════════════════════════════════════════════════════════════════╝

📌 IMPORTANT: The anon key CANNOT execute DDL (CREATE POLICY, ALTER TABLE)

✅ SOLUTION: Apply SQL in Supabase Dashboard (1 minute)

STEP 1️⃣  Go to Supabase SQL Editor:
   👉 https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new

STEP 2️⃣  Copy this SQL:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Add DEFAULT to user_id (CRITICAL)
ALTER TABLE public.medications ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Rebuild RLS
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications"
  ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3️⃣  Paste into Supabase SQL Editor
STEP 4️⃣  Click "Run" or press Ctrl+Enter
STEP 5️⃣  Wait for green checkmark ✅

STEP 6️⃣  Test it:
   1. Go to http://localhost:8081/medications
   2. Click "Add Medication" button
   3. Fill form and click "Save"
   4. 🎉 Should work without RLS errors!

═════════════════════════════════════════════════════════════════════

Why this fixes it:
✓ Adds DEFAULT auth.uid() to user_id column
✓ User_id is auto-set on insert
✓ RLS policy validation succeeds
✓ No more "violates row-level security" error

═════════════════════════════════════════════════════════════════════
`)
