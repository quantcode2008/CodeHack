-- ============================================================================
-- Commons — Comprehensive Seed Data
-- Trusted Campus Resource Sharing Platform
-- Organization: Eastbrook Institute of Technology (eastbrook.edu)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ORGANIZATION
-- ============================================================================
INSERT INTO organizations (
  id,
  name,
  type,
  domain,
  verified,
  logo_url,
  description
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Eastbrook Institute of Technology',
  'college',
  'eastbrook.edu',
  true,
  '/orgs/eastbrook-crest.svg',
  'A premier collegiate research institute dedicated to engineering, physical sciences, and autonomous robotics.'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  verified = true;


-- ============================================================================
-- 2. DEMO USERS (auth.users & profiles)
-- ============================================================================
-- Passwords:
--   Aanya (student):  demo-student-2026!
--   Dr. Rao (owner):  demo-owner-2026!
--   Imran (manager):  demo-manager-2026!
--   Admin (admin):    demo-admin-2026!

-- Student: Aanya Patel
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'aanya@eastbrook.edu',
  crypt('demo-student-2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Aanya Patel","role":"user"}',
  'authenticated', 'authenticated', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- Owner: Dr. Kavitha Rao
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'rao@eastbrook.edu',
  crypt('demo-owner-2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dr. Kavitha Rao","role":"owner"}',
  'authenticated', 'authenticated', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- Manager: Imran Syed
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'imran@eastbrook.edu',
  crypt('demo-manager-2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Imran Syed","role":"manager"}',
  'authenticated', 'authenticated', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- Admin: Campus Administrator
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'admin@eastbrook.edu',
  crypt('demo-admin-2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Campus Administrator","role":"admin"}',
  'authenticated', 'authenticated', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- Insert Public Profiles
INSERT INTO profiles (
  id, full_name, email, role, organization_id, affiliation, verified_status, avatar_url, phone
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Aanya Patel',
  'aanya@eastbrook.edu',
  'user',
  '00000000-0000-0000-0000-000000000001',
  'B.Tech Mechanical Engineering, Year 3',
  'verified',
  '/avatars/aanya.jpg',
  '+1 (555) 392-1084'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Dr. Kavitha Rao',
  'rao@eastbrook.edu',
  'owner',
  '00000000-0000-0000-0000-000000000001',
  'Associate Professor & Lead Custodian, Eastbrook Fabrication Lab',
  'verified',
  '/avatars/dr-rao.jpg',
  '+1 (555) 749-2910'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Imran Syed',
  'imran@eastbrook.edu',
  'manager',
  '00000000-0000-0000-0000-000000000001',
  'Senior Lab Coordinator, Electrical & Computer Engineering',
  'verified',
  '/avatars/imran.jpg',
  '+1 (555) 831-4029'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Campus Administrator',
  'admin@eastbrook.edu',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  'Dean of Operations & Resource Governance',
  'verified',
  '/avatars/admin.jpg',
  '+1 (555) 990-0000'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  affiliation = EXCLUDED.affiliation,
  verified_status = EXCLUDED.verified_status;


-- ============================================================================
-- 3. RESOURCES (~14 BELIEVABLE CAMPUS RESOURCES)
-- ============================================================================
INSERT INTO resources (
  id, owner_id, organization_id, title, slug, category, description,
  location_text, lat, lng, photos, capacity, requires_supervision,
  deposit_amount, credit_cost_per_hour, max_booking_hours, min_notice_hours,
  usage_rules, status
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Prusa MK4 3D Printer (Bench A)',
  'prusa-mk4-bench-a',
  'device',
  'High-speed precision FDM 3D printer with Nextruder architecture, 0.4mm nozzle, and textured PEI magnetic spring sheet. Ideal for structural prototypes and mechanical fittings.',
  'Fabrication Lab, Room 104, East Engineering Wing',
  42.3601, -71.0942,
  ARRAY['/resources/prusa-mk4-1.jpg', '/resources/prusa-mk4-2.jpg'],
  1, false, 0.00, 0.00, 6, 2,
  'PLA and PETG filament only. Use isopropyl alcohol to clean print bed before and after print.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Bambu Lab X1 Carbon Multi-Material 3D Printer',
  'bambu-x1-carbon-ams',
  'device',
  'CoreXY 3D printer equipped with 4-color automatic material system (AMS), hardened steel nozzle, lidar first-layer inspection, and chamber heating for engineering filaments (ABS, PA-CF, PC).',
  'Fabrication Lab, Room 104, East Engineering Wing',
  42.3601, -71.0942,
  ARRAY['/resources/bambu-x1-1.jpg'],
  1, false, 15.00, 2.00, 8, 4,
  'Engineering materials require prior filament drying confirmation in the lab dehydrator.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'RF & Electronics Testbench (Rigol 4GHz Scope + Siglent PSU)',
  'rf-electronics-testbench',
  'equipment',
  'Dedicated testbench with 4-channel 4GHz digital storage oscilloscope, dual-channel arbitrary waveform generator, triple-output linear DC power supply, and calibrated spectrum analyzer.',
  'Maxwell Tower, Room 202, EE North Wing',
  42.3605, -71.0935,
  ARRAY['/resources/rf-bench-1.jpg'],
  2, false, 0.00, 0.00, 4, 1,
  'ESD wrist strap mandatory. Power down all high-current leads before leaving the bench.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Soundproof Media & Podcast Recording Studio',
  'podcast-studio-room-305',
  'space',
  'Acoustically isolated vocal room featuring 4 Shure SM7B dynamic microphones, Cloudlifter preamps, Rodecaster Pro II mixer, audio monitoring headphones, and broadcast lighting.',
  'Media Arts Center, Room 305, Central Campus',
  42.3610, -71.0950,
  ARRAY['/resources/podcast-1.jpg'],
  4, false, 0.00, 0.00, 3, 3,
  'No food or uncovered beverages allowed inside the sound booth.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Sony FX3 Full-Frame Cinema Camera Kit',
  'sony-fx3-cinema-kit',
  'device',
  'Professional 4K 120p video production kit with top XLR handle unit, Sony FE 24-70mm f/2.8 GM II lens, 2x 160GB CFexpress Type A cards, 4x batteries, and Pelican storm case.',
  'AV Equipment Vault, Library Basement Room B12',
  42.3608, -71.0945,
  ARRAY['/resources/sony-fx3-1.jpg'],
  1, false, 500.00, 10.00, 24, 24,
  'Mandatory physical condition inspection at pickup and return. Late returns incur academic hold.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'ShopBot PRSalpha 4x8 CNC Router',
  'shopbot-cnc-router',
  'equipment',
  'Industrial 3-axis CNC router with 96x48 inch vacuum hold-down bed, 5HP spindle, and high-efficiency dust collection. Capable of precision machining hardwoods, plywood, MDF, and machinable foam.',
  'Woodworking & Digital Fab Shop, Building C, High Bay',
  42.3615, -71.0960,
  ARRAY['/resources/shopbot-1.jpg'],
  2, true, 0.00, 5.00, 4, 12,
  'Eye and ear protection mandatory. Certified lab monitor supervision required during cuts.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Collegiate Seminar & Defense Room Alpha',
  'seminar-room-alpha',
  'space',
  'Collegiate conference room with tiered seating, dual 4K laser projectors, Crestron touch control, document camera, and hybrid Zoom Room video conferencing integration.',
  'Academic Block A, 4th Floor, Room 401',
  42.3603, -71.0938,
  ARRAY['/resources/seminar-1.jpg'],
  30, false, 0.00, 0.00, 3, 6,
  'Reset all chairs and wipe dry-erase boards upon session conclusion.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'FLIR E8-XT High-Res Thermal Imaging Camera',
  'flir-e8-thermal-camera',
  'device',
  'Handheld radiometric thermal imaging camera with 320x240 detector resolution, MSX detail enhancement, and temperature range of -20°C to 550°C. Useful for circuit heat dissipation and building insulation studies.',
  'Maxwell Tower, Room 202, EE Equipment Locker',
  42.3605, -71.0935,
  ARRAY['/resources/flir-1.jpg'],
  1, false, 50.00, 0.00, 8, 4,
  'Keep Germanium protective lens cap attached whenever not actively capturing thermal images.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Deep Learning & GPU Compute Rig (NVIDIA RTX 4090 24GB)',
  'gpu-workstation-rtx4090',
  'equipment',
  'High-performance compute workstation featuring AMD Threadripper PRO 64-core processor, 256GB ECC RAM, and dual NVIDIA RTX 4090 GPUs. Pre-configured with PyTorch, CUDA 12, and Docker.',
  'Turing Computer Science Building, Lab 108',
  42.3612, -71.0940,
  ARRAY['/resources/gpu-rig-1.jpg'],
  1, false, 0.00, 0.00, 12, 1,
  'Store all datasets on /scratch/scratch01. Unsaved model checkpoints purged weekly.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Epilog Zing 24 CO2 Laser Cutter (60W)',
  'epilog-zing-24-laser',
  'equipment',
  'Precision 60-watt CO2 laser cutting and engraving system with 24x12 inch work area, air assist compressor, and inline fume filtration. Cuts acrylic, wood, paper, and delrin.',
  'Fabrication Lab, Room 106, Laser Facility',
  42.3601, -71.0942,
  ARRAY['/resources/laser-1.jpg'],
  2, true, 0.00, 4.00, 3, 2,
  'PVC, vinyl, and polycarbonate are strictly forbidden (chlorine gas hazard). Never leave laser unattended while firing.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Hakko FX-951 Precision Soldering Station',
  'hakko-soldering-bench-4',
  'tool',
  'Microprocessor-controlled soldering station with thermal recovery tip sensor, ESD-safe chassis, fume extractor arm, and temperature lockout card.',
  'Maxwell Tower, Room 202, Bench 4',
  42.3605, -71.0935,
  ARRAY['/resources/soldering-1.jpg'],
  1, false, 0.00, 0.00, 4, 1,
  'Tin iron tip before switching off. Sponge must be damp with deionized water only.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'EinScan Pro HD Multi-Functional 3D Scanner',
  'einscan-pro-hd-scanner',
  'device',
  'High-resolution structured light 3D scanner capable of capturing intricate handheld geometries with 0.045mm accuracy. Includes industrial motorized turntable and tripod kit.',
  'Fabrication Lab, Room 104, Metrology Nook',
  42.3601, -71.0942,
  ARRAY['/resources/scanner-1.jpg'],
  1, false, 50.00, 0.00, 3, 3,
  'Calibrate optical target dots before starting scan sequence. Return turntable in protective foam sleeve.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Acoustic Music Practice & Chamber Studio B',
  'music-practice-room-b',
  'space',
  'Sound-isolated practice room equipped with Yamaha U3 acoustic upright piano, music stands, full-length mirror, and metronome.',
  'Arts Block, Lower Level, Room 012',
  42.3607, -71.0955,
  ARRAY['/resources/practice-1.jpg'],
  2, false, 0.00, 0.00, 2, 1,
  'Close piano key lid gently after playing. Absolutely no drinks on piano frame.',
  'listed'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014',
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Saleae Logic Pro 16 USB Logic Analyzer',
  'saleae-logic-pro-16',
  'device',
  '16-channel digital/analog logic analyzer with 500MS/s digital sampling, USB 3.0 real-time streaming, and protocol decoders for SPI, I2C, CAN, UART, and USB.',
  'Maxwell Tower, Room 202, Bench 7',
  42.3605, -71.0935,
  ARRAY['/resources/saleae-1.jpg'],
  1, false, 0.00, 0.00, 6, 1,
  'Ensure ground leads are connected before signal probing to avoid ground loops.',
  'listed'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;


-- ============================================================================
-- 4. RESOURCE REQUIREMENTS
-- ============================================================================
INSERT INTO resource_requirements (id, resource_id, type, label, description, requires_document) VALUES
-- Epilog Laser Cutter
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010', 'training', 'Laser Safety Certification Level 1', 'Mandatory 45-minute lab safety training covering optical hazards, ventilation protocols, and material restrictions.', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010', 'authorisation', 'Fabrication Lab Proximity Card', 'Active campus RFID proximity pass programmed with Eastbrook Fab Lab access clearance.', false),

-- ShopBot CNC Router
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', 'training', 'Workshop Safety Orientation', 'General machine shop safety protocol and emergency stop procedures.', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006', 'qualification', 'Digital Fabrication CNC Level 2', 'Prerequisite course qualification (ME-204 or equivalent machine shop sign-off).', false),

-- Sony FX3 Cinema Kit
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', 'training', 'AV Media Vault Equipment Induction', 'Hands-on briefing on full-frame sensor care, lens mounting, and storm case transport.', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', 'document', 'Signed Equipment Liability Waiver', 'Physical liability agreement signed for high-value media apparatus loan.', true),

-- Prusa MK4 3D Printer
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'qualification', 'FDM 3D Printing Fundamentals', 'Completed online slicing primer covering PrusaSlicer parameters and build sheet care.', false),

-- GPU Compute Workstation
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009', 'membership', 'Computer Science Department Roster', 'Active student or researcher enrollment in Eastbrook School of Computing.', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 5. USER CREDENTIALS (FOR AANYA PATEL)
-- ============================================================================
INSERT INTO user_credentials (
  id, user_id, requirement_label, type, document_path, status,
  reviewed_by, reviewed_at, expires_at, review_note
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccc0001',
  '11111111-1111-1111-1111-111111111111',
  'Laser Safety Certification Level 1',
  'training',
  NULL,
  'verified',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '20 days',
  now() + interval '180 days',
  'Passed practical optical alignment check and safety quiz with 100% score.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0002',
  '11111111-1111-1111-1111-111111111111',
  'Fabrication Lab Proximity Card',
  'authorisation',
  NULL,
  'verified',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '60 days',
  NULL,
  'RFID badge #89201 programmed and confirmed.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0003',
  '11111111-1111-1111-1111-111111111111',
  'FDM 3D Printing Fundamentals',
  'qualification',
  NULL,
  'verified',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '45 days',
  NULL,
  'Standard orientation badge awarded via MakerBridge platform.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0004',
  '11111111-1111-1111-1111-111111111111',
  'Workshop Safety Orientation',
  'training',
  NULL,
  'verified',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '90 days',
  NULL,
  'Attended fall semester machine shop briefing.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0005',
  '11111111-1111-1111-1111-111111111111',
  'AV Media Vault Equipment Induction',
  'training',
  NULL,
  'pending',
  NULL,
  NULL,
  NULL,
  'Submitted request for Friday orientation slot.'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0006',
  '11111111-1111-1111-1111-111111111111',
  'Computer Science Department Roster',
  'membership',
  NULL,
  'verified',
  '44444444-4444-4444-4444-444444444444',
  now() - interval '30 days',
  now() + interval '300 days',
  'Cross-registered in CS-682 Deep Learning Lab.'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 6. AVAILABILITY RULES (WEEKDAY SCHEDULES)
-- ============================================================================
-- Standard schedule: Monday to Friday (1-5) from 09:00 to 18:00
INSERT INTO availability_rules (resource_id, weekday, start_time, end_time)
SELECT r.id, d.day, '09:00:00'::time, '18:00:00'::time
FROM resources r
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day)
ON CONFLICT (resource_id, weekday, start_time) DO NOTHING;

-- Extended Saturday hours (6) for 3D Printers and Electronics Benches
INSERT INTO availability_rules (resource_id, weekday, start_time, end_time)
SELECT r.id, 6, '10:00:00'::time, '16:00:00'::time
FROM resources r
WHERE r.slug IN ('prusa-mk4-bench-a', 'bambu-x1-carbon-ams', 'rf-electronics-testbench')
ON CONFLICT (resource_id, weekday, start_time) DO NOTHING;

-- Extended night hours for GPU Compute Workstation (08:00 to 22:00)
INSERT INTO availability_rules (resource_id, weekday, start_time, end_time)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009', d.day, '18:00:00'::time, '22:00:00'::time
FROM (VALUES (1), (2), (3), (4), (5)) AS d(day)
ON CONFLICT (resource_id, weekday, start_time) DO NOTHING;


-- ============================================================================
-- 7. AVAILABILITY BLACKOUTS
-- ============================================================================
INSERT INTO availability_blackouts (resource_id, blocked_range, reason) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  tstzrange(now() + interval '14 days', now() + interval '16 days'),
  'Semi-annual optics calibration and mirror realignment'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007',
  tstzrange(now() + interval '7 days', now() + interval '9 days'),
  'Eastbrook Faculty Senate Annual Retreat'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 8. BOOKINGS ACROSS ALL LIFECYCLE STATES
-- ============================================================================
INSERT INTO bookings (
  id, resource_id, user_id, purpose, time_range, status,
  decision_reason_codes, decision_explanation, decided_by, decided_at, waitlist_priority_score
) VALUES
-- 1. APPROVED (Prusa MK4) — Upcoming session tomorrow
(
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  '11111111-1111-1111-1111-111111111111',
  'Senior capstone robotics rover: 3D printing custom steering knuckle and planetary gear housing.',
  tstzrange(now() + interval '1 day' + interval '2 hours', now() + interval '1 day' + interval '6 hours'),
  'approved',
  ARRAY['verified_credentials', 'adequate_notice'],
  'Approved by Dr. Rao. Certified for PETG engineering material.',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '6 hours',
  NULL
),
-- 2. CHECKED_IN (Electronics Testbench) — Currently in progress right now!
(
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
  '11111111-1111-1111-1111-111111111111',
  'High-frequency oscilloscope probing of brushless DC motor inverter ringing and gate drive jitter.',
  tstzrange(now() - interval '45 minutes', now() + interval '2 hours'),
  'checked_in',
  ARRAY['verified_credentials'],
  'Auto-approved under standard department bench allocation policy.',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '2 days',
  NULL
),
-- 3. RETURNED (Laser Cutter) — Completed earlier today, condition verified
(
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  '11111111-1111-1111-1111-111111111111',
  'Architectural scale model framing: precision cut 3mm birch plywood and clear acrylic facade glazing.',
  tstzrange(now() - interval '6 hours', now() - interval '4 hours'),
  'returned',
  ARRAY['verified_credentials', 'supervision_present'],
  'Supervised by lab monitor Imran Syed.',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '1 day',
  NULL
),
-- 4. REQUESTED (Podcast Studio) — Awaiting owner review
(
  'dddddddd-dddd-dddd-dddd-dddddddd0004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004',
  '11111111-1111-1111-1111-111111111111',
  'Recording episode 14 of "Eastbrook Innovators" podcast: interview with solar car team captain.',
  tstzrange(now() + interval '3 days' + interval '4 hours', now() + interval '3 days' + interval '6 hours'),
  'requested',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL
),
-- 5. REJECTED (Sony FX3) — Denied due to missing induction credential
(
  'dddddddd-dddd-dddd-dddd-dddddddd0005',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005',
  '11111111-1111-1111-1111-111111111111',
  'B-roll cinematic capture of drone flight tests in athletics field.',
  tstzrange(now() - interval '3 days', now() - interval '2 days'),
  'rejected',
  ARRAY['unverified_credential'],
  'AV Media Vault Equipment Induction is currently pending. Please complete induction session prior to reserving cinema camera gear.',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '3 days',
  NULL
),
-- 6. COMPLETED (GPU Compute Workstation) — Full journey finished with zero issues
(
  'dddddddd-dddd-dddd-dddd-dddddddd0006',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009',
  '11111111-1111-1111-1111-111111111111',
  'Fine-tuning YOLOv8 object detection model on collegiate drone inspection dataset.',
  tstzrange(now() - interval '5 days', now() - interval '5 days' + interval '8 hours'),
  'completed',
  ARRAY['verified_membership'],
  'Approved for academic thesis research.',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '6 days',
  NULL
),
-- 7. WAITLISTED (ShopBot CNC Router) — In high-priority waitlist queue
(
  'dddddddd-dddd-dddd-dddd-dddddddd0007',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
  '11111111-1111-1111-1111-111111111111',
  'Milling hardwood tooling board master plugs for carbon-fiber aerodynamic fairing molding.',
  tstzrange(now() + interval '2 days', now() + interval '2 days' + interval '4 hours'),
  'waitlisted',
  ARRAY['overlapping_approved_slot'],
  'Time slot currently occupied by Formula SAE team. Added to waitlist position #1.',
  NULL,
  NULL,
  82.50
),
-- 8. OVERDUE (Seminar Room Alpha) — Time passed without checkout
(
  'dddddddd-dddd-dddd-dddd-dddddddd0008',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007',
  '33333333-3333-3333-3333-333333333333',
  'Departmental teaching assistant orientation and curriculum review.',
  tstzrange(now() - interval '3 hours', now() - interval '30 minutes'),
  'overdue',
  ARRAY['internal_reservation'],
  'Department coordinator reserved.',
  '44444444-4444-4444-4444-444444444444',
  now() - interval '1 day',
  NULL
),
-- 9. DISPUTED (3D Scanner) — Discrepancy reported during post-use return
(
  'dddddddd-dddd-dddd-dddd-dddddddd0009',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012',
  '11111111-1111-1111-1111-111111111111',
  'Reverse engineering complex turbine impellers for CFD fluid dynamics analysis.',
  tstzrange(now() - interval '2 days', now() - interval '2 days' + interval '2 hours'),
  'disputed',
  ARRAY['verified_credentials'],
  'Approved under lab trial program.',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '3 days',
  NULL
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 9. CONDITION REPORTS (PHOTOS & PHYSICAL STATE AUDIT)
-- ============================================================================
INSERT INTO condition_reports (
  id, booking_id, phase, notes, photos, overall, recorded_by, recorded_at
) VALUES
-- Booking 0002: Electronics Testbench (Check-in before phase)
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0002',
  'before',
  'All 4 oscilloscope probe tip springs verified intact. Ground clips and BNC terminators organized in tray.',
  ARRAY['/condition/bench-before-1.jpg', '/condition/bench-before-2.jpg'],
  'excellent',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '40 minutes'
),
-- Booking 0003: Epilog Laser Cutter (Before phase)
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'before',
  'Honeycomb bed clear of debris. Focusing gauge present. Honeycomb bed seated flat against locator pins.',
  ARRAY['/condition/laser-before.jpg'],
  'excellent',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '6 hours'
),
-- Booking 0003: Epilog Laser Cutter (After phase)
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0003',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'after',
  'Cleaned bed and vacuumed acrylic slag. Minor surface abrasion noted on acrylic lid hinge during wipe-down.',
  ARRAY['/condition/laser-after.jpg'],
  'good',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '4 hours'
),
-- Booking 0006: GPU Rig (Before phase)
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0004',
  'dddddddd-dddd-dddd-dddd-dddddddd0006',
  'before',
  'Host machine booted cleanly. Both RTX 4090 GPUs operating at 38C idle with zero ECC errors.',
  ARRAY['/condition/gpu-before.jpg'],
  'excellent',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '5 days'
),
-- Booking 0006: GPU Rig (After phase)
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeee0005',
  'dddddddd-dddd-dddd-dddd-dddddddd0006',
  'after',
  'Model artifacts transferred to cloud storage. Temp directories cleared and Docker containers terminated.',
  ARRAY['/condition/gpu-after.jpg'],
  'excellent',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '5 days' + interval '8 hours'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 10. INCIDENTS (DAMAGE & DISCREPANCY TRACKING)
-- ============================================================================
INSERT INTO incidents (
  id, booking_id, resource_id, reported_by, type, severity, description,
  ai_summary, status, resolution_note, resolved_by, resolved_at
) VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffff0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  '11111111-1111-1111-1111-111111111111',
  'damage',
  'low',
  'Noticed fine hairline scratch on the acrylic lid near the left safety interlock bracket. Does not compromise laser enclosure safety seal.',
  'Low-severity cosmetic scratch on exterior acrylic cover. Interlock safety mechanism tested and fully functional.',
  'resolved',
  'Inspected by Dr. Rao. Interlock safety switch passed secondary resistance test. Cosmetic flaw logged in maintenance register.',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 11. WAITLIST ENTRIES
-- ============================================================================
INSERT INTO waitlist_entries (
  id, resource_id, user_id, desired_range, priority_score, score_breakdown, status
) VALUES
(
  '10101010-1010-1010-1010-101010100001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
  '11111111-1111-1111-1111-111111111111',
  tstzrange(now() + interval '2 days', now() + interval '2 days' + interval '4 hours'),
  82.50,
  jsonb_build_object(
    'hours_used_this_month', 4.5,
    'hours_score', 85.0,
    'days_since_last_booking', 5,
    'recency_score', 75.0,
    'academic_need_flag', true,
    'need_score', 100.0,
    'no_shows_90d', 0,
    'reliability_score', 100.0,
    'weighted_total', 82.50
  ),
  'waiting'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 12. NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (
  id, user_id, type, title, body, link, read_at
) VALUES
(
  '20202020-2020-2020-2020-202020200001',
  '11111111-1111-1111-1111-111111111111',
  'booking_update',
  'Reservation Approved: Prusa MK4 3D Printer',
  'Dr. Kavitha Rao has approved your reservation request for tomorrow at 11:00 AM. Please arrive on time with your filament.',
  '/bookings/dddddddd-dddd-dddd-dddd-dddddddd0001',
  now() - interval '5 hours'
),
(
  '20202020-2020-2020-2020-202020200002',
  '11111111-1111-1111-1111-111111111111',
  'reminder',
  'Session In Progress: Electronics Testbench',
  'Your bench reservation at Maxwell Tower Room 202 is active. Remember to check out before 5:00 PM.',
  '/bookings/dddddddd-dddd-dddd-dddd-dddddddd0002',
  NULL
),
(
  '20202020-2020-2020-2020-202020200003',
  '11111111-1111-1111-1111-111111111111',
  'approval_needed',
  'Booking Request Received: Podcast Studio',
  'Your booking request for Studio 305 is pending evaluation by the AV Department manager.',
  '/bookings/dddddddd-dddd-dddd-dddd-dddddddd0004',
  NULL
),
(
  '20202020-2020-2020-2020-202020200004',
  '11111111-1111-1111-1111-111111111111',
  'credential',
  'Credential Verified: Laser Safety Certification',
  'Your certification has been approved and logged in your profile with 180 days validity.',
  '/profile',
  now() - interval '18 days'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 13. USAGE LEDGER (FAIR-USE HOUR METERING)
-- ============================================================================
INSERT INTO usage_ledger (
  id, user_id, booking_id, hours, credits, week_start
) VALUES
(
  '30303030-3030-3030-3030-303030300001',
  '11111111-1111-1111-1111-111111111111',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  2.0,
  8.0,
  date_trunc('week', now())::date
),
(
  '30303030-3030-3030-3030-303030300002',
  '11111111-1111-1111-1111-111111111111',
  'dddddddd-dddd-dddd-dddd-dddddddd0006',
  8.0,
  0.0,
  (date_trunc('week', now()) - interval '7 days')::date
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 14. IMMUTABLE AUDIT LOG (COMPLETE RECORD OF LIFECYCLE EVENTS)
-- ============================================================================
INSERT INTO audit_log (
  id, actor_id, actor_role, action, entity_type, entity_id,
  booking_id, resource_id, before, after, reason, created_at
) VALUES
-- Event 1: Booking requested
(
  '40404040-4040-4040-4040-404040400001',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'booking.requested',
  'booking',
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  NULL,
  jsonb_build_object('status', 'requested', 'purpose', 'Senior capstone robotics rover housing'),
  'Student submitted booking request with verified 3D printing qualification.',
  now() - interval '8 hours'
),
-- Event 2: Booking approved by owner
(
  '40404040-4040-4040-4040-404040400002',
  '22222222-2222-2222-2222-222222222222',
  'owner',
  'booking.approved',
  'booking',
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  jsonb_build_object('status', 'requested'),
  jsonb_build_object('status', 'approved', 'decided_by', 'Dr. Kavitha Rao'),
  'Qualifications verified. PETG slicing parameters reviewed.',
  now() - interval '6 hours'
),
-- Event 3: Laser cutter checked in with photos
(
  '40404040-4040-4040-4040-404040400003',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'booking.check_in',
  'booking',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  jsonb_build_object('status', 'approved'),
  jsonb_build_object('status', 'checked_in', 'condition', 'excellent'),
  'Pre-use inspection passed. Arrival condition photo uploaded.',
  now() - interval '6 hours'
),
-- Event 4: Laser cutter returned
(
  '40404040-4040-4040-4040-404040400004',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'booking.returned',
  'booking',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  jsonb_build_object('status', 'checked_in'),
  jsonb_build_object('status', 'returned', 'condition', 'good'),
  'Laser bed cleaned, exhaust run for 10-minute clear down.',
  now() - interval '4 hours'
),
-- Event 5: Incident reported
(
  '40404040-4040-4040-4040-404040400005',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'incident.reported',
  'incident',
  'ffffffff-ffff-ffff-ffff-ffffffff0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  NULL,
  jsonb_build_object('type', 'damage', 'severity', 'low', 'status', 'open'),
  'Student logged fine scratch on acrylic cover during return.',
  now() - interval '3 hours' + interval '45 minutes'
),
-- Event 6: Incident resolved by owner
(
  '40404040-4040-4040-4040-404040400006',
  '22222222-2222-2222-2222-222222222222',
  'owner',
  'incident.resolved',
  'incident',
  'ffffffff-ffff-ffff-ffff-ffffffff0001',
  'dddddddd-dddd-dddd-dddd-dddddddd0003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  jsonb_build_object('status', 'open'),
  jsonb_build_object('status', 'resolved', 'resolved_by', 'Dr. Kavitha Rao'),
  'Interlock tested. Passed safety inspection without requiring parts replacement.',
  now() - interval '2 hours'
),
-- Event 7: Waitlist placement
(
  '40404040-4040-4040-4040-404040400007',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'waitlist.entered',
  'waitlist_entry',
  '10101010-1010-1010-1010-101010100001',
  'dddddddd-dddd-dddd-dddd-dddddddd0007',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
  NULL,
  jsonb_build_object('status', 'waiting', 'priority_score', 82.50),
  'Slot conflicted with Formula SAE. Calculated waitlist priority score: 82.50.',
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

