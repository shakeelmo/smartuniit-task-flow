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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_budget_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          proposal_id: string
          quantity: number | null
          sort_order: number | null
          total_price: number | null
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          proposal_id: string
          quantity?: number | null
          sort_order?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          proposal_id?: string
          quantity?: number | null
          sort_order?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_budget_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_case_studies: {
        Row: {
          client_name: string | null
          created_at: string
          description: string | null
          id: string
          proposal_id: string
          sort_order: number | null
          testimonial: string | null
          title: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          proposal_id: string
          sort_order?: number | null
          testimonial?: string | null
          title: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          proposal_id?: string
          sort_order?: number | null
          testimonial?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_case_studies_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_commercial_items: {
        Row: {
          created_at: string
          description: string
          id: string
          proposal_id: string | null
          quantity: number
          serial_number: number
          sort_order: number | null
          total_price: number | null
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          proposal_id?: string | null
          quantity?: number
          serial_number: number
          sort_order?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          proposal_id?: string | null
          quantity?: number
          serial_number?: number
          sort_order?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_commercial_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_deliverables: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_collapsible: boolean | null
          proposal_id: string
          sort_order: number | null
          sub_tasks: Json | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_collapsible?: boolean | null
          proposal_id: string
          sort_order?: number | null
          sub_tasks?: Json | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_collapsible?: boolean | null
          proposal_id?: string
          sort_order?: number | null
          sub_tasks?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_deliverables_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_timeline: {
        Row: {
          completion_date: string | null
          created_at: string
          description: string | null
          id: string
          phase_name: string
          proposal_id: string
          sort_order: number | null
          start_date: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          phase_name: string
          proposal_id: string
          sort_order?: number | null
          start_date?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          phase_name?: string
          proposal_id?: string
          sort_order?: number | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_timeline_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          id: string
          proposal_id: string | null
          review_date: string | null
          reviewer_name: string | null
          version_number: string
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          id?: string
          proposal_id?: string | null
          review_date?: string | null
          reviewer_name?: string | null
          version_number: string
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          id?: string
          proposal_id?: string | null
          review_date?: string | null
          reviewer_name?: string | null
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          abstract: string | null
          appendix: string | null
          background_context: string | null
          bank_details: Json | null
          call_to_action: string | null
          client_address: string | null
          client_company_name: string | null
          client_contact_person: string | null
          client_email: string | null
          client_logo_url: string | null
          client_phone: string | null
          client_signature_data: string | null
          company_bio: string | null
          company_contact_details: string | null
          company_logo_url: string | null
          company_name: string | null
          company_signature_data: string | null
          confidentiality_included: boolean | null
          created_at: string
          customer_logo_url: string | null
          customer_prerequisites: string | null
          document_reviewers: Json | null
          executive_summary: string | null
          glossary: string | null
          id: string
          is_bilingual: boolean | null
          key_objectives: string | null
          payment_terms: string | null
          problem_description: string | null
          project_duration_days: number | null
          project_name: string | null
          proposed_solution: string | null
          quotation_data: Json | null
          reference_number: string | null
          signature_date: string | null
          status: string
          strategy_method: string | null
          submission_date: string | null
          table_of_contents: boolean | null
          team_bios: Json | null
          team_photo_url: string | null
          template_customization: Json | null
          terms_conditions: string | null
          title: string
          understanding_requirements: string | null
          updated_at: string
          user_id: string
          version_number: string | null
          why_choose_us: string | null
        }
        Insert: {
          abstract?: string | null
          appendix?: string | null
          background_context?: string | null
          bank_details?: Json | null
          call_to_action?: string | null
          client_address?: string | null
          client_company_name?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_phone?: string | null
          client_signature_data?: string | null
          company_bio?: string | null
          company_contact_details?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_signature_data?: string | null
          confidentiality_included?: boolean | null
          created_at?: string
          customer_logo_url?: string | null
          customer_prerequisites?: string | null
          document_reviewers?: Json | null
          executive_summary?: string | null
          glossary?: string | null
          id?: string
          is_bilingual?: boolean | null
          key_objectives?: string | null
          payment_terms?: string | null
          problem_description?: string | null
          project_duration_days?: number | null
          project_name?: string | null
          proposed_solution?: string | null
          quotation_data?: Json | null
          reference_number?: string | null
          signature_date?: string | null
          status?: string
          strategy_method?: string | null
          submission_date?: string | null
          table_of_contents?: boolean | null
          team_bios?: Json | null
          team_photo_url?: string | null
          template_customization?: Json | null
          terms_conditions?: string | null
          title: string
          understanding_requirements?: string | null
          updated_at?: string
          user_id: string
          version_number?: string | null
          why_choose_us?: string | null
        }
        Update: {
          abstract?: string | null
          appendix?: string | null
          background_context?: string | null
          bank_details?: Json | null
          call_to_action?: string | null
          client_address?: string | null
          client_company_name?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_phone?: string | null
          client_signature_data?: string | null
          company_bio?: string | null
          company_contact_details?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_signature_data?: string | null
          confidentiality_included?: boolean | null
          created_at?: string
          customer_logo_url?: string | null
          customer_prerequisites?: string | null
          document_reviewers?: Json | null
          executive_summary?: string | null
          glossary?: string | null
          id?: string
          is_bilingual?: boolean | null
          key_objectives?: string | null
          payment_terms?: string | null
          problem_description?: string | null
          project_duration_days?: number | null
          project_name?: string | null
          proposed_solution?: string | null
          quotation_data?: Json | null
          reference_number?: string | null
          signature_date?: string | null
          status?: string
          strategy_method?: string | null
          submission_date?: string | null
          table_of_contents?: boolean | null
          team_bios?: Json | null
          team_photo_url?: string | null
          template_customization?: Json | null
          terms_conditions?: string | null
          title?: string
          understanding_requirements?: string | null
          updated_at?: string
          user_id?: string
          version_number?: string | null
          why_choose_us?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
