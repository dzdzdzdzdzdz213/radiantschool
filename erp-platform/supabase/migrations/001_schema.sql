-- ============================================================
-- ERP Tutoring Center — Schema Migration 001
-- Description: Initial schema, enums, tables, constraints, RLS
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'assistant', 'teacher', 'student', 'parent');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE student_type AS ENUM ('regular', 'single_session');
CREATE TYPE rfid_status AS ENUM ('active', 'inactive', 'lost');
CREATE TYPE teaching_mode AS ENUM ('online', 'onsite', 'both');
CREATE TYPE contract_type AS ENUM ('fixed', 'hourly', 'percentage');
CREATE TYPE course_type AS ENUM ('normal', 'vip', 'private');
CREATE TYPE course_status AS ENUM ('active', 'inactive', 'full', 'cancelled');
CREATE TYPE enrollment_status AS ENUM ('active', 'pending_approval', 'completed', 'cancelled');
CREATE TYPE attendance_method AS ENUM ('rfid', 'manual');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'check');
CREATE TYPE payment_type AS ENUM ('monthly', 'per_session', 'vip', 'private');
CREATE TYPE invoice_status AS ENUM ('paid', 'unpaid', 'partially_paid', 'cancelled');
CREATE TYPE resource_type AS ENUM ('pdf', 'exercise', 'image', 'video', 'link');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE notification_category AS ENUM ('payment', 'course', 'attendance', 'system', 'registration');
CREATE TYPE waiting_list_status AS ENUM ('waiting', 'notified', 'enrolled', 'expired');
CREATE TYPE backup_type AS ENUM ('automatic', 'manual');
CREATE TYPE backup_status AS ENUM ('in_progress', 'completed', 'failed');
CREATE TYPE room_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE level_category AS ENUM ('primary', 'middle', 'high_school');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_type AS ENUM ('payment', 'credit', 'refund', 'adjustment');

-- ============================================================
-- USERS (base table for all roles)
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    postal_code VARCHAR(10),
    city VARCHAR(100),
    wilaya VARCHAR(100),
    date_of_birth DATE,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    photo_url TEXT,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted ON users(deleted_at);
CREATE INDEX idx_users_search ON users USING GIN (
    to_tsvector('french', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,''))
);

-- ============================================================
-- ROLE EXTENSION TABLES
-- ============================================================

CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_type student_type NOT NULL DEFAULT 'regular',
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    school_origin VARCHAR(200),
    level_id BIGINT REFERENCES levels(id),
    rfid_tag VARCHAR(100) UNIQUE,
    rfid_assigned_at TIMESTAMPTZ,
    rfid_status rfid_status DEFAULT 'inactive',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_rfid ON students(rfid_tag);
CREATE INDEX idx_students_reg_num ON students(registration_number);
CREATE INDEX idx_students_level ON students(level_id);

CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_parent (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    relationship VARCHAR(50),
    UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_sp_student ON student_parent(student_id);
CREATE INDEX idx_sp_parent ON student_parent(parent_id);

CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    teaching_mode teaching_mode NOT NULL DEFAULT 'onsite',
    biography TEXT,
    specialties JSONB DEFAULT '[]',
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_contracts (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    contract_type contract_type NOT NULL DEFAULT 'hourly',
    hourly_rate DECIMAL(10,2),
    percentage_rate DECIMAL(5,2),
    fixed_salary DECIMAL(10,2),
    hours_min INTEGER DEFAULT 0,
    hours_max INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tc_teacher ON teacher_contracts(teacher_id);

CREATE TABLE teacher_availability (
    id BIGSERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_time CHECK (start_time < end_time)
);

CREATE INDEX idx_ta_teacher ON teacher_availability(teacher_id);

CREATE TABLE assistants (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEVELS & SUBJECTS
-- ============================================================

CREATE TABLE levels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category level_category NOT NULL,
    stream VARCHAR(100),
    year INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE level_subject (
    id BIGSERIAL PRIMARY KEY,
    level_id BIGINT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(level_id, subject_id)
);

CREATE INDEX idx_ls_level ON level_subject(level_id);
CREATE INDEX idx_ls_subject ON level_subject(subject_id);

-- ============================================================
-- ROOMS
-- ============================================================

CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    floor INTEGER,
    equipment JSONB DEFAULT '[]',
    status room_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COURSES
-- ============================================================

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type course_type NOT NULL DEFAULT 'normal',
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_enrollments INTEGER DEFAULT 0,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status course_status NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    level_id BIGINT NOT NULL REFERENCES levels(id),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    room_id BIGINT REFERENCES rooms(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_enrollments CHECK (current_enrollments <= capacity)
);

CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_courses_level ON courses(level_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_type ON courses(type);

-- ============================================================
-- COURSE SCHEDULES (with exclusion constraints for conflicts)
-- ============================================================

CREATE TABLE course_schedules (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id BIGINT REFERENCES rooms(id),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    CONSTRAINT valid_schedule CHECK (start_time < end_time),
    CONSTRAINT no_teacher_conflict EXCLUDE USING gist (
        teacher_id WITH =,
        day_of_week WITH =,
        tstzrange(
            '2000-01-01'::date + start_time,
            '2000-01-01'::date + end_time,
            '[)'
        ) WITH &&
    ),
    CONSTRAINT no_room_conflict EXCLUDE USING gist (
        COALESCE(room_id, 0) WITH =,
        day_of_week WITH =,
        tstzrange(
            '2000-01-01'::date + start_time,
            '2000-01-01'::date + end_time,
            '[)'
        ) WITH &&
    ) WHERE (room_id IS NOT NULL)
);

CREATE INDEX idx_cs_course ON course_schedules(course_id);
CREATE INDEX idx_cs_room ON course_schedules(room_id);

-- ============================================================
-- ENROLLMENTS
-- ============================================================

CREATE TABLE course_enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status enrollment_status NOT NULL DEFAULT 'active',
    campaign_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_ce_student ON course_enrollments(student_id);
CREATE INDEX idx_ce_course ON course_enrollments(course_id);
CREATE INDEX idx_ce_status ON course_enrollments(status);
CREATE INDEX idx_ce_student_status ON course_enrollments(student_id, status);
CREATE INDEX idx_ce_course_status ON course_enrollments(course_id, status);

-- ============================================================
-- APPROVALS (private lesson 2-student)
-- ============================================================

CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL,
    status approval_status NOT NULL DEFAULT 'pending',
    comment TEXT,
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, role)
);

CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);

-- ============================================================
-- CAMPAGNS
-- ============================================================

CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    max_seats INTEGER,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_campaign_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_campaigns_active ON campaigns(is_active);

CREATE TABLE campaign_courses (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    price_override DECIMAL(10,2),
    UNIQUE(campaign_id, course_id)
);

-- ============================================================
-- WAITING LIST
-- ============================================================

CREATE TABLE waiting_list (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    status waiting_list_status NOT NULL DEFAULT 'waiting',
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_wl_student ON waiting_list(student_id);
CREATE INDEX idx_wl_course ON waiting_list(course_id);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
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
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_schedule ON attendance(course_schedule_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date DESC);

-- ============================================================
-- FINANCIAL
-- ============================================================

CREATE SEQUENCE receipt_number_seq START 1 INCREMENT 1;
CREATE SEQUENCE invoice_number_seq START 1 INCREMENT 1;

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method payment_method NOT NULL,
    payment_type payment_type NOT NULL,
    reference VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('REC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('receipt_number_seq')::TEXT, 6, '0')),
    notes VARCHAR(500),
    recorded_by UUID NOT NULL REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_student_date ON payments(student_id, payment_date DESC);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('FAC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0')),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'unpaid',
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_student_status ON invoices(student_id, status);

CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    course_id BIGINT REFERENCES courses(id)
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id),
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    reference VARCHAR(100),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transaction_allocations (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id),
    invoice_id BIGINT REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESOURCES
-- ============================================================

CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type resource_type NOT NULL,
    file_url TEXT,
    external_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_resource CHECK (
        (type = 'link' AND external_url IS NOT NULL) OR
        (type != 'link' AND file_url IS NOT NULL)
    )
);

CREATE INDEX idx_resources_course ON resources(course_id);
CREATE INDEX idx_resources_type ON resources(type);

-- ============================================================
-- EVALUATIONS
-- ============================================================

CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    teaching_quality SMALLINT NOT NULL CHECK (teaching_quality BETWEEN 1 AND 5),
    communication SMALLINT NOT NULL CHECK (communication BETWEEN 1 AND 5),
    punctuality SMALLINT NOT NULL CHECK (punctuality BETWEEN 1 AND 5),
    organization SMALLINT NOT NULL CHECK (organization BETWEEN 1 AND 5),
    average_score DECIMAL(3,2) GENERATED ALWAYS AS (
        (teaching_quality + communication + punctuality + organization)::DECIMAL / 4
    ) STORED,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, teacher_id)
);

CREATE INDEX idx_evaluations_teacher ON evaluations(teacher_id);

-- ============================================================
-- NOTIFICATIONS & MESSAGES
-- ============================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    category notification_category NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    parent_message_id BIGINT REFERENCES messages(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_receiver_read ON messages(receiver_id, is_read);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- BACKUPS
-- ============================================================

CREATE TABLE backups (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    type backup_type NOT NULL,
    status backup_status NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES admins(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Users: can read own, admin reads all
CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_read_admin ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Students: read own, parent reads children, admin/assistant reads all
CREATE POLICY students_read_own ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY students_read_parent ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_parent WHERE student_id = id AND parent_id = auth.uid())
);
CREATE POLICY students_read_staff ON students FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
);

-- Courses: all authenticated users can read
CREATE POLICY courses_read_all ON courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY courses_write_staff ON courses FOR INSERT UPDATE DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
);

-- Enrollments: own, parent, staff
CREATE POLICY enrollments_read_own ON course_enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY enrollments_read_parent ON course_enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_parent WHERE student_id = course_enrollments.student_id AND parent_id = auth.uid())
);
CREATE POLICY enrollments_read_teacher ON course_enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid())
);
CREATE POLICY enrollments_write_staff ON course_enrollments FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid())
);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: enrollment count
-- ============================================================

CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- ============================================================
-- TRIGGER: audit log
-- ============================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_courses AFTER INSERT OR UPDATE OR DELETE ON courses FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_enrollments AFTER INSERT OR UPDATE OR DELETE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_evaluations AFTER INSERT OR UPDATE OR DELETE ON evaluations FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================
-- FUNCTION: auto-generate invoice (to be called by cron)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_monthly_invoices()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA: default admin
-- ============================================================

-- Note: In production, create admin via Supabase Auth + trigger
INSERT INTO system_settings (key, value, description) VALUES
('center.name', '"Mon Centre de Soutien"', 'Nom du centre'),
('center.currency', '"DZD"', 'Devise par défaut'),
('center.timezone', '"Africa/Algiers"', 'Fuseau horaire'),
('center.language', '"fr"', 'Langue de l''interface'),
('payment.reminder_days', '[5, 15, 30]', 'Jours de relance après échéance'),
('rfid.grace_period_minutes', '15', 'Période de grâce avant marquage retard'),
('academic.current_year_id', 'null', 'Année académique en cours')
ON CONFLICT (key) DO NOTHING;
