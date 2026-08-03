-- Fix privilege escalation in register_user.
--
-- register_user is SECURITY DEFINER (bypasses RLS). Previously the only gate
-- was "you may only register yourself, unless you are an admin" — but once
-- past that check, p_role and p_status were inserted verbatim from caller
-- input. Any self-signed-up user could call
--   supabase.rpc('register_user', { p_id: <own uid>, p_role: 'admin', p_status: 'active', ... })
-- and get an immediately-active admin account, bypassing the app UI and any
-- approval step.
--
-- Fix:
--  * Self-registration branch (auth.uid() = p_id): p_role restricted to
--    ('student', 'parent'); p_status derived server-side (student -> 'active',
--    parent -> 'pending'), never trusted from client input.
--  * Admin branch (existing admin registering someone else): full flexibility
--    on p_role/p_status preserved — that is the CreateUserPage.tsx feature.
--  * Explicit REVOKE/GRANT hygiene on EXECUTE.

create or replace function register_user(
  p_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_role text,
  p_status text default 'pending',
  p_phone text default null,
  p_student_type text default 'regular'
)
returns void
security definer
set search_path = public
language plpgsql
as $$
begin
  if auth.uid() = p_id then
    -- Self-registration: only student/parent, status derived server-side.
    if p_role not in ('student', 'parent') then
      raise exception 'permission_denied' using hint = 'Inscription avec ce rôle non autorisée';
    end if;
    p_status := case when p_role = 'student' then 'active' else 'pending' end;
  elsif exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    -- Admin registering someone else: full flexibility (CreateUserPage).
    null;
  else
    raise exception 'permission_denied' using hint = 'Vous ne pouvez vous inscrire que vous-même';
  end if;

  insert into public.users (id, email, first_name, last_name, role, status, phone)
  values (p_id, p_email, p_first_name, p_last_name, p_role::public.user_role, p_status::public.user_status, p_phone);

  if p_role = 'student' then
    insert into public.students (id, student_type) values (p_id, coalesce(p_student_type, 'regular')::public.student_type);
  end if;
exception
  when unique_violation then
    if sqlerrm like '%users_email_key%' then
      raise exception 'email_exists' using hint = 'Cet email est déjà utilisé';
    elsif sqlerrm like '%users_phone_key%' then
      raise exception 'phone_exists' using hint = 'Ce numéro de téléphone est déjà utilisé';
    elsif sqlerrm like '%users_full_name_key%' then
      raise exception 'name_exists' using hint = 'Ce nom complet est déjà utilisé';
    else
      raise;
    end if;
end;
$$;

-- EXECUTE hygiene: explicit revoke from public/anon (no-op if already revoked,
-- protects against future re-grants), keep authenticated access.
revoke all on function public.register_user(uuid, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.register_user(uuid, text, text, text, text, text, text, text) to authenticated;
