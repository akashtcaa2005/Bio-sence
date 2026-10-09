import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ziomyqwvmbndssrdgmhp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppb215cXd2bWJuZHNzcmRnbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAxMDksImV4cCI6MjA4ODI1NjEwOX0.eWZMfzNMO3gc-SEUTB6WnM3wIovy6-7cYy3kR8AmIB0'

console.log('🔍 Checking medications table RLS configuration...\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Test 1: Check if table exists and RLS is enabled
console.log('✓ Test 1: Checking medications table...')
const { data: tableMeds, error: tableError } = await supabase
  .from('medications')
  .select('*')
  .limit(1)

if (tableError && tableError.message.includes('violates row-level security')) {
  console.log('❌ RLS BLOCKING: Row-level security is enabled but policies may have issues\n')
} else if (tableError) {
  console.log(`❌ Error: ${tableError.message}\n`)
} else {
  console.log('✅ Medications table accessible\n')
}

// Test 2: Check current authentication
console.log('✓ Test 2: Checking authentication...')
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  console.log('⚠️  Not authenticated - RLS policies will only apply to authenticated users\n')
  console.log('For testing, please:')
  console.log('1. Go to http://localhost:8080')
  console.log('2. Log in to create an authenticated session')
  console.log('3. Then navigate to the medications page\n')
} else {
  console.log(`✅ Authenticated as: ${user.email}\n`)
  
  // Test 3: Try to fetch medications
  console.log('✓ Test 3: Fetching your medications...')
  const { data: meds, error: medsError } = await supabase
    .from('medications')
    .select('*')
  
  if (medsError) {
    console.log(`❌ Error: ${medsError.message}\n`)
  } else {
    console.log(`✅ Found ${meds?.length || 0} medications\n`)
  }
}

console.log('📋 Summary:')
console.log('- The RLS fix has been prepared in: supabase/migrations/20260314_fix_medications_rls.sql')
console.log('- You need to apply this migration in Supabase Dashboard')
console.log('\n📖 Instructions to apply the migration:')
console.log('1. Go to https://app.supabase.com')
console.log('2. Select your project (ziomyqwvmbndssrdgmhp)')
console.log('3. Go to SQL Editor')
console.log('4. Create new query')
console.log('5. Copy-paste the contents of: supabase/migrations/20260314_fix_medications_rls.sql')
console.log('6. Execute the query')
console.log('7. Test the medications page')
