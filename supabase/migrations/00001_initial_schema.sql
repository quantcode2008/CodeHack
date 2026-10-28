-- ============================================================================
-- Commons — Initial Schema Migration
-- Trusted Campus Resource Sharing Platform
-- ============================================================================
-- This migration establishes the complete database schema including:
--   • Extensions
--   • Enum types
--   • All application tables (with RLS enabled)
--   • Indexes
--   • Triggers (updated_at, audit_log immutability)
--   • Storage buckets
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- GiST index support for exclusion constraints
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Cryptographic functions (gen_random_uuid fallback)


-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================

CREATE TYPE org_type             AS ENUM ('college', 'lab', 'makerspace', 'community');
CREATE TYPE user_role            AS ENUM ('user', 'owner', 'manager', 'admin');
CREATE TYPE verification_status  AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE resource_category    AS ENUM ('space', 'equipment', 'device', 'tool');
CREATE TYPE resource_status      AS ENUM ('draft', 'listed', 'paused');
CREATE TYPE requirement_type     AS ENUM ('training', 'qualification', 'membership', 'authorisation', 'document');
CREATE TYPE credential_status    AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE booking_status       AS ENUM ('requested', 'approved', 'rejected', 'waitlisted', 'cancelled', 'checked_in', 'returned', 'overdue', 'disputed', 'completed');
CREATE TYPE condition_phase      AS ENUM ('before', 'after');
CREATE TYPE condition_rating     AS ENUM ('excellent', 'good', 'fair', 'damaged');
CREATE TYPE incident_type        AS ENUM ('damage', 'delay', 'misuse', 'safety', 'conflict', 'other');
CREATE TYPE incident_severity    AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status      AS ENUM ('open', 'under_review', 'resolved', 'dismissed');
CREATE TYPE waitlist_status      AS ENUM ('waiting', 'offered', 'accepted', 'expired', 'cancelled');
CREATE TYPE notification_type    AS ENUM ('booking_update', 'approval_needed', 'reminder', 'overdue', 'incident', 'credential', 'system');


-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- Trigger function: automatically set updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. TABLES
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 4.1  organizations
-- ----------------------------------------------------------------------------
CREATE TABLE organizations (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text            NOT NULL,
  type          org_type        NOT NULL,
  domain        text,
  verified      boolean         DEFAULT false,
  logo_url      text,
  description   text,
  created_at    timestamptz     NOT NULL DEFAULT now(),
  updated_at    timestamptz     NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.2  profiles
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id                uuid                PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text                NOT NULL,
  email             text                NOT NULL,
  role              user_role           NOT NULL DEFAULT 'user',
  organization_id   uuid                REFERENCES organizations(id),
  affiliation       text,
  verified_status   verification_status DEFAULT 'unverified',
  avatar_url        text,
  phone             text,
  created_at        timestamptz         NOT NULL DEFAULT now(),
  updated_at        timestamptz         NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.3  resources
-- ----------------------------------------------------------------------------
CREATE TABLE resources (
  id                    uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              uuid                NOT NULL REFERENCES profiles(id),
  organization_id       uuid                REFERENCES organizations(id),
  title                 text                NOT NULL,
  slug                  text                NOT NULL UNIQUE,
  category              resource_category   NOT NULL,
  description           text,
  location_text         text,
  lat                   double precision,
  lng                   double precision,
  photos                text[]              DEFAULT '{}',
  capacity              int,
  requires_supervision  boolean             DEFAULT false,
  deposit_amount        numeric(10,2)       DEFAULT 0,
  credit_cost_per_hour  numeric(10,2)       DEFAULT 0,
  max_booking_hours     int                 DEFAULT 4,
  min_notice_hours      int                 DEFAULT 1,
  usage_rules           text,
  status                resource_status     DEFAULT 'draft',
  search                tsvector            GENERATED ALWAYS AS (
                          to_tsvector('english',
                            coalesce(title, '') || ' ' ||
                            coalesce(description, '') || ' ' ||
                            coalesce(location_text, '')
                          )
                        ) STORED,
  created_at            timestamptz         NOT NULL DEFAULT now(),
  updated_at            timestamptz         NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_resources_search   ON resources USING GIN (search);
CREATE INDEX idx_resources_slug     ON resources (slug);
CREATE INDEX idx_resources_owner    ON resources (owner_id);
CREATE INDEX idx_resources_status   ON resources (status);

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.4  resource_requirements
-- ----------------------------------------------------------------------------
CREATE TABLE resource_requirements (
  id                uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id       uuid              NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  type              requirement_type  NOT NULL,
  label             text              NOT NULL,
  description       text,
  requires_document boolean           DEFAULT false,
  created_at        timestamptz       NOT NULL DEFAULT now(),
  updated_at        timestamptz       NOT NULL DEFAULT now(),

  UNIQUE (resource_id, label)
);

ALTER TABLE resource_requirements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_resource_requirements_updated_at
  BEFORE UPDATE ON resource_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.5  user_credentials
-- ----------------------------------------------------------------------------
CREATE TABLE user_credentials (
  id                uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requirement_label text              NOT NULL,
  type              requirement_type  NOT NULL,
  document_path     text,
  status            credential_status DEFAULT 'pending',
  reviewed_by       uuid              REFERENCES profiles(id),
  reviewed_at       timestamptz,
  expires_at        timestamptz,
  review_note       text,
  created_at        timestamptz       NOT NULL DEFAULT now(),
  updated_at        timestamptz       NOT NULL DEFAULT now()
);

ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_credentials_lookup ON user_credentials (user_id, requirement_label);

CREATE TRIGGER trg_user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.6  availability_rules
-- ----------------------------------------------------------------------------
CREATE TABLE availability_rules (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   uuid        NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  weekday       int         NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time    time        NOT NULL,
  end_time      time        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CHECK (start_time < end_time),
  UNIQUE (resource_id, weekday, start_time)
);

ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_availability_rules_updated_at
  BEFORE UPDATE ON availability_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.7  availability_blackouts
-- ----------------------------------------------------------------------------
CREATE TABLE availability_blackouts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id     uuid        NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  blocked_range   tstzrange   NOT NULL,
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Prevent overlapping blackout windows for the same resource
  EXCLUDE USING gist (resource_id WITH =, blocked_range WITH &&)
);

ALTER TABLE availability_blackouts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_availability_blackouts_updated_at
  BEFORE UPDATE ON availability_blackouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.8  bookings
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
  id                      uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id             uuid            NOT NULL REFERENCES resources(id),
  user_id                 uuid            NOT NULL REFERENCES profiles(id),
  purpose                 text            NOT NULL,
  time_range              tstzrange       NOT NULL,
  status                  booking_status  DEFAULT 'requested',
  decision_reason_codes   text[]          DEFAULT '{}',
  decision_explanation    text,
  decided_by              uuid            REFERENCES profiles(id),
  decided_at              timestamptz,
  waitlist_priority_score numeric(8,2),
  created_at              timestamptz     NOT NULL DEFAULT now(),
  updated_at              timestamptz     NOT NULL DEFAULT now(),

  -- Prevent double-booking: only one approved/checked-in/overdue reservation per time slot
  EXCLUDE USING gist (resource_id WITH =, time_range WITH &&)
    WHERE (status IN ('approved', 'checked_in', 'overdue'))
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bookings_user     ON bookings (user_id);
CREATE INDEX idx_bookings_resource ON bookings (resource_id);
CREATE INDEX idx_bookings_status   ON bookings (status);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.9  condition_reports
-- ----------------------------------------------------------------------------
CREATE TABLE condition_reports (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid              NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  phase         condition_phase   NOT NULL,
  notes         text,
  photos        text[]            DEFAULT '{}',
  overall       condition_rating,
  recorded_by   uuid              NOT NULL REFERENCES profiles(id),
  recorded_at   timestamptz       DEFAULT now(),
  created_at    timestamptz       NOT NULL DEFAULT now(),
  updated_at    timestamptz       NOT NULL DEFAULT now(),

  UNIQUE (booking_id, phase)
);

ALTER TABLE condition_reports ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_condition_reports_updated_at
  BEFORE UPDATE ON condition_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.10 incidents
-- ----------------------------------------------------------------------------
CREATE TABLE incidents (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid              REFERENCES bookings(id),
  resource_id     uuid              NOT NULL REFERENCES resources(id),
  reported_by     uuid              NOT NULL REFERENCES profiles(id),
  type            incident_type     NOT NULL,
  severity        incident_severity DEFAULT 'low',
  description     text              NOT NULL,
  ai_summary      text,
  status          incident_status   DEFAULT 'open',
  resolution_note text,
  resolved_by     uuid              REFERENCES profiles(id),
  resolved_at     timestamptz,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.11 waitlist_entries
-- ----------------------------------------------------------------------------
CREATE TABLE waitlist_entries (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id     uuid            NOT NULL REFERENCES resources(id),
  user_id         uuid            NOT NULL REFERENCES profiles(id),
  desired_range   tstzrange       NOT NULL,
  priority_score  numeric(8,2)    DEFAULT 0,
  score_breakdown jsonb           DEFAULT '{}',
  status          waitlist_status DEFAULT 'waiting',
  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now()
);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_waitlist_entries_lookup
  ON waitlist_entries (resource_id, status, priority_score DESC);

CREATE TRIGGER trg_waitlist_entries_updated_at
  BEFORE UPDATE ON waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.12 notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       text              NOT NULL,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  updated_at  timestamptz       NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at);

CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.13 usage_ledger
-- ----------------------------------------------------------------------------
CREATE TABLE usage_ledger (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES profiles(id),
  booking_id  uuid          REFERENCES bookings(id),
  hours       numeric(6,2)  NOT NULL DEFAULT 0,
  credits     numeric(10,2) NOT NULL DEFAULT 0,
  week_start  date          NOT NULL,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_usage_ledger_user_week ON usage_ledger (user_id, week_start);

CREATE TRIGGER trg_usage_ledger_updated_at
  BEFORE UPDATE ON usage_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ----------------------------------------------------------------------------
-- 4.14 audit_log  (APPEND-ONLY — no updated_at column)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      uuid        REFERENCES profiles(id),
  actor_role    user_role,
  action        text        NOT NULL,
  entity_type   text        NOT NULL,
  entity_id     uuid,
  booking_id    uuid,
  resource_id   uuid,
  before        jsonb,
  after         jsonb,
  reason        text,
  created_at    timestamptz NOT NULL DEFAULT now()
  -- NOTE: No updated_at — this table is strictly append-only
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_log_entity    ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_booking   ON audit_log (booking_id);
CREATE INDEX idx_audit_log_actor     ON audit_log (actor_id);


-- ============================================================================
-- 5. AUDIT_LOG IMMUTABILITY TRIGGERS
-- ============================================================================

-- Prevent any UPDATE on audit_log
CREATE OR REPLACE FUNCTION audit_log_no_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: updates are forbidden';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_no_update();

-- Prevent any DELETE on audit_log
CREATE OR REPLACE FUNCTION audit_log_no_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: deletes are forbidden';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_no_delete();


-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('resource-photos', 'resource-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('credentials', 'credentials', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('condition-photos', 'condition-photos', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
