-- Performance indexes for the ERP platform
-- Run this in Supabase SQL Editor

-- Users search & filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_name_search ON public.users USING gin(to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '')));

-- Students
CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(level_id);
CREATE INDEX IF NOT EXISTS idx_students_rfid ON public.students(rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_type ON public.students(student_type);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON public.courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_room ON public.courses(room_id) WHERE room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_dates ON public.courses(start_date, end_date);

-- Course schedules
CREATE INDEX IF NOT EXISTS idx_schedules_day ON public.course_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_course ON public.course_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON public.course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_room ON public.course_schedules(room_id) WHERE room_id IS NOT NULL;

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_date ON public.course_enrollments(enrollment_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_active_unique ON public.course_enrollments(student_id, course_id) WHERE status NOT IN ('cancelled');

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON public.attendance(course_schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date_status ON public.attendance(date, status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_recorded_by ON public.payments(recorded_by);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_student ON public.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- Evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_teacher ON public.evaluations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_score ON public.evaluations(average_score DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(created_at DESC);

-- Teacher contracts
CREATE INDEX IF NOT EXISTS idx_teacher_contracts_teacher ON public.teacher_contracts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_contracts_active ON public.teacher_contracts(teacher_id) WHERE end_date IS NULL OR end_date > now();

-- Resources
CREATE INDEX IF NOT EXISTS idx_resources_course ON public.resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);

-- Approvals
CREATE INDEX IF NOT EXISTS idx_approvals_entity ON public.approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);

-- Student-parent
CREATE INDEX IF NOT EXISTS idx_sp_student ON public.student_parent(student_id);
CREATE INDEX IF NOT EXISTS idx_sp_parent ON public.student_parent(parent_id);

-- Level-subject
CREATE INDEX IF NOT EXISTS idx_ls_level ON public.level_subject(level_id);
CREATE INDEX IF NOT EXISTS idx_ls_subject ON public.level_subject(subject_id);
