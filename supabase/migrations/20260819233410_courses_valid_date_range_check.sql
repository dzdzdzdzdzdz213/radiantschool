-- Prevent courses with an end date before the start date
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_valid_date_range;
ALTER TABLE public.courses ADD CONSTRAINT courses_valid_date_range CHECK (
  start_date IS NULL OR end_date IS NULL OR end_date >= start_date
);