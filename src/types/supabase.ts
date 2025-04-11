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
      model_files: {
        Row: {
          id: string
          name: string
          description: string | null
          file_path: string
          size: number
          checksum: string | null
          user_id: string
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
          downloads: number | null
          is_public: boolean | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          file_path: string
          size: number
          checksum?: string | null
          user_id: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          downloads?: number | null
          is_public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          file_path?: string
          size?: number
          checksum?: string | null
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          downloads?: number | null
          is_public?: boolean | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string | null
          updated_at?: string | null
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
  }
}