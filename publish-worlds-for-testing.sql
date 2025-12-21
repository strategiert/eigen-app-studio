-- SQL zum Veröffentlichen der Testwelten
-- Führe dies im Supabase SQL Editor aus

-- 1. PRÜFEN: Welche Welten existieren und welche Design-Formate sie haben
SELECT
  id,
  title,
  poetic_name,
  status,
  is_public,
  created_at,
  CASE
    WHEN world_design->'visualIdentity'->>'primaryHue' IS NOT NULL THEN
      '✅ NUMERIC: ' || (world_design->'visualIdentity'->>'primaryHue')
    WHEN visual_theme->>'primaryHue' IS NOT NULL THEN
      '✅ NUMERIC (visual_theme): ' || (visual_theme->>'primaryHue')
    WHEN visual_theme->>'primaryColor' IS NOT NULL THEN
      '⚠️ STRING: ' || (visual_theme->>'primaryColor')
    ELSE '❌ NO DATA'
  END as design_format,
  world_design->'visualIdentity'->>'mood' as mood,
  world_design->'visualIdentity'->>'era' as era
FROM learning_worlds
ORDER BY created_at DESC
LIMIT 10;

-- 2. VERÖFFENTLICHEN: Die Sonnensystem-Welt mit Lila/Magenta Design (primaryHue: 260)
UPDATE learning_worlds
SET
  status = 'published',
  is_public = true
WHERE
  title LIKE '%Sonnensystem%'
  AND (
    world_design->'visualIdentity'->>'primaryHue' = '260'
    OR visual_theme->>'primaryHue' = '260'
  )
RETURNING
  id,
  title,
  poetic_name,
  world_design->'visualIdentity'->>'primaryHue' as primary_hue,
  world_design->'visualIdentity'->>'mood' as mood;

-- 3. OPTIONAL: Weitere Welten veröffentlichen für unterschiedliche Farbtests
-- (Kommentiere die gewünschten Welten ein)

-- Alle Draft-Welten mit numerischem Format veröffentlichen:
-- UPDATE learning_worlds
-- SET status = 'published', is_public = true
-- WHERE status = 'draft'
--   AND world_design->'visualIdentity'->>'primaryHue' IS NOT NULL
-- RETURNING id, title, world_design->'visualIdentity'->>'primaryHue' as hue;

-- ODER: Alle Welten veröffentlichen (für schnellen Test):
-- UPDATE learning_worlds
-- SET status = 'published', is_public = true
-- WHERE status = 'draft'
-- RETURNING id, title, poetic_name;
