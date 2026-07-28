-- Drop overloaded versions and recreate as a single function
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS get_dashboard_stats(text);

CREATE OR REPLACE FUNCTION get_dashboard_stats(stat text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_count bigint;
  course_count bigint;
  scans_today bigint;
  unpaid_count bigint;
  payments_today bigint;
  enrollment_count bigint;
  val bigint;
BEGIN
  IF stat IS NULL THEN
    SELECT count(*) INTO student_count FROM users WHERE role = 'student';
    SELECT count(*) INTO course_count FROM courses WHERE status = 'active';
    SELECT count(*) INTO scans_today FROM rfid_scans WHERE scanned_at >= CURRENT_DATE;
    SELECT count(*) INTO unpaid_count FROM invoices WHERE status = 'unpaid';
    SELECT count(*) INTO payments_today FROM payments WHERE created_at >= CURRENT_DATE;
    SELECT count(*) INTO enrollment_count FROM course_enrollments WHERE status = 'active';
    RETURN json_build_object(
      'students', student_count,
      'courses', course_count,
      'scansToday', scans_today,
      'unpaidInvoices', unpaid_count,
      'paymentsToday', payments_today,
      'enrollments', enrollment_count
    );
  ELSE
    val := CASE stat
      WHEN 'today_registrations' THEN (SELECT count(*) FROM course_enrollments WHERE enrollment_date >= CURRENT_DATE)
      WHEN 'pending_registrations' THEN (SELECT count(*) FROM course_enrollments WHERE status = 'pending_approval')
      WHEN 'today_attendance' THEN (SELECT count(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'present')
      WHEN 'absent_today' THEN (SELECT count(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'absent')
      WHEN 'today_revenue' THEN COALESCE((SELECT SUM(amount)::bigint FROM payments WHERE created_at >= CURRENT_DATE), 0)
      WHEN 'pending_payments' THEN (SELECT count(*) FROM invoices WHERE status IN ('unpaid', 'partially_paid'))
      WHEN 'invoices_month' THEN (SELECT count(*) FROM invoices WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))
      WHEN 'rfid_scans_today' THEN (SELECT count(*) FROM rfid_scans WHERE scanned_at >= CURRENT_DATE)
      WHEN 'upcoming_classes' THEN (SELECT count(*) FROM course_schedules WHERE day_of_week = LOWER(TRIM(TO_CHAR(CURRENT_DATE, 'Day')))::day_of_week)
      WHEN 'waiting_list' THEN (SELECT count(*) FROM waiting_list)
      WHEN 'private_lesson_requests' THEN (SELECT count(*) FROM private_lessons WHERE status = 'pending')
      WHEN 'vip_students_today' THEN (SELECT count(*) FROM vip_classes WHERE date = CURRENT_DATE)
      ELSE 0
    END;
    RETURN to_json(val);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_stats(text) TO anon, authenticated, service_role;
