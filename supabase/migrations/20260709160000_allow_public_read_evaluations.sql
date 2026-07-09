CREATE POLICY "evaluations_public_read"
  ON public.evaluations
  FOR SELECT
  TO anon
  USING (true);
