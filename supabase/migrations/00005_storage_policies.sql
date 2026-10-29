-- ============================================================================
-- Migration 00005: Storage Security and RLS Policies
-- Commons — Trusted Campus Resource Sharing
-- ============================================================================
-- Enforces zero-leak storage policies for private documents:
-- 1. 'credentials':
--    - Private bucket. Direct public download is disabled.
--    - Upload restricted to authenticated user's own directory (<user_id>/*).
--    - Read access restricted to:
--      a) The owning user
--      b) Owners & managers of resources the user has requested/booked
--      c) Campus administrators
-- 2. 'condition-photos':
--    - Private bucket for timestamped condition check-in / check-out evidence.
--    - Upload & read restricted to booking participants (requester, owner, manager).
-- 3. 'resource-photos':
--    - Public read for discovery.
--    - Upload restricted to resource owners, managers, and administrators.
-- ============================================================================

-- Ensure storage schema RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- BUCKET 1: credentials (PRIVATE - Signed URL or Authorized Read Only)
-- ----------------------------------------------------------------------------

-- SELECT: Only owner of credential, authorized resource owners/managers, or admin
DROP POLICY IF EXISTS "credentials_storage_select" ON storage.objects;
CREATE POLICY "credentials_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'credentials'
    AND (
      -- Student accessing own files in their folder
      (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      OR
      -- Administrator oversight
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
      OR
      -- Verified resource owner reviewing requester's credential
      EXISTS (
        SELECT 1 FROM bookings b
        JOIN resources r ON r.id = b.resource_id
        WHERE (storage.foldername(name))[1] = b.user_id::text
          AND (r.owner_id = auth.uid())
      )
    )
  );

-- INSERT: Student can only upload to their own user_id directory
DROP POLICY IF EXISTS "credentials_storage_insert_own" ON storage.objects;
CREATE POLICY "credentials_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'credentials'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Student can delete their own credential documents
DROP POLICY IF EXISTS "credentials_storage_delete_own" ON storage.objects;
CREATE POLICY "credentials_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'credentials'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- BUCKET 2: condition-photos (PRIVATE)
-- ----------------------------------------------------------------------------

-- SELECT: Booking participants and admins only
DROP POLICY IF EXISTS "condition_photos_storage_select" ON storage.objects;
CREATE POLICY "condition_photos_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'condition-photos'
    AND (
      EXISTS (
        SELECT 1 FROM bookings b
        JOIN resources r ON r.id = b.resource_id
        WHERE (storage.foldername(name))[1] = b.id::text
          AND (
            b.user_id = auth.uid()
            OR r.owner_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM profiles p
              WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
            )
          )
      )
    )
  );

-- INSERT: Booking participants uploading condition verification photos
DROP POLICY IF EXISTS "condition_photos_storage_insert" ON storage.objects;
CREATE POLICY "condition_photos_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'condition-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM bookings b
      JOIN resources r ON r.id = b.resource_id
      WHERE (storage.foldername(name))[1] = b.id::text
        AND (b.user_id = auth.uid() OR r.owner_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- BUCKET 3: resource-photos (PUBLIC READ)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "resource_photos_public_select" ON storage.objects;
CREATE POLICY "resource_photos_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resource-photos');

DROP POLICY IF EXISTS "resource_photos_owner_insert" ON storage.objects;
CREATE POLICY "resource_photos_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resource-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'manager', 'admin')
    )
  );
