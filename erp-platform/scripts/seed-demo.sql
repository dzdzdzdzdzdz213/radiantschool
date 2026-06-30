-- Seed demo accounts for all roles
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Create users in Supabase Auth via the admin API
-- Note: You need to manually create these users in the Auth > Users panel
-- or use the Supabase dashboard, because auth.users is system-managed.

-- Instead, use this function from the SQL editor:

-- Create demo accounts with known UUIDs
-- These IDs match what we'll use in the public.users table
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'etudiant@demo.dz', crypt('demo123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'prof@demo.dz', crypt('demo123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'assistant@demo.dz', crypt('demo123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'admin@demo.dz', crypt('demo123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Create profiles in public.users
INSERT INTO public.users (id, email, first_name, last_name, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'etudiant@demo.dz', 'Ahmed', 'Demo', 'student', now()),
  ('00000000-0000-0000-0000-000000000002', 'prof@demo.dz', 'Sami', 'Demo', 'teacher', now()),
  ('00000000-0000-0000-0000-000000000003', 'assistant@demo.dz', 'Leila', 'Demo', 'assistant', now()),
  ('00000000-0000-0000-0000-000000000004', 'admin@demo.dz', 'Admin', 'Demo', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- Note: If you get a "permission denied" error on auth.users,
-- use the Supabase Dashboard instead:
-- 1. Go to Authentication > Users > Add User
-- 2. Create each user manually with their email and password (demo123)
-- 3. Then insert into public.users with the correct id
