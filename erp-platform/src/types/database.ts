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
          payment_method: string;
          payment_type: string;
          receipt_number: string;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          student_id: string;
          amount: number;
          payment_method: string;
          payment_type: string;
          recorded_by: string;
        };
        Update: {
          payment_method?: string;
          payment_type?: string;
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
          total_amount: number;
          paid_amount: number;
          status: string;
          due_date: string;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          student_id: string;
          total_amount: number;
          due_date: string;
          status?: string;
        };
        Update: {
          paid_amount?: number;
          status?: string;
          pdf_url?: string;
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
          created_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          subject?: string;
          body: string;
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
          speciality: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          speciality?: string;
          bio?: string;
        };
        Update: {
          speciality?: string;
          bio?: string;
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
    };
    Functions: {
      generate_monthly_invoices: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
}
