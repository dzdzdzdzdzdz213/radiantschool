export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: string;
          status: string;
          email_verified: boolean;
          photo_url: string | null;
          guardian_name: string | null;
          guardian_email: string | null;
          guardian_phone: string | null;
          parent_id: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          status?: string;
          email_verified?: boolean;
          phone?: string | null;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          status?: string;
          photo_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_users_students',
            columns: ['id'],
            isOneToOne: true,
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      students: {
        Row: {
          id: string;
          student_type: string;
          registration_number: string;
          rfid_tag: string | null;
          rfid_status: string | null;
          level_id: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          student_type?: string;
          registration_number: string;
        };
        Update: {
          rfid_tag?: string;
          rfid_status?: string;
          level_id?: number;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: number;
          name: string;
          type: string;
          capacity: number;
          current_enrollments: number;
          price: number;
          status: string;
          subject_id: number;
          level_id: number;
          teacher_id: string;
          room_id: number | null;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          name: string;
          type?: string;
          capacity: number;
          price: number;
          subject_id: number;
          level_id: number;
          teacher_id: string;
          room_id?: number;
          start_date: string;
          end_date: string;
        };
        Update: {
          name?: string;
          capacity?: number;
          price?: number;
          status?: string;
          room_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_courses_subject',
            columns: ['subject_id'],
            referencedRelation: 'subjects',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_courses_level',
            columns: ['level_id'],
            referencedRelation: 'levels',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_courses_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_courses_room',
            columns: ['room_id'],
            referencedRelation: 'rooms',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_courses_schedules',
            columns: ['id'],
            referencedRelation: 'course_schedules',
            referencedColumns: ['course_id'],
          },
        ];
      };
      course_schedules: {
        Row: {
          id: number;
          course_id: number;
          day_of_week: string;
          start_time: string;
          end_time: string;
          room_id: number | null;
          teacher_id: string;
        };
        Insert: {
          course_id: number;
          day_of_week: string;
          start_time: string;
          end_time: string;
          room_id?: number;
          teacher_id: string;
        };
        Update: {
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          room_id?: number;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_course_schedules_course',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_course_schedules_room',
            columns: ['room_id'],
            referencedRelation: 'rooms',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_course_schedules_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      course_enrollments: {
        Row: {
          id: number;
          student_id: string;
          course_id: number;
          status: string;
          enrollment_date: string;
        };
        Insert: {
          student_id: string;
          course_id: number;
          status?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_enrollments_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_enrollments_course',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ];
      };
      payments: {
        Row: {
          id: number;
          student_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          payment_type: string;
          reference: string | null;
          receipt_number: string;
          notes: string | null;
          recorded_by: string;
          course_id: number | null;
          created_at: string;
        };
        Insert: {
          student_id: string;
          amount: number;
          payment_method: string;
          payment_type: string;
          recorded_by: string;
          payment_date?: string;
          reference?: string;
          notes?: string;
          course_id?: number;
        };
        Update: {
          payment_method?: string;
          payment_type?: string;
          notes?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_payments_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_payments_recorded_by',
            columns: ['recorded_by'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      invoices: {
        Row: {
          id: number;
          invoice_number: string;
          student_id: string;
          issue_date: string;
          due_date: string;
          total_amount: number;
          paid_amount: number;
          status: string;
          pdf_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          total_amount: number;
          due_date: string;
          issue_date?: string;
          status?: string;
          notes?: string;
        };
        Update: {
          paid_amount?: number;
          status?: string;
          pdf_url?: string;
          notes?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_invoices_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      attendance: {
        Row: {
          id: number;
          student_id: string;
          course_schedule_id: number;
          date: string;
          status: string;
          check_in_time: string | null;
          method: string;
          created_at: string;
        };
        Insert: {
          student_id: string;
          course_schedule_id: number;
          date: string;
          status?: string;
          method?: string;
        };
        Update: {
          status?: string;
          check_in_time?: string;
          method?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_attendance_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_attendance_schedule',
            columns: ['course_schedule_id'],
            referencedRelation: 'course_schedules',
            referencedColumns: ['id'],
          },
        ];
      };
      evaluations: {
        Row: {
          id: number;
          student_id: string;
          teacher_id: string;
          teaching_quality: number;
          communication: number;
          punctuality: number;
          organization: number;
          average_score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          student_id: string;
          teacher_id: string;
          teaching_quality: number;
          communication: number;
          punctuality: number;
          organization: number;
          comment?: string;
        };
        Update: {
          comment?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_evaluations_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          message: string;
          type: string;
          category: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          type?: string;
          category?: string;
        };
        Update: {
          is_read?: boolean;
          read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_notifications_user',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      messages: {
        Row: {
          id: number;
          sender_id: string;
          receiver_id: string;
          subject: string | null;
          body: string;
          is_read: boolean;
          read_at: string | null;
          parent_message_id: number | null;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          subject?: string;
          body: string;
          parent_message_id?: number;
        };
        Update: {
          is_read?: boolean;
          read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_messages_sender',
            columns: ['sender_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_messages_receiver',
            columns: ['receiver_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      teachers: {
        Row: {
          id: string;
          specialties: Json;
          biography: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          specialties?: Json;
          biography?: string;
        };
        Update: {
          specialties?: Json;
          biography?: string;
        };
        Relationships: [];
      };
      assistants: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      levels: {
        Row: {
          id: number;
          name: string;
          category: string;
          stream: string | null;
          year: number | null;
          sort_order: number;
        };
        Insert: {
          name: string;
          category: string;
          stream?: string;
          year?: number;
          sort_order: number;
        };
        Update: {
          name?: string;
          stream?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: number;
          name: string;
          description: string | null;
        };
        Insert: {
          name: string;
          description?: string;
        };
        Update: {
          name?: string;
          description?: string;
        };
        Relationships: [];
      };
      parents: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      student_parent: {
        Row: {
          id: number;
          student_id: string;
          parent_id: string;
          relationship: string | null;
        };
        Insert: {
          student_id: string;
          parent_id: string;
          relationship?: string;
        };
        Update: {
          relationship?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_sp_student',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_sp_parent',
            columns: ['parent_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      rooms: {
        Row: {
          id: number;
          name: string;
          capacity: number;
          floor: number | null;
          equipment: Json;
          status: string;
        };
        Insert: {
          name: string;
          capacity: number;
          floor?: number;
          equipment?: Json;
          status?: string;
        };
        Update: {
          name?: string;
          capacity?: number;
          status?: string;
        };
        Relationships: [];
      };
      private_lessons: {
        Row: {
          id: number;
          teacher_id: string;
          student_id: string;
          date: string | null;
          start_time: string | null;
          end_time: string | null;
          price: number;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          student_id: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          price?: number;
          status?: string;
          notes?: string;
        };
        Update: {
          status?: string;
          notes?: string;
          start_time?: string;
          end_time?: string;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_private_lessons_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_private_lessons_student',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      vip_classes: {
        Row: {
          id: number;
          teacher_id: string;
          student_id: string;
          date: string | null;
          start_time: string | null;
          end_time: string | null;
          price: number;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          student_id: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          price?: number;
          status?: string;
          notes?: string;
        };
        Update: {
          status?: string;
          notes?: string;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_vip_classes_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_vip_classes_student',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      online_classes: {
        Row: {
          id: number;
          teacher_id: string;
          course_id: number | null;
          title: string;
          description: string | null;
          platform: string | null;
          meeting_url: string | null;
          start_time: string | null;
          end_time: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          course_id?: number;
          title: string;
          description?: string;
          platform?: string;
          meeting_url?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
        };
        Update: {
          title?: string;
          description?: string;
          meeting_url?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_online_classes_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_online_classes_course',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ];
      };
      assignments: {
        Row: {
          id: number;
          teacher_id: string;
          course_id: number;
          title: string;
          description: string | null;
          due_date: string | null;
          file_url: string | null;
          max_grade: number | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          course_id: number;
          title: string;
          description?: string;
          due_date?: string;
          file_url?: string;
          max_grade?: number;
        };
        Update: {
          title?: string;
          description?: string;
          due_date?: string;
          file_url?: string;
          max_grade?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_assignments_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_assignments_course',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ];
      };
      assignment_submissions: {
        Row: {
          id: number;
          assignment_id: number;
          student_id: string;
          status: string;
          submitted_at: string;
          grade: number | null;
          feedback: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          assignment_id: number;
          student_id: string;
          status?: string;
          grade?: number;
          feedback?: string;
          file_url?: string;
        };
        Update: {
          status?: string;
          grade?: number;
          feedback?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_as_assignment',
            columns: ['assignment_id'],
            referencedRelation: 'assignments',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_as_student',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      announcements: {
        Row: {
          id: number;
          teacher_id: string | null;
          course_id: number | null;
          title: string;
          content: string;
          is_pinned: boolean;
          created_at: string;
        };
        Insert: {
          teacher_id?: string;
          course_id?: number;
          title: string;
          content: string;
          is_pinned?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          is_pinned?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_announcements_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_announcements_course',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ];
      };
      certificates: {
        Row: {
          id: number;
          student_id: string;
          course_id: number | null;
          title: string;
          description: string | null;
          issued_date: string;
          expiry_date: string | null;
          certificate_url: string | null;
          created_at: string;
        };
        Insert: {
          student_id: string;
          course_id?: number;
          title: string;
          description?: string;
          issued_date?: string;
          expiry_date?: string;
          certificate_url?: string;
        };
        Update: {
          title?: string;
          description?: string;
          certificate_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_certificates_student',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      conversations: {
        Row: {
          id: number;
          student_id: string | null;
          teacher_id: string | null;
          parent_id: string | null;
          participant_id: string;
          last_message: string | null;
          last_message_at: string | null;
          unread: boolean;
          created_at: string;
        };
        Insert: {
          student_id?: string;
          teacher_id?: string;
          parent_id?: string;
          participant_id: string;
          last_message?: string;
          last_message_at?: string;
          unread?: boolean;
        };
        Update: {
          last_message?: string;
          last_message_at?: string;
          unread?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_conversations_participant',
            columns: ['participant_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ];
      };
      teacher_reviews: {
        Row: {
          id: number;
          teacher_id: string;
          student_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          student_id: string;
          rating: number;
          comment?: string;
        };
        Update: {
          comment?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_tr_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'fk_tr_student',
            columns: ['student_id'],
            referencedRelation: 'students',
            referencedColumns: ['id'],
          },
        ];
      };
      rfid_scans: {
        Row: {
          id: number;
          rfid_code: string;
          student_id: string | null;
          status: string;
          scanned_at: string;
          created_at: string;
        };
        Insert: {
          rfid_code: string;
          student_id?: string;
          status?: string;
          scanned_at?: string;
        };
        Update: {
          status?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      center_settings: {
        Row: {
          id: number;
          center_name: string;
          address: string | null;
          phone: string | null;
          wilaya: string | null;
          currency: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          auto_invoice: boolean;
          created_at: string;
        };
        Insert: {
          center_name?: string;
          address?: string;
          phone?: string;
          wilaya?: string;
          currency?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          auto_invoice?: boolean;
        };
        Update: {
          center_name?: string;
          address?: string;
          phone?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          auto_invoice?: boolean;
        };
        Relationships: [];
      };
      teacher_payroll: {
        Row: {
          id: number;
          teacher_id: string;
          month: number;
          year: number;
          gross_pay: number;
          deductions: number;
          net_pay: number;
          status: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          month: number;
          year: number;
          gross_pay?: number;
          deductions?: number;
          net_pay?: number;
          status?: string;
          paid_at?: string;
        };
        Update: {
          gross_pay?: number;
          deductions?: number;
          net_pay?: number;
          status?: string;
          paid_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_tp_teacher',
            columns: ['teacher_id'],
            referencedRelation: 'teachers',
            referencedColumns: ['id'],
          },
        ];
      };
    };
    Views: {
      dashboard_kpi: {
        Row: {
          total_revenue: number | null;
          active_students: number | null;
          new_students_month: number | null;
          occupancy_rate: number | null;
          pending_approvals: number | null;
          unpaid_invoices: number | null;
          active_courses: number | null;
          evaluation_count: number | null;
          my_courses: number | null;
          attendance_rate: number | null;
          next_payment: number | null;
          average_rating: number | null;
          children_count: number | null;
        };
        Relationships: [];
      };
      v_daily_revenue: {
        Row: {
          date: string;
          amount: number;
          transaction_count: number;
        };
        Relationships: [];
      };
      v_teacher_payroll: {
        Row: {
          teacher_id: string;
          teacher_name: string;
          contract_type: string;
          hourly_rate: number | null;
          fixed_salary: number | null;
          percentage_rate: number | null;
          sessions_this_month: number;
          sessions_last_month: number;
          avg_rating: number;
        };
        Relationships: [];
      };
      v_student_performance: {
        Row: {
          student_id: string;
          student_name: string;
          email: string;
          level_name: string | null;
          level_category: string | null;
          enrolled_courses: number;
          total_present: number;
          monthly_present: number;
          attendance_rate: number;
          given_ratings_avg: number;
        };
        Relationships: [];
      };
      v_course_occupancy: {
        Row: {
          course_id: number;
          course_name: string;
          subject_name: string;
          level_name: string;
          room_name: string | null;
          room_capacity: number | null;
          max_students: number;
          current_enrollments: number;
          occupancy_pct: number;
          price: number;
          teacher_name: string;
          status: string;
        };
        Relationships: [];
      };
      v_monthly_financials: {
        Row: {
          month: string;
          paying_students: number;
          transaction_count: number;
          total_revenue: number;
          avg_transaction: number;
          cash_revenue: number | null;
          transfer_revenue: number | null;
          card_revenue: number | null;
          check_revenue: number | null;
        };
        Relationships: [];
      };
      v_upcoming_schedule: {
        Row: {
          schedule_id: number;
          course_name: string;
          subject_name: string;
          level_name: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          room_name: string | null;
          teacher_name: string;
          current_enrollments: number;
          capacity: number;
        };
        Relationships: [];
      };
      v_active_alerts: {
        Row: {
          alert_type: string;
          severity: string;
          count: number;
          details: Json;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_monthly_invoices: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
}
