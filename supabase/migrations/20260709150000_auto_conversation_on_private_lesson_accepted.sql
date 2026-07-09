CREATE OR REPLACE FUNCTION public.handle_private_lesson_accepted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    INSERT INTO public.conversations (student_id, teacher_id, participant_id, unread, created_at)
    VALUES (
      NEW.student_id,
      NEW.teacher_id,
      NEW.teacher_id,
      false,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_private_lesson_accepted ON public.private_lessons;
CREATE TRIGGER trg_private_lesson_accepted
  AFTER UPDATE OF status ON public.private_lessons
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION public.handle_private_lesson_accepted();
