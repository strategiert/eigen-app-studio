-- SUPER-DIAGNOSTIC: Vollständige Analyse warum Farben nicht angezeigt werden
-- Führe diese Queries der Reihe nach in Supabase SQL Editor aus

-- =============================================================================
-- TEST 1: Prüfe ob die Spalten überhaupt existieren
-- =============================================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'learning_worlds'
  AND column_name IN ('world_design', 'visual_theme', 'poetic_name', 'description')
ORDER BY column_name;

-- ERWARTETES ERGEBNIS:
-- visual_theme | jsonb | YES
-- world_design | jsonb | YES
-- Wenn diese FEHLEN → KRITISCHER FEHLER: Spalten fehlen!


-- =============================================================================
-- TEST 2: Prüfe die tatsächlichen Daten in der Datenbank
-- =============================================================================
SELECT
  id,
  title,
  poetic_name,
  status,
  is_public,

  -- Prüfe ob world_design existiert und nicht leer ist
  CASE
    WHEN world_design IS NULL THEN '❌ NULL'
    WHEN world_design::text = '{}' THEN '⚠️ LEER ({})'
    WHEN world_design->'visualIdentity' IS NULL THEN '⚠️ Kein visualIdentity'
    ELSE '✅ Hat visualIdentity'
  END as world_design_status,

  -- Prüfe ob visual_theme existiert und nicht leer ist
  CASE
    WHEN visual_theme IS NULL THEN '❌ NULL'
    WHEN visual_theme::text = '{}' THEN '⚠️ LEER ({})'
    ELSE '✅ Hat Daten'
  END as visual_theme_status,

  -- Zeige die tatsächlichen primaryHue Werte
  world_design->'visualIdentity'->>'primaryHue' as wd_primary_hue,
  visual_theme->>'primaryHue' as vt_primary_hue,

  -- Zeige was SOLLTE geladen werden (Fallback-Logik simulieren)
  COALESCE(
    world_design->'visualIdentity'->>'primaryHue',
    visual_theme->>'primaryHue',
    '220 (DEFAULT)'
  ) as effective_hue

FROM learning_worlds
WHERE status = 'published' OR is_public = true
ORDER BY created_at DESC;

-- ERWARTETES ERGEBNIS für "Die Römer":
-- world_design_status: ✅ Hat visualIdentity
-- wd_primary_hue: 45
-- effective_hue: 45
--
-- WENN effective_hue = "220 (DEFAULT)" → Daten fehlen in DB!


-- =============================================================================
-- TEST 3: Vollständiges JSON für eine spezifische Welt
-- =============================================================================
SELECT
  title,
  status,
  is_public,

  -- KOMPLETTES world_design JSON
  jsonb_pretty(world_design) as full_world_design,

  -- KOMPLETTES visual_theme JSON
  jsonb_pretty(visual_theme) as full_visual_theme

FROM learning_worlds
WHERE title LIKE '%Römer%'
   OR title LIKE '%Sonnensystem%'
ORDER BY created_at DESC
LIMIT 3;

-- ERWARTETES ERGEBNIS:
-- Für "Die Römer" solltest du sehen:
-- full_world_design → { "visualIdentity": { "primaryHue": 45, ... } }
-- Oder:
-- full_visual_theme → { "primaryHue": 45, ... }
--
-- WENN BEIDE LEER oder NULL → PROBLEM: Daten wurden nie gespeichert!


-- =============================================================================
-- TEST 4: RLS Policy Check - Welche Welten kann ein anonymer User sehen?
-- =============================================================================

-- Simuliere was ein nicht-eingeloggter User sehen würde
SET LOCAL ROLE anon;

SELECT
  id,
  title,
  poetic_name,
  status,
  is_public,
  world_design->'visualIdentity'->>'primaryHue' as hue
FROM learning_worlds
ORDER BY created_at DESC;

-- RESET ROLE zurück
RESET ROLE;

-- ERWARTETES ERGEBNIS:
-- Sollte nur Welten mit (is_public = true AND status = 'published') zeigen
-- WENN LEER → RLS blockiert Zugriff!


-- =============================================================================
-- TEST 5: Zeige die RLS Policies für learning_worlds
-- =============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'learning_worlds'
ORDER BY policyname;

-- ERWARTETES ERGEBNIS:
-- Sollte Policies für SELECT zeigen
-- Prüfe ob "qual" eine Bedingung wie "is_public = true AND status = 'published'" hat


-- =============================================================================
-- TEST 6: Prüfe ob die Edge Function die Daten korrekt speichert
-- =============================================================================
SELECT
  id,
  title,
  status,
  created_at,

  -- Prüfe generated_code um zu sehen was die AI generiert hat
  generated_code->'worldDesign'->'visualIdentity'->>'primaryHue' as ai_generated_hue,

  -- Prüfe was tatsächlich in world_design gespeichert wurde
  world_design->'visualIdentity'->>'primaryHue' as saved_hue,

  -- Sind sie identisch?
  CASE
    WHEN (generated_code->'worldDesign'->'visualIdentity'->>'primaryHue') =
         (world_design->'visualIdentity'->>'primaryHue')
    THEN '✅ GLEICH'
    ELSE '❌ UNTERSCHIEDLICH - SPEICHER-FEHLER!'
  END as match_status

FROM learning_worlds
WHERE generated_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ERWARTETES ERGEBNIS:
-- match_status sollte ✅ GLEICH sein
-- WENN ❌ UNTERSCHIEDLICH → Edge Function speichert falsch!


-- =============================================================================
-- ZUSAMMENFASSUNG: Was die Ergebnisse bedeuten
-- =============================================================================

/*
SZENARIO A: Spalten fehlen (TEST 1 schlägt fehl)
→ LÖSUNG: Migration ausführen um world_design/visual_theme Spalten zu erstellen

SZENARIO B: Daten sind NULL/leer (TEST 2 zeigt ❌ NULL oder ⚠️ LEER)
→ LÖSUNG: Edge Function läuft nicht korrekt oder Welten wurden vor Fix erstellt
→ AKTION: Neue Welt erstellen nach Deployment

SZENARIO C: Daten existieren, aber User sieht nichts (TEST 4 leer)
→ LÖSUNG: RLS Policy blockiert Zugriff
→ AKTION: Status auf 'published' UND is_public auf true setzen

SZENARIO D: Daten existieren in DB, aber Frontend zeigt Standard-Design
→ LÖSUNG: Frontend Code nicht deployed ODER Browser Cache
→ AKTION: Lovable Re-Deploy + Hard Refresh

SZENARIO E: AI generiert richtig, aber speichert falsch (TEST 6 zeigt ❌)
→ LÖSUNG: Bug in Edge Function Line 312-313
→ AKTION: Code prüfen und neu deployen
*/
