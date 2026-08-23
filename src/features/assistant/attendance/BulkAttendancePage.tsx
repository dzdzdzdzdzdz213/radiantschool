import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AttendanceRegister from '@/components/attendance/AttendanceRegister';

/** Assistant attendance: the monthly register across all active courses. */
export default function BulkAttendancePage() {
  const { data: courses } = useQuery({
    queryKey: ['all-active-courses-brief'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .in('status', ['active', 'full'])
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  return <AttendanceRegister courses={courses ?? []} />;
}
