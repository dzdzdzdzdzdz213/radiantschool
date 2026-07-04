import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface ChildInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  levelName: string | null;
  attendanceRate: number;
  pendingHomework: number;
  upcomingClasses: number;
}

export interface UpcomingClass {
  id: number;
  courseName: string;
  childName: string;
  childId: string;
  startTime: string;
  endTime: string;
  roomName: string;
  teacherName: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface PaymentRecord {
  id: number;
  studentId: string;
  childName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  reference: string | null;
}

export interface InvoiceSummary {
  id: number;
  invoiceNumber: string;
  studentId: string;
  childName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

export interface HomeworkItem {
  id: number;
  assignmentTitle: string;
  childName: string;
  childId: string;
  courseName: string;
  status: string;
  dueDate: string;
  grade: number | null;
  feedback: string | null;
}

export interface ActivityItem {
  id: number;
  childName: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface ParentKpi {
  childrenCount: number;
  totalUpcomingClasses: number;
  totalPendingHomework: number;
  overallAttendanceRate: number;
  totalOutstandingBalance: number;
  pendingInvoicesCount: number;
  unreadNotifications: number;
  totalCompletedHomework: number;
}

export function useParentDashboard() {
  const { profile } = useAuth();
  const parentId = profile?.id;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const childrenQuery = useQuery({
    queryKey: ['parent_children', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const { data: relations } = await supabase
        .from('student_parent')
        .select('student_id')
        .eq('parent_id', parentId);
      if (!relations || relations.length === 0) return [];
      const studentIds = relations.map((r) => r.student_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', studentIds);
      return (users ?? []).map((u) => ({
        id: u.id, firstName: u.first_name ?? '', lastName: u.last_name ?? '', email: u.email ?? '',
        levelName: null, attendanceRate: 0, pendingHomework: 0, upcomingClasses: 0,
      }));
    },
    enabled: !!parentId,
    staleTime: 300_000,
    gcTime: 5 * 60 * 1000,
  });

  const childrenIds = childrenQuery.data?.map((c) => c.id) ?? [];

  const kpiQuery = useQuery({
    queryKey: ['parent_dashboard_kpi', parentId, childrenIds.join(',')],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) {
        return {
          childrenCount: 0, totalUpcomingClasses: 0, totalPendingHomework: 0,
          overallAttendanceRate: 0, totalOutstandingBalance: 0, pendingInvoicesCount: 0,
          unreadNotifications: 0, totalCompletedHomework: 0,
        };
      }

      const [activeEnrollments, attendanceData, pendingHomework, completedHomework, invoices, notifications] = await Promise.all([
        supabase.from('course_enrollments')
          .select('course_id')
          .in('student_id', childrenIds)
          .eq('status', 'active')
          .then((r) => [...new Set((r.data ?? []).map((e) => e.course_id))] as number[]),
        supabase.from('attendance')
          .select('student_id, status')
          .in('student_id', childrenIds)
          .eq('date', today)
          .then((r) => {
            const records = r.data ?? [];
            const perStudent: Record<string, { present: number; absent: number; late: number; total: number }> = {};
            childrenIds.forEach((id: string) => {
              perStudent[id] = { present: 0, absent: 0, late: 0, total: 0 };
            });
            records.forEach((a) => {
              if (!perStudent[a.student_id]) return;
              perStudent[a.student_id].total += 1;
              if (a.status === 'present') perStudent[a.student_id].present += 1;
              else if (a.status === 'absent') perStudent[a.student_id].absent += 1;
              else if (a.status === 'late') perStudent[a.student_id].late += 1;
            });
            return perStudent;
          }),
        supabase.from('assignment_submissions')
          .select('id', { count: 'exact', head: true })
          .in('student_id', childrenIds)
          .eq('status', 'pending')
          .then((r) => r.count ?? 0),
        supabase.from('assignment_submissions')
          .select('id', { count: 'exact', head: true })
          .in('student_id', childrenIds)
          .eq('status', 'completed')
          .then((r) => r.count ?? 0),
        supabase.from('invoices')
          .select('id, total_amount, paid_amount, status, student_id')
          .in('student_id', childrenIds)
          .neq('status', 'paid')
          .neq('status', 'cancelled')
          .then((r) => r.data ?? []),
        supabase.from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', parentId)
          .eq('is_read', false)
          .then((r) => r.count ?? 0),
      ]);

      let upcomingCount = 0;
      if (activeEnrollments.length > 0) {
        const { count } = await supabase
          .from('course_schedules')
          .select('id', { count: 'exact', head: true })
          .in('course_id', activeEnrollments)
          .eq('day_of_week', dayName)
          .gte('start_time', currentTime);
        upcomingCount = count ?? 0;
      }

      type AttStats = { present: number; absent: number; late: number; total: number };
      const totalAttendanceEntries = Object.values(attendanceData).reduce((sum: number, s: AttStats) => sum + s.total, 0);
      const totalPresentEntries = Object.values(attendanceData).reduce((sum: number, s: AttStats) => sum + s.present, 0);
      const overallRate = totalAttendanceEntries > 0 ? Math.round((totalPresentEntries / totalAttendanceEntries) * 100) : 0;

      const outstandingBalance = invoices.reduce((sum: number, inv) =>
        sum + ((inv.total_amount ?? 0) - (inv.paid_amount ?? 0)), 0);

      return {
        childrenCount: childrenIds.length,
        totalUpcomingClasses: upcomingCount,
        totalPendingHomework: pendingHomework,
        overallAttendanceRate: overallRate,
        totalOutstandingBalance: outstandingBalance,
        pendingInvoicesCount: invoices.length,
        unreadNotifications: notifications,
        totalCompletedHomework: completedHomework,
      };
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });

  const upcomingClassesQuery = useQuery({
    queryKey: ['parent_upcoming_classes', parentId, dayName, ...childrenIds],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) return [];
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .in('student_id', childrenIds)
        .eq('status', 'active');
      const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))];
      if (courseIds.length === 0) return [];

      const { data: schedules } = await supabase
        .from('course_schedules')
        .select('id, start_time, end_time, course_id, room:rooms(name), teacher:users!teacher_id(first_name, last_name)')
        .in('course_id', courseIds)
        .eq('day_of_week', dayName)
        .order('start_time');

      const { data: courseNames } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);

      const nameMap: Record<number, string> = {};
      (courseNames ?? []).forEach((c) => { nameMap[c.id] = c.name; });

      const childNameMap: Record<string, string> = {};
      (childrenQuery.data ?? []).forEach((c) => {
        childNameMap[c.id] = `${c.firstName} ${c.lastName}`;
      });

      const { data: scheduleEnrollments } = await supabase
        .from('course_enrollments')
        .select('student_id, course_id')
        .in('student_id', childrenIds)
        .in('course_id', courseIds)
        .eq('status', 'active');

      const studentCourseMap: Record<number, string[]> = {};
      (scheduleEnrollments ?? []).forEach((e) => {
        if (!studentCourseMap[e.course_id]) studentCourseMap[e.course_id] = [];
        studentCourseMap[e.course_id].push(e.student_id);
      });

      const result: UpcomingClass[] = [];
      (schedules ?? []).forEach((s) => {
        const enrolledStudents = studentCourseMap[s.course_id] ?? [];
        enrolledStudents.forEach((sid: string) => {
          result.push({
            id: s.id,
            courseName: nameMap[s.course_id] ?? '',
            childName: childNameMap[sid] ?? '',
            childId: sid,
            startTime: s.start_time ?? '',
            endTime: s.end_time ?? '',
            roomName: s.room?.name ?? '',
            teacherName: s.teacher ? `${s.teacher.first_name ?? ''} ${s.teacher.last_name ?? ''}`.trim() : '',
          });
        });
      });

      return result;
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const recentPaymentsQuery = useQuery({
    queryKey: ['parent_recent_payments', parentId, ...childrenIds],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) return [];
      const { data } = await supabase
        .from('payments')
        .select('id, student_id, amount, payment_date, payment_method, payment_type, reference, recorded_by')
        .in('student_id', childrenIds)
        .order('payment_date', { ascending: false })
        .limit(10);

      const childNameMap: Record<string, string> = {};
      (childrenQuery.data ?? []).forEach((c) => {
        childNameMap[c.id] = `${c.firstName} ${c.lastName}`;
      });

      return (data ?? []).map((p) => ({
        id: p.id,
        studentId: p.student_id,
        childName: childNameMap[p.student_id] ?? '',
        amount: p.amount ?? 0,
        paymentDate: p.payment_date ?? '',
        paymentMethod: p.payment_method ?? '',
        paymentType: p.payment_type ?? '',
        reference: p.reference ?? null,
      })) as PaymentRecord[];
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const invoicesQuery = useQuery({
    queryKey: ['parent_invoices', parentId, ...childrenIds],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) return [];
      const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, student_id, total_amount, paid_amount, due_date, status')
        .in('student_id', childrenIds)
        .order('due_date', { ascending: false })
        .limit(10);

      const childNameMap: Record<string, string> = {};
      (childrenQuery.data ?? []).forEach((c) => {
        childNameMap[c.id] = `${c.firstName} ${c.lastName}`;
      });

      return (data ?? []).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number ?? '',
        studentId: inv.student_id,
        childName: childNameMap[inv.student_id] ?? '',
        totalAmount: inv.total_amount ?? 0,
        paidAmount: inv.paid_amount ?? 0,
        dueDate: inv.due_date ?? '',
        status: inv.status ?? '',
      })) as InvoiceSummary[];
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const homeworkQuery = useQuery({
    queryKey: ['parent_homework', parentId, ...childrenIds],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) return [];
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, student_id, status, submitted_at, grade, feedback')
        .in('student_id', childrenIds)
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (!submissions || submissions.length === 0) return [];

      const assignmentIds = [...new Set(submissions.map((s) => s.assignment_id))];
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, due_date, course_id')
        .in('id', assignmentIds);

      const assignmentMap: Record<number, { title: string; due_date: string | null; course_id: number }> = {};
      (assignments ?? []).forEach((a) => { assignmentMap[a.id] = a; });

      const courseIds = [...new Set((assignments ?? []).map((a) => a.course_id))];
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);
      const courseNameMap: Record<number, string> = {};
      (courses ?? []).forEach((c) => { courseNameMap[c.id] = c.name; });

      const childNameMap: Record<string, string> = {};
      (childrenQuery.data ?? []).forEach((c) => {
        childNameMap[c.id] = `${c.firstName} ${c.lastName}`;
      });

      return (submissions).map((s) => ({
        id: s.id,
        assignmentTitle: assignmentMap[s.assignment_id]?.title ?? '',
        childName: childNameMap[s.student_id] ?? '',
        childId: s.student_id,
        courseName: courseNameMap[assignmentMap[s.assignment_id]?.course_id] ?? '',
        status: s.status ?? '',
        dueDate: assignmentMap[s.assignment_id]?.due_date ?? '',
        grade: s.grade ?? null,
        feedback: s.feedback ?? null,
      })) as HomeworkItem[];
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: ['parent_activity', parentId, ...childrenIds],
    queryFn: async () => {
      if (!parentId || childrenIds.length === 0) return [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const childNameMap: Record<string, string> = {};
      (childrenQuery.data ?? []).forEach((c) => {
        childNameMap[c.id] = `${c.firstName} ${c.lastName}`;
      });

      const [attendanceActivity, paymentActivity, submissionActivity] = await Promise.all([
        supabase.from('attendance')
          .select('id, student_id, date, status, created_at')
          .in('student_id', childrenIds)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(10)
          .then((r) => (r.data ?? []).map((a) => ({
            id: a.id, childName: childNameMap[a.student_id] ?? '',
            type: a.status === 'present' ? 'presence' : a.status === 'absent' ? 'absence' : 'retard',
            description: `${childNameMap[a.student_id] ?? 'Élève'} ${a.status === 'present' ? 'présent' : a.status === 'absent' ? 'absent' : 'en retard'} le ${a.date ?? ''}`,
            timestamp: a.created_at ?? '',
          }))),
        supabase.from('payments')
          .select('id, student_id, amount, payment_date, created_at')
          .in('student_id', childrenIds)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(10)
          .then((r) => (r.data ?? []).map((p) => ({
            id: p.id, childName: childNameMap[p.student_id] ?? '',
            type: 'payment',
            description: `Paiement de ${p.amount ?? 0} DA pour ${childNameMap[p.student_id] ?? 'élève'}`,
            timestamp: p.created_at ?? '',
          }))),
        supabase.from('assignment_submissions')
          .select('id, student_id, grade, status, created_at, assignment:assignments!inner(title)')
          .in('student_id', childrenIds)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(10)
          .then((r) => (r.data ?? []).map((s) => ({
            id: s.id, childName: childNameMap[s.student_id] ?? '',
            type: s.status === 'completed' ? 'homework_done' : 'homework',
            description: s.assignment?.title
              ? `${childNameMap[s.student_id] ?? 'Élève'} — ${s.assignment.title}${s.grade != null ? ` : ${s.grade}/20` : ''}`
              : `Devoir ${s.status === 'completed' ? 'rendu' : 'à rendre'} par ${childNameMap[s.student_id] ?? 'élève'}`,
            timestamp: s.created_at ?? '',
          }))),
      ]);

      const allActivities: ActivityItem[] = [...attendanceActivity, ...paymentActivity, ...submissionActivity]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 15);
      return allActivities;
    },
    enabled: !!parentId && childrenIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const notificationsQuery = useQuery({
    queryKey: ['parent_notifications', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const { data } = await supabase
        .from('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', parentId)
        .order('created_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!parentId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const isLoading = childrenQuery.isLoading || kpiQuery.isLoading ||
    upcomingClassesQuery.isLoading || recentPaymentsQuery.isLoading ||
    invoicesQuery.isLoading || homeworkQuery.isLoading ||
    activityQuery.isLoading || notificationsQuery.isLoading;

  const isError = childrenQuery.isError || kpiQuery.isError ||
    upcomingClassesQuery.isError || recentPaymentsQuery.isError ||
    invoicesQuery.isError || homeworkQuery.isError ||
    activityQuery.isError || notificationsQuery.isError;

  return {
    kpi: kpiQuery.data ?? {
      childrenCount: 0, totalUpcomingClasses: 0, totalPendingHomework: 0,
      overallAttendanceRate: 0, totalOutstandingBalance: 0, pendingInvoicesCount: 0,
      unreadNotifications: 0, totalCompletedHomework: 0,
    },
    children: childrenQuery.data ?? [],
    upcomingClasses: upcomingClassesQuery.data ?? [],
    recentPayments: recentPaymentsQuery.data ?? [],
    invoices: invoicesQuery.data ?? [],
    homeworkItems: homeworkQuery.data ?? [],
    activities: activityQuery.data ?? [],
    notifications: notificationsQuery.data ?? [],
    isLoading,
    isError,
    childrenLoading: childrenQuery.isLoading,
  };
}
