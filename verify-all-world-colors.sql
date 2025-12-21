-- KOMPLETT-ÜBERSICHT: Alle Welten und ihre Farben
-- Führe dies in Supabase SQL Editor aus

-- Teil 1: Farb-Übersicht aller veröffentlichten Welten
SELECT
  id,
  title,
  poetic_name,
  status,
  is_public,

  -- Primärfarbe
  COALESCE(
    world_design->'visualIdentity'->>'primaryHue',
    visual_theme->>'primaryHue',
    'KEINE'
  ) as primary_hue,

  -- Sättigung
  COALESCE(
    world_design->'visualIdentity'->>'saturation',
    visual_theme->>'saturation',
    'KEINE'
  ) as saturation,

  -- Mood & Era
  COALESCE(
    world_design->'visualIdentity'->>'mood',
    visual_theme->>'mood',
    'keine'
  ) as mood,

  COALESCE(
    world_design->'visualIdentity'->>'era',
    visual_theme->>'era',
    'keine'
  ) as era,

  -- Farb-Interpretation
  CASE
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 0 AND 30 THEN '🔴 ROT'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 31 AND 60 THEN '🟡 GOLD/ORANGE'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 61 AND 120 THEN '🟢 GRÜN/GELB'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 121 AND 180 THEN '🟢 GRÜN/TÜRKIS'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 181 AND 240 THEN '🔵 BLAU/CYAN'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 241 AND 300 THEN '🟣 LILA/MAGENTA'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue')::int BETWEEN 301 AND 360 THEN '🟣 PINK/ROT'
    ELSE '⚪ UNBEKANNT'
  END as farbe,

  created_at

FROM learning_worlds
WHERE status = 'published' OR is_public = true
ORDER BY created_at DESC;


-- Teil 2: Detaillierte Ansicht für Debug
SELECT
  title,

  -- URL zum Testen
  '/w/' || id as test_url,

  -- Vollständiges Visual Identity JSON
  jsonb_pretty(
    COALESCE(
      world_design->'visualIdentity',
      visual_theme
    )
  ) as design_details

FROM learning_worlds
WHERE status = 'published' OR is_public = true
ORDER BY created_at DESC;


-- Teil 3: Finde Welten mit Standard-Blau (Problem-Welten)
SELECT
  title,
  poetic_name,
  COALESCE(
    world_design->'visualIdentity'->>'primaryHue',
    visual_theme->>'primaryHue'
  ) as hue,

  CASE
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue') = '220' THEN '⚠️ STANDARD BLAU - KEIN EINZIGARTIGES DESIGN!'
    WHEN COALESCE(world_design->'visualIdentity'->>'primaryHue', visual_theme->>'primaryHue') IS NULL THEN '❌ KEINE FARBE - FEHLT KOMPLETT!'
    ELSE '✅ Hat einzigartiges Design'
  END as status

FROM learning_worlds
WHERE is_public = true OR status = 'published'
ORDER BY created_at DESC;


-- Teil 4: Veröffentliche ALLE Draft-Welten für Test
-- (Nur ausführen wenn gewünscht!)
/*
UPDATE learning_worlds
SET
  status = 'published',
  is_public = true
WHERE status = 'draft'
RETURNING
  title,
  COALESCE(
    world_design->'visualIdentity'->>'primaryHue',
    visual_theme->>'primaryHue'
  ) as hue;
*/
