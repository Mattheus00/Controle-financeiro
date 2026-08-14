export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar_url: string | null;
          currency: string;
          timezone: string;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark" | "system";
          locale: string;
          week_starts_on: number;
        } & Timestamps;
        Insert: {
          user_id: string;
          theme?: "light" | "dark" | "system";
          locale?: string;
          week_starts_on?: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Insert"]>;
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          initial_balance_cents: number;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          type?: string;
          initial_balance_cents?: number;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
        Relationships: [];
      };
      credit_cards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand: string | null;
          last_four: string | null;
          limit_cents: number | null;
          closing_day: number;
          due_day: number;
          color: string | null;
          is_active: boolean;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          brand?: string | null;
          last_four?: string | null;
          limit_cents?: number | null;
          closing_day: number;
          due_day: number;
          color?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["credit_cards"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          type: string;
          is_default: boolean;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          type?: string;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      merchant_icon_rules: {
        Row: {
          id: string;
          user_id: string | null;
          pattern: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          pattern: string;
          icon: string;
        };
        Update: Partial<Database["public"]["Tables"]["merchant_icon_rules"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          amount_cents: number;
          date: string;
          category_id: string | null;
          account_id: string | null;
          credit_card_id: string | null;
          destination_account_id: string | null;
          payment_method: string | null;
          merchant: string | null;
          notes: string | null;
          is_recurring: boolean;
          recurring_transaction_id: string | null;
          parent_transaction_id: string | null;
          installment_number: number | null;
          installment_total: number | null;
          icon: string | null;
          tags: string[];
        } & Timestamps;
        Insert: {
          user_id: string;
          type: string;
          description: string;
          amount_cents: number;
          date: string;
          category_id?: string | null;
          account_id?: string | null;
          credit_card_id?: string | null;
          destination_account_id?: string | null;
          payment_method?: string | null;
          merchant?: string | null;
          notes?: string | null;
          is_recurring?: boolean;
          recurring_transaction_id?: string | null;
          parent_transaction_id?: string | null;
          installment_number?: number | null;
          installment_total?: number | null;
          icon?: string | null;
          tags?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
      transaction_installments: {
        Row: {
          id: string;
          user_id: string;
          parent_transaction_id: string;
          transaction_id: string | null;
          number: number;
          total: number;
          amount_cents: number;
          due_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          parent_transaction_id: string;
          transaction_id?: string | null;
          number: number;
          total: number;
          amount_cents: number;
          due_date: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transaction_installments"]["Insert"]>;
        Relationships: [];
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount_cents: number;
          due_date: string;
          category_id: string | null;
          account_id: string | null;
          credit_card_id: string | null;
          status: string;
          icon: string | null;
          notes: string | null;
          recurring_transaction_id: string | null;
          paid_transaction_id: string | null;
          paid_at: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          amount_cents: number;
          due_date: string;
          category_id?: string | null;
          account_id?: string | null;
          credit_card_id?: string | null;
          status?: string;
          icon?: string | null;
          notes?: string | null;
          recurring_transaction_id?: string | null;
          paid_transaction_id?: string | null;
          paid_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bills"]["Insert"]>;
        Relationships: [];
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          amount_cents: number;
          category_id: string | null;
          account_id: string | null;
          credit_card_id: string | null;
          payment_method: string | null;
          merchant: string | null;
          icon: string | null;
          frequency: string;
          interval_count: number;
          day_of_month: number | null;
          weekday: number | null;
          start_date: string;
          end_date: string | null;
          next_occurrence: string;
          is_active: boolean;
          generate_as: string;
        } & Timestamps;
        Insert: {
          user_id: string;
          type: string;
          description: string;
          amount_cents: number;
          frequency: string;
          next_occurrence: string;
          start_date: string;
          category_id?: string | null;
          account_id?: string | null;
          credit_card_id?: string | null;
          payment_method?: string | null;
          merchant?: string | null;
          icon?: string | null;
          interval_count?: number;
          day_of_month?: number | null;
          weekday?: number | null;
          end_date?: string | null;
          is_active?: boolean;
          generate_as?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recurring_transactions"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount_cents: number;
          category_id: string | null;
          account_id: string | null;
          credit_card_id: string | null;
          billing_day: number;
          icon: string | null;
          merchant: string | null;
          is_active: boolean;
          recurring_transaction_id: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          amount_cents: number;
          billing_day: number;
          category_id?: string | null;
          account_id?: string | null;
          credit_card_id?: string | null;
          icon?: string | null;
          merchant?: string | null;
          is_active?: boolean;
          recurring_transaction_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount_cents: number;
          month: string;
        } & Timestamps;
        Insert: {
          user_id: string;
          category_id: string;
          amount_cents: number;
          month: string;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
        Relationships: [];
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_cents: number;
          current_cents: number;
          deadline: string | null;
          icon: string | null;
          color: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          name: string;
          target_cents: number;
          current_cents?: number;
          deadline?: string | null;
          icon?: string | null;
          color?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["financial_goals"]["Insert"]>;
        Relationships: [];
      };
      financial_goal_contributions: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          amount_cents: number;
          contributed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          goal_id: string;
          amount_cents: number;
          contributed_at?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["financial_goal_contributions"]["Insert"]>;
        Relationships: [];
      };
      attachments: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string | null;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          original_name: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          transaction_id?: string | null;
          original_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
        Relationships: [];
      };
      receipt_scans: {
        Row: {
          id: string;
          user_id: string;
          attachment_id: string | null;
          storage_path: string;
          status: string;
          extracted: Json | null;
          confidence: number | null;
          transaction_id: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          storage_path: string;
          attachment_id?: string | null;
          status?: string;
          extracted?: Json | null;
          confidence?: number | null;
          transaction_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["receipt_scans"]["Insert"]>;
        Relationships: [];
      };
      merchant_brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_path: string | null;
          category_slug: string | null;
          aliases: string[];
          website: string | null;
          background_color: string | null;
          foreground_color: string | null;
          is_verified: boolean;
          is_active: boolean;
        } & Timestamps;
        Insert: {
          name: string;
          slug: string;
          logo_path?: string | null;
          category_slug?: string | null;
          aliases?: string[];
          website?: string | null;
          background_color?: string | null;
          foreground_color?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["merchant_brands"]["Insert"]>;
        Relationships: [];
      };
      user_merchant_rules: {
        Row: {
          id: string;
          user_id: string;
          merchant_pattern: string;
          custom_name: string | null;
          category_id: string | null;
          custom_icon: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          merchant_pattern: string;
          custom_name?: string | null;
          category_id?: string | null;
          custom_icon?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_merchant_rules"]["Insert"]>;
        Relationships: [];
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: "privacy_policy" | "terms_of_use" | "marketing_email";
          policy_version: string;
          granted: boolean;
          granted_at: string | null;
          revoked_at: string | null;
          source: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          consent_type: "privacy_policy" | "terms_of_use" | "marketing_email";
          policy_version: string;
          granted: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          source?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_consents"]["Insert"]>;
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          metadata_minimal: Json;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          event_type: string;
          metadata_minimal?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["audit_events"]["Insert"]>;
        Relationships: [];
      };
      privacy_requests: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          status: string;
          created_at: string;
          completed_at: string | null;
          notes_internal: string | null;
          message: string | null;
          assigned_admin_id: string | null;
          admin_response: string | null;
          resolution_status: string | null;
          responded_at: string | null;
          response_delivery_status: string;
          response_delivery_error_code: string | null;
        };
        Insert: {
          user_id: string;
          type: string;
          status?: string;
          message?: string | null;
          notes_internal?: string | null;
          assigned_admin_id?: string | null;
          admin_response?: string | null;
          resolution_status?: string | null;
          responded_at?: string | null;
          response_delivery_status?: string;
          response_delivery_error_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["privacy_requests"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: "admin";
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          user_id: string;
          role: "admin";
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      data_export_jobs: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          storage_path: string | null;
          error_code: string | null;
          created_at: string;
          completed_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          user_id: string;
          status?: string;
          storage_path?: string | null;
          error_code?: string | null;
          completed_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["data_export_jobs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number };
        Returns: boolean;
      };
      issue_email_confirmation: {
        Args: { p_user_id: string; p_token_hash: string; p_secret: string };
        Returns: boolean;
      };
      issue_email_confirmation_for_email: {
        Args: { p_email: string; p_token_hash: string; p_secret: string };
        Returns: boolean;
      };
      confirm_email_with_token: {
        Args: { p_token: string };
        Returns: boolean;
      };
      write_audit_event: {
        Args: { p_event_type: string; p_metadata?: Json };
        Returns: undefined;
      };
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      purge_expired_exports: {
        Args: Record<string, never>;
        Returns: number;
      };
      admin_dashboard_metrics: {
        Args: Record<string, never>;
        Returns: Json;
      };
      admin_list_privacy_requests: {
        Args: { p_status?: string | null };
        Returns: {
          request_id: string;
          customer_name: string;
          request_type: string;
          request_status: string;
          request_message: string | null;
          request_created_at: string;
          assigned_to_current_admin: boolean;
          response_message: string | null;
          response_resolution: string | null;
          delivery_status: string;
          delivery_error_code: string | null;
          response_sent_at: string | null;
        }[];
      };
      admin_start_privacy_request: {
        Args: { p_request_id: string };
        Returns: boolean;
      };
      admin_prepare_privacy_response: {
        Args: { p_request_id: string; p_resolution: string; p_response: string };
        Returns: Json;
      };
      admin_finish_privacy_response: {
        Args: { p_request_id: string; p_sent: boolean; p_error_code?: string | null };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
