import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  category?: string;
  send_email?: boolean;
  from_name?: string;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: NotificationPayload = await req.json();

    if (!payload.user_id || !payload.title || !payload.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('id', payload.user_id)
      .single();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
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
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
