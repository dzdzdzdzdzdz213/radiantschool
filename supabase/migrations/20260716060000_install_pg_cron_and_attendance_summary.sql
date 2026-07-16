-- Enable pg_cron for scheduling attendance summary jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function that calls the attendance-summary Edge Function via pg_net
CREATE OR REPLACE FUNCTION run_attendance_summary()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anon_key text;
  job_id bigint;
BEGIN
  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_anon_key';

  SELECT net.http_post(
    url := 'https://kaoxcbqhuwhtadpgccjp.supabase.co/functions/v1/attendance-summary',
    body := '{}'::text,
    params := 'application/json',
    headers := ARRAY['Authorization: Bearer ' || anon_key, 'Content-Type: application/json'],
    timeout_milliseconds := 30000
  ) INTO job_id;

  RETURN 'Job submitted: ' || job_id;
END;
$$;

-- Run every 10 minutes to check for sessions that closed 2+ hours ago
SELECT cron.schedule('attendance-summary-every-10min', '*/10 * * * *', 'SELECT run_attendance_summary();');