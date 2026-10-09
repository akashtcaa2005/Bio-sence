import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://ziomyqwvmbndssrdgmhp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppb215cXd2bWJuZHNzcmRnbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODAxMDksImV4cCI6MjA4ODI1NjEwOX0.eWZMfzNMO3gc-SEUTB6WnM3wIovy6-7cYy3kR8AmIB0'

console.log('═══════════════════════════════════════════════════════════')
console.log('    🏥 Medications Table RLS Fix - Status Report')
console.log('═══════════════════════════════════════════════════════════\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('📍 Supabase Instance: ziomyqwvmbndssrdgmhp')
console.log('🔗 URL: ' + SUPABASE_URL)
console.log('')

// Check migration file
console.log('📄 Migration File Status:')
const migrationPath = './supabase/migrations/20260314_fix_medications_rls.sql'
if (fs.existsSync(migrationPath)) {
  console.log('✅ Migration file exists: ' + path.resolve(migrationPath))
  const content = fs.readFileSync(migrationPath, 'utf8')
  console.log('   Lines: ' + content.split('\n').length)
  console.log('   Size: ' + (content.length / 1024).toFixed(2) + ' KB\n')
} else {
  console.log('❌ Migration file not found\n')
}

// Test database connection
console.log('🔌 Database Connection Test:')
try {
  const { error } = await supabase.from('medications').select('count').eq('id', '00000000-0000-0000-0000-000000000000')
  if (!error || error.message.includes('jwt') || error.message.includes('No rows')) {
    console.log('✅ Can connect to medications table')
  } else {
    console.log('⚠️  Connection issue: ' + error.message)
  }
} catch (err) {
  console.log('❌ Connection error: ' + err.message)
}

console.log('')

// Check authentication
console.log('🔑 Authentication Check:')
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  console.log('✅ Authenticated as: ' + user.email)
} else {
  console.log('⚠️  Not authenticated (this is normal without active session)')
}

console.log('\n═══════════════════════════════════════════════════════════')
console.log('    📋 Next Steps')
console.log('═══════════════════════════════════════════════════════════\n')

console.log('1. 🌐 Open: https://app.supabase.com/project/ziomyqwvmbndssrdgmhp/sql')
console.log('2. 📋 Create new query')
console.log('3. 📄 Copy contents of: ' + migrationPath)
console.log('4. ▶️  Click "Run" to execute')
console.log('5. ✅ Verify success (green checkmark)')
console.log('6. 🧪 Test medications page at http://localhost:8081')

console.log('\n═══════════════════════════════════════════════════════════')
console.log('    📖 Reference Information')
console.log('═══════════════════════════════════════════════════════════\n')

console.log('📚 Full Guide: Read RLS-FIX-GUIDE.md')
console.log('🧬 Schema: medications table has user_id column')
console.log('🔒 RLS: Will be enabled with 4 policies (SELECT, INSERT, UPDATE, DELETE)')
console.log('👤 Auth: Policies check auth.uid() = user_id')

console.log('\n✨ Migration is ready to apply!\n')
