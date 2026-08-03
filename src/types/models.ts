export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'assistant' | 'teacher' | 'student' | 'parent';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  phone?: string;
  photoUrl?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
}

export interface StudentProfile extends UserProfile {
  studentType: 'regular' | 'single_session';
  registrationNumber: string;
  rfidTag?: string;
  levelId: number;
}

export interface TeacherProfile extends UserProfile {
  teachingMode: 'online' | 'onsite' | 'both';
  biography?: string;
  specialties: string[];
  rating: number;
}

export interface Course {
  id: number;
  name: string;
  type: 'normal' | 'vip' | 'private';
  capacity: number;
  currentEnrollments: number;
  price: number;
  status: 'active' | 'inactive' | 'full' | 'cancelled';
  subjectId: number;
  teacherId: string;
  roomId?: number;
  levelId: number;
  startDate: string;
  endDate: string;
}

export interface CourseSchedule {
  id: number;
  courseId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomId?: number;
  teacherId: string;
}

export interface Payment {
  id: number;
  studentId: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  paymentDate: string;
  receiptNumber: string;
  reference?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled';
  dueDate: string;
  pdfUrl?: string;
}

export interface Attendance {
  id: number;
  studentId: string;
  courseScheduleId: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
}

export interface Evaluation {
  id: number;
  studentId: string;
  teacherId: string;
  teachingQuality: number;
  communication: number;
  punctuality: number;
  organization: number;
  averageScore: number;
  comment?: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  subject?: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardKPI {
  totalRevenue: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  occupancyRate: number;
  pendingApprovals: number;
  unpaidInvoices: number;
}

export type UserRole = UserProfile['role'];

export const PERMISSIONS = {
  users: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
    approve: 'users:approve',
  },
  courses: {
    read: 'courses:read',
    create: 'courses:create',
    update: 'courses:update',
    delete: 'courses:delete',
  },
  payments: {
    read: 'payments:read',
  },
  attendance: {
    read: 'attendance:read',
    create: 'attendance:create',
  },
  reports: {
    read: 'reports:read',
    export: 'reports:export',
  },
} as const;
