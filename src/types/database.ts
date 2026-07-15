export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          course_id: number | null
          created_at: string
          id: number
          is_pinned: boolean
          teacher_id: string | null
          title: string
        }
        Insert: {
          content: string
          course_id?: number | null
          created_at?: string
          id?: number
          is_pinned?: boolean
          teacher_id?: string | null
          title: string
        }
        Update: {
          content?: string
          course_id?: number | null
          created_at?: string
          id?: number
          is_pinned?: boolean
          teacher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "announcements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "announcements_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approved_by: string
          comment: string | null
          created_at: string
          entity_id: number
          entity_type: string
          expires_at: string
          id: number
          responded_at: string | null
          role: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approved_by: string
          comment?: string | null
          created_at?: string
          entity_id: number
          entity_type: string
          expires_at?: string
          id?: number
          responded_at?: string | null
          role: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approved_by?: string
          comment?: string | null
          created_at?: string
          entity_id?: number
          entity_type?: string
          expires_at?: string
          id?: number
          responded_at?: string | null
          role?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: number
          created_at: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          id: number
          status: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: number
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: number
          status?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: number
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: number
          status?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: number
          created_at: string
          description: string | null
          due_date: string | null
          file_url: string | null
          id: number
          max_grade: number | null
          teacher_id: string
          title: string
        }
        Insert: {
          course_id: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: number
          max_grade?: number | null
          teacher_id: string
          title: string
        }
        Update: {
          course_id?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: number
          max_grade?: number | null
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assistants: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistants_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in_closed_at: string | null
          check_in_time: string | null
          course_schedule_id: number
          created_at: string
          date: string
          id: number
          method: Database["public"]["Enums"]["attendance_method"]
          notes: string | null
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          check_in_closed_at?: string | null
          check_in_time?: string | null
          course_schedule_id: number
          created_at?: string
          date: string
          id?: number
          method?: Database["public"]["Enums"]["attendance_method"]
          notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          check_in_closed_at?: string | null
          check_in_time?: string | null
          course_schedule_id?: number
          created_at?: string
          date?: string
          id?: number
          method?: Database["public"]["Enums"]["attendance_method"]
          notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_schedule"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          check_in_closed_at: string | null
          created_at: string
          id: number
          session_id: number
          status: string
          student_id: string
        }
        Insert: {
          check_in_closed_at?: string | null
          created_at?: string
          id?: number
          session_id: number
          status?: string
          student_id: string
        }
        Update: {
          check_in_closed_at?: string | null
          created_at?: string
          id?: number
          session_id?: number
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          check_in_closed_at: string | null
          check_in_opened_at: string | null
          course_id: number
          created_at: string
          date: string
          id: number
          price_calculated: number | null
          schedule_id: number | null
          session_price_formula: string | null
          status: string
          title: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          check_in_closed_at?: string | null
          check_in_opened_at?: string | null
          course_id: number
          created_at?: string
          date: string
          id?: number
          price_calculated?: number | null
          schedule_id?: number | null
          session_price_formula?: string | null
          status?: string
          title?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          check_in_closed_at?: string | null
          check_in_opened_at?: string | null
          course_id?: number
          created_at?: string
          date?: string
          id?: number
          price_calculated?: number | null
          schedule_id?: number | null
          session_price_formula?: string | null
          status?: string
          title?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "attendance_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "v_upcoming_schedule"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "attendance_sessions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      backups: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          id: number
          status: Database["public"]["Enums"]["backup_status"]
          type: Database["public"]["Enums"]["backup_type"]
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          id?: number
          status?: Database["public"]["Enums"]["backup_status"]
          type: Database["public"]["Enums"]["backup_type"]
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          id?: number
          status?: Database["public"]["Enums"]["backup_status"]
          type?: Database["public"]["Enums"]["backup_type"]
        }
        Relationships: []
      }
      campaign_courses: {
        Row: {
          campaign_id: number
          course_id: number
          created_at: string
          id: number
          price_override: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: number
          course_id: number
          created_at?: string
          id?: number
          price_override?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: number
          course_id?: number
          created_at?: string
          id?: number
          price_override?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_courses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: number
          is_active: boolean
          max_seats: number | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: number
          is_active?: boolean
          max_seats?: number | null
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: number
          is_active?: boolean
          max_seats?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      center_settings: {
        Row: {
          address: string | null
          auto_invoice: boolean
          center_name: string
          created_at: string
          currency: string
          email_notifications: boolean
          id: number
          phone: string | null
          sms_notifications: boolean
          updated_at: string
          wilaya: string | null
        }
        Insert: {
          address?: string | null
          auto_invoice?: boolean
          center_name?: string
          created_at?: string
          currency?: string
          email_notifications?: boolean
          id?: number
          phone?: string | null
          sms_notifications?: boolean
          updated_at?: string
          wilaya?: string | null
        }
        Update: {
          address?: string | null
          auto_invoice?: boolean
          center_name?: string
          created_at?: string
          currency?: string
          email_notifications?: boolean
          id?: number
          phone?: string | null
          sms_notifications?: boolean
          updated_at?: string
          wilaya?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: number | null
          created_at: string
          description: string | null
          expiry_date: string | null
          id: number
          issued_date: string
          student_id: string
          title: string
        }
        Insert: {
          certificate_url?: string | null
          course_id?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: number
          issued_date?: string
          student_id: string
          title: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: number
          issued_date?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: number
          last_message: string | null
          last_message_at: string | null
          parent_id: string | null
          participant_id: string
          student_id: string | null
          teacher_id: string | null
          unread: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          last_message?: string | null
          last_message_at?: string | null
          parent_id?: string | null
          participant_id: string
          student_id?: string | null
          teacher_id?: string | null
          unread?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          last_message?: string | null
          last_message_at?: string | null
          parent_id?: string | null
          participant_id?: string
          student_id?: string | null
          teacher_id?: string | null
          unread?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "conversations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "conversations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          campaign_id: number | null
          course_id: number
          created_at: string
          enrollment_date: string
          id: number
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          campaign_id?: number | null
          course_id: number
          created_at?: string
          enrollment_date?: string
          id?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          campaign_id?: number | null
          course_id?: number
          created_at?: string
          enrollment_date?: string
          id?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      course_schedules: {
        Row: {
          course_id: number
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id: number
          room_id: number | null
          start_time: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id?: number
          room_id?: number | null
          start_time: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          end_time?: string
          id?: number
          room_id?: number | null
          start_time?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_schedules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_course_schedules_teacher"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          capacity: number
          created_at: string
          current_enrollments: number | null
          description: string | null
          end_date: string
          id: number
          image_url: string | null
          level_id: number
          name: string
          price: number
          room_id: number | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"]
          subject_id: number
          teacher_id: string
          type: Database["public"]["Enums"]["course_type"]
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          current_enrollments?: number | null
          description?: string | null
          end_date: string
          id?: number
          image_url?: string | null
          level_id: number
          name: string
          price: number
          room_id?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["course_status"]
          subject_id: number
          teacher_id: string
          type?: Database["public"]["Enums"]["course_type"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_enrollments?: number | null
          description?: string | null
          end_date?: string
          id?: number
          image_url?: string | null
          level_id?: number
          name?: string
          price?: number
          room_id?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          subject_id?: number
          teacher_id?: string
          type?: Database["public"]["Enums"]["course_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "fk_courses_teacher"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          average_score: number | null
          comment: string | null
          communication: number
          created_at: string
          id: number
          organization: number
          punctuality: number
          student_id: string
          teacher_id: string
          teaching_quality: number
        }
        Insert: {
          average_score?: number | null
          comment?: string | null
          communication: number
          created_at?: string
          id?: number
          organization: number
          punctuality: number
          student_id: string
          teacher_id: string
          teaching_quality: number
        }
        Update: {
          average_score?: number | null
          comment?: string | null
          communication?: number
          created_at?: string
          id?: number
          organization?: number
          punctuality?: number
          student_id?: string
          teacher_id?: string
          teaching_quality?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "evaluations_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          course_id: number | null
          created_at: string
          description: string
          id: number
          invoice_id: number
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string
          description: string
          id?: number
          invoice_id: number
          quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          course_id?: number | null
          created_at?: string
          description?: string
          id?: number
          invoice_id?: number
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          deleted_at: string | null
          due_date: string
          id: number
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          due_date: string
          id?: number
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          due_date?: string
          id?: number
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      level_subject: {
        Row: {
          created_at: string
          id: number
          level_id: number
          subject_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          level_id: number
          subject_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          level_id?: number
          subject_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "level_subject_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "level_subject_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          category: Database["public"]["Enums"]["level_category"]
          created_at: string
          id: number
          name: string
          sort_order: number | null
          stream: string | null
          year: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["level_category"]
          created_at?: string
          id?: number
          name: string
          sort_order?: number | null
          stream?: string | null
          year?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["level_category"]
          created_at?: string
          id?: number
          name?: string
          sort_order?: number | null
          stream?: string | null
          year?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          id: number
          is_read: boolean
          parent_message_id: number | null
          read_at: string | null
          receiver_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read?: boolean
          parent_message_id?: number | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read?: boolean
          parent_message_id?: number | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          deleted_at: string | null
          id: number
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      online_classes: {
        Row: {
          course_id: number | null
          created_at: string
          description: string | null
          end_time: string | null
          id: number
          meeting_url: string | null
          platform: string | null
          start_time: string | null
          status: string
          teacher_id: string
          title: string
        }
        Insert: {
          course_id?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          meeting_url?: string | null
          platform?: string | null
          start_time?: string | null
          status?: string
          teacher_id: string
          title: string
        }
        Update: {
          course_id?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          meeting_url?: string | null
          platform?: string | null
          start_time?: string | null
          status?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: number | null
          created_at: string
          deleted_at: string | null
          id: number
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: Database["public"]["Enums"]["payment_type"]
          receipt_number: string
          recorded_by: string
          reference: string | null
          student_id: string
        }
        Insert: {
          amount: number
          course_id?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: Database["public"]["Enums"]["payment_type"]
          receipt_number?: string
          recorded_by: string
          reference?: string | null
          student_id: string
        }
        Update: {
          amount?: number
          course_id?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_type?: Database["public"]["Enums"]["payment_type"]
          receipt_number?: string
          recorded_by?: string
          reference?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      private_lesson_inquiries: {
        Row: {
          course_id: number
          created_at: string
          email: string
          end_time: string
          first_name: string
          id: number
          last_name: string
          notes: string | null
          phone: string | null
          preferred_date: string
          start_time: string
          status: string
        }
        Insert: {
          course_id: number
          created_at?: string
          email: string
          end_time: string
          first_name: string
          id?: never
          last_name: string
          notes?: string | null
          phone?: string | null
          preferred_date: string
          start_time: string
          status?: string
        }
        Update: {
          course_id?: number
          created_at?: string
          email?: string
          end_time?: string
          first_name?: string
          id?: never
          last_name?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_lesson_inquiries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_lesson_inquiries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
        ]
      }
      private_lessons: {
        Row: {
          created_at: string
          date: string | null
          end_time: string | null
          id: number
          notes: string | null
          price: number | null
          start_time: string | null
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: number
          notes?: string | null
          price?: number | null
          start_time?: string | null
          status?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: number
          notes?: string | null
          price?: number | null
          start_time?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "private_lessons_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "private_lessons_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          course_id: number
          created_at: string
          description: string | null
          external_url: string | null
          file_size: number | null
          file_url: string | null
          id: number
          mime_type: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string | null
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          course_id: number
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: number
          mime_type?: string | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          course_id?: number
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: number
          mime_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rfid_scans: {
        Row: {
          created_at: string
          id: number
          rfid_code: string
          scanned_at: string
          status: string
          student_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          rfid_code: string
          scanned_at?: string
          status?: string
          student_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          rfid_code?: string
          scanned_at?: string
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfid_scans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfid_scans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "rfid_scans_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          equipment: Json | null
          floor: number | null
          id: number
          name: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          equipment?: Json | null
          floor?: number | null
          id?: number
          name: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          equipment?: Json | null
          floor?: number | null
          id?: number
          name?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      student_parent: {
        Row: {
          created_at: string
          id: number
          parent_id: string
          relationship: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          parent_id: string
          relationship?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          parent_id?: string
          relationship?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_parent_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parent_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parent_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          id: string
          level_id: number | null
          registration_number: string
          rfid_assigned_at: string | null
          rfid_status: Database["public"]["Enums"]["rfid_status"] | null
          rfid_tag: string | null
          school_origin: string | null
          student_type: Database["public"]["Enums"]["student_type"]
        }
        Insert: {
          created_at?: string
          id: string
          level_id?: number | null
          registration_number?: string
          rfid_assigned_at?: string | null
          rfid_status?: Database["public"]["Enums"]["rfid_status"] | null
          rfid_tag?: string | null
          school_origin?: string | null
          student_type?: Database["public"]["Enums"]["student_type"]
        }
        Update: {
          created_at?: string
          id?: string
          level_id?: number | null
          registration_number?: string
          rfid_assigned_at?: string | null
          rfid_status?: Database["public"]["Enums"]["rfid_status"] | null
          rfid_tag?: string | null
          school_origin?: string | null
          student_type?: Database["public"]["Enums"]["student_type"]
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_availability: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id: number
          start_time: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          id?: number
          start_time: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          end_time?: string
          id?: number
          start_time?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_availability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_availability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_contracts: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          end_date: string | null
          fixed_salary: number | null
          hourly_rate: number | null
          hours_max: number | null
          hours_min: number | null
          id: number
          per_session_rate: number | null
          percentage_rate: number | null
          private_rate: number | null
          start_date: string
          status: string
          teacher_id: string
          vip_rate: number | null
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          end_date?: string | null
          fixed_salary?: number | null
          hourly_rate?: number | null
          hours_max?: number | null
          hours_min?: number | null
          id?: number
          per_session_rate?: number | null
          percentage_rate?: number | null
          private_rate?: number | null
          start_date: string
          status?: string
          teacher_id: string
          vip_rate?: number | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          end_date?: string | null
          fixed_salary?: number | null
          hourly_rate?: number | null
          hours_max?: number | null
          hours_min?: number | null
          id?: number
          per_session_rate?: number | null
          percentage_rate?: number | null
          private_rate?: number | null
          start_date?: string
          status?: string
          teacher_id?: string
          vip_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_contracts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_contracts_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_payroll: {
        Row: {
          created_at: string
          deductions: number
          gross_pay: number
          id: number
          month: number
          net_pay: number
          paid_at: string | null
          session_id: number | null
          source: string | null
          status: string
          teacher_id: string
          year: number
        }
        Insert: {
          created_at?: string
          deductions?: number
          gross_pay?: number
          id?: number
          month: number
          net_pay?: number
          paid_at?: string | null
          session_id?: number | null
          source?: string | null
          status?: string
          teacher_id: string
          year: number
        }
        Update: {
          created_at?: string
          deductions?: number
          gross_pay?: number
          id?: number
          month?: number
          net_pay?: number
          paid_at?: string | null
          session_id?: number | null
          source?: string | null
          status?: string
          teacher_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_payroll_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_payroll_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_payroll_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
        ]
      }
      teacher_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          rating: number
          student_id: string
          teacher_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          rating: number
          student_id: string
          teacher_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          rating?: number
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "teacher_reviews_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          biography: string | null
          created_at: string
          id: string
          rating: number | null
          rating_count: number | null
          specialties: Json | null
          teaching_mode: Database["public"]["Enums"]["teaching_mode"]
        }
        Insert: {
          biography?: string | null
          created_at?: string
          id: string
          rating?: number | null
          rating_count?: number | null
          specialties?: Json | null
          teaching_mode?: Database["public"]["Enums"]["teaching_mode"]
        }
        Update: {
          biography?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          rating_count?: number | null
          specialties?: Json | null
          teaching_mode?: Database["public"]["Enums"]["teaching_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_allocations: {
        Row: {
          amount: number
          created_at: string
          id: number
          invoice_id: number | null
          transaction_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          invoice_id?: number | null
          transaction_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          invoice_id?: number | null
          transaction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_allocations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deleted_at: string | null
          id: number
          notes: string | null
          recorded_by: string
          reference: string | null
          student_id: string
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          id?: number
          notes?: string | null
          recorded_by: string
          reference?: string | null
          student_id: string
          transaction_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          id?: number
          notes?: string | null
          recorded_by?: string
          reference?: string | null
          student_id?: string
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      users: {
        Row: {
          accepts_private_lessons: boolean
          address: string | null
          announcement_alerts: boolean | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          email_notifications: boolean | null
          email_verified: boolean
          email_verified_at: string | null
          first_name: string
          grade_alerts: boolean | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          homework_reminders: boolean | null
          id: string
          language: string | null
          last_login_at: string | null
          last_name: string
          message_alerts: boolean | null
          notif_absences: boolean | null
          notif_inscriptions: boolean | null
          notif_payments: boolean | null
          notif_rfid: boolean | null
          parent_id: string | null
          payment_reminders: boolean | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          push_notifications: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          show_attendance: boolean | null
          show_courses: boolean | null
          show_email: boolean | null
          show_phone: boolean | null
          show_profile: boolean | null
          show_schedule: boolean | null
          sms_notifications: boolean | null
          status: Database["public"]["Enums"]["user_status"]
          theme: string | null
          timezone: string | null
          updated_at: string
          wilaya: string | null
        }
        Insert: {
          accepts_private_lessons?: boolean
          address?: string | null
          announcement_alerts?: boolean | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email: string
          email_notifications?: boolean | null
          email_verified?: boolean
          email_verified_at?: string | null
          first_name: string
          grade_alerts?: boolean | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          homework_reminders?: boolean | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_name: string
          message_alerts?: boolean | null
          notif_absences?: boolean | null
          notif_inscriptions?: boolean | null
          notif_payments?: boolean | null
          notif_rfid?: boolean | null
          parent_id?: string | null
          payment_reminders?: boolean | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          push_notifications?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          show_attendance?: boolean | null
          show_courses?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_profile?: boolean | null
          show_schedule?: boolean | null
          sms_notifications?: boolean | null
          status?: Database["public"]["Enums"]["user_status"]
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          wilaya?: string | null
        }
        Update: {
          accepts_private_lessons?: boolean
          address?: string | null
          announcement_alerts?: boolean | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          email_notifications?: boolean | null
          email_verified?: boolean
          email_verified_at?: string | null
          first_name?: string
          grade_alerts?: boolean | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          homework_reminders?: boolean | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_name?: string
          message_alerts?: boolean | null
          notif_absences?: boolean | null
          notif_inscriptions?: boolean | null
          notif_payments?: boolean | null
          notif_rfid?: boolean | null
          parent_id?: string | null
          payment_reminders?: boolean | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          push_notifications?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          show_attendance?: boolean | null
          show_courses?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_profile?: boolean | null
          show_schedule?: boolean | null
          sms_notifications?: boolean | null
          status?: Database["public"]["Enums"]["user_status"]
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_classes: {
        Row: {
          created_at: string
          date: string | null
          end_time: string | null
          id: number
          notes: string | null
          price: number | null
          start_time: string | null
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: number
          notes?: string | null
          price?: number | null
          start_time?: string | null
          status?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: number
          notes?: string | null
          price?: number | null
          start_time?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "vip_classes_student_id_fkey_users"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "v_teacher_payroll"
            referencedColumns: ["teacher_id"]
          },
          {
            foreignKeyName: "vip_classes_teacher_id_fkey_users"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      waiting_list: {
        Row: {
          course_id: number
          created_at: string
          id: number
          notified_at: string | null
          registered_at: string
          status: Database["public"]["Enums"]["waiting_list_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string
          id?: number
          notified_at?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["waiting_list_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string
          id?: number
          notified_at?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["waiting_list_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "v_course_occupancy"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "waiting_list_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
    }
    Views: {
      dashboard_kpi: {
        Row: {
          active_students: number | null
          attendance_rate: number | null
          new_students_month: number | null
          occupancy_rate: number | null
          pending_approvals: number | null
          total_revenue: number | null
          unpaid_invoices: number | null
        }
        Relationships: []
      }
      v_active_alerts: {
        Row: {
          alert_type: string | null
          count: number | null
          details: Json | null
          severity: string | null
        }
        Relationships: []
      }
      v_course_occupancy: {
        Row: {
          course_id: number | null
          course_name: string | null
          current_enrollments: number | null
          level_name: string | null
          max_students: number | null
          occupancy_pct: number | null
          price: number | null
          room_capacity: number | null
          room_name: string | null
          status: Database["public"]["Enums"]["course_status"] | null
          subject_name: string | null
          teacher_name: string | null
        }
        Relationships: []
      }
      v_daily_revenue: {
        Row: {
          amount: number | null
          date: string | null
          transaction_count: number | null
        }
        Relationships: []
      }
      v_monthly_financials: {
        Row: {
          avg_transaction: number | null
          card_revenue: number | null
          cash_revenue: number | null
          check_revenue: number | null
          month: string | null
          paying_students: number | null
          total_revenue: number | null
          transaction_count: number | null
          transfer_revenue: number | null
        }
        Relationships: []
      }
      v_student_performance: {
        Row: {
          attendance_rate: number | null
          email: string | null
          enrolled_courses: number | null
          given_ratings_avg: number | null
          level_category: Database["public"]["Enums"]["level_category"] | null
          level_name: string | null
          monthly_present: number | null
          student_id: string | null
          student_name: string | null
          total_present: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_teacher_payroll: {
        Row: {
          avg_rating: number | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          fixed_salary: number | null
          hourly_rate: number | null
          percentage_rate: number | null
          sessions_last_month: number | null
          sessions_this_month: number | null
          teacher_id: string | null
          teacher_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_upcoming_schedule: {
        Row: {
          capacity: number | null
          course_name: string | null
          current_enrollments: number | null
          day_of_week: Database["public"]["Enums"]["day_of_week"] | null
          end_time: string | null
          level_name: string | null
          room_name: string | null
          schedule_id: number | null
          start_time: string | null
          subject_name: string | null
          teacher_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_close_expired_sessions: {
        Args: never
        Returns: {
          closed_records: number
          course_name: string
          session_id: number
          teacher_name: string
        }[]
      }
      dispatch_notification: {
        Args: {
          category?: string
          message?: string
          title?: string
          type?: string
        }
        Returns: undefined
      }
      generate_monthly_invoices: { Args: never; Returns: number }
      generate_todays_sessions: { Args: never; Returns: number }
      get_active_students: { Args: never; Returns: Json }
      get_attendance_summary: {
        Args: { date_from: string; date_to: string }
        Returns: Json
      }
      get_dashboard_stats:
        | { Args: never; Returns: Json }
        | { Args: { stat?: string }; Returns: Json }
      get_invoices: {
        Args: { p_search?: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          due_date: string
          id: number
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          total_amount: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_payments: {
        Args: { p_search?: string }
        Returns: {
          amount: number
          course_id: number | null
          created_at: string
          deleted_at: string | null
          id: number
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: Database["public"]["Enums"]["payment_type"]
          receipt_number: string
          recorded_by: string
          reference: string | null
          student_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_stats: { Args: never; Returns: Json }
      get_revenue_summary: {
        Args: { date_from: string; date_to: string }
        Returns: Json
      }
      get_role_dashboard: { Args: { p_user_id: string }; Returns: Json }
      get_teacher_dashboard_kpi: {
        Args: { p_teacher_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_assistant: { Args: never; Returns: boolean }
      is_parent: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_student: { Args: never; Returns: boolean }
      is_student_enrolled_in: {
        Args: { check_course_id: number }
        Returns: boolean
      }
      is_teacher: { Args: never; Returns: boolean }
      is_teacher_of_course: {
        Args: { check_course_id: number }
        Returns: boolean
      }
      process_payment: {
        Args: {
          p_amount: number
          p_payment_method: string
          p_payment_type: string
          p_recorded_by: string
          p_student_id: string
        }
        Returns: Json
      }
      register_child: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_level_category: string
          p_parent_id: string
        }
        Returns: undefined
      }
      register_user: {
        Args: {
          p_email: string
          p_first_name: string
          p_id: string
          p_last_name: string
          p_phone?: string
          p_role: string
          p_status?: string
          p_student_type?: string
        }
        Returns: undefined
      }
      search_users: {
        Args: {
          result_limit?: number
          result_offset?: number
          search_query: string
        }
        Returns: {
          accepts_private_lessons: boolean
          address: string | null
          announcement_alerts: boolean | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          email_notifications: boolean | null
          email_verified: boolean
          email_verified_at: string | null
          first_name: string
          grade_alerts: boolean | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          homework_reminders: boolean | null
          id: string
          language: string | null
          last_login_at: string | null
          last_name: string
          message_alerts: boolean | null
          notif_absences: boolean | null
          notif_inscriptions: boolean | null
          notif_payments: boolean | null
          notif_rfid: boolean | null
          parent_id: string | null
          payment_reminders: boolean | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          push_notifications: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          show_attendance: boolean | null
          show_courses: boolean | null
          show_email: boolean | null
          show_phone: boolean | null
          show_profile: boolean | null
          show_schedule: boolean | null
          sms_notifications: boolean | null
          status: Database["public"]["Enums"]["user_status"]
          theme: string | null
          timezone: string | null
          updated_at: string
          wilaya: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_users_count: { Args: { search_query: string }; Returns: number }
      unregister_user: { Args: { p_id: string }; Returns: undefined }
      validate_attendance_session: {
        Args: { p_session_id: number; p_validated_by: string }
        Returns: Json
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      attendance_method: "rfid" | "manual"
      attendance_status: "present" | "absent" | "late"
      backup_status: "in_progress" | "completed" | "failed"
      backup_type: "automatic" | "manual"
      contract_type: "fixed" | "hourly" | "percentage"
      course_status: "active" | "inactive" | "full" | "cancelled" | "pending"
      course_type: "normal" | "vip" | "private"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      enrollment_status:
        | "active"
        | "pending_approval"
        | "completed"
        | "cancelled"
      invoice_status: "paid" | "unpaid" | "partially_paid" | "cancelled"
      level_category: "primary" | "middle" | "high_school"
      notification_category:
        | "payment"
        | "course"
        | "attendance"
        | "system"
        | "registration"
      notification_type: "info" | "warning" | "success" | "error"
      payment_method: "cash" | "bank_transfer" | "card" | "check"
      payment_type: "monthly" | "per_session" | "vip" | "private"
      resource_type: "pdf" | "exercise" | "image" | "video" | "link"
      rfid_status: "active" | "inactive" | "lost"
      room_status:
        | "active"
        | "maintenance"
        | "inactive"
        | "available"
        | "occupied"
        | "reserved"
      student_type: "regular" | "single_session"
      teaching_mode: "online" | "onsite" | "both"
      transaction_type: "payment" | "credit" | "refund" | "adjustment"
      user_role: "admin" | "assistant" | "teacher" | "student" | "parent"
      user_status: "pending" | "active" | "suspended" | "inactive"
      waiting_list_status: "waiting" | "notified" | "enrolled" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      attendance_method: ["rfid", "manual"],
      attendance_status: ["present", "absent", "late"],
      backup_status: ["in_progress", "completed", "failed"],
      backup_type: ["automatic", "manual"],
      contract_type: ["fixed", "hourly", "percentage"],
      course_status: ["active", "inactive", "full", "cancelled", "pending"],
      course_type: ["normal", "vip", "private"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      enrollment_status: [
        "active",
        "pending_approval",
        "completed",
        "cancelled",
      ],
      invoice_status: ["paid", "unpaid", "partially_paid", "cancelled"],
      level_category: ["primary", "middle", "high_school"],
      notification_category: [
        "payment",
        "course",
        "attendance",
        "system",
        "registration",
      ],
      notification_type: ["info", "warning", "success", "error"],
      payment_method: ["cash", "bank_transfer", "card", "check"],
      payment_type: ["monthly", "per_session", "vip", "private"],
      resource_type: ["pdf", "exercise", "image", "video", "link"],
      rfid_status: ["active", "inactive", "lost"],
      room_status: [
        "active",
        "maintenance",
        "inactive",
        "available",
        "occupied",
        "reserved",
      ],
      student_type: ["regular", "single_session"],
      teaching_mode: ["online", "onsite", "both"],
      transaction_type: ["payment", "credit", "refund", "adjustment"],
      user_role: ["admin", "assistant", "teacher", "student", "parent"],
      user_status: ["pending", "active", "suspended", "inactive"],
      waiting_list_status: ["waiting", "notified", "enrolled", "expired"],
    },
  },
} as const
