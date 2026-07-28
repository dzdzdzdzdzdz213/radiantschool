CREATE OR REPLACE VIEW v_daily_attendance AS
SELECT
  d.d::date AS date,
  COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS present_count,
  COALESCE(COUNT(a.id), 0) AS total_count
FROM generate_series(now() - '90 days'::interval, now(), '1 day'::interval) d(d)
LEFT JOIN attendance a ON a.date = d.d::date
GROUP BY d.d::date
ORDER BY d.d::date DESC;

CREATE OR REPLACE VIEW v_teacher_workload AS
SELECT
  u.id AS teacher_id,
  u.first_name || ' ' || u.last_name AS teacher_name,
  COUNT(DISTINCT cs.id) AS total_hours,
  COUNT(DISTINCT c.id) AS course_count
FROM users u
JOIN teachers t ON t.id = u.id
LEFT JOIN courses c ON c.teacher_id = u.id AND c.status = 'active'
LEFT JOIN course_schedules cs ON cs.course_id = c.id
WHERE u.role = 'teacher'
GROUP BY u.id, u.first_name, u.last_name;
