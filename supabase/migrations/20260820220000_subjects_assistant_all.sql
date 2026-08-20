create policy "subjects_assistant_all" on public.subjects
  for all using (is_assistant()) with check (is_assistant());