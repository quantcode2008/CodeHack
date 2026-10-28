export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// ENUM TYPES
// ============================================================================

export type OrgType = "college" | "lab" | "makerspace" | "community";
export type UserRole = "user" | "owner" | "manager" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type ResourceCategory = "space" | "equipment" | "device" | "tool";
export type ResourceStatus = "draft" | "listed" | "paused";
export type RequirementType = "training" | "qualification" | "membership" | "authorisation" | "document";
export type CredentialStatus = "pending" | "verified" | "rejected" | "expired";
export type BookingStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "cancelled"
  | "checked_in"
  | "returned"
  | "overdue"
  | "disputed"
  | "completed";
export type ConditionPhase = "before" | "after";
export type ConditionRating = "excellent" | "good" | "fair" | "damaged";
export type IncidentType = "damage" | "delay" | "misuse" | "safety" | "conflict" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "under_review" | "resolved" | "dismissed";
export type WaitlistStatus = "waiting" | "offered" | "accepted" | "expired" | "cancelled";
export type NotificationType =
  | "booking_update"
  | "approval_needed"
  | "reminder"
  | "overdue"
  | "incident"
  | "credential"
  | "system";

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: OrgType;
          domain: string | null;
          verified: boolean;
          logo_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: OrgType;
          domain?: string | null;
          verified?: boolean;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: OrgType;
          domain?: string | null;
          verified?: boolean;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          organization_id: string | null;
          affiliation: string | null;
          verified_status: VerificationStatus;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          organization_id?: string | null;
          affiliation?: string | null;
          verified_status?: VerificationStatus;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          organization_id?: string | null;
          affiliation?: string | null;
          verified_status?: VerificationStatus;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      resources: {
        Row: {
          id: string;
          owner_id: string;
          organization_id: string | null;
          title: string;
          slug: string;
          category: ResourceCategory;
          description: string | null;
          location_text: string | null;
          lat: number | null;
          lng: number | null;
          photos: string[];
          capacity: number | null;
          requires_supervision: boolean;
          deposit_amount: number;
          credit_cost_per_hour: number;
          max_booking_hours: number;
          min_notice_hours: number;
          usage_rules: string | null;
          status: ResourceStatus;
          search: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          organization_id?: string | null;
          title: string;
          slug: string;
          category: ResourceCategory;
          description?: string | null;
          location_text?: string | null;
          lat?: number | null;
          lng?: number | null;
          photos?: string[];
          capacity?: number | null;
          requires_supervision?: boolean;
          deposit_amount?: number;
          credit_cost_per_hour?: number;
          max_booking_hours?: number;
          min_notice_hours?: number;
          usage_rules?: string | null;
          status?: ResourceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          organization_id?: string | null;
          title?: string;
          slug?: string;
          category?: ResourceCategory;
          description?: string | null;
          location_text?: string | null;
          lat?: number | null;
          lng?: number | null;
          photos?: string[];
          capacity?: number | null;
          requires_supervision?: boolean;
          deposit_amount?: number;
          credit_cost_per_hour?: number;
          max_booking_hours?: number;
          min_notice_hours?: number;
          usage_rules?: string | null;
          status?: ResourceStatus;
          created_at?: string;
          updated_at?: string;
        };
      };

      resource_requirements: {
        Row: {
          id: string;
          resource_id: string;
          type: RequirementType;
          label: string;
          description: string | null;
          requires_document: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          type: RequirementType;
          label: string;
          description?: string | null;
          requires_document?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          type?: RequirementType;
          label?: string;
          description?: string | null;
          requires_document?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_credentials: {
        Row: {
          id: string;
          user_id: string;
          requirement_label: string;
          type: RequirementType;
          document_path: string | null;
          status: CredentialStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          expires_at: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          requirement_label: string;
          type: RequirementType;
          document_path?: string | null;
          status?: CredentialStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          expires_at?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          requirement_label?: string;
          type?: RequirementType;
          document_path?: string | null;
          status?: CredentialStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          expires_at?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      availability_rules: {
        Row: {
          id: string;
          resource_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      availability_blackouts: {
        Row: {
          id: string;
          resource_id: string;
          blocked_range: string;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          blocked_range: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          blocked_range?: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      bookings: {
        Row: {
          id: string;
          resource_id: string;
          user_id: string;
          purpose: string;
          time_range: string;
          status: BookingStatus;
          decision_reason_codes: string[];
          decision_explanation: string | null;
          decided_by: string | null;
          decided_at: string | null;
          waitlist_priority_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          user_id: string;
          purpose: string;
          time_range: string;
          status?: BookingStatus;
          decision_reason_codes?: string[];
          decision_explanation?: string | null;
          decided_by?: string | null;
          decided_at?: string | null;
          waitlist_priority_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          user_id?: string;
          purpose?: string;
          time_range?: string;
          status?: BookingStatus;
          decision_reason_codes?: string[];
          decision_explanation?: string | null;
          decided_by?: string | null;
          decided_at?: string | null;
          waitlist_priority_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      condition_reports: {
        Row: {
          id: string;
          booking_id: string;
          phase: ConditionPhase;
          notes: string | null;
          photos: string[];
          overall: ConditionRating | null;
          recorded_by: string;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          phase: ConditionPhase;
          notes?: string | null;
          photos?: string[];
          overall?: ConditionRating | null;
          recorded_by: string;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          phase?: ConditionPhase;
          notes?: string | null;
          photos?: string[];
          overall?: ConditionRating | null;
          recorded_by?: string;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      incidents: {
        Row: {
          id: string;
          booking_id: string | null;
          resource_id: string;
          reported_by: string;
          type: IncidentType;
          severity: IncidentSeverity;
          description: string;
          ai_summary: string | null;
          status: IncidentStatus;
          resolution_note: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          resource_id: string;
          reported_by: string;
          type: IncidentType;
          severity?: IncidentSeverity;
          description: string;
          ai_summary?: string | null;
          status?: IncidentStatus;
          resolution_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          resource_id?: string;
          reported_by?: string;
          type?: IncidentType;
          severity?: IncidentSeverity;
          description?: string;
          ai_summary?: string | null;
          status?: IncidentStatus;
          resolution_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      waitlist_entries: {
        Row: {
          id: string;
          resource_id: string;
          user_id: string;
          desired_range: string;
          priority_score: number;
          score_breakdown: Json;
          status: WaitlistStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          user_id: string;
          desired_range: string;
          priority_score?: number;
          score_breakdown?: Json;
          status?: WaitlistStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          user_id?: string;
          desired_range?: string;
          priority_score?: number;
          score_breakdown?: Json;
          status?: WaitlistStatus;
          created_at?: string;
          updated_at?: string;
        };
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      usage_ledger: {
        Row: {
          id: string;
          user_id: string;
          booking_id: string | null;
          hours: number;
          credits: number;
          week_start: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          booking_id?: string | null;
          hours?: number;
          credits?: number;
          week_start: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          booking_id?: string | null;
          hours?: number;
          credits?: number;
          week_start?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: UserRole | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          booking_id: string | null;
          resource_id: string | null;
          before: Json | null;
          after: Json | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role?: UserRole | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          booking_id?: string | null;
          resource_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: never; // Append-only by design!
      };
    };

    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_resource_owner_or_manager: {
        Args: { p_resource_id: string };
        Returns: boolean;
      };
      get_fair_use_status: {
        Args: { p_user_id: string; p_resource_id: string };
        Returns: {
          is_blocked: boolean;
          rule_name: string | null;
          explanation: string | null;
        }[];
      };
      calculate_waitlist_score: {
        Args: { p_user_id: string; p_resource_id: string };
        Returns: {
          score: number;
          breakdown: Json;
        }[];
      };
      request_booking: {
        Args: {
          p_resource_id: string;
          p_time_range: string;
          p_purpose: string;
        };
        Returns: {
          outcome: "requested" | "waitlisted" | "blocked" | "error";
          booking_id?: string;
          waitlist_id?: string;
          reason_codes: string[];
          explanation: string;
        };
      };
      decide_booking: {
        Args: {
          p_booking_id: string;
          p_decision: "approved" | "rejected";
          p_reason_codes?: string[];
          p_explanation?: string;
        };
        Returns: Json;
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
          p_reason?: string;
        };
        Returns: Json;
      };
      check_in: {
        Args: {
          p_booking_id: string;
          p_condition: {
            notes?: string;
            photos?: string[];
            overall?: ConditionRating;
          };
        };
        Returns: Json;
      };
      check_out: {
        Args: {
          p_booking_id: string;
          p_condition: {
            notes?: string;
            photos?: string[];
            overall?: ConditionRating;
          };
        };
        Returns: Json;
      };
      complete_booking: {
        Args: { p_booking_id: string };
        Returns: Json;
      };
      report_incident: {
        Args: {
          p_booking_id?: string;
          p_resource_id: string;
          p_type: IncidentType;
          p_severity?: IncidentSeverity;
          p_description: string;
        };
        Returns: Json;
      };
      resolve_incident: {
        Args: {
          p_incident_id: string;
          p_resolution_note: string;
          p_status: IncidentStatus;
        };
        Returns: Json;
      };
      review_credential: {
        Args: {
          p_credential_id: string;
          p_status: CredentialStatus;
          p_note?: string;
        };
        Returns: Json;
      };
      mark_overdue_bookings: {
        Args: Record<PropertyKey, never>;
        Returns: {
          overdue_count: number;
          reminders_sent: number;
        };
      };
    };
  };
}

// ============================================================================
// CONVENIENCE TYPE ALIASES
// ============================================================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Organization = Tables<"organizations">;
export type Profile = Tables<"profiles">;
export type Resource = Tables<"resources">;
export type ResourceRequirement = Tables<"resource_requirements">;
export type UserCredential = Tables<"user_credentials">;
export type AvailabilityRule = Tables<"availability_rules">;
export type AvailabilityBlackout = Tables<"availability_blackouts">;
export type Booking = Tables<"bookings">;
export type ConditionReport = Tables<"condition_reports">;
export type Incident = Tables<"incidents">;
export type WaitlistEntry = Tables<"waitlist_entries">;
export type Notification = Tables<"notifications">;
export type UsageLedger = Tables<"usage_ledger">;
export type AuditLogEntry = Tables<"audit_log">;

