import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Validates an invite token, lets the student set their own password,
// and activates the account so their real name shows in the presence list.
const PROJECT_REF = "kaoxcbqhuwhtadpgccjp";

function isProjectKey(key: string): boolean {
  const envKeys = [
    Deno.env.get("SUPABASE_ANON_KEY"),
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
  ].filter(Boolean);
  if (envKeys.includes(key)) return true;
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.role === "anon" && payload?.ref === PROJECT_REF;
  } catch {
    return false;
  }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!isProjectKey(authHeader.replace("Bearer ", ""))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_JWT") ?? "",
  );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const token = (body as Record<string, unknown>)?.token as string | undefined;
  const password = (body as Record<string, unknown>)?.password as string | undefined;
  if (!token || typeof token !== "string") {
    return new Response(JSON.stringify({ error: "token is required" }), { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, status, invite_token, invite_expires_at")
    .eq("invite_token", token)
    .maybeSingle();
  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
  }
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid or expired invitation link" }), { status: 404 });
  }
  if (user.status !== "pending") {
    return new Response(JSON.stringify({ error: "Account is already active" }), { status: 400 });
  }
  if (!user.invite_expires_at || new Date(user.invite_expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "Invitation link has expired" }), { status: 400 });
  }

  const { error: passwordError } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (passwordError) {
    return new Response(JSON.stringify({ error: passwordError.message }), { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      status: "active",
      invite_token: null,
      invite_expires_at: null,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true, first_name: user.first_name, last_name: user.last_name }),
    { headers: { "Content-Type": "application/json" } },
  );
});