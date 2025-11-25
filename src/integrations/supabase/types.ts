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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          amount_paid: number | null
          center_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          meeting_link: string | null
          notes: string | null
          payment_intent_id: string | null
          payment_status: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          center_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          center_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "teaching_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          level: string | null
          thumbnail_url: string | null
          title: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teaching_centers: {
        Row: {
          address: string
          city: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tutor_applications: {
        Row: {
          created_at: string
          experience_years: number
          expertise: string
          hourly_rate: number
          id: string
          motivation: string
          reviewed_at: string | null
          reviewed_by: string | null
          specialties: string[]
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_years: number
          expertise: string
          hourly_rate: number
          id?: string
          motivation: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_years?: number
          expertise?: string
          hourly_rate?: number
          id?: string
          motivation?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tutor_profiles: {
        Row: {
          created_at: string
          experience_years: number
          expertise: string
          hourly_rate: number
          id: string
          is_verified: boolean | null
          rating: number | null
          specialties: string[]
          total_students: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_years?: number
          expertise: string
          hourly_rate: number
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          specialties?: string[]
          total_students?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_years?: number
          expertise?: string
          hourly_rate?: number
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          specialties?: string[]
          total_students?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "tutor" | "admin"
      application_status: "pending" | "approved" | "rejected"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
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
      app_role: ["student", "tutor", "admin"],
      application_status: ["pending", "approved", "rejected"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
} as const
