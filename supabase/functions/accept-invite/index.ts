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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, x-supabase-api-version, content-type",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!isProjectKey(authHeader.replace("Bearer ", ""))) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_JWT") ?? "",
  );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const token = (body as Record<string, unknown>)?.token as string | undefined;
  const password = (body as Record<string, unknown>)?.password as string | undefined;
  if (!token || typeof token !== "string") {
    return jsonResponse({ error: "token is required" }, 400);
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return jsonResponse({ error: "Password must be at least 8 characters" }, 400);
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, status, invite_token, invite_expires_at")
    .eq("invite_token", token)
    .maybeSingle();
  if (userError) {
    return jsonResponse({ error: userError.message }, 500);
  }
  if (!user) {
    return jsonResponse({ error: "Invalid or expired invitation link" }, 404);
  }
  if (user.status !== "pending") {
    return jsonResponse({ error: "Account is already active" }, 400);
  }
  if (!user.invite_expires_at || new Date(user.invite_expires_at) < new Date()) {
    return jsonResponse({ error: "Invitation link has expired" }, 400);
  }

  const { error: passwordError } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (passwordError) {
    return jsonResponse({ error: passwordError.message }, 500);
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
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({ success: true, first_name: user.first_name, last_name: user.last_name }, 200);
});