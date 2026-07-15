CREATE POLICY course_enrollments_parent_read ON course_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_parent
      WHERE student_parent.student_id = course_enrollments.student_id
        AND student_parent.parent_id = auth.uid()
    )
  );

CREATE POLICY attendance_parent_read ON attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_parent
      WHERE student_parent.student_id = attendance.student_id
        AND student_parent.parent_id = auth.uid()
    )
  );

CREATE POLICY attendance_records_parent_read ON attendance_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_parent
      WHERE student_parent.student_id = attendance_records.student_id
        AND student_parent.parent_id = auth.uid()
    )
  );

CREATE POLICY invoices_parent_read ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_parent
      WHERE student_parent.student_id = invoices.student_id
        AND student_parent.parent_id = auth.uid()
    )
  );
