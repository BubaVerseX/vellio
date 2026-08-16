export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          created_at: string
          default_reps: string
          default_sets: number
          difficulty: string
          equipment: string[]
          id: string
          image_url: string | null
          instructions: string | null
          instructions_ka: string | null
          muscle_group: string
          name: string
          name_ka: string | null
          setting: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          default_reps?: string
          default_sets?: number
          difficulty: string
          equipment?: string[]
          id?: string
          image_url?: string | null
          instructions?: string | null
          instructions_ka?: string | null
          muscle_group: string
          name: string
          name_ka?: string | null
          setting: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          default_reps?: string
          default_sets?: number
          difficulty?: string
          equipment?: string[]
          id?: string
          image_url?: string | null
          instructions?: string | null
          instructions_ka?: string | null
          muscle_group?: string
          name?: string
          name_ka?: string | null
          setting?: string
          video_url?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_list_items: {
        Row: {
          checked: boolean
          id: string
          ingredient_key: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          checked?: boolean
          id?: string
          ingredient_key: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          checked?: boolean
          id?: string
          ingredient_key?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_list_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          daily_calorie_target: number
          id: string
          macro_targets: Json
          plan_data: Json
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          daily_calorie_target: number
          id?: string
          macro_targets?: Json
          plan_data?: Json
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          daily_calorie_target?: number
          id?: string
          macro_targets?: Json
          plan_data?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          arms_cm: number | null
          chest_cm: number | null
          created_at: string
          date: string
          hips_cm: number | null
          id: string
          thighs_cm: number | null
          user_id: string
          waist_cm: number | null
        }
        Insert: {
          arms_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          date: string
          hips_cm?: number | null
          id?: string
          thighs_cm?: number | null
          user_id: string
          waist_cm?: number | null
        }
        Update: {
          arms_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          thighs_cm?: number | null
          user_id?: string
          waist_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[]
          created_at: string
          dietary_restrictions: string[]
          disclaimer_accepted_at: string | null
          email: string | null
          equipment_setting: string | null
          full_name: string | null
          goal: string | null
          height_cm: number | null
          id: string
          locale: string
          medical_conditions: string | null
          onboarding_completed: boolean
          restrictions_notes: string | null
          sex: string | null
          time_available_minutes: number | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[]
          created_at?: string
          dietary_restrictions?: string[]
          disclaimer_accepted_at?: string | null
          email?: string | null
          equipment_setting?: string | null
          full_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          locale?: string
          medical_conditions?: string | null
          onboarding_completed?: boolean
          restrictions_notes?: string | null
          sex?: string | null
          time_available_minutes?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[]
          created_at?: string
          dietary_restrictions?: string[]
          disclaimer_accepted_at?: string | null
          email?: string | null
          equipment_setting?: string | null
          full_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          locale?: string
          medical_conditions?: string | null
          onboarding_completed?: boolean
          restrictions_notes?: string | null
          sex?: string | null
          time_available_minutes?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          photo_path: string | null
          user_id: string
          weight_kg: number | null
          workout_completed: boolean | null
          workout_notes: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          photo_path?: string | null
          user_id: string
          weight_kg?: number | null
          workout_completed?: boolean | null
          workout_notes?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          photo_path?: string | null
          user_id?: string
          weight_kg?: number | null
          workout_completed?: boolean | null
          workout_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergens: string[]
          calories: number
          carbs_g: number
          created_at: string
          cuisine: string
          description: string | null
          description_ka: string | null
          dietary_tags: string[]
          fat_g: number
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string | null
          instructions_ka: string | null
          meal_type: string
          name: string
          name_ka: string | null
          prep_time_minutes: number
          protein_g: number
        }
        Insert: {
          allergens?: string[]
          calories: number
          carbs_g?: number
          created_at?: string
          cuisine?: string
          description?: string | null
          description_ka?: string | null
          dietary_tags?: string[]
          fat_g?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          instructions_ka?: string | null
          meal_type: string
          name: string
          name_ka?: string | null
          prep_time_minutes?: number
          protein_g?: number
        }
        Update: {
          allergens?: string[]
          calories?: number
          carbs_g?: number
          created_at?: string
          cuisine?: string
          description?: string | null
          description_ka?: string | null
          dietary_tags?: string[]
          fat_g?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          instructions_ka?: string | null
          meal_type?: string
          name?: string
          name_ka?: string | null
          prep_time_minutes?: number
          protein_g?: number
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_sent_at: string | null
          schedule: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          schedule?: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          schedule?: Json
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          setting: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data?: Json
          setting: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          setting?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
