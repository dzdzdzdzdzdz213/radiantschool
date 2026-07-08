import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PayrollItem {
  teacher_id: string;
  teacher_name: string;
  contract_type: 'fixed' | 'hourly' | 'percentage';
  hourly_rate: number;
  percentage_rate: number;
  fixed_salary: number;
  hours_worked: number;
  revenue_generated: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
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
    const { month, year } = await req.json();
    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const monthEnd = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const { data: contracts } = await supabase
      .from('teacher_contracts')
      .select(`
        id, teacher_id, contract_type, hourly_rate, percentage_rate, fixed_salary,
        teacher:users(first_name, last_name)
      `)
      .eq('status', 'active');

    if (!contracts) {
      return new Response(JSON.stringify({ error: 'No contracts found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    const payroll: PayrollItem[] = [];

    for (const contract of contracts) {
      let hoursWorked = 0;
      let revenueGenerated = 0;

      const { data: schedules } = await supabase
        .from('course_schedules')
        .select('id, start_time, end_time')
        .eq('teacher_id', contract.teacher_id);

      if (schedules) {
        for (const schedule of schedules) {
          const startParts = schedule.start_time.split(':');
          const endParts = schedule.end_time.split(':');
          const hours = parseInt(endParts[0]) - parseInt(startParts[0]) +
            (parseInt(endParts[1]) - parseInt(startParts[1])) / 60;
          hoursWorked += hours;

          const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
          let attendanceCount = 0;

          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const { count } = await supabase
              .from('attendance')
              .select('*', { count: 'exact', head: true })
              .eq('course_schedule_id', schedule.id)
              .eq('date', dateStr)
              .in('status', ['present', 'late']);
            attendanceCount += count ?? 0;
          }

          const totalHours = hours * attendanceCount;
          hoursWorked = hoursWorked - hours + totalHours;
        }
      }

      const { data: courseIds } = await supabase
        .from('course_schedules')
        .select('course_id')
        .eq('teacher_id', contract.teacher_id);

      if (courseIds && courseIds.length > 0) {
        const ids = [...new Set(courseIds.map(c => c.course_id))];
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .in('course_id', ids)
          .gte('payment_date', monthStart)
          .lte('payment_date', monthEnd);

        if (payments) {
          revenueGenerated = payments.reduce((sum, p) => sum + p.amount, 0);
        }
      }

      let grossPay = 0;
      switch (contract.contract_type) {
        case 'fixed':
          grossPay = contract.fixed_salary ?? 0;
          break;
        case 'hourly':
          grossPay = (contract.hourly_rate ?? 0) * hoursWorked;
          break;
        case 'percentage':
          grossPay = revenueGenerated * ((contract.percentage_rate ?? 0) / 100);
          break;
      }

      const deductions = grossPay * 0.09;
      const netPay = grossPay - deductions;

      payroll.push({
        teacher_id: contract.teacher_id,
        teacher_name: `${contract.teacher?.first_name ?? ''} ${contract.teacher?.last_name ?? ''}`.trim(),
        contract_type: contract.contract_type,
        hourly_rate: contract.hourly_rate ?? 0,
        percentage_rate: contract.percentage_rate ?? 0,
        fixed_salary: contract.fixed_salary ?? 0,
        hours_worked: Math.round(hoursWorked * 100) / 100,
        revenue_generated: Math.round(revenueGenerated * 100) / 100,
        gross_pay: Math.round(grossPay * 100) / 100,
        deductions: Math.round(deductions * 100) / 100,
        net_pay: Math.round(netPay * 100) / 100,
      });
    }

    return new Response(JSON.stringify({ month: targetMonth, year: targetYear, payroll }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
