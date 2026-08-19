-- Storage uploads perform INSERT ... RETURNING *, so the caller needs a
-- SELECT policy on storage.objects as well. Without it, course/resource
-- image uploads fail with "new row violates row-level security policy".
DROP POLICY IF EXISTS course_images_staff_select ON storage.objects;
CREATE POLICY course_images_staff_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'courses'::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'assistant'::user_role, 'teacher'::user_role])
    )
  );

DROP POLICY IF EXISTS resources_staff_select ON storage.objects;
CREATE POLICY resources_staff_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resources'::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'assistant'::user_role])
    )
  );