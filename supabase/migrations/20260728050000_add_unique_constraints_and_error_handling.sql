ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone);
ALTER TABLE users ADD CONSTRAINT users_full_name_key UNIQUE (first_name, last_name);

CREATE OR REPLACE FUNCTION register_user(
  p_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_role text,
  p_status text DEFAULT 'pending',
  p_phone text DEFAULT NULL,
  p_student_type text DEFAULT 'regular'
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() != p_id AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'permission_denied' USING HINT = 'Vous ne pouvez vous inscrire que vous-même';
  END IF;

  INSERT INTO public.users (id, email, first_name, last_name, role, status, phone)
  VALUES (p_id, p_email, p_first_name, p_last_name, p_role::public.user_role, p_status::public.user_status, p_phone);

  IF p_role = 'student' THEN
    INSERT INTO public.students (id, student_type) VALUES (p_id, COALESCE(p_student_type, 'regular')::public.student_type);
  END IF;
EXCEPTION
  WHEN UNIQUE_VIOLATION THEN
    IF SQLERRM LIKE '%users_email_key%' THEN
      RAISE EXCEPTION 'email_exists' USING HINT = 'Cet email est déjà utilisé';
    ELSIF SQLERRM LIKE '%users_phone_key%' THEN
      RAISE EXCEPTION 'phone_exists' USING HINT = 'Ce numéro de téléphone est déjà utilisé';
    ELSIF SQLERRM LIKE '%users_full_name_key%' THEN
      RAISE EXCEPTION 'name_exists' USING HINT = 'Ce nom complet est déjà utilisé';
    ELSE
      RAISE;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION register_child(
  p_parent_id uuid,
  p_first_name text,
  p_last_name text,
  p_level_category text DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  child_id uuid;
  child_email text;
BEGIN
  IF auth.uid() != p_parent_id THEN
    RAISE EXCEPTION 'permission_denied' USING HINT = 'Vous ne pouvez inscrire un enfant que pour vous-même';
  END IF;

  child_id := gen_random_uuid();
  child_email := 'child_' || p_parent_id || '_' || p_first_name || '_' || p_last_name || '@temp.radiantlearning.dz';

  INSERT INTO public.users (id, email, first_name, last_name, role, status)
  VALUES (child_id, child_email, p_first_name, p_last_name, 'student', 'active');

  INSERT INTO public.students (id) VALUES (child_id);

  INSERT INTO public.student_parent (student_id, parent_id) VALUES (child_id, p_parent_id);
EXCEPTION
  WHEN UNIQUE_VIOLATION THEN
    IF SQLERRM LIKE '%users_full_name_key%' THEN
      RAISE EXCEPTION 'child_name_exists' USING HINT = 'Un enfant avec ce nom existe déjà. Si c''est le même, il est déjà inscrit.';
    ELSE
      RAISE;
    END IF;
END;
$$;
