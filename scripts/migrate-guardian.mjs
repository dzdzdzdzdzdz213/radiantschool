const SUPABASE_URL = 'https://kaoxcbqhuwhtadpgccjp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb3hjYnFodXdodGFkcGdjY2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgwODgwOSwiZXhwIjoyMDk4Mzg0ODA5fQ.VxOuSMzhx1R5QsXYHZ_xfATAKnynWeKSPpAdwGqA4s4';

const SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES users(id);
`.trim();

async function run() {
  // Try /sql endpoint
  try {
    const res = await fetch(`${SUPABASE_URL}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query: SQL }),
    });
    const text = await res.text();
    console.log(`/sql endpoint: ${res.status} ${text}`);
    if (res.ok) { console.log('✓ Migration applied!'); return; }
  } catch (e) { console.log('/sql failed:', e.message); }

  // Try /rest/v1/rpc/exec_sql
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query_text: SQL }),
    });
    const text = await res.text();
    console.log(`/rpc/exec_sql: ${res.status} ${text}`);
    if (res.ok) { console.log('✓ Migration applied!'); return; }
  } catch (e) { console.log('/rpc/exec_sql failed:', e.message); }

  // Try /rest/v1/ with raw query
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Prefer': 'params=multiple-objects',
      },
      body: JSON.stringify({ query: SQL }),
    });
    const text = await res.text();
    console.log(`/rest/v1 raw: ${res.status} ${text}`);
    if (res.ok) { console.log('✓ Migration applied!'); return; }
  } catch (e) { console.log('/rest/v1 raw failed:', e.message); }

  // Direct pg connection via fetch to auth admin
  console.log('\n❌ Could not run SQL via API.');
  console.log('Run this SQL manually in Supabase Dashboard → SQL Editor:');
  console.log('\n' + SQL);
}

run().catch(console.error);
