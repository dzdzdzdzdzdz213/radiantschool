-- Allow assistant to update student/parent user records (name, phone, etc.)
DROP POLICY IF EXISTS users_assistant_update ON public.users;

CREATE POLICY users_assistant_update ON public.users
  FOR UPDATE TO authenticated
  USING (is_assistant() AND role = ANY (ARRAY['student'::user_role, 'parent'::user_role]))
  WITH CHECK (is_assistant() AND role = ANY (ARRAY['student'::user_role, 'parent'::user_role]));