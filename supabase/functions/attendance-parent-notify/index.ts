import { createClient } from "@supabase/supabase-js";

// Real-time attendance → parent notification bridge.
// Called by DB triggers (notify_parent_on_attendance*) using the project anon key.
// Resolves the student's parents, respects their notification preferences, and
// forwards to send-notification using the service role (which the DB must never hold).
// One attendance notification per parent per day (prevents spam + trigger re-fires).
const PROJECT_REF = "kaoxcbqhuwhtadpgccjp";
const VALID_STATUS = ["present", "absent", "late"];

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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const studentId = body?.student_id;
  const status = body?.status;
  if (typeof studentId !== "string" || !VALID_STATUS.includes(status)) {
    return new Response(JSON.stringify({ error: "student_id and status (present|absent|late) are required" }), { status: 400 });
  }

  try {
    const results = { sent: 0, skipped: 0, errors: [] as string[] };

    const { data: student } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("id", studentId)
      .single();
    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
    }
    const studentName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();

    let courseName = "";
    if (body?.session_id) {
      const { data: session } = await supabase
        .from("attendance_sessions")
        .select("course_id, courses(name)")
        .eq("id", body.session_id)
        .single();
      courseName = (session as any)?.courses?.name ?? "";
    } else if (body?.course_schedule_id) {
      const { data: sched } = await supabase
        .from("course_schedules")
        .select("course:courses(name)")
        .eq("id", body.course_schedule_id)
        .single();
      courseName = (sched as any)?.course?.name ?? "";
    }

    const statusLabel = status === "present" ? "Présent" : status === "absent" ? "Absent" : "En retard";
    const dateLabel = body?.date ?? new Date().toISOString().slice(0, 10);

    const { data: links } = await supabase
      .from("student_parent")
      .select("parent_id")
      .eq("student_id", studentId);
    const parentIds = (links ?? []).map((l) => l.parent_id);
    if (!parentIds.length) {
      return new Response(JSON.stringify({ ok: true, ...results, skipped: parentIds.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { data: parentRows } = await supabase
      .from("users")
      .select("id, email_notifications, push_notifications, sms_notifications, whatsapp_notifications, notif_absences")
      .in("id", parentIds);

    for (const parent of parentRows ?? []) {
      try {
        if (status === "absent" && parent.notif_absences === false) {
          results.skipped++;
          continue;
        }
        const anyChannel =
          (parent.email_notifications ?? true) ||
          (parent.push_notifications ?? true) ||
          (parent.sms_notifications ?? true) ||
          (parent.whatsapp_notifications ?? true);
        if (!anyChannel) {
          results.skipped++;
          continue;
        }

        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", parent.id)
          .eq("category", "attendance")
          .gte("created_at", `${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
        if (count && count > 0) {
          results.skipped++;
          continue;
        }

        const notifRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: parent.id,
            title: `Présence - ${studentName}`,
            message: `Votre enfant ${studentName} a été marqué(e) comme "${statusLabel}" pour le cours de ${courseName} le ${dateLabel}.`,
            type: status === "absent" ? "warning" : "info",
            category: "attendance",
            send_email: parent.email_notifications !== false,
            from_name: "Radiant Academy",
          }),
        });
        const notifBody = await notifRes.text();
        if (!notifRes.ok) {
          throw new Error(`send-notification ${notifRes.status}: ${notifBody.slice(0, 300)}`);
        }
        results.sent++;
      } catch (e) {
        results.errors.push(`parent ${parent.id}: ${e.message}`);
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