-- ============================================================================
-- Migration 00002: Row Level Security Policies
-- Commons — Trusted Campus Resource Sharing
-- ============================================================================
-- This migration enables RLS on every table and defines granular access
-- policies aligned with the four platform roles:
--   student  — discovers resources, books, checks in, returns
--   owner    — manages listings, reviews requests, inspects returns
--   manager  — org-scoped oversight, verifies check-ins / returns
--   admin    — campus-wide authority, full audit access
--
-- Design invariants enforced here:
--   • No direct client UPDATE on bookings, incidents, or usage_ledger
--     (all mutations flow through SECURITY DEFINER RPC functions).
--   • audit_log is append-only (INSERT/UPDATE/DELETE blocked by triggers
--     in migration 00001); SELECT is scoped to participants + admins.
--   • notifications & usage_ledger are system-created via RPC; users may
--     only read (and, for notifications, mark-as-read / delete) their own.
-- ============================================================================

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §0  Helper Functions
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Returns the role of the currently authenticated user.
-- SECURITY DEFINER so RLS policies can call it without recursion on profiles.
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION get_user_role() IS
  'Returns the platform role of the current session user. Used by RLS policies.';

-- Returns TRUE if the current user is the resource owner, or a manager/admin
-- within the same organization as the resource.
CREATE OR REPLACE FUNCTION is_resource_owner_or_manager(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM resources r
    JOIN profiles p ON p.id = auth.uid()
    WHERE r.id = p_resource_id
      AND (
        r.owner_id = auth.uid()
        OR (
          p.role IN ('manager', 'admin')
          AND r.organization_id = p.organization_id
        )
      )
  );
$$;

COMMENT ON FUNCTION is_resource_owner_or_manager(uuid) IS
  'Checks whether the current user owns the resource or is a manager/admin in the same org.';


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §1  organizations
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- All verified campus community members can browse organizations.
-- Only admins may create or modify organizations.
-- Deletion is not supported (soft-archive pattern).

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select_authenticated"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "organizations_insert_admin"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "organizations_update_admin"
  ON organizations FOR UPDATE
  TO authenticated
  USING  (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- No DELETE policy — organizations are never hard-deleted.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §2  profiles
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Basic profile info is visible campus-wide (name, department, avatar).
-- Users create and update their own profile; admins may update any profile.
-- Deletion is handled by the auth.users cascade, not directly.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING  (id = auth.uid() OR get_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR get_user_role() = 'admin');

-- No DELETE policy — profile removal cascades from auth.users.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §3  resources
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Discovery: any authenticated user sees 'listed' resources.
-- Owners always see their own resources regardless of status.
-- Managers/admins see all resources within their organization.
-- Only owners, managers, and admins may create resources.
-- Updates: owner of the resource, or org-scoped managers/admins.
-- Deletion: owner only, and only when the resource is still in 'draft'.

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_listed_or_privileged"
  ON resources FOR SELECT
  TO authenticated
  USING (
    status = 'listed'
    OR owner_id = auth.uid()
    OR (
      get_user_role() IN ('manager', 'admin')
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "resources_insert_owner_manager_admin"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() IN ('owner', 'manager', 'admin')
  );

CREATE POLICY "resources_update_owner_or_org_staff"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR (
      get_user_role() IN ('manager', 'admin')
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR (
      get_user_role() IN ('manager', 'admin')
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "resources_delete_owner_draft_only"
  ON resources FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND status = 'draft'
  );


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §4  resource_requirements
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Readable for listed resources (so prospective bookers see prerequisites).
-- Owners/managers see requirements for any of their resources.
-- Writable by resource owner or org-scoped managers/admins.

ALTER TABLE resource_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resource_requirements_select"
  ON resource_requirements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resources r
      WHERE r.id = resource_requirements.resource_id
        AND r.status = 'listed'
    )
    OR is_resource_owner_or_manager(resource_id)
  );

CREATE POLICY "resource_requirements_insert"
  ON resource_requirements FOR INSERT
  TO authenticated
  WITH CHECK (
    is_resource_owner_or_manager(resource_id)
  );

CREATE POLICY "resource_requirements_update"
  ON resource_requirements FOR UPDATE
  TO authenticated
  USING  (is_resource_owner_or_manager(resource_id))
  WITH CHECK (is_resource_owner_or_manager(resource_id));

CREATE POLICY "resource_requirements_delete"
  ON resource_requirements FOR DELETE
  TO authenticated
  USING (is_resource_owner_or_manager(resource_id));


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §5  user_credentials
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Users see their own credentials.
-- Resource owners/managers can view credentials for users who have bookings
-- on their resources (to evaluate eligibility).
-- Admins see all credentials.
-- Users insert their own; update own pending credentials.
-- Reviewers (owner/manager/admin) can update to change review status.
-- Users may delete their own pending credentials.

ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_credentials_select"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE b.user_id = user_credentials.user_id
        AND (
          r.owner_id = auth.uid()
          OR (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
            AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "user_credentials_insert_own"
  ON user_credentials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_credentials_update_own_or_reviewer"
  ON user_credentials FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE b.user_id = user_credentials.user_id
        AND (
          r.owner_id = auth.uid()
          OR (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
            AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
          )
        )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE b.user_id = user_credentials.user_id
        AND (
          r.owner_id = auth.uid()
          OR (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
            AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "user_credentials_delete_own_pending"
  ON user_credentials FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'pending'
  );


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §6  availability_rules
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Readable for listed resources (so users see when a resource is available).
-- Owners/managers see all rules for their resources.
-- Writable by resource owner or org-scoped managers/admins.

ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_rules_select"
  ON availability_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resources r
      WHERE r.id = availability_rules.resource_id
        AND r.status = 'listed'
    )
    OR is_resource_owner_or_manager(resource_id)
  );

CREATE POLICY "availability_rules_insert"
  ON availability_rules FOR INSERT
  TO authenticated
  WITH CHECK (is_resource_owner_or_manager(resource_id));

CREATE POLICY "availability_rules_update"
  ON availability_rules FOR UPDATE
  TO authenticated
  USING  (is_resource_owner_or_manager(resource_id))
  WITH CHECK (is_resource_owner_or_manager(resource_id));

CREATE POLICY "availability_rules_delete"
  ON availability_rules FOR DELETE
  TO authenticated
  USING (is_resource_owner_or_manager(resource_id));


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §7  availability_blackouts
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Same visibility and write rules as availability_rules.

ALTER TABLE availability_blackouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_blackouts_select"
  ON availability_blackouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resources r
      WHERE r.id = availability_blackouts.resource_id
        AND r.status = 'listed'
    )
    OR is_resource_owner_or_manager(resource_id)
  );

CREATE POLICY "availability_blackouts_insert"
  ON availability_blackouts FOR INSERT
  TO authenticated
  WITH CHECK (is_resource_owner_or_manager(resource_id));

CREATE POLICY "availability_blackouts_update"
  ON availability_blackouts FOR UPDATE
  TO authenticated
  USING  (is_resource_owner_or_manager(resource_id))
  WITH CHECK (is_resource_owner_or_manager(resource_id));

CREATE POLICY "availability_blackouts_delete"
  ON availability_blackouts FOR DELETE
  TO authenticated
  USING (is_resource_owner_or_manager(resource_id));


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §8  bookings
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Users see their own bookings.
-- Resource owners/managers see bookings for their resources.
-- Admins see all bookings.
-- Insert: any authenticated user may request a booking (user_id = self).
-- UPDATE and DELETE are BLOCKED — all status changes go through RPC functions.

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_participant_or_admin"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_resource_owner_or_manager(resource_id)
    OR get_user_role() = 'admin'
  );

CREATE POLICY "bookings_insert_authenticated"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE policy — booking status transitions are managed exclusively
-- through validated Postgres RPC functions (request_booking, approve_booking,
-- reject_booking, check_in_resource, return_resource, etc.).

-- No DELETE policy — bookings are never hard-deleted; they carry
-- an immutable audit trail.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §9  condition_reports
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Visible to booking participants (the user who booked, the resource
-- owner, and org managers/admins).
-- Insert: only booking participants may file a condition report.
-- No UPDATE or DELETE — condition photos are immutable evidence.

ALTER TABLE condition_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "condition_reports_select_participant_or_admin"
  ON condition_reports FOR SELECT
  TO authenticated
  USING (
    recorded_by = auth.uid()
    OR get_user_role() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE b.id = condition_reports.booking_id
        AND (
          b.user_id = auth.uid()
          OR r.owner_id = auth.uid()
          OR (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
            AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "condition_reports_insert_participant"
  ON condition_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    recorded_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE b.id = condition_reports.booking_id
        AND (
          b.user_id = auth.uid()
          OR r.owner_id = auth.uid()
          OR (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
            AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
          )
        )
    )
  );

-- No UPDATE policy — condition reports are immutable records.
-- No DELETE policy — condition reports are permanent evidence.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §10  incidents
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Visible to the reporter, the resource owner/manager, and admins.
-- Insert: any authenticated user may report (reported_by = self).
-- No UPDATE or DELETE — incident lifecycle managed via RPC.

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_select_reporter_owner_admin"
  ON incidents FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR get_user_role() = 'admin'
    OR is_resource_owner_or_manager(resource_id)
  );

CREATE POLICY "incidents_insert_authenticated"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

-- No UPDATE policy — incident resolution goes through RPC functions.
-- No DELETE policy — incidents are permanent records.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §11  waitlist_entries
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Users see their own waitlist positions.
-- Resource owners/managers see entries for their resources.
-- Admins see all.
-- Insert: authenticated users for themselves.
-- Delete: users may cancel their own entries.
-- No UPDATE — position changes are system-managed.

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_entries_select"
  ON waitlist_entries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_resource_owner_or_manager(resource_id)
    OR get_user_role() = 'admin'
  );

CREATE POLICY "waitlist_entries_insert_own"
  ON waitlist_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "waitlist_entries_delete_own"
  ON waitlist_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No UPDATE policy — waitlist ordering is managed by the system.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §12  notifications
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Users see only their own notifications.
-- No direct INSERT — notifications are created by SECURITY DEFINER RPCs.
-- Users may mark their own notifications as read (UPDATE read_at).
-- Users may delete their own notifications.

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT policy — notifications are created exclusively by
-- SECURITY DEFINER RPC functions on the server side.

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §13  usage_ledger
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Users see their own usage records. Admins see all.
-- No direct INSERT, UPDATE, or DELETE — the ledger is system-managed
-- through SECURITY DEFINER RPC functions.

ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_ledger_select_own_or_admin"
  ON usage_ledger FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
  );

-- No INSERT policy — usage entries are written by RPC functions.
-- No UPDATE policy — ledger entries are immutable.
-- No DELETE policy — ledger entries are permanent.


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- §14  audit_log
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- The audit log is the immutable backbone of trust on Commons.
-- SELECT: visible to the actor, booking participants (user + resource
--   owner), resource owners, and admins.
-- INSERT: blocked for clients — only SECURITY DEFINER RPCs may write.
-- UPDATE/DELETE: blocked by triggers in migration 00001.

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_participant_or_admin"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    -- The actor who performed the action can always review it
    actor_id = auth.uid()
    -- Admins have full audit visibility
    OR get_user_role() = 'admin'
    -- Booking participants: the booker and the resource owner
    OR (
      booking_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM bookings b
        JOIN resources r ON r.id = b.resource_id
        WHERE b.id = audit_log.booking_id
          AND (b.user_id = auth.uid() OR r.owner_id = auth.uid())
      )
    )
    -- Resource owners can see audit entries about their resources
    OR (
      resource_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM resources r
        WHERE r.id = audit_log.resource_id
          AND r.owner_id = auth.uid()
      )
    )
  );

-- No INSERT policy — audit entries are written exclusively by
-- SECURITY DEFINER RPC functions that validate state transitions.

-- No UPDATE or DELETE policies — the append-only triggers in
-- migration 00001 raise exceptions on any attempt to modify or
-- remove audit log rows.


-- ============================================================================
-- End of migration 00002
-- ============================================================================
