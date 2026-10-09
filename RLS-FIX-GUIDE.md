# ✨ Medications Table RLS Fix - Complete Guide

## 📋 Summary of the Issue
- **Error**: "new row violates row-level security policy for table medications"
- **Cause**: RLS policies not properly configured for authenticated user inserts
- **Solution**: Apply updated RLS policies with proper `TO authenticated` clauses

## 🔧 Fix Applied
Updated migration: `supabase/migrations/20260314_fix_medications_rls.sql`

### What Changed:
✅ Added `TO authenticated` clause to all RLS policies
✅ Proper SELECT, INSERT, UPDATE, DELETE policy configuration
✅ Ensures `auth.uid() = user_id` for all operations

## 🚀 How to Apply (Choose One Method)

### Method 1: Supabase Dashboard (Recommended) ✅

1. Go to: https://supabase.com/dashboard
2. Log in with your account
3. Select project: **Bio Sense** (ziomyqwvmbndssrdgmhp)
4. Navigate to: **SQL Editor** → **New Query**
5. Copy all text below between the markers:

```sql
-- Comprehensive RLS policy fix for medications table
-- This ensures authenticated users can only access their own medications

-- Step 1: Ensure RLS is enabled
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Step 3: Create RLS policies for authenticated users
-- SELECT policy: Users can view only their own medications
CREATE POLICY "Users can view their own medications"
  ON public.medications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy: Users can insert only if user_id matches their auth.uid()
CREATE POLICY "Users can create their own medications"
  ON public.medications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update only their own medications
CREATE POLICY "Users can update their own medications"
  ON public.medications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete only their own medications
CREATE POLICY "Users can delete their own medications"
  ON public.medications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

6. Click **Run** or press **Ctrl+Enter**
7. Wait for success message (green checkmark)
8. Go to http://localhost:8081 and test

### Method 2: Using psql CLI

If you have PostgreSQL `psql` installed and have your Supabase connection string:

```bash
# Set your Supabase connection URL
export DATABASE_URL="postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres"

# Run the migration
psql "$DATABASE_URL" -f supabase/migrations/20260314_fix_medications_rls.sql
```

### Method 3: Via Node.js Script

```bash
node apply-rls-migration.js
```

## 🧪 Testing After Applying Migration

### Step 1: Navigate to the app
```
http://localhost:8081
```

### Step 2: Sign in
- Use Google OAuth or Phone OTP
- Ensure you're authenticated

### Step 3: Go to Medications page
- Click "Medications" in sidebar
- Try adding a new medication
- Should work without RLS errors!

## ✅ Verification Checklist

After applying the migration:

```bash
# 1. Run verification script
node verify-rls.js

# 2. Check for RLS policies (in dashboard)
SELECT tablename FROM pg_tables WHERE tablename = 'medications';
SELECT * FROM pg_policies WHERE tablename = 'medications';

# 3. Expected output should show 4 policies:
# - Users can view their own medications (SELECT)
# - Users can create their own medications (INSERT)
# - Users can update their own medications (UPDATE)
# - Users can delete their own medications (DELETE)
```

## 🔍 Troubleshooting

### Still getting RLS errors?

**Check 1**: Are you authenticated?
```bash
# Open browser console and run:
const { data } = await supabase.auth.getUser();
console.log(data.user);
```

**Check 2**: Is user_id being sent?
```
Look at Network tab in DevTools → medications (POST request)
Should include: "user_id": "actual-uuid"
```

**Check 3**: Did migration apply?
```sql
-- Run in Supabase SQL Editor:
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'medications';
-- Should show 4 policies
```

**Check 4**: Clear browser cache
- Press Ctrl+Shift+Delete
- Clear cache and cookies
- Reload page

### If You Need Help

1. Check `supabase/migrations/20260314_fix_medications_rls.sql` is correct
2. Run `node verify-rls.js` to diagnose
3. Check Supabase Dashboard → Logs for SQL errors

## 📊 Files Modified

- ✏️ `supabase/migrations/20260314_fix_medications_rls.sql` - Updated RLS policies
- ➕ `verify-rls.js` - Verification script
- ➕ `apply-rls-migration.js` - Auto-apply script (if needed)
- ➕ `RLS-FIX-GUIDE.md` - This file

## 🎯 Next Steps

1. ✅ Apply the SQL migration
2. ✅ Test the medications page
3. ✅ Verify no more RLS errors
4. ✅ Clean up temporary files (apply-migration.js, verify-rls.js)

---

**Status**: Migration is ready. Just need to execute the SQL in Supabase Dashboard!
