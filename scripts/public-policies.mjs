import { Client } from 'pg';

const password = encodeURIComponent('3Ks#?Y.tZQ2#Dr5');
const client = new Client({
  connectionString: `postgresql://postgres.kaoxcbqhuwhtadpgccjp:${password}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
console.log('Connected.');

// Allow anonymous (not authenticated) users to SELECT from public-facing tables
const publicTables = [
  'courses', 'course_schedules', 'levels', 'subjects', 'rooms',
  'teachers', 'users', 'level_subject', 'teacher_availability',
];

for (const table of publicTables) {
  try {
    // Drop existing anon policy if any
    await client.query(`DROP POLICY IF EXISTS ${table}_read_anon ON ${table}`);
    await client.query(`CREATE POLICY ${table}_read_anon ON ${table} FOR SELECT USING (true)`);
    console.log(`  ${table}: anon read policy created`);
  } catch (e) {
    console.log(`  ${table}: ${e.message.substring(0, 100)}`);
  }
}

// Enable RLS on tables that might not have it
const rlsTables = ['levels', 'subjects', 'level_subject', 'teacher_availability'];
for (const table of rlsTables) {
  try {
    await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    console.log(`  ${table}: RLS enabled`);
  } catch {}
}

console.log('Done. Public access policies added.');
await client.end();
