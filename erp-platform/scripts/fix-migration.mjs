import { Client } from 'pg';

const password = encodeURIComponent('3Ks#?Y.tZQ2#Dr5');
const client = new Client({
  connectionString: `postgresql://postgres.kaoxcbqhuwhtadpgccjp:${password}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

await client.connect();
console.log('Connected. Fixing remaining objects...');

// 1. Create attendance table (references course_schedules which now exists)
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id BIGSERIAL PRIMARY KEY,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_schedule_id BIGINT NOT NULL REFERENCES course_schedules(id),
      date DATE NOT NULL,
      check_in_time TIMESTAMPTZ,
      method attendance_method NOT NULL DEFAULT 'rfid',
      status attendance_status NOT NULL DEFAULT 'absent',
      notes VARCHAR(255),
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, course_schedule_id, date)
    )
  `);
  console.log('Created attendance table');

  await client.query('CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON attendance(course_schedule_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date DESC)');
  await client.query('ALTER TABLE attendance ENABLE ROW LEVEL SECURITY');
  console.log('Created attendance indexes + RLS');
} catch (e) {
  console.log('attendance:', e.message.substring(0, 120));
}

// 2. PL/pgSQL Functions - run each as a separate block
try {
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$;
  `);
  console.log('Created update_updated_at function');

  await client.query('CREATE TRIGGER IF NOT EXISTS users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at()');
  await client.query('CREATE TRIGGER IF NOT EXISTS courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at()');
  await client.query('CREATE TRIGGER IF NOT EXISTS rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at()');
  await client.query('CREATE TRIGGER IF NOT EXISTS invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at()');
  await client.query('CREATE TRIGGER IF NOT EXISTS campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at()');
  console.log('Created update triggers');
} catch (e) {
  console.log('update_updated_at:', e.message.substring(0, 120));
}

try {
  await client.query(`
    CREATE OR REPLACE FUNCTION update_course_enrollment_count()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE courses SET current_enrollments = current_enrollments + 1 WHERE id = NEW.course_id;
      ELSIF TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active' THEN
        UPDATE courses SET current_enrollments = current_enrollments + 1 WHERE id = NEW.course_id;
      ELSIF TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active' THEN
        UPDATE courses SET current_enrollments = current_enrollments - 1 WHERE id = NEW.course_id;
      ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE courses SET current_enrollments = current_enrollments - 1 WHERE id = OLD.course_id;
      END IF;
      RETURN NEW;
    END;
    $func$;
  `);
  await client.query('CREATE TRIGGER IF NOT EXISTS enrollment_count_trigger AFTER INSERT OR UPDATE OR DELETE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count()');
  console.log('Created enrollment count trigger');
} catch (e) {
  console.log('enrollment_count:', e.message.substring(0, 120));
}

try {
  await client.query(`
    CREATE OR REPLACE FUNCTION log_audit_event()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    DECLARE
      entity_name TEXT;
    BEGIN
      entity_name := TG_TABLE_NAME;
      IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
        VALUES (auth.uid(), 'CREATE', entity_name, NEW.id::TEXT, row_to_json(NEW)::JSONB);
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', entity_name, NEW.id::TEXT, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values)
        VALUES (auth.uid(), 'DELETE', entity_name, OLD.id::TEXT, row_to_json(OLD)::JSONB);
      END IF;
      RETURN NEW;
    END;
    $func$;
  `);
  await client.query('CREATE TRIGGER IF NOT EXISTS audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit_event()');
  await client.query('CREATE TRIGGER IF NOT EXISTS audit_courses AFTER INSERT OR UPDATE OR DELETE ON courses FOR EACH ROW EXECUTE FUNCTION log_audit_event()');
  await client.query('CREATE TRIGGER IF NOT EXISTS audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION log_audit_event()');
  await client.query('CREATE TRIGGER IF NOT EXISTS audit_enrollments AFTER INSERT OR UPDATE OR DELETE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION log_audit_event()');
  await client.query('CREATE TRIGGER IF NOT EXISTS audit_evaluations AFTER INSERT OR UPDATE OR DELETE ON evaluations FOR EACH ROW EXECUTE FUNCTION log_audit_event()');
  console.log('Created audit triggers');
} catch (e) {
  console.log('audit:', e.message.substring(0, 120));
}

try {
  await client.query(`
    CREATE OR REPLACE FUNCTION generate_monthly_invoices()
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    DECLARE
      invoice_count INTEGER := 0;
      rec RECORD;
    BEGIN
      FOR rec IN
        SELECT DISTINCT ce.student_id, c.price, c.id as course_id
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.status = 'active'
        AND c.type IN ('normal', 'vip')
        AND NOT EXISTS (
          SELECT 1 FROM invoices i
          WHERE i.student_id = ce.student_id
          AND EXTRACT(MONTH FROM i.issue_date) = EXTRACT(MONTH FROM NOW())
          AND EXTRACT(YEAR FROM i.issue_date) = EXTRACT(YEAR FROM NOW())
        )
      LOOP
        INSERT INTO invoices (student_id, due_date, total_amount, notes)
        VALUES (
          rec.student_id,
          (DATE_TRUNC('month', NOW()) + INTERVAL '10 days')::DATE,
          rec.price,
          'Facture mensuelle - ' || TO_CHAR(NOW(), 'TMMonth YYYY')
        );
        invoice_count := invoice_count + 1;
      END LOOP;
      RETURN invoice_count;
    END;
    $func$;
  `);
  console.log('Created generate_monthly_invoices function');
} catch (e) {
  console.log('generate_monthly_invoices:', e.message.substring(0, 120));
}

// 3. Fix RLS policies
try {
  await client.query(`DROP POLICY IF EXISTS courses_write_staff ON courses`);
  await client.query(`CREATE POLICY courses_insert_staff ON courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid()))`);
  await client.query(`CREATE POLICY courses_update_staff ON courses FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid()))`);
  await client.query(`CREATE POLICY courses_delete_staff ON courses FOR DELETE USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid()))`);
  console.log('Fixed courses RLS policies');
} catch (e) {
  console.log('courses RLS:', e.message.substring(0, 120));
}

try {
  await client.query(`DROP POLICY IF EXISTS students_read_parent ON students`);
  await client.query(`CREATE POLICY students_read_parent ON students FOR SELECT USING (EXISTS (SELECT 1 FROM student_parent sp WHERE sp.student_id = students.id AND sp.parent_id = auth.uid()))`);
  console.log('Fixed students_read_parent RLS policy');
} catch (e) {
  console.log('students RLS:', e.message.substring(0, 120));
}

try {
  await client.query(`ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY`);
  await client.query(`ALTER TABLE attendance ENABLE ROW LEVEL SECURITY`);
  console.log('Enabled RLS on course_schedules + attendance');
} catch (e) {
  console.log('RLS enable:', e.message.substring(0, 120));
}

console.log('\nMigration complete!');

await client.end();
