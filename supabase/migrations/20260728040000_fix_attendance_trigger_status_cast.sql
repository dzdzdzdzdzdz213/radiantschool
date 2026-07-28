CREATE OR REPLACE FUNCTION notify_parent_on_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_id_val uuid;
  student_name text;
  course_name text;
  anon_key text;
  payload jsonb;
  status_label text;
BEGIN
  IF NEW.status NOT IN ('present', 'absent', 'late') THEN
    RETURN NEW;
  END IF;

  SELECT first_name || ' ' || last_name INTO student_name
  FROM users WHERE id = NEW.student_id;

  SELECT c.name INTO course_name
  FROM course_schedules cs
  JOIN courses c ON c.id = cs.course_id
  WHERE cs.id = NEW.course_schedule_id;

  status_label := CASE NEW.status
    WHEN 'present' THEN 'Présent'
    WHEN 'absent' THEN 'Absent'
    WHEN 'late' THEN 'En retard'
    ELSE NEW.status::text
  END;

  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_anon_key';

  FOR parent_id_val IN
    SELECT sp.parent_id
    FROM student_parent sp
    WHERE sp.student_id = NEW.student_id
  LOOP
    payload := jsonb_build_object(
      'user_id', parent_id_val,
      'title', 'Présence - ' || student_name,
      'message', 'Votre enfant ' || student_name || ' a été marqué(e) comme "' || status_label || '" pour le cours de ' || COALESCE(course_name, '') || ' le ' || NEW.date,
      'type', CASE WHEN NEW.status = 'absent' THEN 'warning' ELSE 'info' END,
      'category', 'attendance',
      'send_email', true,
      'from_name', 'Radiant Academy'
    );

    PERFORM net.http_post(
      'https://kaoxcbqhuwhtadpgccjp.supabase.co/functions/v1/send-notification',
      payload::text,
      'application/json',
      ARRAY['Authorization: Bearer ' || anon_key, 'Content-Type: application/json'],
      5000
    );
  END LOOP;

  RETURN NEW;
END;
$$;
