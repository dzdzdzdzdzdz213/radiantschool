-- DEPRECATED: process_payment_tx is no longer called by any application code.
--
-- It was built for the process-payment edge function
-- (supabase/functions/process-payment/), which was removed in 360ffc7 when
-- in-app payment recording was cancelled. The function is intentionally NOT
-- dropped: it remains a valid, self-contained reference implementation of
-- atomic payment allocation (row-locked invoice updates), and dropping it
-- would break the migration chain for anyone mid-upgrade. It is already
-- revoked from all client roles (public, anon, authenticated), so it poses
-- no security surface. Leave it in place unless the schema is rebuilt from
-- scratch.

comment on function public.process_payment_tx(uuid, numeric, text, text, uuid, bigint, bigint[]) is
'DEPRECATED as of 2026-08-03: no longer called by application code. Kept as reference only.';
