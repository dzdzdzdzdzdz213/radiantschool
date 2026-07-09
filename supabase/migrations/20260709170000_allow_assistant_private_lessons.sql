CREATE POLICY "private_lessons_assistant_all"
  ON public.private_lessons
  FOR ALL
  TO public
  USING (is_assistant())
  WITH CHECK (is_assistant());
