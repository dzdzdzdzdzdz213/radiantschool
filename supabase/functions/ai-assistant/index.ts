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
];

function roleSystemPrompt(role: string, lang: string): string {
  const langName = LANG_NAMES[lang] ?? "French";
  const base =
    `You are Radiant AI, the intelligent assistant of Radiant Learning, an Algerian school/education center. ` +
    `You MUST always reply in ${langName}, regardless of the language the user writes in. ` +
    "You answer from real data by calling the available tools. Be concise, structured, and friendly. " +
    "Never invent data: if a tool is unavailable or returns nothing, say so. " +
    "For admins and assistants: when the user asks to SEND a message or reminder to a student, call student_search to find the student, then call send_message with that student's id, a subject, and the body. When the message has been sent, confirm it to the user with who received it. SMS/email delivery does not exist; the send_message tool sends an in-app message + notification.";
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
  tools: Tool[]
): Promise<{ data: any }> {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };
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

    const contents: Array<Record<string, unknown>> = [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + message }] }];

    let finalText = "";
    let tokenIn = 0;
    let tokenOut = 0;
    const toolCallsLog: unknown[] = [];
    let toolRunCount = 0;

    const MAX_TOOL_ROUNDS = 4;
    let round = 0;
    while (round < MAX_TOOL_ROUNDS) {
      const { data: geminiRes } = await callGemini(apiKey, contents, tools);
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
            role: "model",
            parts: [{ functionResponse: { name: call.name, response: { error: `Unknown tool ${call.name}` } } }],
          });
          continue;
        }
        if (!toolDef.allowedRoles.includes(role)) {
          contents.push({
            role: "model",
            parts: [{ functionResponse: { name: call.name, response: { error: "Not allowed for your role" } } }],
          });
          continue;
        }
        const toolResult = await runTool(userClient, serviceClient, userId, toolDef, call.args, ip);
        toolCallsLog.push({ tool: call.name, args: call.args, status: toolResult.status });
        contents.push({
          role: "model",
          parts: [{ functionResponse: { name: call.name, response: toolResult } }],
        });
      }
      round++;
      if (toolRunCount >= 8) break;
    }

    if (!finalText) {
      const { data: lastRes } = await callGemini(apiKey, contents, []);
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