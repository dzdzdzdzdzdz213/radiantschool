-- ============================================================
-- ERP Tutoring Center — RLS Policies (comprehensive)
-- ============================================================
-- Run after 001_schema_fixed.sql
-- Implements row-level security matching src/lib/permissions.ts

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is assistant
CREATE OR REPLACE FUNCTION is_assistant()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM assistants WHERE id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM students WHERE id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is staff (admin or assistant)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT is_admin() OR is_assistant();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- USERS
-- ============================================================
DROP POLICY IF EXISTS users_read_own ON users;
DROP POLICY IF EXISTS users_read_admin ON users;
DROP POLICY IF EXISTS users_update_own ON users;

CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_select_staff ON users FOR SELECT USING (is_staff());
CREATE POLICY users_select_teacher_students ON users FOR SELECT USING (
  is_teacher() AND role = 'student'
);
CREATE POLICY users_insert_staff ON users FOR INSERT WITH CHECK (is_staff());
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY users_update_staff ON users FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY users_delete_staff ON users FOR DELETE USING (is_staff());

-- ============================================================
-- STUDENTS
-- ============================================================
DROP POLICY IF EXISTS students_read_own ON students;
DROP POLICY IF EXISTS students_read_parent ON students;
DROP POLICY IF EXISTS students_read_staff ON students;

CREATE POLICY students_select_own ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY students_select_parent ON students FOR SELECT USING (
  EXISTS (SELECT 1 FROM student_parent WHERE student_id = id AND parent_id = auth.uid())
);
CREATE POLICY students_select_teacher ON students FOR SELECT USING (
  is_teacher() AND EXISTS (
    SELECT 1 FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    WHERE ce.student_id = id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY students_select_staff ON students FOR SELECT USING (is_staff());
CREATE POLICY students_insert_staff ON students FOR INSERT WITH CHECK (is_staff());
CREATE POLICY students_update_staff ON students FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY students_delete_staff ON students FOR DELETE USING (is_staff());

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE POLICY teachers_select_own ON teachers FOR SELECT USING (auth.uid() = id);
CREATE POLICY teachers_select_staff ON teachers FOR SELECT USING (is_staff());
CREATE POLICY teachers_insert_staff ON teachers FOR INSERT WITH CHECK (is_staff());
CREATE POLICY teachers_update_own ON teachers FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY teachers_update_staff ON teachers FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY teachers_delete_staff ON teachers FOR DELETE USING (is_staff());

-- ============================================================
-- PARENTS
-- ============================================================
CREATE POLICY parents_select_own ON parents FOR SELECT USING (auth.uid() = id);
CREATE POLICY parents_select_staff ON parents FOR SELECT USING (is_staff());
CREATE POLICY parents_insert_staff ON parents FOR INSERT WITH CHECK (is_staff());
CREATE POLICY parents_update_own ON parents FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY parents_update_staff ON parents FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY parents_delete_staff ON parents FOR DELETE USING (is_staff());

-- ============================================================
-- ASSISTANTS
-- ============================================================
CREATE POLICY assistants_select_staff ON assistants FOR SELECT USING (is_staff());
CREATE POLICY assistants_insert_staff ON assistants FOR INSERT WITH CHECK (is_staff());
CREATE POLICY assistants_update_staff ON assistants FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY assistants_delete_staff ON assistants FOR DELETE USING (is_staff());

-- ============================================================
-- ADMINS
-- ============================================================
CREATE POLICY admins_select_self ON admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY admins_select_admin ON admins FOR SELECT USING (is_admin());
CREATE POLICY admins_insert_admin ON admins FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- COURSES
-- ============================================================
DROP POLICY IF EXISTS courses_read_all ON courses;
DROP POLICY IF EXISTS courses_write_staff ON courses;

CREATE POLICY courses_select_all ON courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY courses_insert_staff ON courses FOR INSERT WITH CHECK (is_staff());
CREATE POLICY courses_update_staff ON courses FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY courses_delete_staff ON courses FOR DELETE USING (is_staff());

-- ============================================================
-- COURSE SCHEDULES
-- ============================================================
CREATE POLICY course_schedules_select_all ON course_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY course_schedules_insert_staff ON course_schedules FOR INSERT WITH CHECK (is_staff());
CREATE POLICY course_schedules_update_staff ON course_schedules FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY course_schedules_delete_staff ON course_schedules FOR DELETE USING (is_staff());

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
DROP POLICY IF EXISTS enrollments_read_own ON course_enrollments;
DROP POLICY IF EXISTS enrollments_read_parent ON course_enrollments;
DROP POLICY IF EXISTS enrollments_read_teacher ON course_enrollments;
DROP POLICY IF EXISTS enrollments_write_staff ON course_enrollments;

CREATE POLICY enrollments_select_own ON course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY enrollments_select_parent ON course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM student_parent WHERE student_id = course_enrollments.student_id AND parent_id = auth.uid())
);
CREATE POLICY enrollments_select_teacher ON course_enrollments FOR SELECT USING (
  is_teacher() AND EXISTS (
    SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid()
  )
);
CREATE POLICY enrollments_select_staff ON course_enrollments FOR SELECT USING (is_staff());
CREATE POLICY enrollments_insert_staff ON course_enrollments FOR INSERT WITH CHECK (is_staff());
CREATE POLICY enrollments_update_staff ON course_enrollments FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY enrollments_delete_staff ON course_enrollments FOR DELETE USING (is_staff());

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE POLICY attendance_select_own ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY attendance_select_parent ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM student_parent WHERE student_id = attendance.student_id AND parent_id = auth.uid())
);
CREATE POLICY attendance_select_teacher ON attendance FOR SELECT USING (
  is_teacher() AND EXISTS (
    SELECT 1 FROM course_schedules cs
    JOIN courses c ON cs.course_id = c.id
    WHERE cs.id = course_schedule_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY attendance_select_staff ON attendance FOR SELECT USING (is_staff());
CREATE POLICY attendance_insert_staff ON attendance FOR INSERT WITH CHECK (is_staff());
CREATE POLICY attendance_update_staff ON attendance FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE POLICY payments_select_own ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY payments_select_parent ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM student_parent WHERE student_id = payments.student_id AND parent_id = auth.uid())
);
CREATE POLICY payments_select_staff ON payments FOR SELECT USING (is_staff());
CREATE POLICY payments_insert_staff ON payments FOR INSERT WITH CHECK (is_staff());
CREATE POLICY payments_delete_staff ON payments FOR DELETE USING (is_staff());

-- ============================================================
-- INVOICES
-- ============================================================
CREATE POLICY invoices_select_own ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY invoices_select_parent ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM student_parent WHERE student_id = invoices.student_id AND parent_id = auth.uid())
);
CREATE POLICY invoices_select_staff ON invoices FOR SELECT USING (is_staff());
CREATE POLICY invoices_insert_staff ON invoices FOR INSERT WITH CHECK (is_staff());
CREATE POLICY invoices_update_staff ON invoices FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY invoices_delete_staff ON invoices FOR DELETE USING (is_staff());

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE POLICY resources_select_enrolled ON resources FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_enrollments ce
    WHERE ce.course_id = resources.course_id AND ce.student_id = auth.uid()
  ) OR is_teacher() OR is_staff()
);
CREATE POLICY resources_insert_teacher ON resources FOR INSERT WITH CHECK (
  (is_teacher() AND EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid()))
  OR is_staff()
);
CREATE POLICY resources_update_teacher ON resources FOR UPDATE USING (
  (uploaded_by = auth.uid() AND is_teacher()) OR is_staff()
) WITH CHECK (
  (uploaded_by = auth.uid() AND is_teacher()) OR is_staff()
);
CREATE POLICY resources_delete_teacher ON resources FOR DELETE USING (
  (uploaded_by = auth.uid() AND is_teacher()) OR is_staff()
);

-- ============================================================
-- EVALUATIONS
-- ============================================================
CREATE POLICY evaluations_select_own ON evaluations FOR SELECT USING (
  (EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND id = auth.uid()))
  OR is_staff()
);
CREATE POLICY evaluations_insert_student ON evaluations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);
CREATE POLICY evaluations_update_staff ON evaluations FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY evaluations_delete_staff ON evaluations FOR DELETE USING (is_staff());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_insert_admin ON notifications FOR INSERT WITH CHECK (is_staff());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_delete_own ON notifications FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY messages_select_involved ON messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY messages_insert_authenticated ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);
CREATE POLICY messages_update_receiver ON messages FOR UPDATE USING (
  receiver_id = auth.uid()
) WITH CHECK (receiver_id = auth.uid());

-- ============================================================
-- ROOMS
-- ============================================================
CREATE POLICY rooms_select_all ON rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY rooms_insert_staff ON rooms FOR INSERT WITH CHECK (is_staff());
CREATE POLICY rooms_update_staff ON rooms FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY rooms_delete_staff ON rooms FOR DELETE USING (is_staff());

-- ============================================================
-- TEACHER AVAILABILITY
-- ============================================================
CREATE POLICY teacher_availability_select_own ON teacher_availability FOR SELECT USING (
  teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY teacher_availability_insert_own ON teacher_availability FOR INSERT WITH CHECK (
  teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY teacher_availability_update_own ON teacher_availability FOR UPDATE USING (
  teacher_id = auth.uid() OR is_staff()
) WITH CHECK (teacher_id = auth.uid() OR is_staff());
CREATE POLICY teacher_availability_delete_own ON teacher_availability FOR DELETE USING (
  teacher_id = auth.uid() OR is_staff()
);

-- ============================================================
-- TEACHER CONTRACTS
-- ============================================================
CREATE POLICY teacher_contracts_select_own ON teacher_contracts FOR SELECT USING (
  teacher_id = auth.uid() OR is_staff()
);
CREATE POLICY teacher_contracts_insert_staff ON teacher_contracts FOR INSERT WITH CHECK (is_staff());
CREATE POLICY teacher_contracts_update_staff ON teacher_contracts FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY teacher_contracts_delete_staff ON teacher_contracts FOR DELETE USING (is_staff());

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE POLICY campaigns_select_all ON campaigns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY campaigns_insert_staff ON campaigns FOR INSERT WITH CHECK (is_staff());
CREATE POLICY campaigns_update_staff ON campaigns FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY campaigns_delete_staff ON campaigns FOR DELETE USING (is_staff());

-- ============================================================
-- WAITING LIST
-- ============================================================
CREATE POLICY waiting_list_select_own ON waiting_list FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
  OR is_staff()
);
CREATE POLICY waiting_list_insert_student ON waiting_list FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
  OR is_staff()
);
CREATE POLICY waiting_list_update_staff ON waiting_list FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY waiting_list_delete_own ON waiting_list FOR DELETE USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
  OR is_staff()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE POLICY audit_logs_select_admin ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY audit_logs_insert_trigger ON audit_logs FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- APPROVALS
-- ============================================================
CREATE POLICY approvals_select_staff ON approvals FOR SELECT USING (is_staff());
CREATE POLICY approvals_insert_staff ON approvals FOR INSERT WITH CHECK (is_staff());
CREATE POLICY approvals_update_staff ON approvals FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

-- ============================================================
-- STUDENT_PARENT
-- ============================================================
CREATE POLICY student_parent_select_involved ON student_parent FOR SELECT USING (
  student_id = auth.uid() OR parent_id = auth.uid() OR is_staff()
);
CREATE POLICY student_parent_insert_staff ON student_parent FOR INSERT WITH CHECK (is_staff());
CREATE POLICY student_parent_delete_staff ON student_parent FOR DELETE USING (is_staff());

-- ============================================================
-- LEVELS & SUBJECTS (read-only for all authenticated)
-- ============================================================
CREATE POLICY levels_select_all ON levels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY levels_insert_staff ON levels FOR INSERT WITH CHECK (is_staff());
CREATE POLICY levels_update_staff ON levels FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY levels_delete_staff ON levels FOR DELETE USING (is_staff());

CREATE POLICY subjects_select_all ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY subjects_insert_staff ON subjects FOR INSERT WITH CHECK (is_staff());
CREATE POLICY subjects_update_staff ON subjects FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY subjects_delete_staff ON subjects FOR DELETE USING (is_staff());

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE POLICY system_settings_select_admin ON system_settings FOR SELECT USING (is_admin());
CREATE POLICY system_settings_insert_admin ON system_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY system_settings_update_admin ON system_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- BACKUPS
-- ============================================================
CREATE POLICY backups_select_admin ON backups FOR SELECT USING (is_admin());
CREATE POLICY backups_insert_admin ON backups FOR INSERT WITH CHECK (is_admin());
CREATE POLICY backups_update_admin ON backups FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
