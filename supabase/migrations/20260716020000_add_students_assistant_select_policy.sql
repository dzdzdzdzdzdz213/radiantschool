-- Allow assistants to read student records (for registrations, payments, etc.)
CREATE POLICY "students_assistant_select" ON "public"."students"
FOR SELECT
TO public
USING (is_assistant());
