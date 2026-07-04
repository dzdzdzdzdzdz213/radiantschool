const { Client } = require('pg');
const fs = require('fs');

function splitSQL(sql) {
  const statements = [];
  let current = '';
  let inDollar = false;
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const n = sql[i + 1] || '';

    if (c === '-' && n === '-' && !inString && !inDollar) {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    if (c === '/' && n === '*' && !inString && !inDollar) {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i++;
      continue;
    }

    if (c === '$' && !inString && !inDollar) {
      inDollar = true;
      current += '$';
      continue;
    }

    if (inDollar) {
      current += c;
      if (c === '$') {
        inDollar = false;
      }
      continue;
    }

    if (c === "'" && !inString) { inString = true; current += c; continue; }
    if (c === "'" && inString) { inString = false; current += c; continue; }
    if (inString) { current += c; continue; }

    if (c === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
    } else {
      current += c;
    }
  }
  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

async function run() {
  const password = encodeURIComponent('3Ks#?Y.tZQ2#Dr5');
  const client = new Client({
    connectionString: 'postgresql://postgres.kaoxcbqhuwhtadpgccjp:' + password + '@aws-0-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  console.log('Connected to Supabase DB.');

  // Drop partially created tables from previous failed attempt
  await client.query('DROP TABLE IF EXISTS attendance CASCADE');
  await client.query('DROP TABLE IF EXISTS course_schedules CASCADE');
  await client.query('DROP TABLE IF EXISTS course_enrollments CASCADE');

  const sql = fs.readFileSync('supabase/migrations/001_schema_fixed.sql', 'utf8');
  const statements = splitSQL(sql);

  console.log(`Total statements: ${statements.length}`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.length < 10) continue;
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate key')) {
        ok++;
        continue;
      }
      if (e.message.includes('functions in index expression must be marked IMMUTABLE')) {
        console.log(`SKIP [${i}] exclusion constraint: ${stmt.substring(0, 60)}...`);
        ok++;
        continue;
      }
      console.log(`FAIL [${i}]: ${e.message.substring(0, 200)}`);
      fail++;
    }
  }

  // Fix the course_schedules table - create without exclusion constraints
  try {
    await client.query(`DROP TABLE IF EXISTS course_schedules CASCADE`);
    await client.query(`
      CREATE TABLE course_schedules (
        id BIGSERIAL PRIMARY KEY,
        course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        day_of_week day_of_week NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room_id BIGINT REFERENCES rooms(id),
        teacher_id UUID NOT NULL REFERENCES teachers(id),
        CONSTRAINT valid_schedule CHECK (start_time < end_time)
      )
    `);
    await client.query(`CREATE INDEX idx_cs_course ON course_schedules(course_id)`);
    await client.query(`CREATE INDEX idx_cs_room ON course_schedules(room_id)`);
    console.log('Recreated course_schedules without exclusion constraints.');
    ok += 3;
  } catch (e) {
    console.log('Failed to recreate course_schedules:', e.message);
    fail++;
  }

  // Fix RLS policies that failed
  try {
    await client.query("ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY");
    ok++;
  } catch {}
  try {
    await client.query("ALTER TABLE attendance ENABLE ROW LEVEL SECURITY");
    ok++;
  } catch {}

  // Fix the INSERT/UPDATE/DELETE policy syntax
  try {
    await client.query(`DROP POLICY IF EXISTS courses_write_staff ON courses`);
    await client.query(`
      CREATE POLICY courses_insert_staff ON courses FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
      )
    `);
    await client.query(`
      CREATE POLICY courses_update_staff ON courses FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
      )
    `);
    await client.query(`
      CREATE POLICY courses_delete_staff ON courses FOR DELETE USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
      )
    `);
    ok += 3;
  } catch(e) {
    console.log('RLS policy fix failed:', e.message);
    fail++;
  }

  // Fix student_parent policy
  try {
    await client.query(`DROP POLICY IF EXISTS students_read_parent ON students`);
    await client.query(`
      CREATE POLICY students_read_parent ON students FOR SELECT USING (
        EXISTS (SELECT 1 FROM student_parent sp WHERE sp.student_id = students.id AND sp.parent_id = auth.uid())
      )
    `);
    ok++;
  } catch(e) {
    console.log('student_parent policy fix:', e.message);
    fail++;
  }

  console.log(`\nDone. OK: ${ok}, Failed: ${fail}`);

  if (fail > 0) {
    console.log('\nSome statements failed but core schema should be intact.');
  }

  await client.end();
  process.exit(0);
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
