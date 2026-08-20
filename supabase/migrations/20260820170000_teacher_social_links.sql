alter table public.teachers
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text,
  add column if not exists twitter_url text,
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text,
  add column if not exists website_url text;

create policy "teachers_read_public" on public.teachers
  for select using (true);

create policy "teachers_update_own" on public.teachers
  for update using (auth.uid() = id) with check (auth.uid() = id);