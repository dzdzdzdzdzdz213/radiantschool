import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import AttendanceRegister from '@/components/attendance/AttendanceRegister';

/** Teacher attendance: the monthly register for their own courses. */
export default function TeacherAttendancePage() {
  const { profile } = useAuth();

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses-brief', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('teacher_id', profile.id)
        .in('status', ['active', 'full'])
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  return <AttendanceRegister courses={courses ?? []} />;
}
