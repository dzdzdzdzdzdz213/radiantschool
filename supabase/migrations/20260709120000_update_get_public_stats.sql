CREATE OR REPLACE FUNCTION public.get_public_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
  v_student_count bigint;
  v_teacher_count bigint;
  v_total_courses bigint;
  v_eval_count bigint;
  v_avg_rating numeric;
BEGIN
  SELECT COUNT(*) INTO v_student_count FROM public.users WHERE role = 'student';
  SELECT COUNT(*) INTO v_teacher_count FROM public.users WHERE role = 'teacher';
  SELECT COUNT(*) INTO v_total_courses FROM public.courses WHERE status = 'active';
  SELECT COUNT(*), COALESCE(ROUND(AVG(average_score)::numeric, 1), 0)
    INTO v_eval_count, v_avg_rating
    FROM public.evaluations;

  SELECT jsonb_build_object(
    'student_count', v_student_count,
    'teacher_count', v_teacher_count,
    'total_courses', v_total_courses,
    'total_evaluations', v_eval_count,
    'avg_rating', v_avg_rating,
    'success_rate', 0,
    'years_active', 1
  ) INTO result;
  RETURN result;
END;
$function$;
