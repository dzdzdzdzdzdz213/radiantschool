-- Make course_schedule_id nullable so assistants can record attendance without a schedule reference
ALTER TABLE attendance ALTER COLUMN course_schedule_id DROP NOT NULL;
