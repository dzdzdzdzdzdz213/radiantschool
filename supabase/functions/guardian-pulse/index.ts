import { createClient } from "@supabase/supabase-js";

// Guardian Pulse: daily proactive guardian notifications.
// Called by pg_cron via guardian_pulse_run() with the project anon key.
// Uses the service role internally (same pattern as attendance-summary).
const PROJECT_REF = "kaoxcbqhuwhtadpgccjp";

function isProjectKey(key: string): boolean {
  const envKeys = [
    Deno.env.get("SUPABASE_ANON_KEY"),
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
  ].filter(Boolean);
  if (envKeys.includes(key)) return true;

  // Legacy JWT anon keys: verify role=anon + ref for THIS project without storing secrets.
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.role === "anon" && payload?.ref === PROJECT_REF;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!isProjectKey(authHeader.replace("Bearer ", ""))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const today = new Date().toISOString().slice(0, 10);
    const results = { payments: 0, absences: 0, errors: [] as string[] };

    // 1) Payments overdue >= 30 days
    const overdueCutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data: overdue } = await supabase
      .from("invoices")
      .select("id, student_id, total_amount, paid_amount, due_date, students!inner(user:users!inner(id, first_name, last_name, parent_id))")
      .in("status", ["unpaid", "partially_paid"])
      .is("deleted_at", null)
      .lte("due_date", overdueCutoff);

    for (const inv of overdue ?? []) {
      const student = inv.students?.user;
      if (!student) continue;
      const parentId = student.parent_id;
      if (!parentId) continue;
      try {
        const { data: parent } = await supabase
          .from("users")
          .select("notif_payments")
          .eq("id", parentId)
          .single();
        if (parent && parent.notif_payments === false) continue;

        const days = Math.max(30, Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000));
        const remaining = Number(inv.total_amount) - Number(inv.paid_amount ?? 0);
        const name = `${student.first_name} ${student.last_name}`.trim();
        await supabase.functions.invoke("send-notification", {
          body: {
            user_id: parentId,
            title: "Paiement en retard",
            message: `La facture de ${name} (${remaining.toLocaleString("fr-DZ")} DZD) est impayée depuis ${days} jours. Merci de régulariser votre situation.`,
            type: "warning",
            category: "payment",
            send_email: true,
            from_name: "Radiant Academy",
          },
        });
        results.payments++;
      } catch (e) {
        results.errors.push(`payment invoice ${inv.id}: ${e.message}`);
      }
    }

    // 2) Students absent today, no arrival
    const { data: absentToday } = await supabase
      .from("attendance")
      .select("student_id, date, students!inner(user:users!inner(id, first_name, last_name, parent_id))")
      .eq("date", today)
      .eq("status", "absent");

    for (const rec of absentToday ?? []) {
      const student = rec.students?.user;
      if (!student || !student.parent_id) continue;
      try {
        const { data: parent } = await supabase
          .from("users")
          .select("notif_absences")
          .eq("id", student.parent_id)
          .single();
        if (parent && parent.notif_absences === false) continue;

        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", student.parent_id)
          .eq("category", "attendance")
          .gte("created_at", `${today}T00:00:00Z`);
        if (count && count > 0) continue;

        const name = `${student.first_name} ${student.last_name}`.trim();
        await supabase.functions.invoke("send-notification", {
          body: {
            user_id: student.parent_id,
            title: "Absence aujourd'hui",
            message: `Votre enfant ${name} est marqué(e) absent(e) aujourd'hui. Contactez l'administration pour toute question.`,
            type: "warning",
            category: "attendance",
            send_email: true,
            from_name: "Radiant Academy",
          },
        });
        results.absences++;
      } catch (e) {
        results.errors.push(`absence ${rec.student_id}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
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