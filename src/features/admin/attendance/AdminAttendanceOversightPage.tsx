import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AttendanceRegister from '@/components/attendance/AttendanceRegister';

/** Admin attendance: the monthly register across all courses. */
export default function AdminAttendanceOversightPage() {
  const { data: courses } = useQuery({
    queryKey: ['all-courses-brief-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  return <AttendanceRegister courses={courses ?? []} />;
}
