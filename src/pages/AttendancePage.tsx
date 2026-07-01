import { useState } from 'react';
import { useAttendance, useCourses } from '@/hooks/useQueries';
import { formatDate, getStatusColor, getFullName, formatTime } from '@/lib/utils';
import { Search, ClipboardCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

export default function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [courseFilter, setCourseFilter] = useState<number | undefined>();
  const { data: courses } = useCourses();
  const { data: attendance, isLoading } = useAttendance(date, courseFilter);
  const { toast } = useToast();
  const [showPointer, setShowPointer] = useState(false);
  const [pointerLoading, setPointerLoading] = useState(false);
  const [pointerStudents, setPointerStudents] = useState<any[]>([]);
  const [pointerStatuses, setPointerStatuses] = useState<Record<string, string>>({});

  const handlePointer = async () => {
    if (!courseFilter) {
      toast('Sélectionnez un cours', 'error');
      return;
    }
    setShowPointer(true);
    setPointerLoading(true);
    const { data, error } = await (supabase as any)
      .from('course_enrollments')
      .select('student:users!student_id(id, first_name, last_name)')
      .eq('course_id', courseFilter)
      .in('status', ['enrolled', 'active']);
    if (error) {
      toast(error.message, 'error');
      setPointerLoading(false);
      return;
    }
    const students = (data?.map((e: any) => e.student) ?? []).filter(Boolean);
    setPointerStudents(students);
    const init: Record<string, string> = {};
    students.forEach((s: any) => { init[s.id] = 'present'; });
    setPointerStatuses(init);
    setPointerLoading(false);
  };

  const handleSubmitAttendance = async () => {
    if (pointerStudents.length === 0) return;
    const records = pointerStudents.map((s: any) => ({
      student_id: s.id,
      date,
      status: pointerStatuses[s.id] || 'present',
    }));
    const { error } = await (supabase as any).from('attendance').insert(records);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Présences enregistrées', 'success');
      setShowPointer(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Présences</h1>
        <button onClick={handlePointer} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><ClipboardCheck className="h-4 w-4" /> Pointer</button>
      </div>
      <div className="flex gap-4">
        <div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <select value={courseFilter ?? ''} onChange={(e) => setCourseFilter(e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous les cours</option>
          {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : attendance && attendance.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted">
                <th className="px-4 py-3 font-medium">Élève</th>
                <th className="px-4 py-3 font-medium">Cours</th>
                <th className="px-4 py-3 font-medium">Horaires</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Arrivée</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a: any) => (
                <tr key={a.id} className="border-b text-sm last:border-0">
                  <td className="px-4 py-3 font-medium">{getFullName(a.student.first_name, a.student.last_name)}</td>
                  <td className="px-4 py-3 text-muted">{courses?.find((c: any) => c.id === a.schedule?.course_id)?.name ?? a.schedule?.course_id}</td>
                  <td className="px-4 py-3 text-muted">{a.schedule ? `${formatTime(a.schedule.start_time)} - ${formatTime(a.schedule.end_time)}` : '-'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-muted">{a.check_in_time ? formatTime(a.check_in_time) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted">Aucune présence enregistrée pour cette date</div>
        )}
      </div>
      {showPointer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPointer(false)}>
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pointer les présences</h2>
              <button onClick={() => setShowPointer(false)} className="rounded p-1 hover:bg-page"><X className="h-5 w-5" /></button>
            </div>
            {pointerLoading ? (
              <div className="py-8 text-center text-muted">Chargement des élèves...</div>
            ) : pointerStudents.length === 0 ? (
              <div className="py-8 text-center text-muted">Aucun élève inscrit à ce cours</div>
            ) : (
              <div className="space-y-3">
                {pointerStudents.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <span className="font-medium text-sm">{s.first_name} {s.last_name}</span>
                    <select
                      value={pointerStatuses[s.id]}
                      onChange={e => setPointerStatuses(p => ({ ...p, [s.id]: e.target.value }))}
                      className="rounded-lg border px-3 py-1.5 text-sm"
                    >
                      <option value="present">Présent</option>
                      <option value="late">Retard</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                ))}
                <button onClick={handleSubmitAttendance} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90">
                  Enregistrer les présences
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
