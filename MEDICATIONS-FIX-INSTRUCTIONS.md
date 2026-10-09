# 🚀 FIX MEDICATIONS RLS ERROR - STEP BY STEP

## Problem
Getting error: **"new row violates row-level security policy for table medications"** when trying to add medications

## Root Cause
- `user_id` column doesn't have a DEFAULT value
- RLS policies exist but need to be refreshed
- When INSERT happens, RLS check fails before DEFAULT can be applied

## Solution - 3 Steps

### Step 1: Open Supabase SQL Editor
Go to: **https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new**

### Step 2: Copy the SQL Below (everything between the lines)

```sql
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
```

### Step 3: Click "Run" or Press Ctrl+Enter

Wait for the green success message.

## Testing After Fix

1. Go to: http://localhost:8081
2. Sign in (if not already)
3. Click "Medications" in sidebar
4. Click "Add Medication" button
5. Fill in the form and click "Save"
6. ✅ Should save without errors!

## If Still Having Issues

Try one of these:

### Option A: Check if user is authenticated
Open browser console (F12) and run:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Option B: Verify migration was applied
In Supabase SQL editor, run:
```sql
SELECT policyname, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'medications';
```

Should show 4 policies for medications table.

### Option C: Check table schema
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'medications';
```

Should show `user_id` has DEFAULT: `auth.uid()`

## Key Changes Made

✅ Added `DEFAULT auth.uid()` to `user_id` column
✅ Removed and recreated RLS policies
✅ Added performance index on `user_id`
✅ Refreshed RLS by disabling/enabling

This ensures that:
- When a medication is inserted, `user_id` defaults to the current auth user
- RLS policies validate the insert matches the authenticated user
- No more "violates row-level security" errors

---

Created: 2026-03-13
Status: Ready to Apply ✅
