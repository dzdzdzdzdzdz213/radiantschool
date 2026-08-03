import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface AssistantKpi {
  todayRegistrations: number;
  pendingRegistrations: number;
  todayAttendance: number;
  absentStudents: number;
  todayRevenue: number;
  pendingPayments: number;
  invoicesGenerated: number;
  rfidScansToday: number;
  upcomingClasses: number;
  waitingList: number;
  privateLessonRequests: number;
  vipStudentsToday: number;
}

export interface QuickAction {
  label: string;
  icon: string;
  path: string;
  description: string;
}

export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: { label: string; path: string };
}

export interface PendingRegistration {
  id: string;
  studentName: string;
  courseName: string;
  requestedAt: string;
  status: string;
}

export interface OverduePayment {
  id: string;
  studentName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  email?: string | null;
  phone?: string | null;
}

export interface RoomStatus {
  id: string;
  name: string;
  capacity: number;
  status: string;
  currentCourse?: string;
}

export interface ActiveTeacher {
  id: string;
  name: string;
  course: string;
  room: string;
  time: string;
}

export interface ScheduleItem {
  id: string;
  courseName: string;
  teacherName: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

export interface RfidRecord {
  id: string;
  studentName: string;
  scannedAt: string;
  status: string;
}

export function useAssistantDashboard(lang: string = 'fr') {
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const kpiQuery = useQuery({
    queryKey: ['assistant_dashboard_kpi', today],
    queryFn: async () => {
      const [registrations, pendingReg, attendance, absent, revenue, payments, invoices, rfid, classes, waiting, privateLessons, vip] = await Promise.all([
        api.rpc<number>('get_dashboard_stats', { stat: 'today_registrations' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'pending_registrations' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'today_attendance' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'absent_today' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'today_revenue' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'pending_payments' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'invoices_month' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'rfid_scans_today' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'upcoming_classes' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'waiting_list' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'private_lesson_requests' }).catch(() => 0),
        api.rpc<number>('get_dashboard_stats', { stat: 'vip_students_today' }).catch(() => 0),
      ]);
      return {
        todayRegistrations: registrations ?? 0,
        pendingRegistrations: pendingReg ?? 0,
        todayAttendance: attendance ?? 0,
        absentStudents: absent ?? 0,
        todayRevenue: revenue ?? 0,
        pendingPayments: payments ?? 0,
        invoicesGenerated: invoices ?? 0,
        rfidScansToday: rfid ?? 0,
        upcomingClasses: classes ?? 0,
        waitingList: waiting ?? 0,
        privateLessonRequests: privateLessons ?? 0,
        vipStudentsToday: vip ?? 0,
      } as AssistantKpi;
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const pendingRegistrationsQuery = useQuery({
    queryKey: ['assistant_pending_registrations', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_enrollments')
        .select('id, status, enrollment_date, student:students!student_id(user:users!students_id_fkey(first_name, last_name)), course:courses(name)')
        .eq('status', 'pending_approval')
        .order('enrollment_date', { ascending: false })
        .limit(10);
      return (data ?? []).map((r) => ({
        id: String(r.id),
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        courseName: r.course?.name ?? 'Inconnu',
        requestedAt: r.enrollment_date,
        status: r.status,
      })) as unknown as PendingRegistration[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const overduePaymentsQuery = useQuery({
    queryKey: ['assistant_overdue_payments', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('id, total_amount, paid_amount, due_date, student:students!student_id(user:users!students_id_fkey(first_name, last_name, email, phone))')
        .in('status', ['unpaid', 'partially_paid'])
        .lt('due_date', today)
        .order('due_date', { ascending: true })
        .limit(10);
      return (data ?? []).map((r) => ({
        id: String(r.id),
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        amount: (r.total_amount ?? 0) - (r.paid_amount ?? 0),
        dueDate: r.due_date,
        daysOverdue: Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000),
        email: r.student?.user?.email ?? null,
        phone: r.student?.user?.phone ?? null,
      })) as unknown as OverduePayment[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const activeTeachersQuery = useQuery({
    queryKey: ['assistant_active_teachers', today],
    queryFn: async () => {
      const dayName = (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const)[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const { data } = await supabase
        .from('course_schedules')
        .select('id, start_time, end_time, course:courses!inner(name, room_id), teacher:users(first_name, last_name), room:rooms(name)')
        .eq('day_of_week', dayName)
        .lte('start_time', currentTime)
        .gte('end_time', currentTime)
        .limit(20);
      return (data ?? []).map((r) => ({
        id: String(r.id),
        name: r.teacher ? `${r.teacher.first_name ?? ''} ${r.teacher.last_name ?? ''}` : 'Inconnu',
        course: r.course?.name ?? '',
        room: r.room?.name ?? '',
        time: `${r.start_time?.slice(0, 5) ?? ''} - ${r.end_time?.slice(0, 5) ?? ''}`,
      })) as unknown as ActiveTeacher[];
    },
    enabled: true,
    refetchInterval: 60_000,
  });

  const rfidQuery = useQuery({
    queryKey: ['assistant_rfid_today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance')
        .select('id, date, status, created_at, student:students!student_id(user:users!students_id_fkey(first_name, last_name))')
        .eq('date', today)
        .eq('method', 'rfid')
        .order('created_at', { ascending: false })
        .limit(10);
      return (data ?? []).map((r) => ({
        id: String(r.id),
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        scannedAt: r.created_at ? new Date(r.created_at).toLocaleTimeString(localeMap[lang], { hour: '2-digit', minute: '2-digit' }) : '',
        status: r.status === 'present' ? 'success' : 'failed',
      })) as unknown as RfidRecord[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const alertsQuery = useQuery({
    queryKey: ['assistant_alerts', today],
    queryFn: async () => {
      const alerts: DashboardAlert[] = [];
      const kpi = kpiQuery.data;
      if (!kpi) return alerts;
      if (kpi.pendingRegistrations > 0) {
        alerts.push({
          id: 'pending-reg',
          severity: 'warning',
          title: `${kpi.pendingRegistrations} inscription${kpi.pendingRegistrations > 1 ? 's' : ''} en attente`,
          description: 'Ces inscriptions nécessitent une validation manuelle',
          action: { label: 'Voir', path: '/assistant/registrations' },
        });
      }
      if (kpi.absentStudents > 3) {
        alerts.push({
          id: 'absent-alert',
          severity: 'warning',
          title: `${kpi.absentStudents} élève${kpi.absentStudents > 1 ? 's' : ''} absent${kpi.absentStudents > 1 ? 's' : ''} aujourd'hui`,
          description: 'Taux d\'absence élevé signalé',
          action: { label: 'Voir', path: '/assistant/attendance' },
        });
      }
      if (kpi.waitingList > 0) {
        alerts.push({
          id: 'waiting',
          severity: 'info',
          title: `${kpi.waitingList} élève${kpi.waitingList > 1 ? 's' : ''} en liste d'attente`,
          description: 'Des places peuvent être disponibles',
          action: { label: 'Voir', path: '/assistant/registrations' },
        });
      }
      return alerts;
    },
    enabled: !!kpiQuery.data,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const quickActions: QuickAction[] = [
    { label: 'Créer une classe', icon: 'GraduationCap', path: '/assistant/groups', description: 'Ajouter un groupe' },
    { label: 'Inscrire un élève', icon: 'UserPlus', path: '/assistant/students/new', description: 'Nouvelle inscription' },
    { label: 'Créer une facture', icon: 'FileText', path: '/assistant/invoices/new', description: 'Générer une facture' },
    { label: 'Prendre les présences', icon: 'ClipboardCheck', path: '/assistant/attendance', description: 'Relevé du jour' },
    { label: 'Scanner RFID', icon: 'ClipboardCheck', path: '/assistant/rfid', description: 'Scan par badge' },
    { label: 'Assigner un groupe', icon: 'Users', path: '/assistant/groups', description: 'Affecter un élève' },
    { label: 'Planifier un cours', icon: 'Calendar', path: '/assistant/schedules', description: 'Ajouter au planning' },
    { label: 'Envoyer notification', icon: 'Bell', path: '/assistant/notifications', description: 'Alerter les parents' },
    { label: 'Générer rapport', icon: 'BarChart3', path: '/assistant/reports', description: 'Export des données' },
    { label: 'Uploader ressource', icon: 'FileText', path: '/assistant/resources', description: 'Partager un document' },
  ];

  const scheduleQuery = activeTeachersQuery;
  const scheduleData = scheduleQuery.data ?? [];
  const scheduleLoading = scheduleQuery.isLoading;
  const rfidData = rfidQuery.data ?? [];

  const isLoading = kpiQuery.isLoading || pendingRegistrationsQuery.isLoading || overduePaymentsQuery.isLoading || activeTeachersQuery.isLoading || scheduleQuery.isLoading || rfidQuery.isLoading || alertsQuery.isLoading;
  const isError = kpiQuery.isError || pendingRegistrationsQuery.isError || overduePaymentsQuery.isError || activeTeachersQuery.isError || scheduleQuery.isError || rfidQuery.isError || alertsQuery.isError;

  return {
    kpi: kpiQuery.data ?? {
      todayRegistrations: 0, pendingRegistrations: 0, todayAttendance: 0,
      absentStudents: 0, todayRevenue: 0, pendingPayments: 0,
      invoicesGenerated: 0, rfidScansToday: 0, upcomingClasses: 0,
      waitingList: 0, privateLessonRequests: 0, vipStudentsToday: 0,
    },
    pendingRegistrations: pendingRegistrationsQuery.data ?? [],
    overduePayments: overduePaymentsQuery.data ?? [],
    activeTeachers: activeTeachersQuery.data ?? [],
    alerts: alertsQuery.data ?? [],
    quickActions,
    scheduleData,
    scheduleLoading,
    rfidData,
    isLoading,
    isError,
  };
}