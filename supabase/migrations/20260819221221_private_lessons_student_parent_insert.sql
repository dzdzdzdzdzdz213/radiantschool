-- Allow students and parents to request private lessons (booking flow)
DROP POLICY IF EXISTS private_lessons_student_insert ON public.private_lessons;
DROP POLICY IF EXISTS private_lessons_parent_insert ON public.private_lessons;

CREATE POLICY private_lessons_student_insert ON public.private_lessons
  FOR INSERT TO authenticated
  WITH CHECK (is_student() AND student_id = auth.uid());

CREATE POLICY private_lessons_parent_insert ON public.private_lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    is_parent()
    AND EXISTS (
      SELECT 1 FROM student_parent sp
      WHERE sp.student_id = private_lessons.student_id
        AND sp.parent_id = auth.uid()
    )
  );