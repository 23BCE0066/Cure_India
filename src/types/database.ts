// This file contains TypeScript types for the Supabase database schema
// These types are generated based on the database schema defined in planning.md

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          preferred_language: string
          city: string | null
          emergency_contact: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          preferred_language?: string
          city?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          preferred_language?: string
          city?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      symptom_consultations: {
        Row: {
          id: string
          user_id: string
          query: string
          language: string
          response: Json
          ai_confidence: number
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          language: string
          response: Json
          ai_confidence: number
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          language?: string
          response?: Json
          ai_confidence?: number
          session_id?: string
          created_at?: string
        }
      }
      medical_reports: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_type: string
          extracted_data: Json | null
          interpretation: Json | null
          is_verified: boolean
          upload_date: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_type: string
          extracted_data?: Json | null
          interpretation?: Json | null
          is_verified?: boolean
          upload_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_type?: string
          extracted_data?: Json | null
          interpretation?: Json | null
          is_verified?: boolean
          upload_date?: string
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          specialty: string
          city: string
          hospital: string | null
          rating: number
          experience_years: number
          consultation_fee_min: number
          consultation_fee_max: number
          contact_phone: string | null
          contact_email: string | null
          is_verified: boolean
        }
        Insert: {
          id?: string
          name: string
          specialty: string
          city: string
          hospital?: string | null
          rating: number
          experience_years: number
          consultation_fee_min: number
          consultation_fee_max: number
          contact_phone?: string | null
          contact_email?: string | null
          is_verified?: boolean
        }
        Update: {
          id?: string
          name?: string
          specialty?: string
          city?: string
          hospital?: string | null
          rating?: number
          experience_years?: number
          consultation_fee_min?: number
          consultation_fee_max?: number
          contact_phone?: string | null
          contact_email?: string | null
          is_verified?: boolean
        }
      }
      cost_estimates: {
        Row: {
          id: string
          condition_name: string
          specialty: string
          city: string
          consultation_min: number
          consultation_max: number
          treatment_min: number
          treatment_max: number
          data_source: string
          last_updated: string
        }
        Insert: {
          id?: string
          condition_name: string
          specialty: string
          city: string
          consultation_min: number
          consultation_max: number
          treatment_min: number
          treatment_max: number
          data_source: string
          last_updated?: string
        }
        Update: {
          id?: string
          condition_name?: string
          specialty?: string
          city?: string
          consultation_min?: number
          consultation_max?: number
          treatment_min?: number
          treatment_max?: number
          data_source?: string
          last_updated?: string
        }
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