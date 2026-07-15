-- Seed demo data

-- =====================
-- 1. COURSE SCHEDULES
-- =====================
INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room_id, teacher_id)
SELECT
  c.id,
  day_map.day_of_week::day_of_week,
  day_map.start_time,
  day_map.end_time,
  (SELECT id FROM rooms ORDER BY RANDOM() LIMIT 1),
  c.teacher_id
FROM courses c
CROSS JOIN (
  VALUES
    ('monday', '08:00'::time, '09:30'::time),
    ('tuesday', '10:00'::time, '11:30'::time),
    ('wednesday', '08:00'::time, '09:30'::time),
    ('thursday', '10:00'::time, '11:30'::time),
    ('saturday', '09:00'::time, '10:30'::time)
) AS day_map(day_of_week, start_time, end_time)
WHERE c.status = 'active'
  AND c.type = 'normal'
  AND NOT EXISTS (
    SELECT 1 FROM course_schedules cs WHERE cs.course_id = c.id AND cs.day_of_week = day_map.day_of_week::day_of_week
  )
LIMIT 150;

-- =====================
-- 2. COURSE ENROLLMENTS
-- =====================
INSERT INTO course_enrollments (student_id, course_id, status, enrollment_date)
SELECT
  s.id,
  c.id,
  'active',
  (NOW() - INTERVAL '1 month' * (random() * 3 + 1)::int)
FROM students s
JOIN courses c ON c.level_id = s.level_id
WHERE s.level_id IS NOT NULL
  AND c.status = 'active'
  AND c.type = 'normal'
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments ce WHERE ce.student_id = s.id AND ce.course_id = c.id
  );

INSERT INTO course_enrollments (student_id, course_id, status, enrollment_date)
SELECT
  s.id,
  c.id,
  'pending_approval',
  NOW() - INTERVAL '2 days'
FROM students s
JOIN courses c ON c.level_id = s.level_id
WHERE s.level_id IS NOT NULL
  AND c.status = 'active'
  AND c.type = 'normal'
  AND random() < 0.15
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments ce WHERE ce.student_id = s.id AND ce.course_id = c.id
  )
LIMIT 10;

-- =====================
-- 3. PARENT LINK
-- =====================
INSERT INTO parents (id)
SELECT id FROM users WHERE email = 'eddddddddd@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_parent (student_id, parent_id, relationship)
SELECT s.id, u.id, 'parent'
FROM users u
CROSS JOIN students s
WHERE u.email = 'eddddddddd@gmail.com'
  AND s.id IN (
    SELECT id FROM users WHERE email IN ('mohamed.ali@test.dz', 'selma.belkacem@test.dz', 'ines.merabet@test.dz')
  )
ON CONFLICT DO NOTHING;

-- =====================
-- 4. ATTENDANCE SESSIONS & RECORDS
-- =====================
INSERT INTO attendance_sessions (course_id, date, schedule_id, status, check_in_opened_at, check_in_closed_at)
SELECT
  cs.course_id,
  d.date,
  cs.id,
  'closed',
  (d.date + cs.start_time)::timestamptz - INTERVAL '15 minutes',
  (d.date + cs.end_time)::timestamptz + INTERVAL '15 minutes'
FROM course_schedules cs
CROSS JOIN (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '1 day',
    '1 day'::interval
  )::date AS date
) d
WHERE cs.day_of_week = LOWER(TRIM(TO_CHAR(d.date, 'Day')))::day_of_week
  AND random() < 0.6
LIMIT 200;

INSERT INTO attendance_records (session_id, student_id, status)
SELECT
  ats.id,
  ce.student_id,
  CASE WHEN random() < 0.75 THEN 'present' WHEN random() < 0.85 THEN 'late' ELSE 'absent' END
FROM attendance_sessions ats
JOIN course_enrollments ce ON ce.course_id = ats.course_id AND ce.status = 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.student_id = ce.student_id
)
LIMIT 500;

-- =====================
-- 5. INVOICES
-- =====================
INSERT INTO invoices (student_id, issue_date, due_date, total_amount, paid_amount, status)
SELECT
  s.id,
  d.issue_date,
  d.due_date,
  c.price,
  CASE WHEN random() < 0.6 THEN c.price WHEN random() < 0.8 THEN c.price * 0.5 ELSE 0 END,
  (CASE
    WHEN random() < 0.6 THEN 'paid'
    WHEN random() < 0.8 THEN 'partially_paid'
    ELSE 'unpaid'
  END)::invoice_status
FROM students s
JOIN course_enrollments ce ON ce.student_id = s.id AND ce.status = 'active'
JOIN courses c ON c.id = ce.course_id
CROSS JOIN (
  SELECT
    (CURRENT_DATE - INTERVAL '1 month' * s)::date AS issue_date,
    (CURRENT_DATE - INTERVAL '1 month' * s + INTERVAL '15 days')::date AS due_date
  FROM generate_series(1, 3) AS s
) d
WHERE random() < 0.5
LIMIT 100;

-- =====================
-- 6. PAYMENTS
-- =====================
INSERT INTO payments (student_id, amount, payment_date, payment_method, payment_type, recorded_by, course_id)
SELECT
  s.id,
  c.price,
  (NOW() - INTERVAL '1 day' * (random() * 60)::int),
  (ARRAY['cash'::payment_method, 'bank_transfer'::payment_method, 'card'::payment_method])[floor(random() * 3 + 1)],
  'monthly'::payment_type,
  (SELECT id FROM users WHERE role = 'assistant' LIMIT 1),
  c.id
FROM students s
JOIN course_enrollments ce ON ce.student_id = s.id AND ce.status = 'active'
JOIN courses c ON c.id = ce.course_id
WHERE random() < 0.4
LIMIT 80;
