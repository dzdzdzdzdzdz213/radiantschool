import { createClient } from "@supabase/supabase-js";

// Honesty Box Briefing: clusters anonymous submissions with Gemini.
// Admin/assistant only. Submissions are displayed WITHOUT sender identity.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

async function authorize(req: Request, supabase: ReturnType<typeof createClient>) {
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: "Unauthorized" };
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "assistant"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true, user };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const auth = await authorize(req, supabase);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { data: rows, error: fetchErr } = await supabase
      .from("honesty_box")
      .select("id, role, content, category, severity, status, ai_notes")
      .eq("status", "new")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(100);
    if (fetchErr) throw fetchErr;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, clustered: 0, themes: [] }), { status: 200 });
    }

    const { data: key } = await supabase.rpc("ai_get_gemini_key");
    if (!key) throw new Error("GEMINI_API_KEY not configured");

    const items = rows.map((r) => `#${r.id} [${r.role}] ${r.content}`).join("\n\n---\n\n");
    const prompt =
      `You are the director's confidential briefing assistant of Radiant Academy. ` +
      `Analyze these anonymous feedback messages (marked #id, role parent or student). ` +
      `Cluster them into themes, assign each message a category, a severity (1=minor to 5=crisis), ` +
      `and one short actionable suggestion per theme for the school director. ` +
      `Respond ONLY with valid JSON of shape ` +
      `{"themes":[{"name":string,"severity":number,"suggestion":string,"ids":[number]}],"per_item":[{"id":number,"category":string,"severity":number,"note":string}]}. ` +
      `Max 8 themes. Categories: teaching, fees, facilities, safety, schedule, communication, food, staff, other.\n\nMessages:\n${items}`;

    const res = await fetch(`${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) throw new Error("Gemini API " + res.status + ": " + (await res.text()).slice(0, 300));
    const gemini = await res.json();
    const text = (gemini?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: any) => p.text).map((p: any) => p.text).join("");

    let parsed: any = { themes: [], per_item: [] };
    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // fall back: unclustered
    }

    const byId = new Map((parsed.per_item ?? []).map((p: any) => [p.id, p]));
    for (const row of rows) {
      const item = byId.get(row.id);
      await supabase
        .from("honesty_box")
        .update({
          category: item?.category ?? null,
          severity: item?.severity ?? null,
          ai_notes: item?.note ?? null,
          status: item ? "clustered" : "new",
        })
        .eq("id", row.id);
    }

    return new Response(JSON.stringify({ ok: true, clustered: rows.length, themes: parsed.themes ?? [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});