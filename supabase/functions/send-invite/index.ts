import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Sends a student invitation: generates a secure token, stores it on the users row,
// and emails the student a link to set their own password and activate the account.
// Called by an authenticated admin after creating the user (signUp + register_user RPC).
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
    Deno.env.get("SERVICE_ROLE_JWT") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const userId = (body as Record<string, unknown>)?.user_id as string | undefined;
  if (!userId || typeof userId !== "string") {
    return new Response(JSON.stringify({ error: "user_id is required" }), { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, status")
    .eq("id", userId)
    .maybeSingle();
  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
  }
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  if (user.status !== "pending") {
    return new Response(JSON.stringify({ error: "User is not pending" }), { status: 400 });
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("users")
    .update({ invite_token: token, invite_expires_at: expiresAt })
    .eq("id", userId);
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  const baseUrl = Deno.env.get("INVITE_BASE_URL") ?? "https://erp-platform-seven.vercel.app";
  const inviteUrl = `${baseUrl}/invite?token=${token}`;

  let emailSent = false;
  let emailError = null;
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
              Radiant Academy vous a créé un compte d'élève. Pour l'activer, cliquez sur le bouton ci-dessous
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
  } catch (e) {
    emailError = errMsg(e);
    console.error("[EMAIL_ERROR]", emailError);
  }

  return new Response(
    JSON.stringify({ success: true, email_sent: emailSent, email_error: emailError, expires_at: expiresAt }),
    { headers: { "Content-Type": "application/json" } },
  );
});