import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeRequest, jsonError } from '../_shared/auth.ts';

interface ReportRequest {
  type: 'revenue' | 'attendance' | 'payroll' | 'students' | 'occupancy';
  date_from?: string;
  date_to?: string;
  format?: 'json' | 'csv';
  filters?: Record<string, string>;
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

    const payload: ReportRequest = await req.json();
    const dateFrom = payload.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = payload.date_to || new Date().toISOString().split('T')[0];
    const format = payload.format || 'json';

    let data;

    switch (payload.type) {
      case 'revenue': {
        const { data: revenue } = await supabase.rpc('get_revenue_summary', {
          date_from: dateFrom, date_to: dateTo,
        });
        data = revenue;
        break;
      }

      case 'attendance': {
        const { data: attendance } = await supabase.rpc('get_attendance_summary', {
          date_from: dateFrom, date_to: dateTo,
        });
        data = attendance;
        break;
      }

      case 'payroll': {
        const { data: teachers } = await supabase
          .from('v_teacher_payroll')
          .select('*');
        data = teachers;
        break;
      }

      case 'students': {
        const { data: students } = await supabase
          .from('v_student_performance')
          .select('*');
        data = students;
        break;
      }

      case 'occupancy': {
        const { data: occupancy } = await supabase
          .from('v_course_occupancy')
          .select('*');
        data = occupancy;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid report type' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    if (format === 'csv') {
      const rows = Array.isArray(data) ? data : [data];
      if (!rows.length) {
        return new Response('No data', { status: 200, headers: { 'Content-Type': 'text/csv' } });
      }
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')),
      ].join('\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${payload.type}-report-${dateFrom}-${dateTo}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
