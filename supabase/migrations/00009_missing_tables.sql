-- ============================================================
-- ERP Tutoring Center — Missing Tables Migration
-- Adds 12 tables referenced by the application code
-- ============================================================

-- ============================================================
-- 1. PRIVATE LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS private_lessons (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE,
    start_time TIME,
    end_time TIME,
    price DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_private_lessons_teacher ON private_lessons(teacher_id);
CREATE INDEX idx_private_lessons_student ON private_lessons(student_id);
CREATE INDEX idx_private_lessons_status ON private_lessons(status);

ALTER TABLE private_lessons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. VIP CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS vip_classes (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE,
    start_time TIME,
    end_time TIME,
    price DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vip_classes_teacher ON vip_classes(teacher_id);
CREATE INDEX idx_vip_classes_student ON vip_classes(student_id);
CREATE INDEX idx_vip_classes_status ON vip_classes(status);

ALTER TABLE vip_classes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. ONLINE CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS online_classes (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    platform VARCHAR(100),
    meeting_url TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_online_classes_teacher ON online_classes(teacher_id);
CREATE INDEX idx_online_classes_course ON online_classes(course_id);
CREATE INDEX idx_online_classes_status ON online_classes(status);

ALTER TABLE online_classes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    file_url TEXT,
    max_grade DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_due ON assignments(due_date);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. ASSIGNMENT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grade DECIMAL(5,2),
    feedback TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_as_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_as_student ON assignment_submissions(student_id);
CREATE INDEX idx_as_status ON assignment_submissions(status);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned DESC, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    teacher_id UUID REFERENCES teachers(id),
    parent_id UUID REFERENCES parents(id),
    participant_id UUID NOT NULL REFERENCES users(id),
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_student ON conversations(student_id);
CREATE INDEX idx_conversations_teacher ON conversations(teacher_id);
CREATE INDEX idx_conversations_participant ON conversations(participant_id);
CREATE INDEX idx_conversations_last ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. TEACHER REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_reviews (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, student_id)
);

CREATE INDEX idx_tr_teacher ON teacher_reviews(teacher_id);
CREATE INDEX idx_tr_student ON teacher_reviews(student_id);

ALTER TABLE teacher_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. RFID SCANS
-- ============================================================
CREATE TABLE IF NOT EXISTS rfid_scans (
    id BIGSERIAL PRIMARY KEY,
    rfid_code VARCHAR(100) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unknown',
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rfid_scans_code ON rfid_scans(rfid_code);
CREATE INDEX idx_rfid_scans_student ON rfid_scans(student_id);
CREATE INDEX idx_rfid_scans_date ON rfid_scans(scanned_at DESC);

ALTER TABLE rfid_scans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. CENTER SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS center_settings (
    id BIGSERIAL PRIMARY KEY,
    center_name VARCHAR(255) NOT NULL DEFAULT 'Radiant Learning',
    address TEXT,
    phone VARCHAR(30),
    wilaya VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    auto_invoice BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO center_settings (center_name) VALUES ('Radiant Learning')
ON CONFLICT DO NOTHING;

ALTER TABLE center_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. TEACHER PAYROLL (materialized from v_teacher_payroll)
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_payroll (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, month, year)
);

CREATE INDEX idx_tp_teacher ON teacher_payroll(teacher_id);
CREATE INDEX idx_tp_period ON teacher_payroll(month, year);

ALTER TABLE teacher_payroll ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES for new tables
-- ============================================================

-- Private lessons: student/teacher/staff read, teacher/staff write
CREATE POLICY private_lessons_select_own ON private_lessons FOR SELECT USING (
    student_id = auth.uid() OR teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY private_lessons_insert_student ON private_lessons FOR INSERT WITH CHECK (
    student_id = auth.uid() OR is_staff()
);
CREATE POLICY private_lessons_update_teacher ON private_lessons FOR UPDATE USING (
    teacher_id = auth.uid() OR is_staff()
) WITH CHECK (teacher_id = auth.uid() OR is_staff());
CREATE POLICY private_lessons_delete_staff ON private_lessons FOR DELETE USING (is_staff());

-- VIP classes
CREATE POLICY vip_classes_select_own ON vip_classes FOR SELECT USING (
    student_id = auth.uid() OR teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY vip_classes_insert_student ON vip_classes FOR INSERT WITH CHECK (
    student_id = auth.uid() OR is_staff()
);
CREATE POLICY vip_classes_update_teacher ON vip_classes FOR UPDATE USING (
    teacher_id = auth.uid() OR is_staff()
) WITH CHECK (teacher_id = auth.uid() OR is_staff());
CREATE POLICY vip_classes_delete_staff ON vip_classes FOR DELETE USING (is_staff());

-- Online classes
CREATE POLICY online_classes_select_all ON online_classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY online_classes_insert_teacher ON online_classes FOR INSERT WITH CHECK (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY online_classes_update_teacher ON online_classes FOR UPDATE USING (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY online_classes_delete_staff ON online_classes FOR DELETE USING (is_staff());

-- Assignments
CREATE POLICY assignments_select_course ON assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid())
    OR teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY assignments_insert_teacher ON assignments FOR INSERT WITH CHECK (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY assignments_update_teacher ON assignments FOR UPDATE USING (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY assignments_delete_staff ON assignments FOR DELETE USING (is_staff());

-- Assignment submissions
CREATE POLICY assignment_submissions_select_own ON assignment_submissions FOR SELECT USING (
    student_id = auth.uid() OR is_teacher() OR is_staff()
);
CREATE POLICY assignment_submissions_insert_student ON assignment_submissions FOR INSERT WITH CHECK (
    student_id = auth.uid()
);
CREATE POLICY assignment_submissions_update_teacher ON assignment_submissions FOR UPDATE USING (
    is_teacher() OR is_staff()
);

-- Announcements
CREATE POLICY announcements_select_enrolled ON announcements FOR SELECT USING (
    course_id IS NULL OR
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_id = announcements.course_id AND student_id = auth.uid())
    OR is_teacher() OR is_staff()
);
CREATE POLICY announcements_insert_teacher ON announcements FOR INSERT WITH CHECK (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY announcements_delete_staff ON announcements FOR DELETE USING (is_staff());

-- Certificates
CREATE POLICY certificates_select_own ON certificates FOR SELECT USING (
    student_id = auth.uid() OR is_staff()
);
CREATE POLICY certificates_insert_staff ON certificates FOR INSERT WITH CHECK (is_staff());

-- Conversations
CREATE POLICY conversations_select_involved ON conversations FOR SELECT USING (
    student_id = auth.uid() OR teacher_id = auth.uid() OR parent_id = auth.uid() OR participant_id = auth.uid()
);
CREATE POLICY conversations_insert_authenticated ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY conversations_update_involved ON conversations FOR UPDATE USING (
    student_id = auth.uid() OR teacher_id = auth.uid() OR parent_id = auth.uid() OR participant_id = auth.uid()
);

-- Teacher reviews
CREATE POLICY teacher_reviews_select_all ON teacher_reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY teacher_reviews_insert_student ON teacher_reviews FOR INSERT WITH CHECK (
    student_id = auth.uid()
);
CREATE POLICY teacher_reviews_delete_staff ON teacher_reviews FOR DELETE USING (is_staff());

-- RFID scans
CREATE POLICY rfid_scans_select_staff ON rfid_scans FOR SELECT USING (is_staff());
CREATE POLICY rfid_scans_insert_staff ON rfid_scans FOR INSERT WITH CHECK (is_staff());

-- Center settings
CREATE POLICY center_settings_select_staff ON center_settings FOR SELECT USING (is_staff());
CREATE POLICY center_settings_update_admin ON center_settings FOR UPDATE USING (is_admin());

-- Teacher payroll
CREATE POLICY teacher_payroll_select_own ON teacher_payroll FOR SELECT USING (
    teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY teacher_payroll_insert_admin ON teacher_payroll FOR INSERT WITH CHECK (is_admin());
CREATE POLICY teacher_payroll_update_admin ON teacher_payroll FOR UPDATE USING (is_admin());
