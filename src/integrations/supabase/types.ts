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
      properties: {
        Row: {
          address: string | null
          archived_at: string | null
          area_zone: string | null
          balcony: boolean
          bathrooms: number | null
          bedrooms: number | null
          cellar: boolean
          condition: string | null
          contract_type: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          elevator: boolean
          energy_class: string | null
          energy_performance_index_status: string | null
          energy_performance_index_value: number | null
          featured: boolean
          floors: number | null
          furnished: boolean
          garage: boolean
          garden: boolean
          historic_property: boolean
          id: string
          internal_notes: string | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          municipality: string | null
          panoramic_view: boolean
          postal_code: string | null
          price: number | null
          price_on_request: boolean
          property_type: string | null
          province: string | null
          published_at: string | null
          reference_code: string | null
          region: string | null
          short_notes: string | null
          show_full_address: boolean
          size_sqm: number | null
          slug: string | null
          status: Database["public"]["Enums"]["property_status"]
          status_note: string | null
          status_updated_at: string | null
          suspended_at: string | null
          terrace: boolean
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          area_zone?: string | null
          balcony?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          cellar?: boolean
          condition?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          elevator?: boolean
          energy_class?: string | null
          energy_performance_index_status?: string | null
          energy_performance_index_value?: number | null
          featured?: boolean
          floors?: number | null
          furnished?: boolean
          garage?: boolean
          garden?: boolean
          historic_property?: boolean
          id?: string
          internal_notes?: string | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          municipality?: string | null
          panoramic_view?: boolean
          postal_code?: string | null
          price?: number | null
          price_on_request?: boolean
          property_type?: string | null
          province?: string | null
          published_at?: string | null
          reference_code?: string | null
          region?: string | null
          short_notes?: string | null
          show_full_address?: boolean
          size_sqm?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          status_note?: string | null
          status_updated_at?: string | null
          suspended_at?: string | null
          terrace?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          area_zone?: string | null
          balcony?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          cellar?: boolean
          condition?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          elevator?: boolean
          energy_class?: string | null
          energy_performance_index_status?: string | null
          energy_performance_index_value?: number | null
          featured?: boolean
          floors?: number | null
          furnished?: boolean
          garage?: boolean
          garden?: boolean
          historic_property?: boolean
          id?: string
          internal_notes?: string | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          municipality?: string | null
          panoramic_view?: boolean
          postal_code?: string | null
          price?: number | null
          price_on_request?: boolean
          property_type?: string | null
          province?: string | null
          published_at?: string | null
          reference_code?: string | null
          region?: string | null
          short_notes?: string | null
          show_full_address?: boolean
          size_sqm?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          status_note?: string | null
          status_updated_at?: string | null
          suspended_at?: string | null
          terrace?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_descriptions: {
        Row: {
          edited_description: string | null
          generated_at: string | null
          generated_description: string | null
          id: string
          language: string
          length_preference: string | null
          property_id: string
          seo_focus: string | null
          tone_of_voice: string | null
          updated_at: string
        }
        Insert: {
          edited_description?: string | null
          generated_at?: string | null
          generated_description?: string | null
          id?: string
          language?: string
          length_preference?: string | null
          property_id: string
          seo_focus?: string | null
          tone_of_voice?: string | null
          updated_at?: string
        }
        Update: {
          edited_description?: string | null
          generated_at?: string | null
          generated_description?: string | null
          id?: string
          language?: string
          length_preference?: string | null
          property_id?: string
          seo_focus?: string | null
          tone_of_voice?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_descriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_features: {
        Row: {
          created_at: string
          feature_name: string
          feature_value: string | null
          id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          feature_value?: string | null
          id?: string
          property_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          feature_value?: string | null
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string
          desired_lighting: string | null
          id: string
          image_url: string
          import_status: string | null
          imported_source_url: string | null
          intervention_level: string | null
          is_cover: boolean
          is_imported: boolean
          original_image_url: string | null
          photo_category: string | null
          photo_type: string | null
          preserve_structure: boolean
          property_id: string
          published_image_url: string | null
          render_created_at: string | null
          render_error: string | null
          render_goal: string | null
          render_notes: string | null
          render_status: string
          render_style: string | null
          rendered_image_url: string | null
          rendered_storage_path: string | null
          room_condition: string | null
          sort_order: number
          storage_path: string
          use_rendered: boolean
          visual_target: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          desired_lighting?: string | null
          id?: string
          image_url: string
          import_status?: string | null
          imported_source_url?: string | null
          intervention_level?: string | null
          is_cover?: boolean
          is_imported?: boolean
          original_image_url?: string | null
          photo_category?: string | null
          photo_type?: string | null
          preserve_structure?: boolean
          property_id: string
          published_image_url?: string | null
          render_created_at?: string | null
          render_error?: string | null
          render_goal?: string | null
          render_notes?: string | null
          render_status?: string
          render_style?: string | null
          rendered_image_url?: string | null
          rendered_storage_path?: string | null
          room_condition?: string | null
          sort_order?: number
          storage_path: string
          use_rendered?: boolean
          visual_target?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          desired_lighting?: string | null
          id?: string
          image_url?: string
          import_status?: string | null
          imported_source_url?: string | null
          intervention_level?: string | null
          is_cover?: boolean
          is_imported?: boolean
          original_image_url?: string | null
          photo_category?: string | null
          photo_type?: string | null
          preserve_structure?: boolean
          property_id?: string
          published_image_url?: string | null
          render_created_at?: string | null
          render_error?: string | null
          render_goal?: string | null
          render_notes?: string | null
          render_status?: string
          render_style?: string | null
          rendered_image_url?: string | null
          rendered_storage_path?: string | null
          room_condition?: string | null
          sort_order?: number
          storage_path?: string
          use_rendered?: boolean
          visual_target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "editor"
      property_status:
        | "draft"
        | "ready"
        | "published"
        | "suspended"
        | "sold"
        | "rented"
        | "archived"
        | "deleted"
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
      app_role: ["admin", "editor"],
      property_status: [
        "draft",
        "ready",
        "published",
        "suspended",
        "sold",
        "rented",
        "archived",
        "deleted",
      ],
    },
  },
} as const
