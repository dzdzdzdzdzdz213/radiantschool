-- Generate course schedules for all active courses
INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room_id, teacher_id)
SELECT
  c.id,
  day_map.day_of_week::day_of_week,
  day_map.start_time,
  day_map.end_time,
  (SELECT id FROM rooms WHERE status = 'active' ORDER BY RANDOM() LIMIT 1),
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

-- Generate attendance sessions for the next 8 weeks based on course schedules
INSERT INTO attendance_sessions (course_id, date, title, schedule_id, status)
SELECT
  cs.course_id,
  d.date,
  'Séance du ' || TO_CHAR(d.date, 'DD/MM/YYYY'),
  cs.id,
  'scheduled'
FROM course_schedules cs
CROSS JOIN (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '8 weeks',
    '1 day'::interval
  )::date AS date
) d
WHERE cs.day_of_week = LOWER(TRIM(TO_CHAR(d.date, 'Day')))::day_of_week
  AND NOT EXISTS (
    SELECT 1 FROM attendance_sessions aas
    WHERE aas.course_id = cs.course_id AND aas.date = d.date AND aas.schedule_id = cs.id
  )
ORDER BY cs.course_id, d.date;

-- Update trigger to generate sessions based on schedule for future courses
CREATE OR REPLACE FUNCTION auto_create_attendance_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  d date;
  day_name text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.type = 'normal' AND NEW.status = 'active' THEN
    FOR d IN
      SELECT generate_series(
        GREATEST(CURRENT_DATE, NEW.start_date::date),
        LEAST(CURRENT_DATE + INTERVAL '8 weeks', NEW.end_date::date),
        '1 day'::interval
      )::date
    LOOP
      day_name := LOWER(TRIM(TO_CHAR(d, 'Day')));
      INSERT INTO attendance_sessions (course_id, date, title, schedule_id, status)
      SELECT NEW.id, d, 'Séance du ' || TO_CHAR(d, 'DD/MM/YYYY'), cs.id, 'scheduled'
      FROM course_schedules cs
      WHERE cs.course_id = NEW.id
        AND cs.day_of_week = day_name::day_of_week
        AND NOT EXISTS (
          SELECT 1 FROM attendance_sessions aas
          WHERE aas.course_id = NEW.id AND aas.date = d AND aas.schedule_id = cs.id
        );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
