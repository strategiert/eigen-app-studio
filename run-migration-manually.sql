-- ============================================================================
-- MIGRATION: Add generated_component_code to learning_worlds
-- ============================================================================
-- Führe dies in Supabase SQL Editor aus!

-- Schritt 1: Spalte hinzufügen
ALTER TABLE learning_worlds
ADD COLUMN IF NOT EXISTS generated_component_code TEXT;

-- Schritt 2: Index für Performance
CREATE INDEX IF NOT EXISTS idx_learning_worlds_has_generated_code
ON learning_worlds ((generated_component_code IS NOT NULL));

-- Schritt 3: VERIFY - Prüfe ob Spalte existiert
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'learning_worlds'
  AND column_name = 'generated_component_code';

-- Erwartetes Ergebnis:
-- column_name              | data_type | is_nullable
-- generated_component_code | text      | YES

-- ============================================================================
-- TEST: Prüfe aktuelle Welten
-- ============================================================================
SELECT
  id,
  title,
  created_at,
  generated_component_code IS NULL as code_missing,
  LENGTH(generated_component_code) as code_length
FROM learning_worlds
ORDER BY created_at DESC
LIMIT 5;

-- Alle sollten code_missing = true haben (weil noch keine generiert)
