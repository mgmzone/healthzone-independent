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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          cost_usd: number | null
          created_at: string
          error: string | null
          function_name: string
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          status: string
          used_fallback_key: boolean
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          function_name: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          status?: string
          used_fallback_key?: boolean
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          function_name?: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          status?: string
          used_fallback_key?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_goal_entries: {
        Row: {
          created_at: string | null
          date: string
          goal_id: string
          id: string
          met: boolean | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          goal_id: string
          id?: string
          met?: boolean | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          goal_id?: string
          id?: string
          met?: boolean | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_goal_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "daily_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_goal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_goals: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          color: string | null
          created_at: string | null
          daily_target: number | null
          default_quantity: number
          icon: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          daily_target?: number | null
          default_quantity?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          daily_target?: number | null
          default_quantity?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          activity_name: string | null
          average_heart_rate: number | null
          calories_burned: number | null
          created_at: string
          date: string
          distance: number | null
          highest_heart_rate: number | null
          id: string
          intensity: string
          lowest_heart_rate: number | null
          minutes: number
          steps: number | null
          strava_activity_id: number | null
          type: string
          user_id: string
        }
        Insert: {
          activity_name?: string | null
          average_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          highest_heart_rate?: number | null
          id?: string
          intensity: string
          lowest_heart_rate?: number | null
          minutes: number
          steps?: number | null
          strava_activity_id?: number | null
          type: string
          user_id: string
        }
        Update: {
          activity_name?: string | null
          average_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          highest_heart_rate?: number | null
          id?: string
          intensity?: string
          lowest_heart_rate?: number | null
          minutes?: number
          steps?: number | null
          strava_activity_id?: number | null
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
      journal_entries: {
        Row: {
          body: string
          created_at: string | null
          entry_date: string
          entry_time: string | null
          id: string
          mood: number | null
          pain_level: number | null
          tags: string[]
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          entry_date: string
          entry_time?: string | null
          id?: string
          mood?: number | null
          pain_level?: number | null
          tags?: string[]
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          entry_date?: string
          entry_time?: string | null
          id?: string
          mood?: number | null
          pain_level?: number | null
          tags?: string[]
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          ai_assessment: string | null
          ai_protein_estimate: number | null
          anti_inflammatory: boolean | null
          calories: number | null
          carbs_grams: number | null
          created_at: string | null
          date: string
          fat_grams: number | null
          id: string
          irritant_notes: string | null
          irritant_violation: boolean | null
          meal_slot: string
          notes: string | null
          protein_grams: number | null
          protein_source: string | null
          sodium_mg: number | null
          user_id: string
        }
        Insert: {
          ai_assessment?: string | null
          ai_protein_estimate?: number | null
          anti_inflammatory?: boolean | null
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          date: string
          fat_grams?: number | null
          id?: string
          irritant_notes?: string | null
          irritant_violation?: boolean | null
          meal_slot: string
          notes?: string | null
          protein_grams?: number | null
          protein_source?: string | null
          sodium_mg?: number | null
          user_id: string
        }
        Update: {
          ai_assessment?: string | null
          ai_protein_estimate?: number | null
          anti_inflammatory?: boolean | null
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          date?: string
          fat_grams?: number | null
          id?: string
          irritant_notes?: string | null
          irritant_violation?: boolean | null
          meal_slot?: string
          notes?: string | null
          protein_grams?: number | null
          protein_source?: string | null
          sodium_mg?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string | null
          id: string
          medication_id: string | null
          medication_name: string | null
          notes: string | null
          status: string
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          medication_id?: string | null
          medication_name?: string | null
          notes?: string | null
          status?: string
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          medication_id?: string | null
          medication_name?: string | null
          notes?: string | null
          status?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dose: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          schedule: string | null
          sort_order: number
          times_per_day: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dose?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          schedule?: string | null
          sort_order?: number
          times_per_day?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dose?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          schedule?: string | null
          sort_order?: number
          times_per_day?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      period_milestones: {
        Row: {
          created_at: string
          date: string
          id: string
          is_priority: boolean
          name: string
          notes: string | null
          period_id: string
          reminder_sent_1d_at: string | null
          reminder_sent_7d_at: string | null
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_priority?: boolean
          name: string
          notes?: string | null
          period_id: string
          reminder_sent_1d_at?: string | null
          reminder_sent_7d_at?: string | null
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_priority?: boolean
          name?: string
          notes?: string | null
          period_id?: string
          reminder_sent_1d_at?: string | null
          reminder_sent_7d_at?: string | null
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_milestones_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          ai_prompt: string | null
          avatar_url: string | null
          birth_date: string | null
          claude_api_key: string | null
          created_at: string
          current_weight: number | null
          daily_reminder_enabled: boolean
          email_unsubscribe_token: string
          exercise_minutes_per_day: number | null
          first_name: string | null
          fitness_level: string | null
          gender: string | null
          health_goals: string | null
          height: number | null
          id: string
          is_admin: boolean
          last_inactivity_email_at: string | null
          last_name: string | null
          last_profile_completion_email_at: string | null
          measurement_unit: string | null
          protein_target_max: number | null
          protein_target_min: number | null
          starting_weight: number | null
          strava_client_id: string | null
          strava_client_secret: string | null
          strava_last_sync_at: string | null
          strava_refresh_token: string | null
          system_notification_emails: boolean | null
          target_meals_per_day: number | null
          target_weight: number | null
          time_zone: string
          updated_at: string
          weekly_summary_emails: boolean | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          ai_prompt?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          claude_api_key?: string | null
          created_at?: string
          current_weight?: number | null
          daily_reminder_enabled?: boolean
          email_unsubscribe_token?: string
          exercise_minutes_per_day?: number | null
          first_name?: string | null
          fitness_level?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id: string
          is_admin?: boolean
          last_inactivity_email_at?: string | null
          last_name?: string | null
          last_profile_completion_email_at?: string | null
          measurement_unit?: string | null
          protein_target_max?: number | null
          protein_target_min?: number | null
          starting_weight?: number | null
          strava_client_id?: string | null
          strava_client_secret?: string | null
          strava_last_sync_at?: string | null
          strava_refresh_token?: string | null
          system_notification_emails?: boolean | null
          target_meals_per_day?: number | null
          target_weight?: number | null
          time_zone?: string
          updated_at?: string
          weekly_summary_emails?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          ai_prompt?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          claude_api_key?: string | null
          created_at?: string
          current_weight?: number | null
          daily_reminder_enabled?: boolean
          email_unsubscribe_token?: string
          exercise_minutes_per_day?: number | null
          first_name?: string | null
          fitness_level?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id?: string
          is_admin?: boolean
          last_inactivity_email_at?: string | null
          last_name?: string | null
          last_profile_completion_email_at?: string | null
          measurement_unit?: string | null
          protein_target_max?: number | null
          protein_target_min?: number | null
          starting_weight?: number | null
          strava_client_id?: string | null
          strava_client_secret?: string | null
          strava_last_sync_at?: string | null
          strava_refresh_token?: string | null
          system_notification_emails?: boolean | null
          target_meals_per_day?: number | null
          target_weight?: number | null
          time_zone?: string
          updated_at?: string
          weekly_summary_emails?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      protein_sources: {
        Row: {
          created_at: string | null
          id: string
          is_anti_inflammatory: boolean | null
          name: string
          sort_order: number | null
          typical_protein_grams: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_anti_inflammatory?: boolean | null
          name: string
          sort_order?: number | null
          typical_protein_grams?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_anti_inflammatory?: boolean | null
          name?: string
          sort_order?: number | null
          typical_protein_grams?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protein_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_events: {
        Row: {
          created_at: string | null
          event_key: string
          event_type_id: string | null
          id: string
          notes: string | null
          occurred_at: string
          quantity: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_key: string
          event_type_id?: string | null
          id?: string
          notes?: string | null
          occurred_at?: string
          quantity?: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_key?: string
          event_type_id?: string | null
          id?: string
          notes?: string | null
          occurred_at?: string
          quantity?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          blood_glucose: number | null
          created_at: string | null
          diastolic: number | null
          id: string
          measured_at: string
          notes: string | null
          oxygen_saturation: number | null
          pulse: number | null
          respiratory_rate: number | null
          systolic: number | null
          temperature: number | null
          temperature_unit: string
          user_id: string
        }
        Insert: {
          blood_glucose?: number | null
          created_at?: string | null
          diastolic?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pulse?: number | null
          respiratory_rate?: number | null
          systolic?: number | null
          temperature?: number | null
          temperature_unit?: string
          user_id: string
        }
        Update: {
          blood_glucose?: number | null
          created_at?: string | null
          diastolic?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pulse?: number | null
          respiratory_rate?: number | null
          systolic?: number | null
          temperature?: number | null
          temperature_unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_projected_end_date: {
        Args: { p_period_id: string; p_user_id: string }
        Returns: string
      }
      daily_active_users: {
        Args: { target_date: string }
        Returns: {
          first_name: string
          last_name: string
          logged_exercise: boolean
          logged_fasting: boolean
          logged_goal: boolean
          logged_journal: boolean
          logged_meal: boolean
          logged_weight: boolean
          time_zone: string
          user_id: string
        }[]
      }
      daily_ai_cost_by_user: {
        Args: { target_date: string }
        Returns: {
          call_count: number
          fallback_usd: number
          first_name: string
          last_name: string
          own_key_usd: number
          total_usd: number
          user_id: string
        }[]
      }
      get_admin_activity_volume_by_day: {
        Args: { days_back?: number }
        Returns: {
          day: string
          exercises: number
          fasting: number
          meals: number
          weigh_ins: number
        }[]
      }
      get_admin_ai_usage_by_day: {
        Args: { days_back?: number }
        Returns: {
          calls: number
          cost_usd: number
          day: string
          fallback_calls: number
          fallback_cost_usd: number
          function_name: string
        }[]
      }
      get_admin_feature_adoption: {
        Args: never
        Returns: {
          has_active_period: number
          has_ai_context: number
          has_custom_protein_target: number
          has_macro_data: number
          has_own_claude_key: number
          has_strava_connected: number
          profile_complete: number
          total_users: number
          wau_prior: number
          wau_this: number
        }[]
      }
      get_admin_signups_by_day: {
        Args: { days_back?: number }
        Returns: {
          day: string
          signups: number
        }[]
      }
      get_admin_user_extras: {
        Args: never
        Returns: {
          ai_calls_30d: number
          ai_calls_7d: number
          ai_cost_30d: number
          ai_cost_7d: number
          ai_fallback_7d: number
          has_ai_context: boolean
          has_custom_protein_target: boolean
          has_own_claude_key: boolean
          has_strava_connected: boolean
          is_banned: boolean
          signup_at: string
          user_id: string
        }[]
      }
      get_all_users_for_admin: {
        Args: never
        Returns: {
          email: string
          firstname: string
          in_active_period: boolean
          last_sign_in_at: string
          lastname: string
          profile_complete: boolean
          total_activities: number
          total_fasting_days: number
          total_weigh_ins: number
          user_id: string
          week_activities: number
          week_fasting_days: number
          week_weigh_ins: number
        }[]
      }
      get_cron_secret: { Args: never; Returns: string }
      get_current_active_period: {
        Args: { p_user_id: string }
        Returns: {
          end_date: string
          id: string
          start_date: string
          target_weight: number
          weight_loss_per_week: number
        }[]
      }
      get_system_stats_for_admin: {
        Args: never
        Returns: {
          active_periods: number
          ai_calls_30d: number
          ai_fallback_cost_30d: number
          total_exercises: number
          total_fasts: number
          total_meals: number
          total_users: number
          total_weigh_ins: number
        }[]
      }
      get_user_stats_for_admin: {
        Args: { p_user_id: string }
        Returns: {
          exercises_count: number
          fasts_count: number
          has_active_period: boolean
          weigh_ins_count: number
        }[]
      }
      profiles_due_for_daily_reminder: {
        Args: { target_hour: number }
        Returns: {
          email_unsubscribe_token: string
          first_name: string
          id: string
          last_name: string
          protein_target_max: number
          protein_target_min: number
          target_meals_per_day: number
          time_zone: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
