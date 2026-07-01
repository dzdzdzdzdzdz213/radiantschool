ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES users(id);
