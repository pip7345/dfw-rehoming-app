-- Seed default DFW location
INSERT INTO "Location" (id, landing_page_url, city, state, timezone, created_at, updated_at)
VALUES (
  'dfw-default-location',
  'dfw',
  'Dallas-Fort Worth',
  'TX',
  'America/Chicago',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
