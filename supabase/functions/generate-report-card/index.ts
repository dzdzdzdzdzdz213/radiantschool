import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/@pdf-lib/core';

interface ReportPayload {
  student_id: string;
  course_id?: number;
  period?: { start: string; end: string };
}

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const payload: ReportPayload = await req.json();
    if (!payload.student_id) {
      return new Response(JSON.stringify({ error: 'student_id required' }), { status: 400 });
    }

    const period = payload.period || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    };

    const [studentRes, attendanceRes, submissionsRes, enrollmentsRes] = await Promise.all([
      supabase.from('users').select('first_name, last_name, email, phone').eq('id', payload.student_id).single(),
      supabase.from('attendance').select('status, date').eq('student_id', payload.student_id).gte('date', period.start).lte('date', period.end),
      supabase.from('assignment_submissions').select('grade, feedback, assignment:assignments!inner(name, max_grade)').eq('student_id', payload.student_id),
      supabase.from('course_enrollments').select('course:courses(id, name, subject)').eq('student_id', payload.student_id).eq('status', 'active'),
    ]);

    if (studentRes.error) throw studentRes.error;
    const student = studentRes.data;

    const attendance = attendanceRes.data ?? [];
    const submissions = submissionsRes.data ?? [];
    const enrollments = enrollmentsRes.data ?? [];

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const totalCount = attendance.length;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;

    const gradedSubmissions = submissions.filter(s => s.grade != null);
    const avgGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + Number(s.grade), 0) / gradedSubmissions.length)
      : null;

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 50;

    const drawText = (text: string, opts: { x?: number; size?: number; bold?: boolean; color?: number[] } = {}) => {
      const f = opts.bold ? boldFont : font;
      page.drawText(text, {
        x: opts.x ?? 50,
        y,
        size: opts.size ?? 11,
        font: f,
        color: rgb(opts.color?.[0] ?? 0.1, opts.color?.[1] ?? 0.1, opts.color?.[2] ?? 0.1),
      });
      y -= (opts.size ?? 11) + 4;
    };

    // Header
    page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.15, 0.33, 0.78) });
    y = height - 40;
    drawText('Radiant Academy', { x: 50, size: 24, bold: true, color: [1, 1, 1] });
    drawText('Bulletin de Notes / Report Card', { x: 50, size: 14, color: [1, 1, 1] });
    drawText(`Période: ${period.start} → ${period.end}`, { x: 50, size: 10, color: [0.85, 0.85, 1] });
    y -= 20;

    // Student info
    drawText('Informations de l\'élève', { size: 14, bold: true });
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 8;
    drawText(`Nom: ${student.first_name} ${student.last_name}`);
    drawText(`Email: ${student.email ?? '—'}`);
    drawText(`Téléphone: ${student.phone ?? '—'}`);
    y -= 10;

    // Enrollment
    drawText('Cours inscrits', { size: 14, bold: true });
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 8;
    for (const enr of enrollments) {
      const c = enr.course as any;
      drawText(`• ${c.name ?? c.subject ?? 'Cours'} (${c.subject ?? ''})`);
    }
    y -= 10;

    // Attendance
    drawText('Assiduité', { size: 14, bold: true });
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 8;
    drawText(`Présent: ${presentCount} / ${totalCount} séances`);
    drawText(`Taux de présence: ${attendanceRate != null ? `${attendanceRate}%` : 'N/A'}`);
    y -= 10;

    // Grades
    drawText('Notes', { size: 14, bold: true });
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 8;

    if (gradedSubmissions.length > 0) {
      for (const s of gradedSubmissions) {
        const a = s.assignment as any;
        drawText(`${a.name}: ${s.grade}${a.max_grade ? ` / ${a.max_grade}` : ''}${s.feedback ? ` — ${s.feedback}` : ''}`);
      }
      y -= 6;
      drawText(`Moyenne générale: ${avgGrade}`, { bold: true });
    } else {
      drawText('Aucune note enregistrée pour cette période.');
    }
    y -= 10;

    // Footer
    y = 50;
    const footerText = `Généré le ${new Date().toLocaleDateString('fr-FR')} — Radiant Academy, Alger`;
    page.drawText(footerText, { x: 50, y, size: 8, font, color: rgb(0.6, 0.6, 0.6) });

    const pdfBytes = await doc.save();
    const fileName = `report-cards/${payload.student_id}/${period.start}_${period.end}.pdf`;

    await supabase.storage.from('documents').upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      student: `${student.first_name} ${student.last_name}`,
      attendance_rate: attendanceRate,
      average_grade: avgGrade,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
