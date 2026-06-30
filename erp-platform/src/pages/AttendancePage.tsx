import { useState } from 'react';
import { useAttendance, useCourses } from '@/hooks/useQueries';
import { formatDate, getStatusColor, getFullName, formatTime } from '@/lib/utils';
import { Search, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [courseFilter, setCourseFilter] = useState<number | undefined>();
  const { data: courses } = useCourses();
  const { data: attendance, isLoading } = useAttendance(date, courseFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Présences</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><ClipboardCheck className="h-4 w-4" /> Pointer</button>
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
                  <td className="px-4 py-3 text-muted">{a.schedule?.course_id}</td>
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
    </div>
  );
}
