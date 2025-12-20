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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      learning_sections: {
        Row: {
          component_data: Json | null
          component_type: string | null
          content: string | null
          created_at: string
          id: string
          image_prompt: string | null
          image_url: string | null
          module_type: string | null
          order_index: number
          title: string
          world_id: string
        }
        Insert: {
          component_data?: Json | null
          component_type?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          module_type?: string | null
          order_index?: number
          title: string
          world_id: string
        }
        Update: {
          component_data?: Json | null
          component_type?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          module_type?: string | null
          order_index?: number
          title?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sections_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "learning_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_worlds: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          detected_subject: string | null
          fork_count: number | null
          forked_from_id: string | null
          generated_code: string | null
          id: string
          is_public: boolean
          metadata: Json | null
          moon_phase: Database["public"]["Enums"]["moon_phase"]
          poetic_name: string | null
          source_content: string | null
          status: Database["public"]["Enums"]["world_status"]
          subject: Database["public"]["Enums"]["subject_type"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
          visual_theme: Json | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          detected_subject?: string | null
          fork_count?: number | null
          forked_from_id?: string | null
          generated_code?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          moon_phase?: Database["public"]["Enums"]["moon_phase"]
          poetic_name?: string | null
          source_content?: string | null
          status?: Database["public"]["Enums"]["world_status"]
          subject?: Database["public"]["Enums"]["subject_type"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
          visual_theme?: Json | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          detected_subject?: string | null
          fork_count?: number | null
          forked_from_id?: string | null
          generated_code?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json | null
          moon_phase?: Database["public"]["Enums"]["moon_phase"]
          poetic_name?: string | null
          source_content?: string | null
          status?: Database["public"]["Enums"]["world_status"]
          subject?: Database["public"]["Enums"]["subject_type"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
          visual_theme?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_worlds_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "learning_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_public: boolean | null
          school: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_public?: boolean | null
          school?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_public?: boolean | null
          school?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          attempts: number
          completed: boolean
          created_at: string
          id: string
          last_accessed: string
          score: number | null
          section_id: string | null
          stars_collected: number
          user_id: string
          world_id: string
        }
        Insert: {
          attempts?: number
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          score?: number | null
          section_id?: string | null
          stars_collected?: number
          user_id: string
          world_id: string
        }
        Update: {
          attempts?: number
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          score?: number | null
          section_id?: string | null
          stars_collected?: number
          user_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "learning_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "learning_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      world_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
          world_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
          world_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "world_ratings_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "learning_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_follower_count: { Args: { user_uuid: string }; Returns: number }
      get_following_count: { Args: { user_uuid: string }; Returns: number }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          school: string
          website: string
        }[]
      }
      get_world_rating: {
        Args: { world_uuid: string }
        Returns: {
          average_rating: number
          total_ratings: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_fork_count: { Args: { world_uuid: string }; Returns: undefined }
      increment_view_count: { Args: { world_uuid: string }; Returns: undefined }
      upgrade_to_creator: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "creator" | "student"
      moon_phase:
        | "neumond"
        | "zunehmend"
        | "halbmond"
        | "vollmond"
        | "abnehmend"
      subject_type:
        | "mathematik"
        | "deutsch"
        | "englisch"
        | "biologie"
        | "physik"
        | "chemie"
        | "geschichte"
        | "geografie"
        | "kunst"
        | "musik"
        | "sport"
        | "informatik"
        | "allgemein"
      world_status: "draft" | "published" | "archived"
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
      app_role: ["admin", "creator", "student"],
      moon_phase: ["neumond", "zunehmend", "halbmond", "vollmond", "abnehmend"],
      subject_type: [
        "mathematik",
        "deutsch",
        "englisch",
        "biologie",
        "physik",
        "chemie",
        "geschichte",
        "geografie",
        "kunst",
        "musik",
        "sport",
        "informatik",
        "allgemein",
      ],
      world_status: ["draft", "published", "archived"],
    },
  },
} as const
