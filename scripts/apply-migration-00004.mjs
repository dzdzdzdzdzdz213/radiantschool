import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const password = encodeURIComponent('3Ks#?Y.tZQ2#Dr5');
const client = new Client({
  connectionString: 'postgresql://postgres.kaoxcbqhuwhtadpgccjp:' + password + '@aws-0-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

function splitSQL(sql) {
  const statements = [];
  let current = '';
  let inDollar = false;
  let dollarTag = '';
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const n = sql[i + 1] || '';

    // Skip single-line comments
    if (c === '-' && n === '-' && !inString && !inDollar) {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    // Skip block comments
    if (c === '/' && n === '*' && !inString && !inDollar) {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i++;
      continue;
    }

    // Dollar quoting
    if (c === '$' && !inString) {
      if (!inDollar) {
        // Start of dollar quote - look for tag
        let tag = '';
        let j = i + 1;
        while (j < sql.length && sql[j] !== '$') { tag += sql[j]; j++; }
        if (j < sql.length && sql[j] === '$') {
          // Valid dollar quote start
          inDollar = true;
          dollarTag = tag;
          current += sql.substring(i, j + 1);
          i = j;
          continue;
        }
      } else {
        // Check if this ends the dollar quote
        let tag = '';
        let j = i + 1;
        while (j < sql.length && sql[j] !== '$') { tag += sql[j]; j++; }
        if (j < sql.length && sql[j] === '$' && tag === dollarTag) {
          // Valid dollar quote end
          inDollar = false;
          dollarTag = '';
          current += sql.substring(i, j + 1);
          i = j;
          continue;
        }
      }
    }

    // Single quotes
    if (c === "'" && !inDollar) {
      if (!inString) { inString = true; current += c; continue; }
      // Check for escaped quote ''
      if (n === "'") { current += "''"; i++; continue; }
      inString = false; current += c; continue;
    }

    // Semicolons (only outside strings and dollar quotes)
    if (c === ';' && !inString && !inDollar) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += c;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

async function run() {
  console.log('Connecting to Supabase DB...');
  await client.connect();
  console.log('Connected.\n');

  const sql = readFileSync(resolve(__dirname, '../supabase/migrations/00004_run_in_dashboard.sql'), 'utf8');
  const statements = splitSQL(sql);

  console.log(`Found ${statements.length} statements.\n`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.length < 5) continue;
    try {
      await client.query(stmt);
      console.log(`  ✓ [${i + 1}] ${stmt.substring(0, 80).replace(/\n/g, ' ')}...`);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate key')) {
        console.log(`  ~ [${i + 1}] ${stmt.substring(0, 80).replace(/\n/g, ' ')}... (already exists)`);
        ok++;
      } else {
        console.log(`  ✗ [${i + 1}] ${e.message.substring(0, 200)}`);
        fail++;
      }
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  await client.end();
  if (fail > 0) {
    console.log(`\n⚠ ${fail} statements failed. Check the errors above.`);
  } else {
    console.log('\n✓ All migrations applied successfully!');
  }
  process.exit(0);
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
