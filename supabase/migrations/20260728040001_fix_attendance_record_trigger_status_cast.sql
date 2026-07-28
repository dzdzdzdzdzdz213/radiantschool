CREATE OR REPLACE FUNCTION notify_parent_on_attendance_record()
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
  prefs record;
BEGIN
  IF NEW.status NOT IN ('present', 'absent', 'late') THEN
    RETURN NEW;
  END IF;

  SELECT first_name || ' ' || last_name INTO student_name
  FROM users WHERE id = NEW.student_id;

  SELECT c.name INTO course_name
  FROM attendance_sessions aas
  JOIN courses c ON c.id = aas.course_id
  WHERE aas.id = NEW.session_id;

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
    SELECT
      COALESCE(push_notifications, true) AS push_ok,
      COALESCE(email_notifications, true) AS email_ok,
      COALESCE(sms_notifications, true) AS sms_ok,
      COALESCE(whatsapp_notifications, true) AS whatsapp_ok,
      COALESCE(notif_absences, true) AS absences_ok
    INTO prefs
    FROM users
    WHERE id = parent_id_val;

    IF NEW.status = 'absent' AND NOT prefs.absences_ok THEN
      CONTINUE;
    END IF;

    IF NOT (prefs.push_ok OR prefs.email_ok OR prefs.sms_ok OR prefs.whatsapp_ok) THEN
      CONTINUE;
    END IF;

    payload := jsonb_build_object(
      'user_id', parent_id_val,
      'title', 'Présence - ' || student_name,
      'message', 'Votre enfant ' || student_name || ' a été marqué(e) comme "' || status_label || '" pour le cours de ' || COALESCE(course_name, ''),
      'type', CASE WHEN NEW.status = 'absent' THEN 'warning' ELSE 'info' END,
      'category', 'attendance',
      'send_email', prefs.email_ok,
      'send_push', prefs.push_ok,
      'send_whatsapp', prefs.whatsapp_ok AND NEW.status = 'absent',
      'from_name', 'Radiant Academy'
    );

    BEGIN
      PERFORM net.http_post(
        'https://kaoxcbqhuwhtadpgccjp.supabase.co/functions/v1/send-notification',
        payload::text,
        'application/json',
        ARRAY['Authorization: Bearer ' || anon_key, 'Content-Type: application/json'],
        5000
      );
    EXCEPTION
      WHEN OTHERS THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (parent_id_val, 'notification_failed', 'attendance_records', NEW.id::text,
          '{}'::jsonb,
          jsonb_build_object(
            'error', SQLERRM,
            'status', NEW.status,
            'student_id', NEW.student_id
          )
        );
    END;
  END LOOP;

  RETURN NEW;
END;
$$;
