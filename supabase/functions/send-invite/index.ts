import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Sends a student invitation: generates a secure token, stores it on the users row,
// and emails the student a link to set their own password and activate the account.
// Called by an authenticated admin after creating the user (signUp + register_user RPC).
const PROJECT_REF = "kaoxcbqhuwhtadpgccjp";

function decodeJwt(key: string): { role?: string; ref?: string; sub?: string } | null {
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { role: payload?.role, ref: payload?.ref, sub: payload?.sub };
  } catch {
    return null;
  }
}

function isProjectKey(key: string): boolean {
  const envKeys = [
    Deno.env.get("SUPABASE_ANON_KEY"),
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
  ].filter(Boolean);
  if (envKeys.includes(key)) return true;
  const claims = decodeJwt(key);
  if (!claims) return false;
  if (claims.ref && claims.ref !== PROJECT_REF) return false;
  return claims.role === "anon" || claims.role === "authenticated";
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
  const bearerKey = authHeader.replace("Bearer ", "");
  if (!isProjectKey(bearerKey)) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_JWT") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const claims = decodeJwt(bearerKey);
  if (claims?.role === "authenticated") {
    const userRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${bearerKey}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      },
    });
    if (!userRes.ok) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
    const authedUser = await userRes.json();
    const callerId = authedUser?.id ?? authedUser?.sub;
    if (!callerId) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
    const { data: caller, error: callerError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", callerId)
      .maybeSingle();
    if (callerError || !caller || !["admin", "assistant"].includes(caller.role)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const userId = (body as Record<string, unknown>)?.user_id as string | undefined;
  if (!userId || typeof userId !== "string") {
    return jsonResponse({ error: "user_id is required" }, 400);
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, status")
    .eq("id", userId)
    .maybeSingle();
  if (userError) {
    return jsonResponse({ error: userError.message }, 500);
  }
  if (!user) {
    return jsonResponse({ error: "User not found" }, 404);
  }
  if (user.status !== "pending") {
    return jsonResponse({ error: "User is not pending" }, 400);
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("users")
    .update({ invite_token: token, invite_expires_at: expiresAt })
    .eq("id", userId);
  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  const baseUrl = Deno.env.get("INVITE_BASE_URL") ?? "https://erp-platform-seven.vercel.app";
  const inviteUrl = `${baseUrl}/invite?token=${token}`;

  let emailSent = false;
  let emailError = null;
  let emailMessageId: string | null = null;
  try {
    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY not set");
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Radiant Academy", email: "noreply@radiantlearning.dz" },
        to: [{ email: user.email }],
        subject: "Votre invitation à Radiant Academy",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
            <h2 style="color:#1e293b">Bonjour ${user.first_name} ${user.last_name},</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6">
              Radiant Academy vous a créé un compte. Pour l'activer, cliquez sur le bouton ci-dessous
              et choisissez votre mot de passe.
            </p>
            <p style="text-align:center;margin:28px 0">
              <a href="${inviteUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
                Activer mon compte
              </a>
            </p>
            <p style="color:#94a3b8;font-size:13px">Ce lien expire dans 7 jours. Si vous n'attendiez pas ce message, ignorez-le.</p>
            <p style="color:#94a3b8;font-size:12px">Radiant Academy · noreply@radiantlearning.dz</p>
          </div>`,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || JSON.stringify(result));
    emailSent = true;
    emailMessageId = result.messageId ?? null;
  } catch (e) {
    emailError = errMsg(e);
    console.error("[EMAIL_ERROR]", emailError);
  }

  return jsonResponse({ success: true, email_sent: emailSent, email_error: emailError, email_message_id: emailMessageId, expires_at: expiresAt }, 200);
});