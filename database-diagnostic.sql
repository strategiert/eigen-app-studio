-- ===================================================================
-- KOMPLETTES DATENBANK DIAGNOSTIC für Learning Worlds
-- ===================================================================
-- Führe dieses Script in Supabase SQL Editor aus
-- ===================================================================

-- 1. Prüfe ob generated_component_code Spalte existiert
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'learning_worlds'
  AND column_name = 'generated_component_code';

-- Erwartetes Ergebnis:
-- column_name: generated_component_code
-- data_type: text
-- is_nullable: YES

-- ===================================================================

-- 2. Übersicht aller Welten mit Code-Status
SELECT
  id,
  title,
  subject,
  status,
  created_at,
  generated_component_code IS NOT NULL as has_code,
  CASE
    WHEN generated_component_code IS NOT NULL
    THEN LENGTH(generated_component_code)
    ELSE 0
  END as code_length
FROM learning_worlds
ORDER BY created_at DESC
LIMIT 20;

-- Was du sehen solltest:
-- has_code: true (wenn Code generiert wurde)
-- code_length: 2000+ (wenn erfolgreich)

-- ===================================================================

-- 3. Detaillierte Analyse der neuesten Welt
SELECT
  id,
  title,
  subject,
  status,
  created_at,
  generated_component_code IS NOT NULL as has_code,
  LENGTH(generated_component_code) as code_length,
  LEFT(generated_component_code, 100) as code_preview,
  world_design->>'primaryHue' as primary_hue,
  world_design->'worldConcept'->>'layoutStyle' as layout_style
FROM learning_worlds
ORDER BY created_at DESC
LIMIT 1;

-- ERFOLG wenn:
-- has_code: true
-- code_length: 2000+
-- code_preview: Startet mit "<" (JSX)

-- FEHLER wenn:
-- has_code: false
-- code_length: NULL oder 0
-- → Edge Function hat nicht funktioniert!

-- ===================================================================

-- 4. Statistik über alle Welten
SELECT
  COUNT(*) as total_worlds,
  COUNT(generated_component_code) as worlds_with_code,
  COUNT(*) - COUNT(generated_component_code) as worlds_without_code,
  ROUND(100.0 * COUNT(generated_component_code) / COUNT(*), 2) as code_percentage
FROM learning_worlds;

-- Ideal:
-- code_percentage: 100.00 (alle Welten haben Code)

-- Aktuell wahrscheinlich:
-- code_percentage: 0.00 (keine Welt hat Code)

-- ===================================================================

-- 5. Detaillierte Ansicht: Welten MIT Code (sollte leer sein aktuell)
SELECT
  title,
  subject,
  LENGTH(generated_component_code) as code_length,
  LEFT(generated_component_code, 200) as code_sample
FROM learning_worlds
WHERE generated_component_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ===================================================================

-- 6. Detaillierte Ansicht: Welten OHNE Code (alle aktuellen Welten)
SELECT
  id,
  title,
  subject,
  status,
  created_at,
  world_design->>'primaryHue' as primary_hue
FROM learning_worlds
WHERE generated_component_code IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ===================================================================

-- 7. Prüfe ob Migration gelaufen ist
SELECT
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
WHERE name LIKE '%generated_component%'
ORDER BY executed_at DESC;

-- Sollte zeigen:
-- name: add_generated_component_code oder ähnlich
-- executed_at: Timestamp (wenn Migration gelaufen)

-- ===================================================================
-- INTERPRETATION DER ERGEBNISSE
-- ===================================================================

-- SZENARIO 1: Spalte existiert NICHT
-- → Migration wurde nicht ausgeführt
-- → Führe run-migration-manually.sql aus

-- SZENARIO 2: Spalte existiert, ALLE Welten haben has_code: false
-- → Edge Function generiert keinen Code
-- → callAIRaw fehlt in deploytem Code (NICHT in main!)
-- → PR muss gemerged werden!

-- SZENARIO 3: Spalte existiert, ALTE Welten ohne Code, NEUE mit Code
-- → System funktioniert!
-- → Erstelle neue Testwelt zur Verifizierung

-- SZENARIO 4: Spalte existiert, ALLE Welten haben Code
-- → System funktioniert perfekt!
-- → Browser-Cache leeren und neu laden

-- ===================================================================
