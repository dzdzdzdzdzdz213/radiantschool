import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error: sessErr } = await supabase
      .from('attendance_sessions')
      .select('id, date, title, course_id, courses(name)')
      .lt('check_in_closed_at', twoHoursAgo)
      .is('validated_at', null)
      .limit(20);

    if (sessErr) throw sessErr;
    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const session of sessions) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select(`
          status, student_id,
          students!inner(user:users(id, first_name, last_name))
        `)
        .eq('session_id', session.id);

      const all = records || [];
      const total = all.length;
      const present = all.filter((r: any) => r.status === 'present').length;
      const absent = all.filter((r: any) => r.status === 'absent').length;
      const late = all.filter((r: any) => r.status === 'late').length;
      const absentStudents = all
        .filter((r: any) => r.status === 'absent')
        .map((r: any) => `${r.students?.user?.first_name ?? ''} ${r.students?.user?.last_name ?? ''}`)
        .join(', ');

      const courseName = (session as any).courses?.name ?? '';

      const summary =
        `Résumé de présence pour "${session.title}" - ${courseName}\n\n` +
        `Total: ${total} élèves\nPrésents: ${present}\nAbsents: ${absent}\nRetards: ${late}\n\n` +
        (absent > 0 ? `Élèves absents: ${absentStudents}` : 'Tous les élèves étaient présents.');

      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          await supabase.functions.invoke('send-notification', {
            body: {
              user_id: admin.id,
              title: `Feuille de présence - ${courseName}`,
              message: summary,
              type: 'info',
              category: 'attendance',
              send_email: true,
              from_name: 'Radiant Academy',
            },
          });
        }
      }

      await supabase
        .from('attendance_sessions')
        .update({ validated_at: new Date().toISOString() })
        .eq('id', session.id);
    }

    return new Response(JSON.stringify({ sent: sessions.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
