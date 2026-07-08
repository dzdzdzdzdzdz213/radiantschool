import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  category?: string;
  send_email?: boolean;
  send_sms?: boolean;
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

    // Validate user exists
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

    // Insert in-app notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
      })
      .select()
      .single();

    if (notifError) throw notifError;

    // Send email via Supabase if requested
    if (payload.send_email && user.email) {
      // In production, call an email service (SendGrid, Resend, etc.)
      console.log(`[EMAIL] To: ${user.email}, Subject: ${payload.title}`);
    }

    // Send SMS if requested
    if (payload.send_sms && user.phone) {
      // In production, call an SMS service (Twilio, etc.)
      console.log(`[SMS] To: ${user.phone}, Message: ${payload.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      notification_id: notification.id,
      email_sent: payload.send_email && !!user.email,
      sms_sent: payload.send_sms && !!user.phone,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
