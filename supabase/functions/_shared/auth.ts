import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

export type Role = 'admin' | 'assistant' | 'teacher' | 'student' | 'parent';

export interface AuthUser {
  id: string;
  role: Role;
  email?: string;
}

export interface AuthSuccess {
  ok: true;
  user: AuthUser;
}

export interface AuthFailure {
  ok: false;
  status: number;
  error: string;
}

export function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function authorizeRequest(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  allowedRoles: Role[],
): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const role = profile.role as Role;
  if (!allowedRoles.includes(role)) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  return { ok: true, user: { id: profile.id, role, email: profile.email ?? undefined } };
}
