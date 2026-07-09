CREATE TABLE IF NOT EXISTS public.contact_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert_anon"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_messages_read_admin"
  ON public.contact_messages
  FOR SELECT
  TO public
  USING (is_admin());
