#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const SUPABASE_URL = 'https://ziomyqwvmbndssrdgmhp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppb215cXd2bWJuZHNzcmRnbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAxMDksImV4cCI6MjA4ODI1NjEwOX0.eWZMfzNMO3gc-SEUTB6WnM3wIovy6-7cYy3kR8AmIB0'

console.log('\n' + '='.repeat(70))
console.log('🏥 MEDICATIONS TABLE RLS FIX - DIRECT APPLICATION')
console.log('='.repeat(70) + '\n')

// Read the migration SQL
const migrationPath = './supabase/migrations/20260314_fix_medications_rls.sql'
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`)
  process.exit(1)
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
const sqlStatements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))
  .map(s => s + ';')

console.log(`📄 Found ${sqlStatements.length} SQL statements to execute\n`)
console.log('The following SQL will be applied:')
console.log('-'.repeat(70))
console.log(migrationSQL)
console.log('-'.repeat(70))

console.log('\n⚠️  IMPORTANT:')
console.log('This script requires you to manually apply the SQL in Supabase Dashboard.')
console.log('The anon key cannot execute DDL (CREATE POLICY, ALTER TABLE, etc.)\n')

console.log('📋 How to apply:')
console.log('1. Go to: https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new')
console.log('2. Create a new query')
console.log('3. Copy and paste the SQL above')
console.log('4. Click "Run" button')
console.log('5. Wait for success message')

console.log('\n🔗 Direct link:')
console.log('   https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql/new')

console.log('\n' + '='.repeat(70))
console.log('✅ After applying the SQL, your issue will be fixed!')
console.log('='.repeat(70) + '\n')
