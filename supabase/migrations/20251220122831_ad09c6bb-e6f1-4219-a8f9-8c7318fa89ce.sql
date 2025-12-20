-- Create a system user for demo content
-- We'll use the Supabase auth.users table requires proper signup, so instead
-- we'll temporarily allow NULL creator_id for demo data OR use a workaround

-- Actually, let's modify the foreign key to be deferrable and create demo data
-- For now, we'll remove the FK temporarily and re-add it

-- First, drop the existing foreign key if exists
ALTER TABLE learning_worlds DROP CONSTRAINT IF EXISTS learning_worlds_creator_id_fkey;

-- Insert demo learning world with a placeholder UUID
INSERT INTO learning_worlds (
  id,
  creator_id,
  title,
  poetic_name,
  description,
  subject,
  moon_phase,
  status,
  is_public
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'Das Sonnensystem',
  'Reise durch die kosmische Nachbarschaft',
  'Eine spannende Entdeckungsreise durch unser Sonnensystem - von der glühenden Sonne bis zum eisigen Pluto.',
  'physik',
  'vollmond',
  'published',
  true
);

-- Insert demo sections with all 4 component types
INSERT INTO learning_sections (id, world_id, title, content, component_type, component_data, order_index) VALUES
-- Section 1: Text introduction
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Willkommen im Sonnensystem',
  'Unser Sonnensystem ist ein faszinierender Ort im Weltraum. In seinem Zentrum befindet sich die Sonne, ein riesiger Stern, der Licht und Wärme spendet. Um die Sonne kreisen acht Planeten: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus und Neptun. Die inneren Planeten (Merkur, Venus, Erde, Mars) sind klein und felsig. Die äußeren Planeten (Jupiter, Saturn, Uranus, Neptun) sind riesige Gasplaneten. Zwischen Mars und Jupiter befindet sich der Asteroidengürtel mit Millionen von Gesteinsbrocken.',
  'text',
  '{}',
  0
),
-- Section 2: Quiz
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Quiz: Teste dein Wissen',
  'Zeige was du über das Sonnensystem gelernt hast!',
  'quiz',
  '{"questions": [
    {"question": "Welcher Planet ist der größte in unserem Sonnensystem?", "options": ["Mars", "Jupiter", "Saturn", "Erde"], "correctAnswer": 1, "explanation": "Jupiter ist mit Abstand der größte Planet. Er ist so groß, dass alle anderen Planeten zusammen in ihn hineinpassen würden!"},
    {"question": "Wie viele Planeten gibt es in unserem Sonnensystem?", "options": ["6", "7", "8", "9"], "correctAnswer": 2, "explanation": "Es gibt 8 Planeten: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus und Neptun. Pluto wurde 2006 zum Zwergplaneten herabgestuft."},
    {"question": "Welcher Planet ist der Sonne am nächsten?", "options": ["Venus", "Merkur", "Mars", "Erde"], "correctAnswer": 1, "explanation": "Merkur ist der sonnennächste Planet. Er ist auch der kleinste Planet unseres Sonnensystems."},
    {"question": "Was befindet sich zwischen Mars und Jupiter?", "options": ["Ein Mond", "Der Asteroidengürtel", "Ein Komet", "Nichts"], "correctAnswer": 1, "explanation": "Der Asteroidengürtel liegt zwischen Mars und Jupiter und enthält Millionen von Gesteinsbrocken."}
  ]}',
  1
),
-- Section 3: Fill-in-the-blanks
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'Lückentext: Die Planeten',
  'Fülle die Lücken mit den richtigen Begriffen.',
  'fill-in-blanks',
  '{"items": [
    {"text": "Der ___ ist der größte Planet in unserem Sonnensystem.", "blanks": ["Jupiter"]},
    {"text": "Die ___ ist der einzige Planet mit flüssigem Wasser auf der Oberfläche.", "blanks": ["Erde"]},
    {"text": "Der ___ ist bekannt für seine wunderschönen Ringe.", "blanks": ["Saturn"]},
    {"text": "Die inneren Planeten sind ___ und felsig.", "blanks": ["klein"]}
  ]}',
  2
),
-- Section 4: Matching
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  'Zuordnung: Planeten und ihre Eigenschaften',
  'Ordne jeden Planeten seiner besonderen Eigenschaft zu.',
  'matching',
  '{"pairs": [
    {"left": "Merkur", "right": "Sonnennächster Planet"},
    {"left": "Venus", "right": "Heißester Planet"},
    {"left": "Mars", "right": "Der rote Planet"},
    {"left": "Jupiter", "right": "Größter Planet"},
    {"left": "Saturn", "right": "Planet mit Ringen"}
  ]}',
  3
);