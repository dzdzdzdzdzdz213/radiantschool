-- Allow students to enroll themselves (pending_approval)
CREATE POLICY "course_enrollments_student_insert" ON "public"."course_enrollments"
FOR INSERT
TO public
WITH CHECK (
  is_student()
  AND student_id = auth.uid()
);

-- Allow parents to enroll their children
CREATE POLICY "course_enrollments_parent_insert" ON "public"."course_enrollments"
FOR INSERT
TO public
WITH CHECK (
  is_parent()
  AND (
    EXISTS (
      SELECT 1 FROM student_parent
      WHERE student_parent.student_id = course_enrollments.student_id
      AND student_parent.parent_id = auth.uid()
    )
  )
);
