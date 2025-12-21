-- COMPREHENSIVE DIAGNOSTIC: World Design Data Analysis
-- This query shows EXACTLY what format each world uses for visual design

SELECT
  id,
  title,
  poetic_name,
  created_at,

  -- Check which fields are populated
  CASE
    WHEN visual_theme IS NOT NULL THEN '✓ visual_theme exists'
    ELSE '✗ NO visual_theme'
  END as has_visual_theme,

  CASE
    WHEN world_design->'visualIdentity' IS NOT NULL THEN '✓ world_design.visualIdentity exists'
    ELSE '✗ NO world_design.visualIdentity'
  END as has_world_design_vi,

  -- Visual Theme Format Analysis
  CASE
    WHEN visual_theme->>'primaryHue' IS NOT NULL THEN
      '✓ NUMERIC FORMAT (primaryHue: ' || (visual_theme->>'primaryHue') || ')'
    WHEN visual_theme->>'primaryColor' IS NOT NULL THEN
      '✗ STRING FORMAT (primaryColor: ' || (visual_theme->>'primaryColor') || ')'
    ELSE '✗ NO DATA'
  END as visual_theme_format,

  -- World Design Visual Identity Format Analysis
  CASE
    WHEN world_design->'visualIdentity'->>'primaryHue' IS NOT NULL THEN
      '✓ NUMERIC FORMAT (primaryHue: ' || (world_design->'visualIdentity'->>'primaryHue') || ')'
    WHEN world_design->'visualIdentity'->>'primaryColor' IS NOT NULL THEN
      '✗ STRING FORMAT (primaryColor: ' || (world_design->'visualIdentity'->>'primaryColor') || ')'
    ELSE '✗ NO DATA'
  END as world_design_vi_format,

  -- Mood and Era
  COALESCE(visual_theme->>'mood', world_design->'visualIdentity'->>'mood', 'none') as mood,
  COALESCE(visual_theme->>'era', world_design->'visualIdentity'->>'era', 'none') as era,

  -- Atmosphere from worldConcept
  world_design->'worldConcept'->>'atmosphere' as atmosphere,

  -- Age of the world (to identify newest)
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as hours_old

FROM learning_worlds
WHERE title LIKE '%Sonnensystem%'
ORDER BY created_at DESC
LIMIT 10;

-- SECOND QUERY: Show raw JSON for inspection
SELECT
  title,
  created_at,
  jsonb_pretty(visual_theme) as visual_theme_json,
  jsonb_pretty(world_design->'visualIdentity') as visual_identity_json
FROM learning_worlds
WHERE title LIKE '%Sonnensystem%'
ORDER BY created_at DESC
LIMIT 3;
