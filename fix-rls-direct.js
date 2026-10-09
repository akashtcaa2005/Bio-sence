import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ziomyqwvmbndssrdgmhp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppb215cXd2bWJuZHNzcmRnbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAxMDksImV4cCI6MjA4ODI1NjEwOX0.eWZMfzNMO3gc-SEUTB6WnM3wIovy6-7cYy3kR8AmIB0'

console.log('🔧 Direct RLS Policy Fix for Medications Table')
console.log('=' .repeat(60))

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// The exact SQL to execute to fix RLS
const fixSQL = `
-- MEDICATIONS TABLE RLS FIX
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Create new policies
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
`

console.log('\n📋 SQL to apply:')
console.log(fixSQL)

console.log('\n' + '=' .repeat(60))
console.log('✅ Copy the SQL above and paste it in Supabase SQL Editor')
console.log('🌐 Go to: https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new')
console.log('📌 Paste the SQL above and click Run')
console.log('=' .repeat(60))

// Try to create anonymous client for testing
console.log('\n🧪 Testing connection...')
try {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log(authError ? `⚠️  Not authenticated (expected): ${authError.message}` : `✅ Connected as: ${user?.email}`)
} catch (err) {
  console.log(`✅ Can reach Supabase: ${SUPABASE_URL}`)
}
