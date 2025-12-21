-- Diagnose-Query: Zeige die letzten 5 Lernwelten mit ihren Design-Daten
-- Führe diese Query in Supabase SQL Editor aus

SELECT
  id,
  title,
  poetic_name,
  subject,
  created_at,

  -- Visual Theme (sollte numeric sein nach Fix)
  visual_theme->>'primaryHue' as primary_hue,
  visual_theme->>'saturation' as saturation,
  visual_theme->>'accentHue' as accent_hue,
  visual_theme->>'mood' as mood,
  visual_theme->>'era' as era,
  visual_theme->>'patternStyle' as pattern_style,

  -- Legacy Format (sollte NULL sein nach Fix)
  visual_theme->>'primaryColor' as primary_color_legacy,
  visual_theme->>'secondaryColor' as secondary_color_legacy,

  -- World Design Atmosphere
  world_design->'worldConcept'->>'atmosphere' as atmosphere,
  world_design->'worldConcept'->>'name' as concept_name,

  -- Vollständiges visual_theme JSON (zur Inspektion)
  jsonb_pretty(visual_theme) as visual_theme_full

FROM learning_worlds
WHERE title LIKE '%Sonnensystem%'
ORDER BY created_at DESC
LIMIT 5;
