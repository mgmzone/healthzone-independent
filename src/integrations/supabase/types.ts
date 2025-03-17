export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercise_goals: {
        Row: {
          created_at: string
          id: string
          name: string
          period: string
          target: number
          type: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          period: string
          target: number
          type: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          period?: string
          target?: number
          type?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          average_heart_rate: number | null
          created_at: string
          date: string
          distance: number | null
          highest_heart_rate: number | null
          id: string
          intensity: string
          lowest_heart_rate: number | null
          minutes: number
          steps: number | null
          type: string
          user_id: string
        }
        Insert: {
          average_heart_rate?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          highest_heart_rate?: number | null
          id?: string
          intensity: string
          lowest_heart_rate?: number | null
          minutes: number
          steps?: number | null
          type: string
          user_id: string
        }
        Update: {
          average_heart_rate?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          highest_heart_rate?: number | null
          id?: string
          intensity?: string
          lowest_heart_rate?: number | null
          minutes?: number
          steps?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      fasting_logs: {
        Row: {
          created_at: string
          eating_window_hours: number | null
          end_time: string | null
          fasting_hours: number | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          eating_window_hours?: number | null
          end_time?: string | null
          fasting_hours?: number | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          created_at?: string
          eating_window_hours?: number | null
          end_time?: string | null
          fasting_hours?: number | null
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      health_stats: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          date: string
          id: string
          resting_heart_rate: number | null
          user_id: string
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          date?: string
          id?: string
          resting_heart_rate?: number | null
          user_id: string
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          date?: string
          id?: string
          resting_heart_rate?: number | null
          user_id?: string
        }
        Relationships: []
      }
      periods: {
        Row: {
          created_at: string
          end_date: string | null
          fasting_schedule: string | null
          id: string
          projected_end_date: string | null
          start_date: string
          start_weight: number
          target_weight: number
          type: string
          user_id: string
          weight_loss_per_week: number | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          fasting_schedule?: string | null
          id?: string
          projected_end_date?: string | null
          start_date?: string
          start_weight: number
          target_weight: number
          type: string
          user_id: string
          weight_loss_per_week?: number | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          fasting_schedule?: string | null
          id?: string
          projected_end_date?: string | null
          start_date?: string
          start_weight?: number
          target_weight?: number
          type?: string
          user_id?: string
          weight_loss_per_week?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          current_weight: number | null
          exercise_minutes_per_day: number | null
          first_name: string | null
          fitness_level: string | null
          gender: string | null
          health_goals: string | null
          height: number | null
          id: string
          is_admin: boolean
          last_name: string | null
          measurement_unit: string | null
          starting_weight: number | null
          target_weight: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          current_weight?: number | null
          exercise_minutes_per_day?: number | null
          first_name?: string | null
          fitness_level?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id: string
          is_admin?: boolean
          last_name?: string | null
          measurement_unit?: string | null
          starting_weight?: number | null
          target_weight?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          current_weight?: number | null
          exercise_minutes_per_day?: number | null
          first_name?: string | null
          fitness_level?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          measurement_unit?: string | null
          starting_weight?: number | null
          target_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      weigh_ins: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          body_water_percentage: number | null
          bone_mass: number | null
          created_at: string
          date: string
          id: string
          period_id: string | null
          skeletal_muscle_mass: number | null
          user_id: string
          weight: number
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          body_water_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date?: string
          id?: string
          period_id?: string | null
          skeletal_muscle_mass?: number | null
          user_id: string
          weight: number
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          body_water_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date?: string
          id?: string
          period_id?: string | null
          skeletal_muscle_mass?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weigh_ins_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_current_avg_weight_loss: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      calculate_projected_end_date: {
        Args: {
          p_user_id: string
          p_period_id: string
        }
        Returns: string
      }
      get_all_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          first_name: string
          last_name: string
          last_sign_in_at: string
          created_at: string
        }[]
      }
      get_current_active_period: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          start_date: string
          end_date: string
          target_weight: number
          weight_loss_per_week: number
        }[]
      }
      get_system_stats_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_periods: number
          total_weigh_ins: number
          total_fasts: number
          total_exercises: number
        }[]
      }
      get_user_stats_for_admin: {
        Args: {
          p_user_id: string
        }
        Returns: {
          weigh_ins_count: number
          fasts_count: number
          exercises_count: number
          has_active_period: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
