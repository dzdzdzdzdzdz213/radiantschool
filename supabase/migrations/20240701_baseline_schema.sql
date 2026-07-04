-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE attendance_method AS ENUM ('rfid', 'manual');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE backup_status AS ENUM ('in_progress', 'completed', 'failed');
CREATE TYPE backup_type AS ENUM ('automatic', 'manual');
CREATE TYPE contract_type AS ENUM ('fixed', 'hourly', 'percentage');
CREATE TYPE course_status AS ENUM ('active', 'inactive', 'full', 'cancelled');
CREATE TYPE course_type AS ENUM ('normal', 'vip', 'private');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE enrollment_status AS ENUM ('active', 'pending_approval', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('paid', 'unpaid', 'partially_paid', 'cancelled');
CREATE TYPE level_category AS ENUM ('primary', 'middle', 'high_school');
CREATE TYPE notification_category AS ENUM ('payment', 'course', 'attendance', 'system', 'registration');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'check');
CREATE TYPE payment_type AS ENUM ('monthly', 'per_session', 'vip', 'private');
CREATE TYPE resource_type AS ENUM ('pdf', 'exercise', 'image', 'video', 'link');
CREATE TYPE rfid_status AS ENUM ('active', 'inactive', 'lost');
CREATE TYPE room_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE student_type AS ENUM ('regular', 'single_session');
CREATE TYPE teaching_mode AS ENUM ('online', 'onsite', 'both');
CREATE TYPE transaction_type AS ENUM ('payment', 'credit', 'refund', 'adjustment');
CREATE TYPE user_role AS ENUM ('admin', 'assistant', 'teacher', 'student', 'parent');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE waiting_list_status AS ENUM ('waiting', 'notified', 'enrolled', 'expired');

-- =====================================================
-- SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS announcements_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS approvals_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS assignment_submissions_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS assignments_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS attendance_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS audit_logs_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS backups_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS campaign_courses_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS campaigns_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS center_settings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS certificates_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS conversations_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS course_enrollments_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS course_schedules_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS courses_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS evaluations_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS invoice_items_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS invoices_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS level_subject_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS levels_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS messages_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS online_classes_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS payments_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS private_lessons_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS resources_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS rfid_scans_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS rooms_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS student_parent_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS subjects_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS teacher_availability_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS teacher_contracts_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS teacher_payroll_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS teacher_reviews_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS transaction_allocations_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS transactions_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS vip_classes_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS waiting_list_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE public.admins (
  id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);

CREATE TABLE public.announcements (
  id bigint NOT NULL,
  teacher_id uuid,
  course_id bigint,
  title character varying(255) NOT NULL,
  content text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

CREATE TABLE public.approvals (
  id bigint NOT NULL,
  entity_type character varying(50) NOT NULL,
  entity_id bigint NOT NULL,
  approved_by uuid NOT NULL,
  role character varying(20) NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending'::approval_status,
  comment text,
  responded_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + '48:00:00'::interval),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approvals_pkey PRIMARY KEY (id),
  UNIQUE (entity_type, entity_id, role)
);

CREATE TABLE public.assignment_submissions (
  id bigint NOT NULL,
  assignment_id bigint NOT NULL,
  student_id uuid NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'submitted'::character varying,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  grade numeric,
  feedback text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE public.assignments (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  course_id bigint NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  due_date timestamptz,
  file_url text,
  max_grade numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.assistants (
  id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assistants_pkey PRIMARY KEY (id)
);

CREATE TABLE public.attendance (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  course_schedule_id bigint NOT NULL,
  date date NOT NULL,
  check_in_time timestamptz,
  method attendance_method NOT NULL DEFAULT 'rfid'::attendance_method,
  status attendance_status NOT NULL DEFAULT 'absent'::attendance_status,
  notes character varying(255),
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  UNIQUE (student_id, course_schedule_id, date)
);

CREATE TABLE public.audit_logs (
  id bigint NOT NULL,
  user_id uuid,
  action character varying(255) NOT NULL,
  entity_type character varying(100) NOT NULL,
  entity_id character varying(50),
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.backups (
  id bigint NOT NULL,
  file_name character varying(255) NOT NULL,
  file_size bigint,
  type backup_type NOT NULL,
  status backup_status NOT NULL DEFAULT 'in_progress'::backup_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT backups_pkey PRIMARY KEY (id)
);

CREATE TABLE public.campaign_courses (
  id bigint NOT NULL,
  campaign_id bigint NOT NULL,
  course_id bigint NOT NULL,
  price_override numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT campaign_courses_pkey PRIMARY KEY (id),
  UNIQUE (campaign_id, course_id)
);

CREATE TABLE public.campaigns (
  id bigint NOT NULL,
  name character varying(255) NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_seats integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id)
);

CREATE TABLE public.center_settings (
  id bigint NOT NULL,
  center_name character varying(255) NOT NULL DEFAULT 'Radiant Learning'::character varying,
  address text,
  phone character varying(30),
  wilaya character varying(100),
  currency character varying(3) NOT NULL DEFAULT 'DZD'::character varying,
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  auto_invoice boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT center_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.certificates (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  course_id bigint,
  title character varying(255) NOT NULL,
  description text,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  certificate_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);

CREATE TABLE public.conversations (
  id bigint NOT NULL,
  student_id uuid,
  teacher_id uuid,
  parent_id uuid,
  participant_id uuid NOT NULL,
  last_message text,
  last_message_at timestamptz,
  unread boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.course_enrollments (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  course_id bigint NOT NULL,
  enrollment_date timestamptz NOT NULL DEFAULT now(),
  status enrollment_status NOT NULL DEFAULT 'active'::enrollment_status,
  campaign_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
  UNIQUE (student_id, course_id)
);

CREATE TABLE public.course_schedules (
  id bigint NOT NULL,
  course_id bigint NOT NULL,
  day_of_week day_of_week NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  room_id bigint,
  teacher_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT course_schedules_pkey PRIMARY KEY (id)
);

CREATE TABLE public.courses (
  id bigint NOT NULL,
  name character varying(255) NOT NULL,
  type course_type NOT NULL DEFAULT 'normal'::course_type,
  capacity integer NOT NULL,
  current_enrollments integer DEFAULT 0,
  price numeric NOT NULL,
  status course_status NOT NULL DEFAULT 'active'::course_status,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  subject_id bigint NOT NULL,
  level_id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  room_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);

CREATE TABLE public.evaluations (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  teaching_quality smallint NOT NULL,
  communication smallint NOT NULL,
  punctuality smallint NOT NULL,
  organization smallint NOT NULL,
  average_score numeric,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  UNIQUE (student_id, teacher_id)
);

CREATE TABLE public.invoice_items (
  id bigint NOT NULL,
  invoice_id bigint NOT NULL,
  description character varying(500) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  course_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT invoice_items_pkey PRIMARY KEY (id)
);

CREATE TABLE public.invoices (
  id bigint NOT NULL,
  invoice_number character varying(50) NOT NULL DEFAULT ((('FAC-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('invoice_number_seq'::regclass))::text, 6, '0'::text)),
  student_id uuid NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  total_amount numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'unpaid'::invoice_status,
  pdf_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  UNIQUE (invoice_number)
);

CREATE TABLE public.level_subject (
  id bigint NOT NULL,
  level_id bigint NOT NULL,
  subject_id bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT level_subject_pkey PRIMARY KEY (id),
  UNIQUE (level_id, subject_id)
);

CREATE TABLE public.levels (
  id bigint NOT NULL,
  name character varying(100) NOT NULL,
  category level_category NOT NULL,
  stream character varying(100),
  year integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT levels_pkey PRIMARY KEY (id)
);

CREATE TABLE public.messages (
  id bigint NOT NULL,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  subject character varying(255),
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  parent_message_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.notifications (
  id bigint NOT NULL,
  user_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL DEFAULT 'info'::notification_type,
  category notification_category NOT NULL DEFAULT 'system'::notification_category,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.online_classes (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  course_id bigint,
  title character varying(255) NOT NULL,
  description text,
  platform character varying(100),
  meeting_url text,
  start_time timestamptz,
  end_time timestamptz,
  status character varying(20) NOT NULL DEFAULT 'scheduled'::character varying,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT online_classes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.parents (
  id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payments (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  payment_method payment_method NOT NULL,
  payment_type payment_type NOT NULL,
  reference character varying(100),
  receipt_number character varying(50) NOT NULL DEFAULT ((('REC-'::text || to_char(now(), 'YYYY'::text)) || '-'::text) || lpad((nextval('receipt_number_seq'::regclass))::text, 6, '0'::text)),
  notes character varying(500),
  recorded_by uuid NOT NULL,
  course_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  UNIQUE (receipt_number)
);

CREATE TABLE public.private_lessons (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL,
  date date,
  start_time time,
  end_time time,
  price numeric DEFAULT 0,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT private_lessons_pkey PRIMARY KEY (id)
);

CREATE TABLE public.resources (
  id bigint NOT NULL,
  course_id bigint NOT NULL,
  title character varying(255) NOT NULL,
  type resource_type NOT NULL,
  file_url text,
  external_url text,
  file_size bigint,
  mime_type character varying(100),
  description text,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);

CREATE TABLE public.rfid_scans (
  id bigint NOT NULL,
  rfid_code character varying(100) NOT NULL,
  student_id uuid,
  status character varying(20) NOT NULL DEFAULT 'unknown'::character varying,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rfid_scans_pkey PRIMARY KEY (id)
);

CREATE TABLE public.rooms (
  id bigint NOT NULL,
  name character varying(100) NOT NULL,
  capacity integer NOT NULL,
  floor integer,
  equipment jsonb DEFAULT '[]'::jsonb,
  status room_status NOT NULL DEFAULT 'active'::room_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  UNIQUE (name)
);

CREATE TABLE public.student_parent (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  parent_id uuid NOT NULL,
  relationship character varying(50),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT student_parent_pkey PRIMARY KEY (id),
  UNIQUE (student_id, parent_id)
);

CREATE TABLE public.students (
  id uuid NOT NULL,
  student_type student_type NOT NULL DEFAULT 'regular'::student_type,
  registration_number character varying(50) NOT NULL,
  school_origin character varying(200),
  level_id bigint,
  rfid_tag character varying(100),
  rfid_assigned_at timestamptz,
  rfid_status rfid_status DEFAULT 'inactive'::rfid_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  UNIQUE (registration_number),
  UNIQUE (rfid_tag)
);

CREATE TABLE public.subjects (
  id bigint NOT NULL,
  name character varying(100) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  UNIQUE (name)
);

CREATE TABLE public.system_settings (
  key character varying(100) NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);

CREATE TABLE public.teacher_availability (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  day_of_week day_of_week NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT teacher_availability_pkey PRIMARY KEY (id)
);

CREATE TABLE public.teacher_contracts (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  contract_type contract_type NOT NULL DEFAULT 'hourly'::contract_type,
  hourly_rate numeric,
  percentage_rate numeric,
  fixed_salary numeric,
  hours_min integer DEFAULT 0,
  hours_max integer,
  start_date date NOT NULL,
  end_date date,
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_contracts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.teacher_payroll (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  gross_pay numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_payroll_pkey PRIMARY KEY (id),
  UNIQUE (teacher_id, month, year)
);

CREATE TABLE public.teacher_reviews (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL,
  rating smallint NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_reviews_pkey PRIMARY KEY (id),
  UNIQUE (teacher_id, student_id)
);

CREATE TABLE public.teachers (
  id uuid NOT NULL,
  teaching_mode teaching_mode NOT NULL DEFAULT 'onsite'::teaching_mode,
  biography text,
  specialties jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transaction_allocations (
  id bigint NOT NULL,
  transaction_id bigint NOT NULL,
  invoice_id bigint,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transaction_allocations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transactions (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  type transaction_type NOT NULL,
  amount numeric NOT NULL,
  currency character varying(3) NOT NULL DEFAULT 'DZD'::character varying,
  reference character varying(100),
  transaction_date timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying(255) NOT NULL,
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  phone character varying(30),
  address text,
  postal_code character varying(10),
  city character varying(100),
  wilaya character varying(100),
  date_of_birth date,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'pending'::user_status,
  email_verified boolean NOT NULL DEFAULT false,
  email_verified_at timestamptz,
  photo_url text,
  last_login_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  guardian_name text,
  guardian_email text,
  guardian_phone text,
  parent_id uuid,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  homework_reminders boolean DEFAULT true,
  message_alerts boolean DEFAULT true,
  payment_reminders boolean DEFAULT true,
  announcement_alerts boolean DEFAULT true,
  grade_alerts boolean DEFAULT false,
  show_profile boolean DEFAULT true,
  show_attendance boolean DEFAULT true,
  show_courses boolean DEFAULT false,
  show_email boolean DEFAULT false,
  show_phone boolean DEFAULT true,
  show_schedule boolean DEFAULT true,
  language text DEFAULT 'Français'::text,
  timezone text DEFAULT 'Africa/Algiers (UTC+1)'::text,
  theme text DEFAULT 'Système'::text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  UNIQUE (email)
);

CREATE TABLE public.vip_classes (
  id bigint NOT NULL,
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL,
  date date,
  start_time time,
  end_time time,
  price numeric DEFAULT 0,
  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vip_classes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.waiting_list (
  id bigint NOT NULL,
  student_id uuid NOT NULL,
  course_id bigint NOT NULL,
  registered_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  status waiting_list_status NOT NULL DEFAULT 'waiting'::waiting_list_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT waiting_list_pkey PRIMARY KEY (id),
  UNIQUE (student_id, course_id)
);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE ONLY public.admins ADD CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);
ALTER TABLE ONLY public.announcements ADD CONSTRAINT announcements_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.announcements ADD CONSTRAINT announcements_teacher_id_users FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.announcements ADD CONSTRAINT announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.approvals ADD CONSTRAINT approvals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id);
ALTER TABLE ONLY public.assignment_submissions ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.assignment_submissions ADD CONSTRAINT assignment_submissions_student_id_users FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.assignments ADD CONSTRAINT assignments_teacher_id_users FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.assistants ADD CONSTRAINT assistants_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);
ALTER TABLE ONLY public.attendance ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.attendance ADD CONSTRAINT attendance_course_schedule_id_fkey FOREIGN KEY (course_schedule_id) REFERENCES public.course_schedules(id);
ALTER TABLE ONLY public.attendance ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.campaign_courses ADD CONSTRAINT campaign_courses_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);
ALTER TABLE ONLY public.campaign_courses ADD CONSTRAINT campaign_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.campaigns ADD CONSTRAINT campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);
ALTER TABLE ONLY public.certificates ADD CONSTRAINT certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.certificates ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.certificates ADD CONSTRAINT certificates_student_id_users FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id);
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.course_enrollments ADD CONSTRAINT course_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.course_enrollments ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.course_schedules ADD CONSTRAINT course_schedules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.course_schedules ADD CONSTRAINT course_schedules_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);
ALTER TABLE ONLY public.course_schedules ADD CONSTRAINT course_schedules_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.course_schedules ADD CONSTRAINT course_schedules_teacher_idfk_course_schedules_teacher FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_teacher_idfk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_student_id_users FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_teacher_id_users2 FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);
ALTER TABLE ONLY public.invoice_items ADD CONSTRAINT invoice_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.level_subject ADD CONSTRAINT level_subject_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id);
ALTER TABLE ONLY public.level_subject ADD CONSTRAINT level_subject_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.messages(id);
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.online_classes ADD CONSTRAINT online_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.online_classes ADD CONSTRAINT online_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.online_classes ADD CONSTRAINT online_classes_teacher_id_users FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.parents ADD CONSTRAINT parents_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.private_lessons ADD CONSTRAINT private_lessons_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.private_lessons ADD CONSTRAINT private_lessons_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.private_lessons ADD CONSTRAINT private_lessons_teacher_id_users FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.private_lessons ADD CONSTRAINT private_lessons_student_id_users2 FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.resources ADD CONSTRAINT resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE ONLY public.resources ADD CONSTRAINT resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.rfid_scans ADD CONSTRAINT rfid_scans_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.rfid_scans ADD CONSTRAINT rfid_scans_student_id_users FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.student_parent ADD CONSTRAINT student_parent_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.student_parent ADD CONSTRAINT student_parent_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id);
ALTER TABLE ONLY public.students ADD CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);
ALTER TABLE ONLY public.students ADD CONSTRAINT students_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id);
ALTER TABLE ONLY public.system_settings ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admins(id);
ALTER TABLE ONLY public.teacher_availability ADD CONSTRAINT teacher_availability_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.teacher_contracts ADD CONSTRAINT teacher_contracts_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.teacher_payroll ADD CONSTRAINT teacher_payroll_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE ONLY public.teacher_reviews ADD CONSTRAINT teacher_reviews_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.teacher_reviews ADD CONSTRAINT teacher_reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.teacher_reviews ADD CONSTRAINT teacher_reviews_student_id_users FOREIGN KEY (student_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.teachers ADD CONSTRAINT teachers_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);
ALTER TABLE ONLY public.transaction_allocations ADD CONSTRAINT transaction_allocations_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);
ALTER TABLE ONLY public.transaction_allocations ADD CONSTRAINT transaction_allocations_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);
ALTER TABLE ONLY public.transactions ADD CONSTRAINT transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.transactions ADD CONSTRAINT transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.waiting_list ADD CONSTRAINT waiting_list_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE ONLY public.waiting_list ADD CONSTRAINT waiting_list_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);

-- =====================================================
-- CHECK CONSTRAINTS
-- =====================================================

ALTER TABLE ONLY public.campaigns ADD CONSTRAINT valid_campaign_dates CHECK (end_date > start_date);
ALTER TABLE ONLY public.course_schedules ADD CONSTRAINT valid_schedule CHECK (start_time < end_time);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_capacity_check CHECK (capacity > 0);
ALTER TABLE ONLY public.courses ADD CONSTRAINT courses_price_check CHECK (price >= 0);
ALTER TABLE ONLY public.courses ADD CONSTRAINT valid_dates CHECK (end_date >= start_date);
ALTER TABLE ONLY public.courses ADD CONSTRAINT valid_enrollments CHECK (current_enrollments <= capacity);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_teaching_quality_check CHECK (teaching_quality >= 1 AND teaching_quality <= 5);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_communication_check CHECK (communication >= 1 AND communication <= 5);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_punctuality_check CHECK (punctuality >= 1 AND punctuality <= 5);
ALTER TABLE ONLY public.evaluations ADD CONSTRAINT evaluations_organization_check CHECK (organization >= 1 AND organization <= 5);
ALTER TABLE ONLY public.invoices ADD CONSTRAINT invoices_total_amount_check CHECK (total_amount >= 0);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_amount_check CHECK (amount > 0);
ALTER TABLE ONLY public.resources ADD CONSTRAINT valid_resource CHECK (((type = 'link'::resource_type) AND (external_url IS NOT NULL)) OR ((type <> 'link'::resource_type) AND (file_url IS NOT NULL)));
ALTER TABLE ONLY public.rooms ADD CONSTRAINT rooms_capacity_check CHECK (capacity > 0);
ALTER TABLE ONLY public.teacher_availability ADD CONSTRAINT valid_time CHECK (start_time < end_time);
ALTER TABLE ONLY public.teacher_payroll ADD CONSTRAINT teacher_payroll_month_check CHECK (month >= 1 AND month <= 12);
ALTER TABLE ONLY public.teacher_reviews ADD CONSTRAINT teacher_reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE ONLY public.transaction_allocations ADD CONSTRAINT transaction_allocations_amount_check CHECK (amount > 0);

-- =====================================================
-- ROLE-CHECK FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assistant()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'assistant'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'parent'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'student'
  );
$$;

-- =====================================================
-- END OF BASELINE SCHEMA
-- =====================================================
