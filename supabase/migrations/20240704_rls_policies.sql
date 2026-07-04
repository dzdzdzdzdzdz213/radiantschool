-- =====================================================
-- Enable RLS and create policies for all tables
-- =====================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: check if current user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

-- Helper: check if current user is assistant
CREATE OR REPLACE FUNCTION public.is_assistant()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'assistant'
  );
$$;

-- Helper: check if current user is a student
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'student'
  );
$$;

-- Helper: check if current user is a parent
CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'parent'
  );
$$;

-- =====================================================
-- users
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (public.is_admin());

-- =====================================================
-- students
-- =====================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_read_own" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "students_admin_all" ON public.students
  FOR ALL USING (public.is_admin());

CREATE POLICY "students_teacher_read" ON public.students
  FOR SELECT USING (
    public.is_teacher()
  );

CREATE POLICY "students_parent_read" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_parent
      WHERE student_id = students.id AND parent_id = auth.uid()
    )
  );

-- =====================================================
-- courses
-- =====================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_admin_all" ON public.courses
  FOR ALL USING (public.is_admin());

CREATE POLICY "courses_teacher_read" ON public.courses
  FOR SELECT USING (
    public.is_teacher() AND (teacher_id = auth.uid() OR public.is_admin())
  );

CREATE POLICY "courses_student_read" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = courses.id AND student_id = auth.uid()
    )
  );

-- =====================================================
-- course_schedules
-- =====================================================
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_schedules_admin_all" ON public.course_schedules
  FOR ALL USING (public.is_admin());

CREATE POLICY "course_schedules_teacher_read" ON public.course_schedules
  FOR SELECT USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

CREATE POLICY "course_schedules_student_read" ON public.course_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = course_schedules.course_id AND student_id = auth.uid()
    )
  );

-- =====================================================
-- course_enrollments
-- =====================================================
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_enrollments_admin_all" ON public.course_enrollments
  FOR ALL USING (public.is_admin());

CREATE POLICY "course_enrollments_read_own" ON public.course_enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "course_enrollments_assistant_all" ON public.course_enrollments
  FOR ALL USING (public.is_assistant());

CREATE POLICY "course_enrollments_teacher_read" ON public.course_enrollments
  FOR SELECT USING (
    public.is_teacher() AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_enrollments.course_id
        AND courses.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- payments
-- =====================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "payments_read_own" ON public.payments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "payments_assistant_all" ON public.payments
  FOR ALL USING (public.is_assistant());

-- =====================================================
-- invoices
-- =====================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_admin_all" ON public.invoices
  FOR ALL USING (public.is_admin());

CREATE POLICY "invoices_read_own" ON public.invoices
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "invoices_assistant_all" ON public.invoices
  FOR ALL USING (public.is_assistant());

-- =====================================================
-- attendance
-- =====================================================
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_admin_all" ON public.attendance
  FOR ALL USING (public.is_admin());

CREATE POLICY "attendance_read_own" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "attendance_teacher_all" ON public.attendance
  FOR ALL USING (
    public.is_teacher() AND EXISTS (
      SELECT 1 FROM public.course_schedules
      JOIN public.courses ON courses.id = course_schedules.course_id
      WHERE course_schedules.id = attendance.course_schedule_id
        AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_assistant_all" ON public.attendance
  FOR ALL USING (public.is_assistant());

-- =====================================================
-- evaluations
-- =====================================================
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluations_admin_all" ON public.evaluations
  FOR ALL USING (public.is_admin());

CREATE POLICY "evaluations_read_own" ON public.evaluations
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "evaluations_teacher_read" ON public.evaluations
  FOR SELECT USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

-- =====================================================
-- notifications
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL USING (public.is_admin());

-- =====================================================
-- messages
-- =====================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read_involved" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "messages_insert_authenticated" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_admin_all" ON public.messages
  FOR ALL USING (public.is_admin());

-- =====================================================
-- teachers
-- =====================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_read_own" ON public.teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "teachers_admin_all" ON public.teachers
  FOR ALL USING (public.is_admin());

-- =====================================================
-- assistants
-- =====================================================
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assistants_read_own" ON public.assistants
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "assistants_admin_all" ON public.assistants
  FOR ALL USING (public.is_admin());

-- =====================================================
-- parents
-- =====================================================
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_read_own" ON public.parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "parents_admin_all" ON public.parents
  FOR ALL USING (public.is_admin());

-- =====================================================
-- student_parent
-- =====================================================
ALTER TABLE public.student_parent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_parent_read_involved" ON public.student_parent
  FOR SELECT USING (
    student_id = auth.uid() OR parent_id = auth.uid()
  );

CREATE POLICY "student_parent_admin_all" ON public.student_parent
  FOR ALL USING (public.is_admin());

-- =====================================================
-- levels
-- =====================================================
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "levels_read_all" ON public.levels
  FOR SELECT USING (true);

CREATE POLICY "levels_admin_all" ON public.levels
  FOR ALL USING (public.is_admin());

-- =====================================================
-- subjects
-- =====================================================
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_read_all" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "subjects_admin_all" ON public.subjects
  FOR ALL USING (public.is_admin());

-- =====================================================
-- rooms
-- =====================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_read_all" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_admin_all" ON public.rooms
  FOR ALL USING (public.is_admin());

-- =====================================================
-- private_lessons
-- =====================================================
ALTER TABLE public.private_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "private_lessons_admin_all" ON public.private_lessons
  FOR ALL USING (public.is_admin());

CREATE POLICY "private_lessons_read_involved" ON public.private_lessons
  FOR SELECT USING (
    student_id = auth.uid() OR teacher_id = auth.uid()
  );

CREATE POLICY "private_lessons_teacher_insert" ON public.private_lessons
  FOR INSERT WITH CHECK (
    public.is_teacher() AND teacher_id = auth.uid()
  );

-- =====================================================
-- vip_classes
-- =====================================================
ALTER TABLE public.vip_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vip_classes_admin_all" ON public.vip_classes
  FOR ALL USING (public.is_admin());

CREATE POLICY "vip_classes_read_involved" ON public.vip_classes
  FOR SELECT USING (
    student_id = auth.uid() OR teacher_id = auth.uid()
  );

CREATE POLICY "vip_classes_teacher_insert" ON public.vip_classes
  FOR INSERT WITH CHECK (
    public.is_teacher() AND teacher_id = auth.uid()
  );

-- =====================================================
-- online_classes
-- =====================================================
ALTER TABLE public.online_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "online_classes_admin_all" ON public.online_classes
  FOR ALL USING (public.is_admin());

CREATE POLICY "online_classes_read_teacher" ON public.online_classes
  FOR SELECT USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

CREATE POLICY "online_classes_read_student" ON public.online_classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = online_classes.course_id AND student_id = auth.uid()
    )
  );

-- =====================================================
-- assignments
-- =====================================================
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_admin_all" ON public.assignments
  FOR ALL USING (public.is_admin());

CREATE POLICY "assignments_teacher_all" ON public.assignments
  FOR ALL USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

CREATE POLICY "assignments_student_read" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = assignments.course_id AND student_id = auth.uid()
    )
  );

-- =====================================================
-- assignment_submissions
-- =====================================================
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignment_submissions_admin_all" ON public.assignment_submissions
  FOR ALL USING (public.is_admin());

CREATE POLICY "assignment_submissions_read_own" ON public.assignment_submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "assignment_submissions_insert_own" ON public.assignment_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "assignment_submissions_teacher_update" ON public.assignment_submissions
  FOR UPDATE USING (
    public.is_teacher() AND EXISTS (
      SELECT 1 FROM public.assignments
      WHERE assignments.id = assignment_submissions.assignment_id
        AND assignments.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- announcements
-- =====================================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_read_all" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_admin_all" ON public.announcements
  FOR ALL USING (public.is_admin());

CREATE POLICY "announcements_teacher_all" ON public.announcements
  FOR ALL USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

-- =====================================================
-- certificates
-- =====================================================
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_admin_all" ON public.certificates
  FOR ALL USING (public.is_admin());

CREATE POLICY "certificates_read_own" ON public.certificates
  FOR SELECT USING (student_id = auth.uid());

-- =====================================================
-- conversations
-- =====================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_read_involved" ON public.conversations
  FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "conversations_insert_authenticated" ON public.conversations
  FOR INSERT WITH CHECK (participant_id = auth.uid());

CREATE POLICY "conversations_update_involved" ON public.conversations
  FOR UPDATE USING (participant_id = auth.uid());

-- =====================================================
-- teacher_reviews
-- =====================================================
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_reviews_admin_all" ON public.teacher_reviews
  FOR ALL USING (public.is_admin());

CREATE POLICY "teacher_reviews_read_involved" ON public.teacher_reviews
  FOR SELECT USING (
    teacher_id = auth.uid() OR student_id = auth.uid()
  );

CREATE POLICY "teacher_reviews_insert_student" ON public.teacher_reviews
  FOR INSERT WITH CHECK (
    public.is_student() AND student_id = auth.uid()
  );

-- =====================================================
-- rfid_scans
-- =====================================================
ALTER TABLE public.rfid_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfid_scans_admin_all" ON public.rfid_scans
  FOR ALL USING (public.is_admin());

CREATE POLICY "rfid_scans_assistant_all" ON public.rfid_scans
  FOR ALL USING (public.is_assistant());

CREATE POLICY "rfid_scans_teacher_read" ON public.rfid_scans
  FOR SELECT USING (public.is_teacher());

-- =====================================================
-- center_settings
-- =====================================================
ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "center_settings_read_all" ON public.center_settings
  FOR SELECT USING (true);

CREATE POLICY "center_settings_admin_all" ON public.center_settings
  FOR ALL USING (public.is_admin());

-- =====================================================
-- teacher_payroll
-- =====================================================
ALTER TABLE public.teacher_payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_payroll_admin_all" ON public.teacher_payroll
  FOR ALL USING (public.is_admin());

CREATE POLICY "teacher_payroll_read_own" ON public.teacher_payroll
  FOR SELECT USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );

-- =====================================================
-- resources
-- =====================================================
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_admin_all" ON public.resources
  FOR ALL USING (public.is_admin());

CREATE POLICY "resources_read_course_member" ON public.resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = resources.course_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "resources_teacher_all" ON public.resources
  FOR ALL USING (
    public.is_teacher() AND uploaded_by = auth.uid()
  );

CREATE POLICY "resources_assistant_all" ON public.resources
  FOR ALL USING (public.is_assistant());

-- =====================================================
-- campaigns
-- =====================================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_admin_all" ON public.campaigns
  FOR ALL USING (public.is_admin());

CREATE POLICY "campaigns_read_all" ON public.campaigns
  FOR SELECT USING (true);

-- =====================================================
-- teacher_contracts
-- =====================================================
ALTER TABLE public.teacher_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_contracts_admin_all" ON public.teacher_contracts
  FOR ALL USING (public.is_admin());

CREATE POLICY "teacher_contracts_read_own" ON public.teacher_contracts
  FOR SELECT USING (
    public.is_teacher() AND teacher_id = auth.uid()
  );
