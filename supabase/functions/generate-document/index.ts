import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function certificateHtml(student: Record<string, any>, enrollment: any, today: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Attestation d'inscription</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
  .border { border: 3px double #2563eb; padding: 40px; max-width: 700px; margin: 0 auto; }
  h1 { text-align: center; color: #2563eb; font-size: 22px; margin: 0 0 8px; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 30px; }
  h2 { text-align: center; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
  .content { line-height: 2; font-size: 14px; }
  .content strong { color: #1e293b; }
  .signature { margin-top: 40px; text-align: right; font-size: 13px; }
  .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style></head><body>
<div class="border">
  <h1>Radiant Academy</h1>
  <p class="subtitle">Centre de formation et d'enseignement — Alger</p>
  <h2>ATTESTATION D'INSCRIPTION</h2>
  <div class="content">
    <p>Je soussigné, Directeur de <strong>Radiant Academy</strong>, atteste que :</p>
    <p style="text-align:center;font-size:18px;font-weight:bold;margin:16px 0;">${student.first_name} ${student.last_name}</p>
    <p>est régulièrement inscrit(e) pour l'année scolaire en cours dans le cours de <strong>${enrollment.course?.name || enrollment.course?.subject || ''}</strong>.</p>
    <p>La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
  </div>
  <div class="signature">
    <p>Fait à Alger, le ${today}</p>
    <p style="margin-top:32px;"><em>Le Directeur</em></p>
  </div>
  <div class="footer">Radiant Academy — Alger, Algérie</div>
</div>
</body></html>`;
}

function receiptHtml(payment: Record<string, any>, student: Record<string, any>, today: string) {
  const amount = Number(payment.amount).toLocaleString('fr-FR');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Reçu de paiement</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
  .border { border: 2px solid #333; padding: 30px; max-width: 600px; margin: 0 auto; }
  h1 { text-align: center; font-size: 20px; margin: 0 0 4px; }
  .receipt-no { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  td { padding: 6px 8px; font-size: 13px; }
  td:last-child { text-align: right; font-weight: bold; }
  .total { border-top: 2px solid #333; font-size: 15px; font-weight: bold; }
  .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 24px; }
</style></head><body>
<div class="border">
  <h1>Radiant Academy</h1>
  <p class="receipt-no">Reçu n° ${payment.receipt_number || payment.id || ''}</p>
  <table>
    <tr><td>Date</td><td>${today}</td></tr>
    <tr><td>Élève</td><td>${student.first_name} ${student.last_name}</td></tr>
    <tr><td>Mode de paiement</td><td>${payment.payment_method || ''}</td></tr>
    <tr><td>Type</td><td>${payment.payment_type || ''}</td></tr>
    <tr class="total"><td>Montant</td><td>${amount} DZD</td></tr>
  </table>
  <div class="footer">Radiant Academy — Alger, Algérie</div>
</div>
</body></html>`;
}

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { type, entity_id } = await req.json();
    if (!type || !entity_id) return new Response(JSON.stringify({ error: 'type and entity_id required' }), { status: 400 });

    const today = new Date().toLocaleDateString('fr-FR');
    let html: string;
    let fileName: string;

    if (type === 'certificate') {
      const { data: student } = await supabase.from('users').select('*').eq('id', entity_id).single();
      if (!student) return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course:courses(name, subject)')
        .eq('student_id', entity_id)
        .eq('status', 'active')
        .limit(1);

      html = certificateHtml(student, (enrollments ?? [])[0] || {}, today);
      fileName = `documents/certificates/${entity_id}.html`;
    } else if (type === 'receipt') {
      const { data: payment } = await supabase.from('payments').select('*, student:students!student_id(user:users!students_id_fkey(id, first_name, last_name))').eq('id', entity_id).single();
      if (!payment) return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404 });

      const student = (payment as any).student?.user || {};
      html = receiptHtml(payment, student, today);
      fileName = `documents/receipts/${entity_id}.html`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type. Use certificate or receipt' }), { status: 400 });
    }

    await supabase.storage.from('documents').upload(fileName, new TextEncoder().encode(html), {
      contentType: 'text/html', upsert: true,
    });

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
