import { z } from 'zod/v4';

const algerianPhoneRegex = /^(\+213|0)(5|6|7)\d{8}$/;

/** Validates email + password for login. */
export const loginSchema = z.object({
  email: z.string({ message: 'validation.required' }).email({ message: 'validation.invalid_email' }),
  password: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
});

/** Validates user registration with names, email, password, role, and optional Algerian phone. */
export const registerSchema = z.object({
  firstName: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  lastName: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  email: z.string({ message: 'validation.required' }).email({ message: 'validation.invalid_email' }),
  password: z.string({ message: 'validation.required' }).min(6, { message: 'validation.min_length' }),
  role: z.enum(['student', 'parent', 'teacher', 'assistant', 'admin'], { message: 'auth.select_role' }),
  phone: z.string().regex(algerianPhoneRegex, { message: 'validation.phone_start' }).optional().or(z.literal('')),
});

/** Validates a new password (min 6 chars). */
export const passwordResetSchema = z.object({
  password: z.string({ message: 'validation.required' }).min(6, { message: 'validation.min_length' }),
});

/** Validates email for the forgot-password flow. */
export const forgotPasswordSchema = z.object({
  email: z.string({ message: 'validation.required' }).email({ message: 'validation.invalid_email' }),
});

/** Validates profile updates (names, email, optional phone). */
export const profileSchema = z.object({
  firstName: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  lastName: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  email: z.string({ message: 'validation.required' }).email({ message: 'validation.invalid_email' }),
  phone: z.string().regex(algerianPhoneRegex).optional().or(z.literal('')),
});

/** Validates student creation/edit with type, level, and registration number. */
export const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  levelId: z.number().int().positive().nullable().optional(),
  studentType: z.enum(['regular', 'vip']).default('regular'),
  registrationNumber: z.string().min(1, { message: 'validation.required' }),
});

/** Validates course creation with type, capacity, price, and required relations. */
export const courseSchema = z.object({
  name: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  type: z.enum(['normal', 'vip', 'private'], { message: 'validation.required' }),
  capacity: z.number({ message: 'validation.required' }).int().positive({ message: 'validation.required' }),
  price: z.number({ message: 'validation.required' }).positive({ message: 'validation.required' }),
  subjectId: z.number({ message: 'validation.required' }).int().positive({ message: 'validation.required' }),
  levelId: z.number({ message: 'validation.required' }).int().positive({ message: 'validation.required' }),
  teacherId: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  roomId: z.number().int().positive().nullable().optional(),
  startDate: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
  endDate: z.string({ message: 'validation.required' }).min(1, { message: 'validation.required' }),
});

/** Validates a course schedule with day, time range (HH:MM), and assigned teacher/room. */
export const scheduleSchema = z.object({
  courseId: z.number().int().positive(),
  dayOfWeek: z.enum(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  roomId: z.number().int().positive().nullable().optional(),
  teacherId: z.string().min(1),
});

/** Validates a single attendance record. */
export const attendanceSchema = z.object({
  studentId: z.string().min(1),
  courseScheduleId: z.number().int().positive(),
  date: z.string().min(1),
  status: z.enum(['present', 'absent', 'late', 'excused']),
});

/** Validates a batch of attendance records (at least one). */
export const attendanceBatchSchema = z.object({
  records: z.array(attendanceSchema).min(1),
});

/** Validates an assignment with title, description, and due date. */
export const assignmentSchema = z.object({
  courseId: z.number().int().positive(),
  teacherId: z.string().min(1),
  title: z.string().min(1, { message: 'validation.required' }),
  description: z.string().optional().or(z.literal('')),
  dueDate: z.string().min(1, { message: 'validation.required' }),
});

/** Validates a submission grade (0-20) with optional feedback. */
export const submissionGradeSchema = z.object({
  grade: z.number().int().min(0).max(20),
  feedback: z.string().optional().or(z.literal('')),
});

/** Validates a payment with amount, method, type, and optional reference/course. */
export const paymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive({ message: 'validation.required' }),
  paymentMethod: z.enum(['cash', 'card', 'check', 'transfer']),
  paymentType: z.enum(['tuition', 'registration', 'material', 'other']),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  courseId: z.number().int().positive().nullable().optional(),
});

/** Validates an invoice with amount, due date, and optional description. */
export const invoiceSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
});

/** Validates a notification with title, message, and type (defaults to info). */
export const notificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
});

/** Validates a campaign with title, message, target role, and active flag. */
export const campaignSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  targetRole: z.enum(['student', 'parent', 'teacher', 'assistant', 'admin']).nullable().optional(),
  isActive: z.boolean().default(true),
});

/** Validates a message with receiver, subject, and content. */
export const messageSchema = z.object({
  receiverId: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
});

/** Validates a room with name and capacity. */
export const roomSchema = z.object({
  name: z.string().min(1, { message: 'validation.required' }),
  capacity: z.number().int().positive({ message: 'validation.required' }),
});

/** Validates center settings (name, wilaya, notification flags). */
export const centerSettingsSchema = z.object({
  centerName: z.string().min(1),
  wilaya: z.string().min(1),
  notificationsEnabled: z.boolean(),
  smsEnabled: z.boolean(),
});

/** Validates a teacher contract with type (fixed/hourly/percentage) and rates. */
export const teacherContractSchema = z.object({
  teacherId: z.string().min(1),
  contractType: z.enum(['fixed', 'hourly', 'percentage']),
  hourlyRate: z.number().positive().nullable().optional(),
  monthlySalary: z.number().positive().nullable().optional(),
  percentage: z.number().min(0).max(100).nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
});

/** Validates parent registration including parent info, child info, and optional guardian. */
export const parentRegistrationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().regex(algerianPhoneRegex).optional().or(z.literal('')),
  childFirstName: z.string().min(1),
  childLastName: z.string().min(1),
  childLevelId: z.number().int().positive().nullable().optional(),
  guardianName: z.string().optional().or(z.literal('')),
  guardianEmail: z.string().email().optional().or(z.literal('')),
  guardianPhone: z.string().optional().or(z.literal('')),
});

/** Validates teacher profile updates with bio and specializations. */
export const teacherProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(algerianPhoneRegex).optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  specializations: z.array(z.string()).optional(),
});

/** Validates a student evaluation with score (0-20) and optional comment. */
export const evaluationSchema = z.object({
  studentId: z.string().min(1),
  teacherId: z.string().min(1),
  courseId: z.number().int().positive(),
  score: z.number().min(0).max(20).nullable().optional(),
  comment: z.string().optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
