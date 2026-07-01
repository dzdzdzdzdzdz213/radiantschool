-- Enhanced views for the ERP platform

-- ============================================================
-- DAILY REVENUE VIEW (last 90 days)
-- ============================================================

CREATE OR REPLACE VIEW public.v_daily_revenue AS
SELECT
  d::date AS date,
  COALESCE(sum(p.amount), 0) AS amount,
  COALESCE(count(p.id), 0) AS transaction_count
FROM generate_series(now() - interval '90 days', now(), '1 day'::interval) d
LEFT JOIN public.payments p ON p.created_at::date = d::date
GROUP BY d::date
ORDER BY d::date DESC;

-- ============================================================
-- TEACHER PAYROLL VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.v_teacher_payroll AS
SELECT
  t.id AS teacher_id,
  u.first_name || ' ' || u.last_name AS teacher_name,
  tc.contract_type,
  tc.hourly_rate,
  tc.fixed_salary,
  tc.percentage_rate,
  count(a.id) FILTER (WHERE a.status = 'present' AND a.date >= date_trunc('month', now())) AS sessions_this_month,
  count(a.id) FILTER (WHERE a.status = 'present' AND a.date >= date_trunc('month', now() - interval '1 month') AND a.date < date_trunc('month', now())) AS sessions_last_month,
  COALESCE(round(avg(e.average_score), 2), 0) AS avg_rating
FROM public.teachers t
JOIN public.users u ON u.id = t.id
LEFT JOIN public.teacher_contracts tc ON tc.teacher_id = t.id AND (tc.end_date IS NULL OR tc.end_date >= now())
LEFT JOIN public.course_schedules cs ON cs.teacher_id = t.id
LEFT JOIN public.attendance a ON a.course_schedule_id = cs.id
LEFT JOIN public.evaluations e ON e.teacher_id = t.id
GROUP BY t.id, u.first_name, u.last_name, tc.contract_type, tc.hourly_rate, tc.fixed_salary, tc.percentage_rate;

-- ============================================================
-- STUDENT PERFORMANCE VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.v_student_performance AS
SELECT
  s.id AS student_id,
  u.first_name || ' ' || u.last_name AS student_name,
  u.email,
  l.name AS level_name,
  l.category AS level_category,
  count(DISTINCT ce.course_id) AS enrolled_courses,
  count(DISTINCT a.id) FILTER (WHERE a.status = 'present') AS total_present,
  count(DISTINCT a.id) FILTER (WHERE a.date >= date_trunc('month', now()) AND a.status = 'present') AS monthly_present,
  CASE WHEN count(DISTINCT a.id) > 0
    THEN round(count(DISTINCT a.id) FILTER (WHERE a.status = 'present')::numeric / count(DISTINCT a.id) * 100, 1)
    ELSE 0
  END AS attendance_rate,
  round(COALESCE(avg(e.average_score), 0), 2) AS given_ratings_avg
FROM public.users u
JOIN public.students s ON s.id = u.id
LEFT JOIN public.levels l ON l.id = s.level_id
LEFT JOIN public.course_enrollments ce ON ce.student_id = s.id AND ce.status = 'active'
LEFT JOIN public.attendance a ON a.student_id = s.id
LEFT JOIN public.evaluations e ON e.student_id = s.id
WHERE u.role = 'student' AND u.deleted_at IS NULL
GROUP BY s.id, u.first_name, u.last_name, u.email, l.name, l.category;

-- ============================================================
-- COURSE OCCUPANCY VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.v_course_occupancy AS
SELECT
  c.id AS course_id,
  c.name AS course_name,
  sub.name AS subject_name,
  l.name AS level_name,
  r.name AS room_name,
  r.capacity AS room_capacity,
  c.capacity AS max_students,
  c.current_enrollments,
  CASE WHEN c.capacity > 0
    THEN round((c.current_enrollments::numeric / c.capacity) * 100, 1)
    ELSE 0
  END AS occupancy_pct,
  c.price,
  u.first_name || ' ' || u.last_name AS teacher_name,
  c.status
FROM public.courses c
JOIN public.subjects sub ON sub.id = c.subject_id
JOIN public.levels l ON l.id = c.level_id
JOIN public.users u ON u.id = c.teacher_id
LEFT JOIN public.rooms r ON r.id = c.room_id
WHERE c.deleted_at IS NULL
ORDER BY occupancy_pct DESC;

-- ============================================================
-- MONTHLY FINANCIAL SUMMARY VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.v_monthly_financials AS
SELECT
  date_trunc('month', p.created_at)::date AS month,
  count(DISTINCT p.student_id) AS paying_students,
  count(*) AS transaction_count,
  sum(p.amount) AS total_revenue,
  round(avg(p.amount), 2) AS avg_transaction,
  sum(p.amount) FILTER (WHERE p.payment_method = 'cash') AS cash_revenue,
  sum(p.amount) FILTER (WHERE p.payment_method = 'bank_transfer') AS transfer_revenue,
  sum(p.amount) FILTER (WHERE p.payment_method = 'card') AS card_revenue,
  sum(p.amount) FILTER (WHERE p.payment_method = 'check') AS check_revenue
FROM public.payments p
WHERE p.created_at >= date_trunc('year', now())
GROUP BY date_trunc('month', p.created_at)
ORDER BY month DESC;

-- ============================================================
-- UPCOMING SCHEDULE VIEW (next 7 days)
-- ============================================================

CREATE OR REPLACE VIEW public.v_upcoming_schedule AS
SELECT
  cs.id AS schedule_id,
  c.name AS course_name,
  sub.name AS subject_name,
  l.name AS level_name,
  cs.day_of_week,
  cs.start_time,
  cs.end_time,
  r.name AS room_name,
  u.first_name || ' ' || u.last_name AS teacher_name,
  c.current_enrollments,
  c.capacity
FROM public.course_schedules cs
JOIN public.courses c ON c.id = cs.course_id
JOIN public.subjects sub ON sub.id = c.subject_id
JOIN public.levels l ON l.id = c.level_id
JOIN public.users u ON u.id = cs.teacher_id
LEFT JOIN public.rooms r ON r.id = cs.room_id
WHERE c.status = 'active'
ORDER BY
  CASE cs.day_of_week
    WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3
    WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 WHEN 'sunday' THEN 7
  END,
  cs.start_time;

-- ============================================================
-- ALERT / ISSUE VIEW (for dashboard alert center)
-- ============================================================

CREATE OR REPLACE VIEW public.v_active_alerts AS
SELECT
  'pending_user' AS alert_type,
  'warning' AS severity,
  count(*) AS count,
  jsonb_agg(jsonb_build_object('id', id, 'name', first_name || ' ' || last_name, 'email', email, 'created_at', created_at)) AS details
FROM public.users
WHERE status = 'pending'
GROUP BY 'pending_user'
UNION ALL
SELECT
  'overdue_invoice' AS alert_type,
  'critical' AS severity,
  count(*) AS count,
  jsonb_agg(jsonb_build_object('id', id, 'invoice_number', invoice_number, 'amount', total_amount - paid_amount, 'due_date', due_date, 'student', (SELECT first_name || ' ' || last_name FROM public.users WHERE id = student_id)))
FROM public.invoices
WHERE status IN ('unpaid', 'partially_paid') AND due_date < now() AND (total_amount - paid_amount) > 0
GROUP BY 'overdue_invoice'
UNION ALL
SELECT
  'near_full_course' AS alert_type,
  'info' AS severity,
  count(*) AS count,
  jsonb_agg(jsonb_build_object('id', id, 'name', name, 'enrolled', current_enrollments, 'capacity', capacity))
FROM public.courses
WHERE status = 'active' AND capacity > 0 AND (current_enrollments::numeric / capacity) >= 0.8
GROUP BY 'near_full_course';
