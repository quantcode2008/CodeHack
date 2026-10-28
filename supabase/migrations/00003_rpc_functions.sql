-- ============================================================================
-- Commons — RPC Functions Migration
-- Trusted Campus Resource Sharing Platform
-- ============================================================================
-- This migration establishes ALL remote procedure call (RPC) functions for
-- the Commons platform. Every status lifecycle change goes through these
-- validated stored procedures, which atomically write to audit_log.
--
-- Functions:
--   Helpers:  get_user_role, is_resource_owner_or_manager,
--             write_audit_log, create_notification
--   Core:     get_fair_use_status, calculate_waitlist_score,
--             request_booking, decide_booking, cancel_booking,
--             check_in, check_out, report_incident, resolve_incident,
--             review_credential, mark_overdue_bookings, complete_booking
-- ============================================================================


-- ============================================================================
-- HELPER: get_user_role()
-- Returns the role of the currently authenticated user.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
    FROM profiles
   WHERE id = auth.uid();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Profile not found for authenticated user';
  END IF;

  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- HELPER: is_resource_owner_or_manager(p_resource_id uuid)
-- Returns true if the current user owns the resource, manages it, or is admin.
-- ============================================================================
CREATE OR REPLACE FUNCTION is_resource_owner_or_manager(p_resource_id uuid)
RETURNS boolean AS $$
DECLARE
  v_owner_id uuid;
  v_role     user_role;
BEGIN
  v_role := get_user_role();

  -- Admins always have authority
  IF v_role = 'admin' THEN
    RETURN true;
  END IF;

  SELECT owner_id INTO v_owner_id
    FROM resources
   WHERE id = p_resource_id;

  IF v_owner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Direct owner
  IF v_owner_id = auth.uid() THEN
    RETURN true;
  END IF;

  -- Manager role has authority over all resources
  IF v_role = 'manager' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- HELPER: write_audit_log(...)
-- Inserts an immutable audit trail entry. Returns the new audit_log id.
-- ============================================================================
CREATE OR REPLACE FUNCTION write_audit_log(
  p_action      text,
  p_entity_type text,
  p_entity_id   uuid,
  p_booking_id  uuid   DEFAULT NULL,
  p_resource_id uuid   DEFAULT NULL,
  p_before      jsonb  DEFAULT NULL,
  p_after       jsonb  DEFAULT NULL,
  p_reason      text   DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO audit_log (
    actor_id, actor_role, action, entity_type, entity_id,
    booking_id, resource_id, before, after, reason
  )
  VALUES (
    auth.uid(), get_user_role(), p_action, p_entity_type, p_entity_id,
    p_booking_id, p_resource_id, p_before, p_after, p_reason
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- HELPER: create_notification(...)
-- Inserts a notification for a specific user. Returns the notification id.
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type    notification_type,
  p_title   text,
  p_body    text DEFAULT NULL,
  p_link    text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 1. get_fair_use_status(p_user_id, p_resource_id)
-- Checks fair-use rules IN ORDER and returns the first violation found.
-- Returns TABLE(is_blocked boolean, rule_name text, explanation text).
-- ============================================================================
CREATE OR REPLACE FUNCTION get_fair_use_status(
  p_user_id     uuid,
  p_resource_id uuid
)
RETURNS TABLE(is_blocked boolean, rule_name text, explanation text) AS $$
DECLARE
  v_cooldown_end    timestamptz;
  v_category        resource_category;
  v_weekly_hours    numeric;
  v_active_count    int;
  v_consec_days     int;
BEGIN
  -- ----------------------------------------------------------------
  -- Rule 1: 48h no-show cooldown
  -- ----------------------------------------------------------------
  SELECT greatest(
           max(b.updated_at),
           max(b.created_at)
         ) + interval '48 hours'
    INTO v_cooldown_end
    FROM bookings b
   WHERE b.user_id = p_user_id
     AND b.status = 'overdue'
     AND (b.updated_at > now() - interval '48 hours'
          OR b.created_at > now() - interval '48 hours');

  IF v_cooldown_end IS NOT NULL AND v_cooldown_end > now() THEN
    RETURN QUERY SELECT
      true,
      '48h_no_show_cooldown'::text,
      format('You have a recent no-show. Cooldown ends at %s.',
             to_char(v_cooldown_end, 'YYYY-MM-DD HH24:MI'));
    RETURN;
  END IF;

  -- ----------------------------------------------------------------
  -- Rule 2: Weekly hour cap (8h per resource category)
  -- ----------------------------------------------------------------
  SELECT r.category INTO v_category
    FROM resources r
   WHERE r.id = p_resource_id;

  SELECT coalesce(sum(ul.hours), 0)
    INTO v_weekly_hours
    FROM usage_ledger ul
    JOIN bookings bk ON bk.id = ul.booking_id
    JOIN resources rs ON rs.id = bk.resource_id
   WHERE ul.user_id = p_user_id
     AND rs.category = v_category
     AND ul.week_start = date_trunc('week', now())::date;

  IF v_weekly_hours >= 8 THEN
    RETURN QUERY SELECT
      true,
      'weekly_hour_cap'::text,
      format('Weekly limit of 8 hours reached for %s resources this week (%sh used).',
             v_category::text, v_weekly_hours);
    RETURN;
  END IF;

  -- ----------------------------------------------------------------
  -- Rule 3: Max 3 active future bookings per resource
  -- ----------------------------------------------------------------
  SELECT count(*)
    INTO v_active_count
    FROM bookings b
   WHERE b.user_id = p_user_id
     AND b.resource_id = p_resource_id
     AND b.status IN ('requested', 'approved')
     AND upper(b.time_range) > now();

  IF v_active_count >= 3 THEN
    RETURN QUERY SELECT
      true,
      'max_active_bookings'::text,
      'Maximum 3 pending/approved bookings per resource reached.'::text;
    RETURN;
  END IF;

  -- ----------------------------------------------------------------
  -- Rule 4: Consecutive day cap (3+ days on same resource)
  -- ----------------------------------------------------------------
  SELECT count(DISTINCT (lower(b.time_range))::date)
    INTO v_consec_days
    FROM bookings b
   WHERE b.user_id = p_user_id
     AND b.resource_id = p_resource_id
     AND b.status IN ('approved', 'checked_in')
     AND (lower(b.time_range))::date BETWEEN (current_date - 2) AND (current_date + 2);

  -- If we already have 3+ days in a rolling 5-day window, block
  IF v_consec_days >= 3 THEN
    RETURN QUERY SELECT
      true,
      'consecutive_day_cap'::text,
      'Consecutive-day limit reached. Other students need access to this resource too.'::text;
    RETURN;
  END IF;

  -- ----------------------------------------------------------------
  -- No rules fired — user is clear
  -- ----------------------------------------------------------------
  RETURN QUERY SELECT false, NULL::text, NULL::text;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 2. calculate_waitlist_score(p_user_id, p_resource_id)
-- Computes a weighted priority score for waitlist ordering.
-- Returns TABLE(score numeric, breakdown jsonb).
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_waitlist_score(
  p_user_id     uuid,
  p_resource_id uuid
)
RETURNS TABLE(score numeric, breakdown jsonb) AS $$
DECLARE
  v_monthly_hours       numeric;
  v_hours_score         numeric;
  v_days_since_last     numeric;
  v_recency_score       numeric;
  v_has_academic_need   boolean;
  v_need_score          numeric;
  v_no_shows            int;
  v_reliability_score   numeric;
  v_total               numeric;
  v_last_booking_date   timestamptz;
  v_affiliation         text;
BEGIN
  -- ----------------------------------------------------------------
  -- Hours factor (weight 0.30): fewer hours used this month = higher score
  -- Score = max(0, 100 - (monthly_hours * 12.5))
  -- ----------------------------------------------------------------
  SELECT coalesce(sum(ul.hours), 0)
    INTO v_monthly_hours
    FROM usage_ledger ul
   WHERE ul.user_id = p_user_id
     AND ul.week_start >= date_trunc('month', now())::date;

  v_hours_score := greatest(0, 100 - (v_monthly_hours * 12.5));

  -- ----------------------------------------------------------------
  -- Recency factor (weight 0.25): days since last successful booking
  -- Score = min(100, days_since * 3.3)
  -- ----------------------------------------------------------------
  SELECT max(b.updated_at)
    INTO v_last_booking_date
    FROM bookings b
   WHERE b.user_id = p_user_id
     AND b.status IN ('returned', 'completed');

  IF v_last_booking_date IS NULL THEN
    v_days_since_last := 30;  -- Default for users with no prior bookings
  ELSE
    v_days_since_last := extract(epoch FROM (now() - v_last_booking_date)) / 86400.0;
  END IF;

  v_recency_score := least(100, v_days_since_last * 3.3);

  -- ----------------------------------------------------------------
  -- Need flag (weight 0.20): academic / research affiliation gets boost
  -- ----------------------------------------------------------------
  SELECT p.affiliation INTO v_affiliation
    FROM profiles p
   WHERE p.id = p_user_id;

  v_has_academic_need := (
    v_affiliation IS NOT NULL
    AND (lower(v_affiliation) LIKE '%academic%' OR lower(v_affiliation) LIKE '%research%')
  );

  IF v_has_academic_need THEN
    v_need_score := 100;
  ELSE
    v_need_score := 50;
  END IF;

  -- ----------------------------------------------------------------
  -- Reliability factor (weight 0.25): 100 - (no_shows * 25)
  -- No-shows = bookings with status 'overdue' in last 90 days
  -- ----------------------------------------------------------------
  SELECT count(*)
    INTO v_no_shows
    FROM bookings b
   WHERE b.user_id = p_user_id
     AND b.status = 'overdue'
     AND b.updated_at >= now() - interval '90 days';

  v_reliability_score := greatest(0, 100 - (v_no_shows * 25));

  -- ----------------------------------------------------------------
  -- Total weighted score
  -- ----------------------------------------------------------------
  v_total := round(
    (v_hours_score * 0.30) +
    (v_recency_score * 0.25) +
    (v_need_score * 0.20) +
    (v_reliability_score * 0.25),
    2
  );

  RETURN QUERY SELECT
    v_total,
    jsonb_build_object(
      'hours_used_this_month', v_monthly_hours,
      'hours_score', round(v_hours_score, 2),
      'days_since_last', round(v_days_since_last, 1),
      'recency_score', round(v_recency_score, 2),
      'has_academic_need', v_has_academic_need,
      'need_score', v_need_score,
      'no_shows_90d', v_no_shows,
      'reliability_score', v_reliability_score,
      'total', v_total
    );
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 3. request_booking(p_resource_id, p_time_range, p_purpose)
-- Main entry point for booking requests. Validates eligibility, fair use,
-- availability, and either creates a booking or waitlists the user.
-- Returns jsonb: {outcome, booking_id, reason_codes[], explanation}
-- ============================================================================
CREATE OR REPLACE FUNCTION request_booking(
  p_resource_id uuid,
  p_time_range  tstzrange,
  p_purpose     text
)
RETURNS jsonb AS $$
DECLARE
  v_resource            resources%ROWTYPE;
  v_caller_id           uuid;
  v_booking_id          uuid;
  v_missing_reqs        text[];
  v_req                 record;
  v_cred_count          int;
  v_duration_hours      numeric;
  v_range_start_dow     int;
  v_range_start_time    time;
  v_range_end_time      time;
  v_avail_count         int;
  v_blackout_count      int;
  v_fair_use            record;
  v_waitlist_result     record;
  v_waitlist_entry_id   uuid;
  v_owner_id            uuid;
BEGIN
  v_caller_id := auth.uid();

  -- ----------------------------------------------------------------
  -- Step 1: Verify resource exists and is listed
  -- ----------------------------------------------------------------
  SELECT * INTO v_resource
    FROM resources
   WHERE id = p_resource_id;

  IF v_resource.id IS NULL THEN
    RAISE EXCEPTION 'Resource not found: %', p_resource_id;
  END IF;

  IF v_resource.status != 'listed' THEN
    RETURN jsonb_build_object(
      'outcome', 'error',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array('resource_not_available'),
      'explanation', format('This resource is currently %s and not accepting bookings.', v_resource.status::text)
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 2: Verify caller is authenticated
  -- ----------------------------------------------------------------
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to request a booking';
  END IF;

  -- ----------------------------------------------------------------
  -- Step 3: Check resource requirements (eligibility)
  -- ----------------------------------------------------------------
  v_missing_reqs := ARRAY[]::text[];

  FOR v_req IN
    SELECT rr.label, rr.type
      FROM resource_requirements rr
     WHERE rr.resource_id = p_resource_id
  LOOP
    SELECT count(*) INTO v_cred_count
      FROM user_credentials uc
     WHERE uc.user_id = v_caller_id
       AND uc.requirement_label = v_req.label
       AND uc.status = 'verified'
       AND (uc.expires_at IS NULL OR uc.expires_at > now());

    IF v_cred_count = 0 THEN
      v_missing_reqs := array_append(v_missing_reqs, v_req.label);
    END IF;
  END LOOP;

  IF array_length(v_missing_reqs, 1) > 0 THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', to_jsonb(v_missing_reqs),
      'explanation', format('Missing required credentials: %s. Please upload and get these verified before booking.',
                            array_to_string(v_missing_reqs, ', '))
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 4: Check min_notice_hours
  -- ----------------------------------------------------------------
  IF lower(p_time_range) < now() + (v_resource.min_notice_hours * interval '1 hour') THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array('insufficient_notice'),
      'explanation', format('Bookings require at least %s hours advance notice.', v_resource.min_notice_hours)
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 5: Check max_booking_hours
  -- ----------------------------------------------------------------
  v_duration_hours := extract(epoch FROM (upper(p_time_range) - lower(p_time_range))) / 3600.0;

  IF v_duration_hours > v_resource.max_booking_hours THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array('exceeds_max_hours'),
      'explanation', format('Maximum booking duration is %s hours. Requested: %s hours.',
                            v_resource.max_booking_hours, round(v_duration_hours, 1))
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 6: Check availability_rules (weekday + time window)
  -- ----------------------------------------------------------------
  v_range_start_dow  := extract(dow FROM lower(p_time_range));
  v_range_start_time := (lower(p_time_range) AT TIME ZONE 'UTC')::time;
  v_range_end_time   := (upper(p_time_range) AT TIME ZONE 'UTC')::time;

  SELECT count(*) INTO v_avail_count
    FROM availability_rules ar
   WHERE ar.resource_id = p_resource_id
     AND ar.weekday = v_range_start_dow
     AND ar.start_time <= v_range_start_time
     AND ar.end_time   >= v_range_end_time;

  IF v_avail_count = 0 THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array('outside_availability'),
      'explanation', 'The requested time is outside this resource''s available hours.'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 7: Check availability_blackouts (overlap)
  -- ----------------------------------------------------------------
  SELECT count(*) INTO v_blackout_count
    FROM availability_blackouts ab
   WHERE ab.resource_id = p_resource_id
     AND ab.blocked_range && p_time_range;

  IF v_blackout_count > 0 THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array('blackout_period'),
      'explanation', 'The requested time overlaps with a scheduled blackout period for this resource.'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 8: Run fair-use checks
  -- ----------------------------------------------------------------
  SELECT * INTO v_fair_use
    FROM get_fair_use_status(v_caller_id, p_resource_id);

  IF v_fair_use.is_blocked THEN
    RETURN jsonb_build_object(
      'outcome', 'blocked',
      'booking_id', NULL,
      'reason_codes', jsonb_build_array(v_fair_use.rule_name),
      'explanation', v_fair_use.explanation
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Step 9: Attempt to insert the booking
  -- If the EXCLUDE constraint fires (time overlap with approved/checked_in/overdue),
  -- catch the exception and waitlist the user instead.
  -- ----------------------------------------------------------------
  BEGIN
    INSERT INTO bookings (resource_id, user_id, purpose, time_range, status)
    VALUES (p_resource_id, v_caller_id, p_purpose, p_time_range, 'requested')
    RETURNING id INTO v_booking_id;

  EXCEPTION WHEN exclusion_violation THEN
    -- Calculate waitlist score
    SELECT ws.score, ws.breakdown INTO v_waitlist_result
      FROM calculate_waitlist_score(v_caller_id, p_resource_id) ws;

    -- Insert booking as waitlisted
    INSERT INTO bookings (resource_id, user_id, purpose, time_range, status, waitlist_priority_score)
    VALUES (p_resource_id, v_caller_id, p_purpose, p_time_range, 'waitlisted',
            v_waitlist_result.score)
    RETURNING id INTO v_booking_id;

    -- Insert waitlist entry
    INSERT INTO waitlist_entries (resource_id, user_id, desired_range, priority_score, score_breakdown, status)
    VALUES (p_resource_id, v_caller_id, p_time_range, v_waitlist_result.score,
            v_waitlist_result.breakdown, 'waiting')
    RETURNING id INTO v_waitlist_entry_id;

    -- Audit log for waitlisted booking
    PERFORM write_audit_log(
      'booking.waitlisted',
      'booking',
      v_booking_id,
      v_booking_id,
      p_resource_id,
      NULL,
      jsonb_build_object('status', 'waitlisted', 'priority_score', v_waitlist_result.score),
      'Time slot conflict — added to waitlist'
    );

    -- Notify the user
    PERFORM create_notification(
      v_caller_id,
      'booking_update',
      'Added to waitlist',
      format('Your booking request has been waitlisted (priority score: %s). You''ll be notified if a spot opens up.',
             v_waitlist_result.score),
      '/bookings/' || v_booking_id::text
    );

    RETURN jsonb_build_object(
      'outcome', 'waitlisted',
      'booking_id', v_booking_id,
      'reason_codes', jsonb_build_array('time_conflict'),
      'explanation', format('This time slot is already taken. You''ve been added to the waitlist with priority score %s.',
                            v_waitlist_result.score)
    );
  END;

  -- ----------------------------------------------------------------
  -- Step 10: Insert succeeded — write audit log and notify owner
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.requested',
    'booking',
    v_booking_id,
    v_booking_id,
    p_resource_id,
    NULL,
    jsonb_build_object('status', 'requested', 'purpose', p_purpose,
                       'time_range', p_time_range::text),
    NULL
  );

  -- Notify the resource owner
  SELECT owner_id INTO v_owner_id
    FROM resources
   WHERE id = p_resource_id;

  PERFORM create_notification(
    v_owner_id,
    'approval_needed',
    'New booking request',
    format('A new booking request has been submitted for %s.', v_resource.title),
    '/listings/' || p_resource_id::text || '/bookings'
  );

  RETURN jsonb_build_object(
    'outcome', 'requested',
    'booking_id', v_booking_id,
    'reason_codes', jsonb_build_array(),
    'explanation', 'Your booking request has been submitted and is awaiting approval.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 4. decide_booking(p_booking_id, p_decision, p_reason_codes, p_explanation)
-- Owner/manager approves or rejects a booking request.
-- Returns the updated booking as jsonb.
-- ============================================================================
CREATE OR REPLACE FUNCTION decide_booking(
  p_booking_id    uuid,
  p_decision      text,
  p_reason_codes  text[],
  p_explanation   text
)
RETURNS jsonb AS $$
DECLARE
  v_booking       bookings%ROWTYPE;
  v_prev_status   booking_status;
  v_overlapping   record;
  v_result        jsonb;
BEGIN
  -- ----------------------------------------------------------------
  -- Validate the booking exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_booking
    FROM bookings
   WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller has authority over this resource
  -- ----------------------------------------------------------------
  IF NOT is_resource_owner_or_manager(v_booking.resource_id) THEN
    RAISE EXCEPTION 'Unauthorized: you do not have permission to decide on this booking';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate decision value
  -- ----------------------------------------------------------------
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid decision: %. Must be "approved" or "rejected".', p_decision;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate current status is 'requested'
  -- ----------------------------------------------------------------
  IF v_booking.status != 'requested' THEN
    RAISE EXCEPTION 'Booking status is "%". Only "requested" bookings can be decided upon.', v_booking.status;
  END IF;

  v_prev_status := v_booking.status;

  -- ----------------------------------------------------------------
  -- Update the booking
  -- ----------------------------------------------------------------
  UPDATE bookings
     SET status                 = p_decision::booking_status,
         decision_reason_codes  = p_reason_codes,
         decision_explanation   = p_explanation,
         decided_by             = auth.uid(),
         decided_at             = now()
   WHERE id = p_booking_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.' || p_decision,
    'booking',
    p_booking_id,
    p_booking_id,
    v_booking.resource_id,
    jsonb_build_object('status', v_prev_status::text),
    jsonb_build_object('status', p_decision, 'reason_codes', to_jsonb(p_reason_codes),
                       'explanation', p_explanation),
    p_explanation
  );

  -- ----------------------------------------------------------------
  -- Notify the booking user
  -- ----------------------------------------------------------------
  PERFORM create_notification(
    v_booking.user_id,
    'booking_update',
    CASE p_decision
      WHEN 'approved' THEN 'Booking approved!'
      WHEN 'rejected' THEN 'Booking not approved'
    END,
    p_explanation,
    '/bookings/' || p_booking_id::text
  );

  -- ----------------------------------------------------------------
  -- If approved, auto-reject other overlapping 'requested' bookings
  -- ----------------------------------------------------------------
  IF p_decision = 'approved' THEN
    FOR v_overlapping IN
      SELECT b.id, b.user_id
        FROM bookings b
       WHERE b.resource_id = v_booking.resource_id
         AND b.id != p_booking_id
         AND b.status = 'requested'
         AND b.time_range && v_booking.time_range
    LOOP
      UPDATE bookings
         SET status                = 'rejected',
             decision_reason_codes = ARRAY['auto_rejected'],
             decision_explanation  = 'Another booking was approved for this time slot.',
             decided_by            = auth.uid(),
             decided_at            = now()
       WHERE id = v_overlapping.id;

      PERFORM write_audit_log(
        'booking.auto_rejected',
        'booking',
        v_overlapping.id,
        v_overlapping.id,
        v_booking.resource_id,
        jsonb_build_object('status', 'requested'),
        jsonb_build_object('status', 'rejected', 'reason', 'auto_rejected_due_to_overlap'),
        'Another booking was approved for this time slot.'
      );

      PERFORM create_notification(
        v_overlapping.user_id,
        'booking_update',
        'Booking not approved',
        'Another booking was approved for this time slot. You may request a different time.',
        '/bookings/' || v_overlapping.id::text
      );
    END LOOP;
  END IF;

  -- ----------------------------------------------------------------
  -- Return the updated booking
  -- ----------------------------------------------------------------
  SELECT to_jsonb(b) INTO v_result
    FROM bookings b
   WHERE b.id = p_booking_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 5. cancel_booking(p_booking_id, p_reason)
-- Cancels a booking. If it was approved, promotes the top waitlist entry.
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id uuid,
  p_reason     text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_booking         bookings%ROWTYPE;
  v_prev_status     booking_status;
  v_caller_id       uuid;
  v_caller_role     user_role;
  v_waitlist_entry  waitlist_entries%ROWTYPE;
  v_new_booking_id  uuid;
  v_owner_id        uuid;
BEGIN
  v_caller_id   := auth.uid();
  v_caller_role := get_user_role();

  -- ----------------------------------------------------------------
  -- Validate booking exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_booking
    FROM bookings
   WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller: must be booking user, resource owner/manager, or admin
  -- ----------------------------------------------------------------
  IF v_caller_id != v_booking.user_id
     AND NOT is_resource_owner_or_manager(v_booking.resource_id)
  THEN
    RAISE EXCEPTION 'Unauthorized: only the booking user, resource owner, or admin can cancel';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate status is cancellable
  -- ----------------------------------------------------------------
  IF v_booking.status NOT IN ('requested', 'approved', 'waitlisted') THEN
    RAISE EXCEPTION 'Cannot cancel a booking with status "%". Only requested, approved, or waitlisted bookings can be cancelled.',
                    v_booking.status;
  END IF;

  v_prev_status := v_booking.status;

  -- ----------------------------------------------------------------
  -- Update to cancelled
  -- ----------------------------------------------------------------
  UPDATE bookings
     SET status = 'cancelled'
   WHERE id = p_booking_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.cancelled',
    'booking',
    p_booking_id,
    p_booking_id,
    v_booking.resource_id,
    jsonb_build_object('status', v_prev_status::text),
    jsonb_build_object('status', 'cancelled'),
    coalesce(p_reason, 'Cancelled by ' || CASE
      WHEN v_caller_id = v_booking.user_id THEN 'user'
      ELSE 'owner/manager'
    END)
  );

  -- ----------------------------------------------------------------
  -- If was approved, check waitlist and promote top entry
  -- ----------------------------------------------------------------
  IF v_prev_status = 'approved' THEN
    SELECT * INTO v_waitlist_entry
      FROM waitlist_entries we
     WHERE we.resource_id = v_booking.resource_id
       AND we.status = 'waiting'
       AND we.desired_range && v_booking.time_range
     ORDER BY we.priority_score DESC
     LIMIT 1;

    IF v_waitlist_entry.id IS NOT NULL THEN
      -- Mark waitlist entry as offered
      UPDATE waitlist_entries
         SET status = 'offered'
       WHERE id = v_waitlist_entry.id;

      -- Create a new booking for the waitlisted user
      INSERT INTO bookings (resource_id, user_id, purpose, time_range, status)
      VALUES (v_waitlist_entry.resource_id, v_waitlist_entry.user_id,
              'Promoted from waitlist', v_waitlist_entry.desired_range, 'requested')
      RETURNING id INTO v_new_booking_id;

      -- Audit log for waitlist promotion
      PERFORM write_audit_log(
        'waitlist.promoted',
        'waitlist_entry',
        v_waitlist_entry.id,
        v_new_booking_id,
        v_waitlist_entry.resource_id,
        jsonb_build_object('status', 'waiting'),
        jsonb_build_object('status', 'offered', 'new_booking_id', v_new_booking_id),
        'Promoted from waitlist after cancellation'
      );

      -- Notify the waitlisted user
      PERFORM create_notification(
        v_waitlist_entry.user_id,
        'booking_update',
        'A spot opened up!',
        'A spot opened up! You have 24 hours to confirm your booking.',
        '/bookings/' || v_new_booking_id::text
      );
    END IF;
  END IF;

  -- ----------------------------------------------------------------
  -- Notify relevant parties
  -- ----------------------------------------------------------------
  IF v_caller_id = v_booking.user_id THEN
    -- User cancelled: notify the resource owner
    SELECT owner_id INTO v_owner_id
      FROM resources
     WHERE id = v_booking.resource_id;

    PERFORM create_notification(
      v_owner_id,
      'booking_update',
      'Booking cancelled',
      coalesce(p_reason, 'The user cancelled their booking.'),
      '/listings/' || v_booking.resource_id::text || '/bookings'
    );
  ELSE
    -- Owner/manager cancelled: notify the user
    PERFORM create_notification(
      v_booking.user_id,
      'booking_update',
      'Your booking was cancelled',
      coalesce(p_reason, 'Your booking was cancelled by the resource owner.'),
      '/bookings/' || p_booking_id::text
    );
  END IF;

  RETURN jsonb_build_object(
    'cancelled', true,
    'booking_id', p_booking_id,
    'previous_status', v_prev_status::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 6. check_in(p_booking_id, p_condition)
-- User checks in at the resource, uploading a "before" condition report.
-- p_condition: {notes: text, photos: text[], overall: text}
-- ============================================================================
CREATE OR REPLACE FUNCTION check_in(
  p_booking_id uuid,
  p_condition  jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_booking       bookings%ROWTYPE;
  v_caller_id     uuid;
  v_report_id     uuid;
  v_owner_id      uuid;
BEGIN
  v_caller_id := auth.uid();

  -- ----------------------------------------------------------------
  -- Validate booking exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_booking
    FROM bookings
   WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller is the booking user
  -- ----------------------------------------------------------------
  IF v_caller_id != v_booking.user_id THEN
    RAISE EXCEPTION 'Only the booking holder can check in';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate booking status is approved
  -- ----------------------------------------------------------------
  IF v_booking.status != 'approved' THEN
    RAISE EXCEPTION 'Cannot check in: booking status is "%" (must be "approved").', v_booking.status;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate timing: can check in up to 15 minutes early
  -- ----------------------------------------------------------------
  IF lower(v_booking.time_range) > now() + interval '15 minutes' THEN
    RAISE EXCEPTION 'Too early to check in. Check-in opens 15 minutes before your booking starts at %.',
                    to_char(lower(v_booking.time_range), 'HH24:MI');
  END IF;

  -- ----------------------------------------------------------------
  -- Update booking status to checked_in
  -- ----------------------------------------------------------------
  UPDATE bookings
     SET status = 'checked_in'
   WHERE id = p_booking_id;

  -- ----------------------------------------------------------------
  -- Insert "before" condition report
  -- ----------------------------------------------------------------
  INSERT INTO condition_reports (booking_id, phase, notes, photos, overall, recorded_by)
  VALUES (
    p_booking_id,
    'before',
    p_condition->>'notes',
    ARRAY(SELECT jsonb_array_elements_text(coalesce(p_condition->'photos', '[]'::jsonb))),
    (p_condition->>'overall')::condition_rating,
    v_caller_id
  )
  RETURNING id INTO v_report_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.checked_in',
    'booking',
    p_booking_id,
    p_booking_id,
    v_booking.resource_id,
    jsonb_build_object('status', 'approved'),
    jsonb_build_object('status', 'checked_in', 'condition_report_id', v_report_id,
                       'condition_overall', p_condition->>'overall'),
    NULL
  );

  -- ----------------------------------------------------------------
  -- Notify resource owner
  -- ----------------------------------------------------------------
  SELECT owner_id INTO v_owner_id
    FROM resources
   WHERE id = v_booking.resource_id;

  PERFORM create_notification(
    v_owner_id,
    'booking_update',
    'User has checked in',
    format('A user has checked in for their booking. Condition reported as: %s.',
           p_condition->>'overall'),
    '/listings/' || v_booking.resource_id::text || '/bookings'
  );

  RETURN jsonb_build_object(
    'checked_in', true,
    'booking_id', p_booking_id,
    'condition_report_id', v_report_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 7. check_out(p_booking_id, p_condition)
-- User or owner checks out, uploading an "after" condition report.
-- Compares before/after condition and auto-creates incidents if degraded.
-- p_condition: {notes: text, photos: text[], overall: text}
-- ============================================================================
CREATE OR REPLACE FUNCTION check_out(
  p_booking_id uuid,
  p_condition  jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_booking         bookings%ROWTYPE;
  v_caller_id       uuid;
  v_report_id       uuid;
  v_hours_used      numeric;
  v_owner_id        uuid;
  v_before_overall  condition_rating;
  v_after_overall   condition_rating;
  v_incident_id     uuid;
  v_severity        incident_severity;
  v_rating_order    int[];
BEGIN
  v_caller_id := auth.uid();

  -- ----------------------------------------------------------------
  -- Validate booking exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_booking
    FROM bookings
   WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller: booking user OR resource owner/manager
  -- ----------------------------------------------------------------
  IF v_caller_id != v_booking.user_id
     AND NOT is_resource_owner_or_manager(v_booking.resource_id)
  THEN
    RAISE EXCEPTION 'Unauthorized: only the booking holder or resource owner can check out';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate status: must be checked_in or overdue
  -- ----------------------------------------------------------------
  IF v_booking.status NOT IN ('checked_in', 'overdue') THEN
    RAISE EXCEPTION 'Cannot check out: booking status is "%" (must be "checked_in" or "overdue").', v_booking.status;
  END IF;

  -- ----------------------------------------------------------------
  -- Update booking status to returned
  -- ----------------------------------------------------------------
  UPDATE bookings
     SET status = 'returned'
   WHERE id = p_booking_id;

  -- ----------------------------------------------------------------
  -- Insert "after" condition report
  -- ----------------------------------------------------------------
  INSERT INTO condition_reports (booking_id, phase, notes, photos, overall, recorded_by)
  VALUES (
    p_booking_id,
    'after',
    p_condition->>'notes',
    ARRAY(SELECT jsonb_array_elements_text(coalesce(p_condition->'photos', '[]'::jsonb))),
    (p_condition->>'overall')::condition_rating,
    v_caller_id
  )
  RETURNING id INTO v_report_id;

  -- ----------------------------------------------------------------
  -- Calculate hours used and insert into usage_ledger
  -- ----------------------------------------------------------------
  v_hours_used := round(
    extract(epoch FROM (
      least(now(), upper(v_booking.time_range)) - lower(v_booking.time_range)
    )) / 3600.0,
    2
  );

  INSERT INTO usage_ledger (user_id, booking_id, hours, credits, week_start)
  VALUES (
    v_booking.user_id,
    p_booking_id,
    v_hours_used,
    v_hours_used * coalesce(
      (SELECT credit_cost_per_hour FROM resources WHERE id = v_booking.resource_id),
      0
    ),
    date_trunc('week', lower(v_booking.time_range))::date
  );

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.returned',
    'booking',
    p_booking_id,
    p_booking_id,
    v_booking.resource_id,
    jsonb_build_object('status', v_booking.status::text),
    jsonb_build_object('status', 'returned', 'hours_used', v_hours_used,
                       'condition_overall', p_condition->>'overall'),
    NULL
  );

  -- ----------------------------------------------------------------
  -- Notify both parties
  -- ----------------------------------------------------------------
  SELECT owner_id INTO v_owner_id
    FROM resources
   WHERE id = v_booking.resource_id;

  PERFORM create_notification(
    v_owner_id,
    'booking_update',
    'Resource returned',
    format('The resource has been returned. Condition: %s. Hours used: %s.',
           p_condition->>'overall', v_hours_used),
    '/listings/' || v_booking.resource_id::text || '/bookings'
  );

  PERFORM create_notification(
    v_booking.user_id,
    'booking_update',
    'Check-out confirmed',
    format('Your check-out has been recorded. Hours used: %s.', v_hours_used),
    '/bookings/' || p_booking_id::text
  );

  -- ----------------------------------------------------------------
  -- Compare before/after condition — auto-create incident if degraded
  -- ----------------------------------------------------------------
  SELECT cr.overall INTO v_before_overall
    FROM condition_reports cr
   WHERE cr.booking_id = p_booking_id
     AND cr.phase = 'before';

  v_after_overall := (p_condition->>'overall')::condition_rating;

  -- Determine if condition degraded (excellent > good > fair > damaged)
  IF v_before_overall IS NOT NULL AND v_after_overall IS NOT NULL THEN
    DECLARE
      v_before_rank int;
      v_after_rank  int;
    BEGIN
      -- Rank: excellent=4, good=3, fair=2, damaged=1
      v_before_rank := CASE v_before_overall
        WHEN 'excellent' THEN 4 WHEN 'good' THEN 3
        WHEN 'fair' THEN 2 WHEN 'damaged' THEN 1
      END;
      v_after_rank := CASE v_after_overall
        WHEN 'excellent' THEN 4 WHEN 'good' THEN 3
        WHEN 'fair' THEN 2 WHEN 'damaged' THEN 1
      END;

      IF v_after_rank < v_before_rank THEN
        -- Determine severity based on degradation
        v_severity := CASE (v_before_rank - v_after_rank)
          WHEN 1 THEN 'low'
          WHEN 2 THEN 'medium'
          ELSE 'high'
        END;

        INSERT INTO incidents (
          booking_id, resource_id, reported_by, type, severity, description
        )
        VALUES (
          p_booking_id, v_booking.resource_id, v_caller_id, 'damage', v_severity,
          format('Condition degraded from %s to %s during booking. Before: %s. After: %s.',
                 v_before_overall, v_after_overall,
                 coalesce((SELECT notes FROM condition_reports WHERE booking_id = p_booking_id AND phase = 'before'), 'N/A'),
                 coalesce(p_condition->>'notes', 'N/A'))
        )
        RETURNING id INTO v_incident_id;

        PERFORM write_audit_log(
          'incident.auto_created',
          'incident',
          v_incident_id,
          p_booking_id,
          v_booking.resource_id,
          NULL,
          jsonb_build_object('type', 'damage', 'severity', v_severity::text,
                             'before_condition', v_before_overall::text,
                             'after_condition', v_after_overall::text),
          'Auto-created due to condition degradation'
        );

        -- Notify owner about the auto-created incident
        PERFORM create_notification(
          v_owner_id,
          'incident',
          'Condition degradation detected',
          format('Condition changed from %s to %s. An incident report has been automatically filed.',
                 v_before_overall, v_after_overall),
          '/incidents/' || v_incident_id::text
        );
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object(
    'checked_out', true,
    'booking_id', p_booking_id,
    'condition_report_id', v_report_id,
    'hours_used', v_hours_used,
    'incident_id', v_incident_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 8. report_incident(p_booking_id, p_resource_id, p_type, p_severity, p_description)
-- Any authenticated user can report an incident.
-- ============================================================================
CREATE OR REPLACE FUNCTION report_incident(
  p_booking_id  uuid,
  p_resource_id uuid,
  p_type        incident_type,
  p_severity    incident_severity,
  p_description text
)
RETURNS jsonb AS $$
DECLARE
  v_caller_id     uuid;
  v_incident_id   uuid;
  v_owner_id      uuid;
  v_admin         record;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to report an incident';
  END IF;

  -- ----------------------------------------------------------------
  -- Insert the incident
  -- ----------------------------------------------------------------
  INSERT INTO incidents (booking_id, resource_id, reported_by, type, severity, description)
  VALUES (p_booking_id, p_resource_id, v_caller_id, p_type, p_severity, p_description)
  RETURNING id INTO v_incident_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'incident.reported',
    'incident',
    v_incident_id,
    p_booking_id,
    p_resource_id,
    NULL,
    jsonb_build_object('type', p_type::text, 'severity', p_severity::text,
                       'description', p_description),
    p_description
  );

  -- ----------------------------------------------------------------
  -- Notify resource owner
  -- ----------------------------------------------------------------
  SELECT owner_id INTO v_owner_id
    FROM resources
   WHERE id = p_resource_id;

  IF v_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      v_owner_id,
      'incident',
      format('New %s incident reported', p_type::text),
      format('Severity: %s. %s', p_severity::text, left(p_description, 200)),
      '/incidents/' || v_incident_id::text
    );
  END IF;

  -- ----------------------------------------------------------------
  -- Notify all admin users
  -- ----------------------------------------------------------------
  FOR v_admin IN
    SELECT p.id FROM profiles p WHERE p.role = 'admin'
  LOOP
    PERFORM create_notification(
      v_admin.id,
      'incident',
      format('New %s incident reported (%s)', p_type::text, p_severity::text),
      left(p_description, 200),
      '/incidents/' || v_incident_id::text
    );
  END LOOP;

  RETURN jsonb_build_object(
    'incident_id', v_incident_id,
    'type', p_type::text,
    'severity', p_severity::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 9. resolve_incident(p_incident_id, p_resolution_note, p_status)
-- Owner/manager/admin resolves or dismisses an incident.
-- ============================================================================
CREATE OR REPLACE FUNCTION resolve_incident(
  p_incident_id    uuid,
  p_resolution_note text,
  p_status         incident_status
)
RETURNS jsonb AS $$
DECLARE
  v_incident      incidents%ROWTYPE;
  v_prev_status   incident_status;
BEGIN
  -- ----------------------------------------------------------------
  -- Validate incident exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_incident
    FROM incidents
   WHERE id = p_incident_id;

  IF v_incident.id IS NULL THEN
    RAISE EXCEPTION 'Incident not found: %', p_incident_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller has authority
  -- ----------------------------------------------------------------
  IF NOT is_resource_owner_or_manager(v_incident.resource_id) THEN
    RAISE EXCEPTION 'Unauthorized: only the resource owner, manager, or admin can resolve incidents';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate target status
  -- ----------------------------------------------------------------
  IF p_status NOT IN ('resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid resolution status: %. Must be "resolved" or "dismissed".', p_status;
  END IF;

  v_prev_status := v_incident.status;

  -- ----------------------------------------------------------------
  -- Update the incident
  -- ----------------------------------------------------------------
  UPDATE incidents
     SET status          = p_status,
         resolution_note = p_resolution_note,
         resolved_by     = auth.uid(),
         resolved_at     = now()
   WHERE id = p_incident_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'incident.' || p_status::text,
    'incident',
    p_incident_id,
    v_incident.booking_id,
    v_incident.resource_id,
    jsonb_build_object('status', v_prev_status::text),
    jsonb_build_object('status', p_status::text, 'resolution_note', p_resolution_note),
    p_resolution_note
  );

  -- ----------------------------------------------------------------
  -- Notify the reporter
  -- ----------------------------------------------------------------
  PERFORM create_notification(
    v_incident.reported_by,
    'incident',
    format('Incident %s', p_status::text),
    p_resolution_note,
    '/incidents/' || p_incident_id::text
  );

  RETURN jsonb_build_object(
    'incident_id', p_incident_id,
    'status', p_status::text,
    'resolved_by', auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 10. review_credential(p_credential_id, p_status, p_note)
-- Owner/manager/admin reviews a user credential (verify or reject).
-- ============================================================================
CREATE OR REPLACE FUNCTION review_credential(
  p_credential_id uuid,
  p_status        credential_status,
  p_note          text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_credential    user_credentials%ROWTYPE;
  v_prev_status   credential_status;
BEGIN
  -- ----------------------------------------------------------------
  -- Validate credential exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_credential
    FROM user_credentials
   WHERE id = p_credential_id;

  IF v_credential.id IS NULL THEN
    RAISE EXCEPTION 'Credential not found: %', p_credential_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller is owner/manager/admin
  -- ----------------------------------------------------------------
  IF get_user_role() NOT IN ('owner', 'manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: only owners, managers, or admins can review credentials';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate target status
  -- ----------------------------------------------------------------
  IF p_status NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid credential review status: %. Must be "verified" or "rejected".', p_status;
  END IF;

  v_prev_status := v_credential.status;

  -- ----------------------------------------------------------------
  -- Update the credential
  -- ----------------------------------------------------------------
  UPDATE user_credentials
     SET status      = p_status,
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         review_note = p_note
   WHERE id = p_credential_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'credential.' || p_status::text,
    'user_credential',
    p_credential_id,
    NULL,
    NULL,
    jsonb_build_object('status', v_prev_status::text),
    jsonb_build_object('status', p_status::text, 'review_note', p_note),
    p_note
  );

  -- ----------------------------------------------------------------
  -- Notify the credential owner
  -- ----------------------------------------------------------------
  PERFORM create_notification(
    v_credential.user_id,
    'credential',
    CASE p_status
      WHEN 'verified' THEN 'Credential verified'
      WHEN 'rejected' THEN 'Credential not verified'
    END,
    coalesce(p_note, CASE p_status
      WHEN 'verified' THEN 'Your credential has been verified. You can now book resources that require it.'
      WHEN 'rejected' THEN 'Your credential was not verified. Please review the requirements and resubmit.'
    END),
    '/credentials/' || p_credential_id::text
  );

  RETURN jsonb_build_object(
    'credential_id', p_credential_id,
    'status', p_status::text,
    'reviewed_by', auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 11. mark_overdue_bookings()
-- System function: marks overdue bookings and sends reminders.
-- Called by a scheduled mechanism (cron / pg_cron / edge function).
-- No auth.uid() dependency — uses NULL actor_id for system actions.
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_overdue_bookings()
RETURNS jsonb AS $$
DECLARE
  v_overdue_booking  record;
  v_overdue_count    int := 0;
  v_reminder_booking record;
  v_reminder_count   int := 0;
  v_existing_notif   int;
BEGIN
  -- ================================================================
  -- Part A: Mark overdue bookings
  -- ================================================================
  FOR v_overdue_booking IN
    SELECT b.id, b.user_id, b.resource_id
      FROM bookings b
     WHERE b.status = 'checked_in'
       AND upper(b.time_range) < now()
  LOOP
    -- Update status to overdue
    UPDATE bookings
       SET status = 'overdue'
     WHERE id = v_overdue_booking.id;

    -- System audit log entry (no auth.uid(), use NULL actor)
    INSERT INTO audit_log (
      actor_id, actor_role, action, entity_type, entity_id,
      booking_id, resource_id, before, after, reason
    )
    VALUES (
      NULL, 'admin', 'booking.overdue', 'booking', v_overdue_booking.id,
      v_overdue_booking.id, v_overdue_booking.resource_id,
      jsonb_build_object('status', 'checked_in'),
      jsonb_build_object('status', 'overdue'),
      'Automatically marked overdue by system'
    );

    -- Notify the user
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      v_overdue_booking.user_id,
      'overdue',
      'Booking overdue — please return immediately',
      'Your booking time has ended but you haven''t checked out. Please return the resource and check out as soon as possible.',
      '/bookings/' || v_overdue_booking.id::text
    );

    v_overdue_count := v_overdue_count + 1;
  END LOOP;

  -- ================================================================
  -- Part B: Send reminder notifications for upcoming bookings
  -- ================================================================

  -- 24-hour reminders
  FOR v_reminder_booking IN
    SELECT b.id, b.user_id, b.resource_id, lower(b.time_range) AS starts_at
      FROM bookings b
     WHERE b.status = 'approved'
       AND lower(b.time_range) BETWEEN now() AND now() + interval '24 hours'
       AND lower(b.time_range) > now() + interval '1 hour'  -- exclude 1h range (handled below)
  LOOP
    -- Check if we already sent a 24h reminder
    SELECT count(*) INTO v_existing_notif
      FROM notifications n
     WHERE n.user_id = v_reminder_booking.user_id
       AND n.type = 'reminder'
       AND n.title LIKE '%24 hours%'
       AND n.link = '/bookings/' || v_reminder_booking.id::text;

    IF v_existing_notif = 0 THEN
      INSERT INTO notifications (user_id, type, title, body, link)
      VALUES (
        v_reminder_booking.user_id,
        'reminder',
        'Booking in ~24 hours',
        format('Your booking starts at %s. Don''t forget to check in on time.',
               to_char(v_reminder_booking.starts_at, 'YYYY-MM-DD HH24:MI')),
        '/bookings/' || v_reminder_booking.id::text
      );
      v_reminder_count := v_reminder_count + 1;
    END IF;
  END LOOP;

  -- 1-hour reminders
  FOR v_reminder_booking IN
    SELECT b.id, b.user_id, b.resource_id, lower(b.time_range) AS starts_at
      FROM bookings b
     WHERE b.status = 'approved'
       AND lower(b.time_range) BETWEEN now() AND now() + interval '1 hour'
  LOOP
    -- Check if we already sent a 1h reminder
    SELECT count(*) INTO v_existing_notif
      FROM notifications n
     WHERE n.user_id = v_reminder_booking.user_id
       AND n.type = 'reminder'
       AND n.title LIKE '%1 hour%'
       AND n.link = '/bookings/' || v_reminder_booking.id::text;

    IF v_existing_notif = 0 THEN
      INSERT INTO notifications (user_id, type, title, body, link)
      VALUES (
        v_reminder_booking.user_id,
        'reminder',
        'Booking in ~1 hour',
        format('Your booking starts at %s. Get ready to check in!',
               to_char(v_reminder_booking.starts_at, 'HH24:MI')),
        '/bookings/' || v_reminder_booking.id::text
      );
      v_reminder_count := v_reminder_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'overdue_marked', v_overdue_count,
    'reminders_sent', v_reminder_count,
    'run_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 12. complete_booking(p_booking_id)
-- Marks a returned booking as completed once both condition reports exist
-- and there are no open incidents.
-- ============================================================================
CREATE OR REPLACE FUNCTION complete_booking(p_booking_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_booking         bookings%ROWTYPE;
  v_before_exists   boolean;
  v_after_exists    boolean;
  v_open_incidents  int;
BEGIN
  -- ----------------------------------------------------------------
  -- Validate booking exists
  -- ----------------------------------------------------------------
  SELECT * INTO v_booking
    FROM bookings
   WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  -- ----------------------------------------------------------------
  -- Validate caller has authority
  -- ----------------------------------------------------------------
  IF NOT is_resource_owner_or_manager(v_booking.resource_id) THEN
    RAISE EXCEPTION 'Unauthorized: only the resource owner, manager, or admin can complete a booking';
  END IF;

  -- ----------------------------------------------------------------
  -- Validate current status is 'returned'
  -- ----------------------------------------------------------------
  IF v_booking.status != 'returned' THEN
    RAISE EXCEPTION 'Cannot complete: booking status is "%" (must be "returned").', v_booking.status;
  END IF;

  -- ----------------------------------------------------------------
  -- Verify both condition reports exist
  -- ----------------------------------------------------------------
  SELECT exists(
    SELECT 1 FROM condition_reports cr
     WHERE cr.booking_id = p_booking_id AND cr.phase = 'before'
  ) INTO v_before_exists;

  SELECT exists(
    SELECT 1 FROM condition_reports cr
     WHERE cr.booking_id = p_booking_id AND cr.phase = 'after'
  ) INTO v_after_exists;

  IF NOT v_before_exists OR NOT v_after_exists THEN
    RAISE EXCEPTION 'Cannot complete: both before and after condition reports are required. Before: %, After: %.',
                    v_before_exists, v_after_exists;
  END IF;

  -- ----------------------------------------------------------------
  -- Verify no open incidents
  -- ----------------------------------------------------------------
  SELECT count(*) INTO v_open_incidents
    FROM incidents i
   WHERE i.booking_id = p_booking_id
     AND i.status IN ('open', 'under_review');

  IF v_open_incidents > 0 THEN
    RAISE EXCEPTION 'Cannot complete: there are % open incident(s) for this booking. Resolve them first.',
                    v_open_incidents;
  END IF;

  -- ----------------------------------------------------------------
  -- Update booking status to completed
  -- ----------------------------------------------------------------
  UPDATE bookings
     SET status = 'completed'
   WHERE id = p_booking_id;

  -- ----------------------------------------------------------------
  -- Write audit log
  -- ----------------------------------------------------------------
  PERFORM write_audit_log(
    'booking.completed',
    'booking',
    p_booking_id,
    p_booking_id,
    v_booking.resource_id,
    jsonb_build_object('status', 'returned'),
    jsonb_build_object('status', 'completed'),
    'Booking journey completed successfully'
  );

  RETURN jsonb_build_object(
    'completed', true,
    'booking_id', p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- END OF RPC FUNCTIONS MIGRATION
-- ============================================================================
