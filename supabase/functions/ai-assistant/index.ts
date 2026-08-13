import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  ar: "Arabic",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

interface ToolDef {
  name: string;
  rpc: string;
  allowedRoles: string[];
  parameters: Record<string, unknown>;
  description: string;
}

const TOOLS: ToolDef[] = [
  {
    name: "school_overview",
    rpc: "ai_tool_school_overview",
    allowedRoles: ["admin", "assistant"],
    parameters: { type: "object", properties: {} },
    description: "Overview stats: students, courses, enrollments, revenue, unpaid invoices, absences today.",
  },
  {
    name: "revenue_analysis",
    rpc: "ai_tool_revenue",
    allowedRoles: ["admin", "assistant"],
    parameters: { type: "object", properties: {} },
    description: "Revenue breakdown by month (last 6), payment method, and course.",
  },
  {
    name: "course_performance",
    rpc: "ai_tool_course_performance",
    allowedRoles: ["admin", "assistant", "teacher"],
    parameters: { type: "object", properties: {} },
    description: "Course occupancy, enrollment vs capacity, and average attendance per course.",
  },
  {
    name: "unpaid_invoices",
    rpc: "ai_tool_unpaid_invoices",
    allowedRoles: ["admin", "assistant"],
    parameters: { type: "object", properties: {} },
    description: "List of unpaid or partially paid invoices with days overdue.",
  },
  {
    name: "attendance_alerts",
    rpc: "ai_tool_attendance_alerts",
    allowedRoles: ["admin", "assistant"],
    parameters: { type: "object", properties: {} },
    description: "Students with 3+ absences in the last 30 days.",
  },
  {
    name: "my_students",
    rpc: "ai_tool_teacher_students",
    allowedRoles: ["teacher"],
    parameters: { type: "object", properties: {} },
    description: "Teacher's own students with course, attendance rate, and absences.",
  },
  {
    name: "my_progress",
    rpc: "ai_tool_my_student_progress",
    allowedRoles: ["student"],
    parameters: { type: "object", properties: {} },
    description: "Student's own courses, attendance, invoices, and payments.",
  },
  {
    name: "student_search",
    rpc: "ai_tool_student_search",
    allowedRoles: ["admin", "assistant", "teacher"],
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Name, email, phone, or registration number" } },
      required: ["query"],
    },
    description: "Search students by name, email, phone, or registration number. The result includes the student's unique id field.",
  },
  {
    name: "course_search",
    rpc: "ai_tool_course_search",
    allowedRoles: ["admin", "assistant", "teacher", "student"],
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Course name or keyword" } },
      required: ["query"],
    },
    description: "Search courses by name or description.",
  },
  {
    name: "send_message",
    rpc: "ai_tool_send_message",
    allowedRoles: ["admin", "assistant"],
    parameters: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "The student's id uuid from student_search results, or null" },
        registration: { type: "string", description: "Student registration number (e.g. STU-12345678), or null" },
        email: { type: "string", description: "Student email, or null" },
        subject: { type: "string", description: "Short subject line of the message" },
        body: { type: "string", description: "Message body content" },
      },
      required: ["subject", "body"],
    },
    description: "Send an in-app message and notification to a student (or to their parent if a parent is linked). Use it after a student_search to identify the student (pass its id, registration, or email). Only call it when the user explicitly asks to send, notify, or message a student.",
  },
  {
    name: "course_catalog",
    rpc: "ai_tool_course_catalog",
    allowedRoles: ["admin", "assistant"],
    parameters: { type: "object", properties: {} },
    description: "Reference data needed to create or update a course: all levels, subjects, teachers, rooms, and existing courses with their ids. Call this BEFORE create_course/update_course to pick valid ids.",
  },
  {
    name: "create_course",
    rpc: "ai_tool_create_course",
    allowedRoles: ["admin", "assistant"],
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Course name, e.g. 'Mathématiques 2AM'" },
        type: { type: "string", description: "normal | vip | private (default normal)" },
        capacity: { type: "integer", description: "Max number of students" },
        price: { type: "number", description: "Course price in DZD" },
        level_id: { type: "integer", description: "Level id from course_catalog (e.g. 6 = 1AM)" },
        subject_id: { type: "integer", description: "Subject id from course_catalog" },
        teacher_id: { type: "string", description: "Teacher user id (uuid) from course_catalog" },
        room_id: { type: "integer", description: "Room id from course_catalog, or omit" },
        start_date: { type: "string", description: "Start date YYYY-MM-DD" },
        end_date: { type: "string", description: "End date YYYY-MM-DD" },
        description: { type: "string", description: "Optional course description" },
        status: { type: "string", description: "active | inactive | full | cancelled | pending (default active)" },
        schedules: {
          type: "array",
          description: "Optional schedules: [{day_of_week: 'monday|tuesday|wednesday|thursday|friday|saturday|sunday', start_time: '14:00', end_time: '16:00', teacher_id?, room_id?}]",
          items: {
            type: "object",
            properties: {
              day_of_week: { type: "string", description: "monday, tuesday, wednesday, thursday, friday, saturday, or sunday" },
              start_time: { type: "string", description: "Start time HH:MM" },
              end_time: { type: "string", description: "End time HH:MM" },
              teacher_id: { type: "string", description: "Optional teacher uuid for this session" },
              room_id: { type: "integer", description: "Optional room id for this session" },
            },
          },
        },
      },
      required: ["name", "capacity", "price", "level_id", "subject_id", "teacher_id", "start_date", "end_date"],
    },
    description:
      "CREATE a new course in the school. Always call course_catalog first to get valid level_id, subject_id, teacher_id, room_id. Recommend sensible name/schedule if the user did not specify them, but ask the user before creating if any critical field (price, capacity, dates) is missing. Confirm to the user with the created course id after success. Only call when the user explicitly asks to create/add/open a course.",
  },
  {
    name: "update_course",
    rpc: "ai_tool_update_course",
    allowedRoles: ["admin", "assistant"],
    parameters: {
      type: "object",
      properties: {
        course_id: { type: "integer", description: "Id of the course to update (from course_catalog/existing_courses or course_search)" },
        name: { type: "string", description: "New course name" },
        type: { type: "string", description: "normal | vip | private" },
        capacity: { type: "integer", description: "New capacity" },
        price: { type: "number", description: "New price in DZD" },
        status: { type: "string", description: "active | inactive | full | cancelled | pending" },
        start_date: { type: "string", description: "Start date YYYY-MM-DD" },
        end_date: { type: "string", description: "End date YYYY-MM-DD" },
        description: { type: "string", description: "New description" },
        subject_id: { type: "integer", description: "New subject id" },
        level_id: { type: "integer", description: "New level id" },
        teacher_id: { type: "string", description: "New teacher user id (uuid)" },
        room_id: { type: "integer", description: "New room id" },
      },
      required: ["course_id"],
    },
    description:
      "UPDATE an existing course (name, type, capacity, price, status, dates, description, subject, level, teacher, room). Call course_catalog or course_search first to get the correct course_id. Only call when the user explicitly asks to modify/update/close/archive a course.",
  },
];

function roleSystemPrompt(role: string, lang: string): string {
  const langName = LANG_NAMES[lang] ?? "French";
  const base =
    `You are Radiant AI, the intelligent assistant of Radiant Learning, an Algerian school/education center. ` +
    `You MUST always reply in ${langName}, regardless of the language the user writes in. ` +
    "You answer from real data by calling the available tools. Be concise, structured, and friendly. " +
    "Never invent data: if a tool is unavailable or returns nothing, say so. " +
    "For admins and assistants: when the user asks to SEND a message or reminder to a student, call student_search to find the student, then call send_message with that student's id, a subject, and the body. When the message has been sent, confirm it to the user with who received it. SMS/email delivery does not exist; the send_message tool sends an in-app message + notification. " +
    "For admins and assistants: you can CREATE, UPDATE, and manage courses. When the user asks to create a course, first call course_catalog to get valid level/subject/teacher/room ids, then call create_course. When the user asks to update, close, or change a course, call course_catalog or course_search to find its id, then call update_course. Always confirm what you created or changed (course id, name, level, subject, teacher, price, status). If the user asks to do something you cannot do with your tools, say clearly that you cannot do it.";
  switch (role) {
    case "admin":
      return base + " The user is the school ADMIN: give global stats, revenue insights, alerts, and strategic recommendations.";
    case "assistant":
      return base + " The user is an ADMIN ASSISTANT: help with daily operations, students, invoices, attendance, courses.";
    case "teacher":
      return base + " The user is a TEACHER: focus on their own courses, their students, attendance, and teaching support.";
    case "student":
      return base + " The user is a STUDENT: focus on their own courses, attendance, invoices, payments, and study support.";
    case "parent":
      return base + " The user is a PARENT: you can only help with general questions about the school; you have no personal data access.";
    default:
      return base;
  }
}

function toolsForRole(role: string): Tool[] {
  return TOOLS.filter((t) => t.allowedRoles.includes(role)).map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

async function callGemini(
  apiKey: string,
  contents: Array<Record<string, unknown>>,
  tools: Tool[],
  systemInstruction?: string
): Promise<{ data: any }> {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (tools.length > 0) {
    body.tools = [{ functionDeclarations: tools }];
    body.toolConfig = { functionCallingConfig: { mode: "AUTO" } };
  }
  const res = await fetch(`${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 500)}`);
  }
  return { data: await res.json() };
}

function extractFunctionCalls(data: any): Array<{ id: string; name: string; args: Record<string, unknown> }> {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p: any) => p.functionCall)
    .map((p: any) => ({
      id: p.functionCall.id ?? `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: p.functionCall.name,
      args: p.functionCall.args ?? {},
    }));
}

function extractText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p: any) => p.text)
    .map((p: any) => p.text)
    .join("")
    .trim();
}

async function runTool(
  userClient: SupabaseClient,
  serviceClient: SupabaseClient,
  userId: string,
  toolDef: ToolDef,
  args: Record<string, unknown>,
  ip: string
): Promise<{ result: unknown; status: string; error?: string }> {
  const start = Date.now();
  try {
    const { data, error } = await userClient.rpc(toolDef.rpc, args);
    const latency = Date.now() - start;
    if (error) throw new Error(error.message);
    await serviceClient.from("ai_audit_logs").insert({
      user_id: userId,
      action: "tool",
      tool_name: toolDef.name,
      request: args,
      response_summary: JSON.stringify(data).slice(0, 2000),
      latency_ms: latency,
      status: "ok",
      ip,
    }).then((r) => r.error ?? null);
    return { result: data, status: "ok" };
  } catch (e: any) {
    const latency = Date.now() - start;
    await serviceClient.from("ai_audit_logs").insert({
      user_id: userId,
      action: "tool",
      tool_name: toolDef.name,
      request: args,
      latency_ms: latency,
      status: "error",
      error: String(e?.message ?? e),
      ip,
    }).then((r) => r.error ?? null);
    return { result: null, status: "error", error: String(e?.message ?? e) };
  }
}

async function decodeUser(client: SupabaseClient, token: string) {
  const { data: userData, error } = await client.auth.getUser(token);
  if (error || !userData.user) {
    throw new Error("Invalid or expired token");
  }
  return userData.user;
}

Deno.serve(async (req: Request) => {
  const startAll = Date.now();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json(401, { error: "Missing token" });
    }

    const body = await req.json();
    const message: string = String(body?.message ?? "").trim();
    if (!message) {
      return json(400, { error: "Empty message" });
    }
    const conversationId: string | null = body?.conversation_id ?? null;
    const lang: string = LANG_NAMES[String(body?.lang ?? "fr")] ? String(body?.lang) : "fr";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const user = await decodeUser(userClient, token);
    const userId = user.id;

    const { data: profile, error: profileErr } = await userClient
      .from("users")
      .select("id, first_name, last_name, role")
      .eq("id", userId)
      .single();
    if (profileErr || !profile) {
      throw new Error("Profile not found");
    }
    const role: string = profile.role as string;

    const apiKeyRes = await serviceClient.rpc("ai_get_gemini_key");
    if (apiKeyRes.error) {
      throw new Error("GEMINI_API_KEY not configured: " + (apiKeyRes.error.message ?? ""));
    }
    const apiKey: string = apiKeyRes.data;

    const tools = toolsForRole(role);
    const systemPrompt = roleSystemPrompt(role, lang);

    const contents: Array<Record<string, unknown>> = [{ role: "user", parts: [{ text: message }] }];

    let finalText = "";
    let tokenIn = 0;
    let tokenOut = 0;
    const toolCallsLog: unknown[] = [];
    let toolRunCount = 0;

    const MAX_TOOL_ROUNDS = 4;
    let round = 0;
    while (round < MAX_TOOL_ROUNDS) {
      const { data: geminiRes } = await callGemini(apiKey, contents, tools, systemPrompt);
      tokenIn += geminiRes?.usageMetadata?.promptTokenCount ?? 0;
      tokenOut += geminiRes?.usageMetadata?.candidatesTokenCount ?? 0;

      const calls = extractFunctionCalls(geminiRes);
      const text = extractText(geminiRes);

      if (calls.length === 0) {
        if (text) finalText = text;
        break;
      }

      toolRunCount += calls.length;
      for (const call of calls) {
        const toolDef = TOOLS.find((t) => t.name === call.name);
        if (!toolDef) {
          contents.push({
            role: "user",
            parts: [{ functionResponse: { id: call.id, name: call.name, response: { error: `Unknown tool ${call.name}` } } }],
          });
          continue;
        }
        if (!toolDef.allowedRoles.includes(role)) {
          contents.push({
            role: "user",
            parts: [{ functionResponse: { id: call.id, name: call.name, response: { error: "Not allowed for your role" } } }],
          });
          continue;
        }
        const toolResult = await runTool(userClient, serviceClient, userId, toolDef, call.args, ip);
        toolCallsLog.push({ tool: call.name, args: call.args, status: toolResult.status });
        contents.push({
          role: "user",
          parts: [{ functionResponse: { id: call.id, name: call.name, response: toolResult } }],
        });
      }
      round++;
      if (toolRunCount >= 8) break;
    }

    if (!finalText) {
      const { data: lastRes } = await callGemini(apiKey, contents, [], systemPrompt);
      finalText = extractText(lastRes) || "No answer.";
      tokenIn += lastRes?.usageMetadata?.promptTokenCount ?? 0;
      tokenOut += lastRes?.usageMetadata?.candidatesTokenCount ?? 0;
    }

    let convoId = conversationId;
    if (!convoId) {
      const title = message.slice(0, 60);
      const { data: convo, error: convoErr } = await userClient
        .from("ai_conversations")
        .insert({ user_id: userId, role, title })
        .select("id")
        .single();
      if (convoErr) throw new Error("Failed to create conversation");
      convoId = convo.id;
    } else {
      await userClient.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convoId).eq("user_id", userId);
    }

    await userClient.from("ai_messages").insert([
      { conversation_id: convoId, role: "user", content: message },
      { conversation_id: convoId, role: "assistant", content: finalText, tool_calls: toolCallsLog },
    ]);

    const totalLatency = Date.now() - startAll;
    await serviceClient.from("ai_audit_logs").insert({
      user_id: userId,
      action: "chat",
      request: { message: message.slice(0, 500), lang },
      response_summary: finalText.slice(0, 500),
      model: GEMINI_MODEL,
      tokens_in: tokenIn,
      tokens_out: tokenOut,
      latency_ms: totalLatency,
      status: "ok",
      ip,
    });

    return json(200, {
      reply: finalText,
      conversation_id: convoId,
      tool_calls: toolCallsLog,
      tokens: { in: tokenIn, out: tokenOut },
      latency_ms: totalLatency,
    });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    const status = msg.includes("Invalid or expired token") ? 401 : msg.includes("FORBIDDEN") ? 403 : 500;
    return json(status, { error: msg.slice(0, 1000) });
  }
});