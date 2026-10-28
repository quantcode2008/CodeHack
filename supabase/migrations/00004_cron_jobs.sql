-- ============================================================================
-- Commons — Migration 00004: Scheduled pg_cron Jobs
-- Trusted Campus Resource Sharing Platform
-- ============================================================================
-- Enables pg_cron extension (where supported) and registers a recurring 5-min
-- cron job to execute mark_overdue_bookings(). This automatically transitions
-- bookings to 'overdue' past their scheduled end time and generates reminders.
-- ============================================================================

DO $$
BEGIN
  -- Attempt to enable pg_cron if available on the database cluster
  CREATE EXTENSION IF NOT EXISTS "pg_cron";

  -- Unschedule existing job if already registered to prevent duplicates
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'commons-mark-overdue-and-reminders') THEN
    PERFORM cron.unschedule('commons-mark-overdue-and-reminders');
  END IF;

  -- Schedule mark_overdue_bookings() every 5 minutes
  PERFORM cron.schedule(
    'commons-mark-overdue-and-reminders',
    '*/5 * * * *',
    'SELECT mark_overdue_bookings();'
  );
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'pg_cron tables not found or pg_cron extension not supported on this cluster. Skipping automated schedule.';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to configure pg_cron. The function mark_overdue_bookings() can be triggered via external webhook or Edge Function.';
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron setup note: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

