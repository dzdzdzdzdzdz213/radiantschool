import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@4.4.3';
import { authorizeRequest, jsonError } from '../_shared/auth.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { validateRequest } from '../_shared/validation.ts';

const notificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(['info', 'warning', 'success', 'error']).optional(),
  category: z.string().max(50).optional(),
  send_email: z.boolean().optional(),
  from_name: z.string().max(100).optional(),
});

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Service-to-service calls (attendance-summary cron) present the service-role key.
    // Allow those, otherwise require an authenticated admin/assistant.
    const authHeader = req.headers.get('Authorization');
    const presentedKey = authHeader?.replace('Bearer ', '') ?? '';
    if (presentedKey !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      const auth = await authorizeRequest(req, supabase, ['admin', 'assistant']);
      if (!auth.ok) return jsonError(auth.status, auth.error);
    }

    const parsed = await validateRequest(req, notificationSchema);
    if (!parsed.ok) return parsed.response;
    const payload = parsed.data;

    const { data: user } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('id', payload.user_id)
      .single();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
        category: payload.category || 'system',
      })
      .select()
      .single();

    if (notifError) throw notifError;

    let emailSent = false;
    let emailErrorMsg = null;
    if (payload.send_email && user.email) {
      try {
        const apiKey = Deno.env.get('BREVO_API_KEY');
        if (!apiKey) throw new Error('BREVO_API_KEY not set');
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: payload.from_name || 'Radiant Academy', email: 'noreply@radiantlearning.dz' },
            to: [{ email: user.email }],
            subject: payload.title,
            htmlContent: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2563eb;padding:24px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:20px;">Radiant Academy</h1></div><div style="padding:24px;background:#f8fafc;"><h2 style="margin:0 0 12px;font-size:18px;color:#1e293b;">' + payload.title + '</h2><p style="margin:0;color:#475569;line-height:1.6;">' + payload.message.replace(/\n/g, '<br>') + '</p></div><div style="padding:16px;text-align:center;font-size:12px;color:#94a3b8;">Radiant Academy — Alger, Algérie</div></div>',
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || JSON.stringify(result));
        emailSent = true;
      } catch (e) {
        emailErrorMsg = e.message;
        console.error('[EMAIL_ERROR]', e.message);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      notification_id: notification.id,
      email_sent: emailSent,
      email_error: emailErrorMsg,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
