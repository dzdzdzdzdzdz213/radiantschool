-- Security advisor cleanup
-- 1. Convert report views from SECURITY DEFINER to SECURITY INVOKER
--    so they enforce the caller's RLS instead of the owner's.
--    v_teacher_workload joins `teachers`, which previously had no
--    assistant-read policy — add one first so assistants can still query it.
create policy "teachers_assistant_select" on public.teachers
  for select
  to public
  using (is_assistant());

alter view public.v_daily_attendance set (security_invoker = true);
alter view public.v_teacher_workload set (security_invoker = true);

-- Narrow the over-granted view privileges (views had ALL incl.
-- INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES). Keep SELECT for the API roles.
revoke all on public.v_daily_attendance from anon, authenticated;
revoke all on public.v_teacher_workload from anon, authenticated;
grant select on public.v_daily_attendance to authenticated;
grant select on public.v_teacher_workload to authenticated;

-- 2. Drop the unused `http` (pg_http) extension. Its functions live in `public`
--    but nothing references them (app + triggers use pg_net's net.http_post).
drop extension if exists http;

-- 3. Remove broad SELECT policies on storage.objects for the public buckets.
--    The app only uses getPublicUrl/upload/remove (never .list()/.download()),
--    so these only allowed anonymous/authenticated listing.
drop policy if exists course_images_public_select on storage.objects;
drop policy if exists resources_public_read on storage.objects;

-- 4. Revoke EXECUTE on internal-only SECURITY DEFINER functions.
--    The default PUBLIC grant (`=X`) covers anon+authenticated, so revoke from
--    PUBLIC. Safe: triggers fire regardless of EXECUTE (verified live), cron
--    jobs run as postgres/service_role, and no app or edge-function code calls
--    these via RPC. service_role/postgres keep their explicit grants.
revoke all on function public.archive_student_attendance() from public;
revoke all on function public.auto_enroll_attendance() from public;
revoke all on function public.check_consecutive_absences() from public;
revoke all on function public.check_enrollment_constraints() from public;
revoke all on function public.check_schedule_conflict() from public;
revoke all on function public.generate_todays_sessions() from public;
revoke all on function public.handle_private_lesson_accepted() from public;
revoke all on function public.maintain_course_enrollment_count() from public;
revoke all on function public.notify_parent_on_attendance() from public;
revoke all on function public.notify_parent_on_attendance_record() from public;
revoke all on function public.run_attendance_summary() from public;

-- get_dashboard_stats is only called by the authenticated assistant dashboard
-- (src/features/assistant/dashboard/useAssistantDashboard.ts); keep EXECUTE for
-- authenticated but drop the PUBLIC grant so anon loses access.
revoke all on function public.get_dashboard_stats(text) from public;
grant execute on function public.get_dashboard_stats(text) to authenticated;
