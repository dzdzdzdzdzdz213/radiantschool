import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Real-time attendance → parent notification bridge.
// Called by DB triggers (notify_parent_on_attendance*) that sign with the anon key,
// which is public, so nothing in the body can be trusted. Instead of trusting the
// posted status, the function re-reads the actual attendance row from the database
// and notifies parents based on the recorded truth. Forging a notification would
// require writing an attendance row, which RLS restricts to teachers/assistants.
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

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const asId = (v: unknown): string | undefined => {
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return undefined;
  };
  const studentId = asId((body as Record<string, unknown>)?.student_id);
  const sessionId = asId((body as Record<string, unknown>)?.session_id);
  const scheduleId = asId((body as Record<string, unknown>)?.course_schedule_id);
  const postedDate = (body as Record<string, unknown>)?.date;
  if (!studentId) {
    return new Response(JSON.stringify({ error: "student_id is required" }), { status: 400 });
  }

  try {
    const results = { sent: 0, skipped: 0, errors: [] as string[], email_sent: true, email_errors: [] as string[] };

    // Resolve the recorded truth from the DB. A request whose attendance row
    // does not exist is rejected: the triggers only fire after a real write.
    let status: string | null = null;
    let eventDate: string | null = null;
    let courseName = "";

    if (typeof sessionId === "string" && sessionId.length > 0) {
      const { data: session } = await supabase
        .from("attendance_sessions")
        .select("id, date, course:courses(name)")
        .eq("id", sessionId)
        .single();
      if (!session) {
        return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
      }
      const { data: record } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      if (!record) {
        return new Response(JSON.stringify({ error: "Attendance record not found" }), { status: 404 });
      }
      status = record.status;
      eventDate = session.date ?? null;
      courseName = (session as { course?: { name?: string } })?.course?.name ?? "";
    } else if (typeof scheduleId === "string" && scheduleId.length > 0) {
      const { data: sched } = await supabase
        .from("course_schedules")
        .select("course:courses(name)")
        .eq("id", scheduleId)
        .single();
      const { data: record } = await supabase
        .from("attendance")
        .select("status")
        .eq("course_schedule_id", scheduleId)
        .eq("student_id", studentId)
        .eq("date", postedDate ?? eventDate ?? "")
        .maybeSingle();
      if (!record) {
        return new Response(JSON.stringify({ error: "Attendance record not found" }), { status: 404 });
      }
      status = record.status;
      eventDate = typeof postedDate === "string" ? postedDate : null;
      courseName = (sched as { course?: { name?: string } })?.course?.name ?? "";
    }

    if (!status || !VALID_STATUS.includes(status)) {
      return new Response(JSON.stringify({ error: "Valid attendance status not found" }), { status: 400 });
    }

    const dayWindow = (eventDate ?? new Date().toISOString().slice(0, 10));

    const { data: student } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("id", studentId)
      .single();
    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
    }
    const studentName = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim();

    const statusLabel = status === "present" ? "Présent" : status === "absent" ? "Absent" : "En retard";
    const dateLabel = dayWindow;

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
        if ((status === "absent" || status === "late") && parent.notif_absences === false) {
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
          .gte("created_at", `${dayWindow}T00:00:00Z`)
          .lte("created_at", `${dayWindow}T23:59:59Z`);
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
            type: status === "absent" || status === "late" ? "warning" : "info",
            category: "attendance",
            send_email: parent.email_notifications !== false,
            from_name: "Radiant Academy",
          }),
        });
        const notifBody = await notifRes.text();
        if (!notifRes.ok) {
          throw new Error(`send-notification ${notifRes.status}: ${notifBody.slice(0, 300)}`);
        }
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(notifBody);
        } catch {
          // ignore
        }
        results.email_sent = (results.email_sent ?? true) && parsed?.email_sent === true;
        if (parsed?.email_error) {
          results.email_errors.push(`parent ${parent.id}: ${String(parsed.email_error)}`);
        }
        results.sent++;
      } catch (e) {
        results.errors.push(`parent ${parent.id}: ${errMsg(e)}`);
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: errMsg(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});