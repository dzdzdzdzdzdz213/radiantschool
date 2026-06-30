-- ============================================================
-- Run this entire file in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/kaoxcbqhuwhtadpgccjp/sql/new
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Avatar Storage RLS Policies
-- ============================================================

DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 2. Guardian Fields on users table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES users(id);

-- ============================================================
-- 3. Teacher average_score auto-update trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_teacher_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE teachers
    SET
        rating = (
            SELECT COALESCE(ROUND(AVG(average_score)::DECIMAL, 2), 0)
            FROM evaluations
            WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM evaluations
            WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id)
        )
    WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS evaluation_rating_trigger ON evaluations;
CREATE TRIGGER evaluation_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_teacher_average_rating();

-- ============================================================
-- 4. Enrollment self-service RLS policy for students
-- ============================================================

DROP POLICY IF EXISTS enrollments_insert_self ON course_enrollments;
CREATE POLICY enrollments_insert_self ON course_enrollments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND id = auth.uid())
);

DROP POLICY IF EXISTS enrollments_insert_parent ON course_enrollments;
CREATE POLICY enrollments_insert_parent ON course_enrollments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM student_parent WHERE student_id = course_enrollments.student_id AND parent_id = auth.uid())
);

-- ============================================================
-- 5. Evaluations self-service RLS policy
-- ============================================================

DROP POLICY IF EXISTS evaluations_insert_self ON evaluations;
CREATE POLICY evaluations_insert_self ON evaluations FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.student_id = auth.uid()
        AND c.teacher_id = evaluations.teacher_id
        AND ce.status = 'active')
);

DROP POLICY IF EXISTS evaluations_update_self ON evaluations;
CREATE POLICY evaluations_update_self ON evaluations FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS evaluations_select_self ON evaluations;
CREATE POLICY evaluations_select_self ON evaluations FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR teacher_id = auth.uid());

COMMIT;
