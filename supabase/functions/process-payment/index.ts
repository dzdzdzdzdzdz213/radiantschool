import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeRequest, jsonError } from '../_shared/auth.ts';

interface PaymentPayload {
  student_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'check';
  payment_type: 'monthly' | 'per_session' | 'vip' | 'private';
  recorded_by: string;
  invoice_ids?: number[];
  course_id?: number;
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
    const auth = await authorizeRequest(req, supabase, ['admin', 'assistant']);
    if (!auth.ok) return jsonError(auth.status, auth.error);
    const caller = auth.user;

    const payload: PaymentPayload = await req.json();

    // Validate required fields
    if (!payload.student_id || !payload.amount || !payload.payment_method || !payload.payment_type || !payload.recorded_by) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cross-check recorded_by against the authenticated caller
    if (payload.recorded_by !== caller.id) {
      return new Response(JSON.stringify({ error: 'recorded_by must match the authenticated caller' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (payload.amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be positive' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const validMethods = ['cash', 'bank_transfer', 'card', 'check'];
    if (!validMethods.includes(payload.payment_method)) {
      return new Response(JSON.stringify({ error: 'Invalid payment method' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify student exists
    const { data: student } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', payload.student_id)
      .single();

    if (!student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create payment + transaction + invoice allocations + notification
    // atomically in the database (process_payment_tx).
    const { data: result, error: rpcError } = await supabase.rpc('process_payment_tx', {
      p_student_id: payload.student_id,
      p_amount: payload.amount,
      p_payment_method: payload.payment_method,
      p_payment_type: payload.payment_type,
      p_recorded_by: payload.recorded_by,
      p_course_id: payload.course_id ?? null,
      p_invoice_ids: payload.invoice_ids ?? null,
    });

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify(result), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
