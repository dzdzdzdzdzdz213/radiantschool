-- Phase 0: close RLS gaps on payments and invoices.

-- 1. payments: payment recording is fully external (no client or edge function
-- writes payments anymore). Drop the blanket authenticated INSERT policy that
-- allowed any logged-in user to insert a payment row for any student_id with
-- no WITH CHECK. Writes remain possible only for admin/assistant (their *_all
-- policies) and service_role (bypasses RLS).

drop policy if exists payments_auth_insert_all on public.payments;

-- 2. invoices: any authenticated user could SELECT every invoice (amounts,
-- statuses, all students) via invoices_auth_select_all. Drop it; the properly
-- scoped policies already exist: invoices_read_own (student), 
-- invoices_parent_read (via student_parent), invoices_teacher_select (staff),
-- invoices_admin_all / invoices_assistant_all (ALL).

drop policy if exists invoices_auth_select_all on public.invoices;
