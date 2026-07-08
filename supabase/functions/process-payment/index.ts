import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const payload: PaymentPayload = await req.json();

    // Validate required fields
    if (!payload.student_id || !payload.amount || !payload.payment_method || !payload.payment_type || !payload.recorded_by) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        student_id: payload.student_id,
        amount: payload.amount,
        payment_method: payload.payment_method,
        payment_type: payload.payment_type,
        recorded_by: payload.recorded_by,
        course_id: payload.course_id || null,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        student_id: payload.student_id,
        type: 'payment',
        amount: payload.amount,
        reference: payment.receipt_number,
        recorded_by: payload.recorded_by,
      });

    if (txError) throw txError;

    // NOTE: This multi-invoice allocation is NOT wrapped in a database transaction.
    // If the process fails after creating the payment record but before updating
    // all invoices, the payment record will exist without corresponding invoice
    // updates (known limitation of current Supabase PostgREST setup).
    if (payload.invoice_ids && payload.invoice_ids.length > 0) {
      try {
        for (const invoiceId of payload.invoice_ids) {
          const { data: invoice } = await supabase
            .from('invoices')
            .select('paid_amount, total_amount')
            .eq('id', invoiceId)
            .single();

          if (invoice) {
            const newPaid = (invoice.paid_amount || 0) + (payload.amount / payload.invoice_ids.length);
            const newStatus = newPaid >= invoice.total_amount ? 'paid' : 'partially_paid';

            const { error: updateError } = await supabase
              .from('invoices')
              .update({ paid_amount: newPaid, status: newStatus })
              .eq('id', invoiceId);

            if (updateError) throw updateError;
          }
        }
      } catch (invoiceError) {
        // Rollback: soft-delete the payment record if invoice updates fail
        await supabase.from('payments').update({ deleted_at: new Date().toISOString() }).eq('id', payment.id);
        await supabase.from('transactions').update({ deleted_at: new Date().toISOString() }).eq('reference', payment.receipt_number);
        throw invoiceError;
      }
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: payload.student_id,
        title: 'Paiement reçu',
        message: `Paiement de ${payload.amount.toLocaleString()} DA reçu (${payload.payment_method})`,
        type: 'success',
        category: 'payment',
      });

    return new Response(JSON.stringify({ success: true, payment }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
