-- RPC Functions for the ERP platform
-- All functions are SECURITY DEFINER to bypass RLS for admin operations

-- ============================================================
-- SEARCH
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_users(
  search_query text,
  result_limit int DEFAULT 20,
  result_offset int DEFAULT 0
)
RETURNS SETOF public.users
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.users
  WHERE deleted_at IS NULL
    AND (
      first_name ILIKE '%' || search_query || '%'
      OR last_name ILIKE '%' || search_query || '%'
      OR email ILIKE '%' || search_query || '%'
      OR phone ILIKE '%' || search_query || '%'
      OR (first_name || ' ' || last_name) ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE WHEN first_name ILIKE search_query || '%' THEN 0
         WHEN first_name ILIKE '%' || search_query || '%' THEN 1
         WHEN last_name ILIKE search_query || '%' THEN 2
         ELSE 3
    END,
    created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
$$;

CREATE OR REPLACE FUNCTION public.search_users_count(search_query text)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  SELECT count(*)
  FROM public.users
  WHERE deleted_at IS NULL
    AND (
      first_name ILIKE '%' || search_query || '%'
      OR last_name ILIKE '%' || search_query || '%'
      OR email ILIKE '%' || search_query || '%'
      OR phone ILIKE '%' || search_query || '%'
    );
$$;

-- ============================================================
-- DASHBOARD STATISTICS (aggregated)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_revenue', COALESCE((SELECT sum(amount) FROM public.payments WHERE created_at >= date_trunc('month', now())), 0),
    'revenue_yesterday', COALESCE((SELECT sum(amount) FROM public.payments WHERE created_at::date = now()::date - 1), 0),
    'revenue_today', COALESCE((SELECT sum(amount) FROM public.payments WHERE created_at::date = now()::date), 0),
    'active_students', COALESCE((SELECT count(*) FROM public.users WHERE role = 'student' AND status = 'active' AND deleted_at IS NULL), 0),
    'new_students_month', COALESCE((SELECT count(*) FROM public.users WHERE role = 'student' AND created_at >= date_trunc('month', now())), 0),
    'total_students', COALESCE((SELECT count(*) FROM public.users WHERE role = 'student' AND deleted_at IS NULL), 0),
    'active_courses', COALESCE((SELECT count(*) FROM public.courses WHERE status = 'active'), 0),
    'total_teachers', COALESCE((SELECT count(*) FROM public.users WHERE role = 'teacher' AND status = 'active' AND deleted_at IS NULL), 0),
    'occupancy_rate', COALESCE(
      (SELECT round(avg(current_enrollments::numeric / NULLIF(capacity, 0) * 100), 1)
       FROM public.courses WHERE status = 'active' AND capacity > 0), 0),
    'pending_approvals', COALESCE((SELECT count(*) FROM public.users WHERE status = 'pending'), 0),
    'unpaid_invoices', COALESCE((SELECT count(*) FROM public.invoices WHERE status IN ('unpaid', 'partially_paid')), 0),
    'unpaid_invoices_amount', COALESCE((SELECT sum(total_amount - paid_amount) FROM public.invoices WHERE status IN ('unpaid', 'partially_paid')), 0),
    'overdue_invoices', COALESCE((SELECT count(*) FROM public.invoices WHERE status IN ('unpaid', 'partially_paid') AND due_date < now()), 0),
    'attendance_rate_today', COALESCE(
      (SELECT round(
        (count(*) FILTER (WHERE status = 'present'))::numeric /
        NULLIF(count(*), 0) * 100, 1)
       FROM public.attendance WHERE date = now()::date), 0),
    'attendance_count_today', COALESCE((SELECT count(*) FROM public.attendance WHERE date = now()::date), 0),
    'evaluation_count', COALESCE((SELECT count(*) FROM public.evaluations), 0),
    'average_rating', COALESCE((SELECT round(avg(average_score), 2) FROM public.evaluations), 0),
    'courses_at_capacity', COALESCE((SELECT count(*) FROM public.courses WHERE status = 'active' AND current_enrollments >= capacity), 0),
    'near_full_courses', COALESCE((SELECT count(*) FROM public.courses WHERE status = 'active' AND capacity > 0 AND (current_enrollments::numeric / capacity) >= 0.8), 0),
    'active_campaigns', COALESCE((SELECT count(*) FROM public.campaigns WHERE is_active = true AND now() BETWEEN start_date AND end_date), 0),
    'waiting_list_count', COALESCE((SELECT count(*) FROM public.waiting_list WHERE status = 'waiting'), 0),
    'today_sessions', COALESCE((SELECT count(*) FROM public.course_schedules WHERE day_of_week = to_char(now(), 'day')::text), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- REVENUE SUMMARY
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_revenue_summary(
  date_from date DEFAULT now() - interval '30 days',
  date_to date DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'daily', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('date', d::text, 'amount', COALESCE(sum(p.amount), 0)))
       FROM generate_series(date_from, date_to, '1 day'::interval) d
       LEFT JOIN public.payments p ON p.created_at::date = d::date
       GROUP BY d ORDER BY d), '[]'::jsonb),
    'by_method', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('method', payment_method, 'amount', sum(amount), 'count', count(*)))
       FROM public.payments WHERE created_at::date BETWEEN date_from AND date_to
       GROUP BY payment_method), '[]'::jsonb),
    'by_type', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('type', payment_type, 'amount', sum(amount), 'count', count(*)))
       FROM public.payments WHERE created_at::date BETWEEN date_from AND date_to
       GROUP BY payment_type), '[]'::jsonb),
    'total', COALESCE((SELECT sum(amount) FROM public.payments WHERE created_at::date BETWEEN date_from AND date_to), 0),
    'transaction_count', COALESCE((SELECT count(*) FROM public.payments WHERE created_at::date BETWEEN date_from AND date_to), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- ATTENDANCE SUMMARY
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_attendance_summary(
  date_from date DEFAULT now() - interval '7 days',
  date_to date DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'daily', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'date', d::text,
        'present', COALESCE((SELECT count(*) FROM public.attendance WHERE date = d AND status = 'present'), 0),
        'absent', COALESCE((SELECT count(*) FROM public.attendance WHERE date = d AND status = 'absent'), 0),
        'late', COALESCE((SELECT count(*) FROM public.attendance WHERE date = d AND status = 'late'), 0)
       ))
       FROM generate_series(date_from, date_to, '1 day'::interval) d
       ORDER BY d), '[]'::jsonb),
    'total_present', COALESCE((SELECT count(*) FROM public.attendance WHERE date BETWEEN date_from AND date_to AND status = 'present'), 0),
    'total_absent', COALESCE((SELECT count(*) FROM public.attendance WHERE date BETWEEN date_from AND date_to AND status = 'absent'), 0),
    'total_late', COALESCE((SELECT count(*) FROM public.attendance WHERE date BETWEEN date_from AND date_to AND status = 'late'), 0),
    'overall_rate', COALESCE(
      (SELECT round(
        (count(*) FILTER (WHERE status = 'present'))::numeric /
        NULLIF(count(*), 0) * 100, 1)
       FROM public.attendance WHERE date BETWEEN date_from AND date_to), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- TEACHER PAYROLL CALCULATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_teacher_payroll(
  p_teacher_id uuid,
  p_month int DEFAULT EXTRACT(month FROM now()),
  p_year int DEFAULT EXTRACT(year FROM now())
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  contract_record record;
  total_sessions int;
  hourly_rate numeric;
  total_amount numeric;
  result jsonb;
BEGIN
  -- Get contract
  SELECT * INTO contract_record
  FROM public.teacher_contracts
  WHERE teacher_id = p_teacher_id
    AND (end_date IS NULL OR end_date >= date_trunc('month', make_date(p_year, p_month, 1)))
  ORDER BY start_date DESC
  LIMIT 1;

  IF contract_record.id IS NULL THEN
    RETURN jsonb_build_object('error', 'No active contract found');
  END IF;

  -- Count teaching sessions in the month
  SELECT count(*) INTO total_sessions
  FROM public.attendance a
  JOIN public.course_schedules cs ON cs.id = a.course_schedule_id
  WHERE cs.teacher_id = p_teacher_id
    AND a.date >= make_date(p_year, p_month, 1)
    AND a.date < make_date(p_year, p_month, 1) + interval '1 month'
    AND a.status = 'present';

  -- Calculate amount based on contract type
  CASE contract_record.contract_type
    WHEN 'fixed' THEN
      total_amount := contract_record.fixed_salary;
    WHEN 'hourly' THEN
      total_amount := total_sessions * contract_record.hourly_rate;
    WHEN 'percentage' THEN
      total_amount := 0; -- calculated from course revenue
    ELSE
      total_amount := 0;
  END CASE;

  SELECT jsonb_build_object(
    'teacher_id', p_teacher_id,
    'month', p_month,
    'year', p_year,
    'contract_type', contract_record.contract_type,
    'hourly_rate', contract_record.hourly_rate,
    'fixed_salary', contract_record.fixed_salary,
    'sessions_taught', total_sessions,
    'total_amount', total_amount,
    'status', 'calculated'
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- BATCH APPROVAL
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_enrollment(p_enrollment_id int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_id int;
  v_capacity int;
  v_enrolled int;
  v_student_id uuid;
BEGIN
  SELECT course_id, student_id INTO v_course_id, v_student_id
  FROM public.course_enrollments WHERE id = p_enrollment_id AND status = 'pending_approval';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT capacity, current_enrollments INTO v_capacity, v_enrolled
  FROM public.courses WHERE id = v_course_id;

  IF v_enrolled >= v_capacity THEN
    RAISE EXCEPTION 'Course at full capacity (%)', v_capacity;
  END IF;

  UPDATE public.course_enrollments
  SET status = 'active'
  WHERE id = p_enrollment_id;

  -- Notify student
  INSERT INTO public.notifications (user_id, title, message, type, category)
  VALUES (v_student_id, 'Inscription approuvée', 'Votre inscription a été approuvée.', 'success', 'registration');

  RETURN true;
END;
$$;

-- ============================================================
-- BATCH ATTENDANCE ENTRY
-- ============================================================

CREATE OR REPLACE FUNCTION public.record_batch_attendance(
  records jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec jsonb;
  inserted int := 0;
  updated int := 0;
  errors jsonb := '[]'::jsonb;
BEGIN
  FOR rec IN SELECT * FROM jsonb_array_elements(records)
  LOOP
    BEGIN
      INSERT INTO public.attendance (student_id, course_schedule_id, date, status, method, recorded_by)
      VALUES (
        (rec->>'student_id')::uuid,
        (rec->>'course_schedule_id')::int,
        (rec->>'date')::date,
        COALESCE(rec->>'status', 'present'),
        COALESCE(rec->>'method', 'manual'),
        (rec->>'recorded_by')::uuid
      )
      ON CONFLICT (student_id, course_schedule_id, date)
      DO UPDATE SET status = EXCLUDED.status, method = EXCLUDED.method, check_in_time = now();

      IF FOUND THEN
        updated := updated + 1;
      ELSE
        inserted := inserted + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      errors := errors || jsonb_build_object(
        'student_id', rec->>'student_id',
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', inserted,
    'updated', updated,
    'errors', errors
  );
END;
$$;

-- ============================================================
-- INVOICE AGING REPORT
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_invoice_aging()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'current', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('id', id, 'invoice_number', invoice_number, 'student_name', u.first_name || ' ' || u.last_name, 'amount', total_amount - paid_amount, 'due_date', due_date, 'days_overdue', 0))
       FROM public.invoices i JOIN public.users u ON u.id = i.student_id
       WHERE i.status IN ('unpaid', 'partially_paid') AND i.due_date >= now()), '[]'::jsonb),
    '1_30_days', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('id', id, 'invoice_number', invoice_number, 'student_name', u.first_name || ' ' || u.last_name, 'amount', total_amount - paid_amount, 'due_date', due_date, 'days_overdue', EXTRACT(day FROM now() - i.due_date)::int))
       FROM public.invoices i JOIN public.users u ON u.id = i.student_id
       WHERE i.status IN ('unpaid', 'partially_paid') AND i.due_date < now() AND i.due_date >= now() - interval '30 days'), '[]'::jsonb),
    '31_60_days', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('id', id, 'invoice_number', invoice_number, 'student_name', u.first_name || ' ' || u.last_name, 'amount', total_amount - paid_amount, 'due_date', due_date, 'days_overdue', EXTRACT(day FROM now() - i.due_date)::int))
       FROM public.invoices i JOIN public.users u ON u.id = i.student_id
       WHERE i.status IN ('unpaid', 'partially_paid') AND i.due_date < now() - interval '30 days' AND i.due_date >= now() - interval '60 days'), '[]'::jsonb),
    '61_plus_days', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('id', id, 'invoice_number', invoice_number, 'student_name', u.first_name || ' ' || u.last_name, 'amount', total_amount - paid_amount, 'due_date', due_date, 'days_overdue', EXTRACT(day FROM now() - i.due_date)::int))
       FROM public.invoices i JOIN public.users u ON u.id = i.student_id
       WHERE i.status IN ('unpaid', 'partially_paid') AND i.due_date < now() - interval '60 days'), '[]'::jsonb),
    'total_overdue', COALESCE(
      (SELECT sum(total_amount - paid_amount) FROM public.invoices WHERE status IN ('unpaid', 'partially_paid') AND due_date < now()), 0),
    'total_count', COALESCE(
      (SELECT count(*) FROM public.invoices WHERE status IN ('unpaid', 'partially_paid') AND due_date < now()), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- NOTIFICATION DISPATCH (internal)
-- ============================================================

CREATE OR REPLACE FUNCTION public.dispatch_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_category text DEFAULT 'system'
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notif_id int;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, category)
  VALUES (p_user_id, p_title, p_message, p_type, p_category)
  RETURNING id INTO v_notif_id;
  RETURN v_notif_id;
END;
$$;
