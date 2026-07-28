-- Seed attendance data for assistant pages + dashboard
-- Re-creates enrollments, sessions, records, and the attendance table

-- =====================
-- 1. ACTIVE ENROLLMENTS
-- =====================
INSERT INTO course_enrollments (student_id, course_id, status, enrollment_date)
SELECT s.id, c.id, 'active', (NOW() - INTERVAL '2 months')
FROM students s
JOIN courses c ON c.level_id = s.level_id
WHERE s.level_id IS NOT NULL
  AND c.status = 'active'
  AND c.type = 'normal'
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments ce WHERE ce.student_id = s.id AND ce.course_id = c.id
  );

-- Also enroll the two students with null level_id in a few courses
INSERT INTO course_enrollments (student_id, course_id, status, enrollment_date)
SELECT s.id, c.id, 'active', (NOW() - INTERVAL '1 month')
FROM students s
CROSS JOIN (
  SELECT id FROM courses WHERE status = 'active' AND type = 'normal' ORDER BY random() LIMIT 3
) c
WHERE s.level_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM course_enrollments ce WHERE ce.student_id = s.id AND ce.course_id = c.id
  );

-- =====================
-- 2. ATTENDANCE SESSIONS
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
  AND NOT EXISTS (
    SELECT 1 FROM attendance_sessions ats
    WHERE ats.course_id = cs.course_id AND ats.date = d.date
  )
LIMIT 300;

-- =====================
-- 3. ATTENDANCE RECORDS
-- =====================
INSERT INTO attendance_records (session_id, student_id, status)
SELECT
  ats.id,
  ce.student_id,
  CASE
    WHEN random() < 0.70 THEN 'present'
    WHEN random() < 0.85 THEN 'late'
    ELSE 'absent'
  END
FROM attendance_sessions ats
JOIN course_enrollments ce ON ce.course_id = ats.course_id AND ce.status = 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.student_id = ce.student_id
)
LIMIT 1500;

-- =====================
-- 4. ATTENDANCE TABLE (for assistant pages)
-- =====================
INSERT INTO attendance (student_id, course_schedule_id, date, status, method, recorded_by, created_at)
SELECT
  ar.student_id,
  ats.schedule_id,
  ats.date,
  ar.status::attendance_status,
  'manual'::attendance_method,
  ats.validated_by,
  ar.created_at
FROM attendance_records ar
JOIN attendance_sessions ats ON ats.id = ar.session_id
WHERE NOT EXISTS (
  SELECT 1 FROM attendance a
  WHERE a.student_id = ar.student_id AND a.date = ats.date
)
LIMIT 1500;
