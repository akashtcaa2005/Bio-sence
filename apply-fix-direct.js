#!/usr/bin/env node
/**
 * Medications RLS Fix - Direct PostgreSQL Connection
 * 
 * This script applies the RLS fix directly via PostgreSQL
 * Requires: DATABASE_URL environment variable
 * 
 * Usage: 
 *   DATABASE_URL="postgresql://..." node apply-fix-direct.js
 * 
 * Or provide via Supabase Service Role Key
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ziomyqwvmbndssrdgmhp.supabase.co'

// Try to get Service Role Key from environment
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error(`
❌ Service Role Key not found!

The anon key CANNOT execute DDL statements (CREATE POLICY, ALTER TABLE, etc).

To fix this, you need the SERVICE ROLE KEY from Supabase:

1. Go to: https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/settings/api
2. Under "Project API keys", copy the "SERVICE ROLE KEY" (not the anon key)
3. Set environment variable:
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
4. Run this script again

OR manually apply the SQL:
   https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new
  `)
  process.exit(1)
}

console.log('\n' + '='.repeat(70))
console.log('🔧 APPLYING MEDICATIONS RLS FIX')
console.log('='.repeat(70) + '\n')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const fixSQL = `
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;

-- Add DEFAULT to user_id
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
`

try {
  // Execute the SQL
  console.log('⏳ Executing SQL statements...')
  
  // Split statements and execute
  const statements = fixSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))
  
  for (const statement of statements) {
    console.log(`\n  📝 ${statement.substring(0, 60)}...`)
    const { error } = await supabase.rpc('exec', { sql: statement + ';' })
    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
    } else {
      console.log(`  ✅ Success`)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('✨ Fix applied successfully!')
  console.log('='.repeat(70))
  console.log('\n🧪 Test it now:')
  console.log('   1. Go to http://localhost:8081')
  console.log('   2. Sign in')
  console.log('   3. Click "Medications"')
  console.log('   4. Click "Add Medication"')
  console.log('   5. Should work without RLS errors!')
  console.log('')
  
} catch (err) {
  console.error(`\n❌ Error: ${err.message}`)
  console.error('\nTry manual approach:')
  console.error('1. Get your Service Role Key from Supabase Settings/API')
  console.error('2. Go to https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new')
  console.error('3. Paste the SQL and click Run')
  process.exit(1)
}
