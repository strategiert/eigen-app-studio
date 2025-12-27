import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Declare EdgeRuntime for Deno
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

interface GenerationRequest {
  title: string;
  subject: string;
  sourceContent: string;
}

// Helper to update generation status
async function updateStatus(
  supabase: SupabaseClient,
  worldId: string,
  status: string,
  error?: string
) {
  const updateData: Record<string, string | null> = { generation_status: status };
  if (error) {
    updateData.generation_error = error;
  }
  
  const { error: updateError } = await supabase
    .from('learning_worlds')
    .update(updateData)
    .eq('id', worldId);
    
  if (updateError) {
    console.error(`Failed to update status to ${status}:`, updateError);
  } else {
    console.log(`Status updated to: ${status}`);
  }
}

// Call AI API
async function callAI(systemPrompt: string, userPrompt: string, model = "google/gemini-2.5-flash") {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in AI response");
  }

  // Parse JSON, handling markdown code blocks
  let jsonContent = content.trim();
  if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  }
  
  return JSON.parse(jsonContent);
}

// Call AI API for RAW output (no JSON formatting) - used for JSX/code generation
async function callAIRaw(systemPrompt: string, userPrompt: string, model = "google/gemini-2.5-flash"): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      // NO response_format - allows free text/JSX output
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  return content || null; // Return raw text
}

// Background generation process
async function runGeneration(
  supabase: SupabaseClient,
  worldId: string,
  title: string,
  sourceContent: string,
  subject: string
) {
  try {
    // PHASE 1: Analyze Content
    console.log("Phase 1: Analyzing content...");
    await updateStatus(supabase, worldId, 'analyzing');
    
    const analysisPrompt = `Analysiere diesen Lerninhalt und extrahiere wichtige Informationen für eine Lernerfahrung.

WICHTIG: Alle Texte müssen auf DEUTSCH sein!

Gib ein JSON-Objekt zurück mit:
{
  "theme": {
    "mainTopic": "Das zentrale Thema des Inhalts",
    "keywords": ["Liste", "wichtiger", "Begriffe"],
    "targetAge": "geschätzte Altersgruppe (z.B. '10-12')",
    "difficulty": "anfänger/fortgeschritten/experte"
  },
  "structure": {
    "conceptCount": "Anzahl der Hauptkonzepte (Zahl)",
    "hasExamples": true,
    "contentType": "theoretisch/praktisch/gemischt"
  },
  "learningObjectives": ["Was Schüler lernen werden"]
}`;

    const contentAnalysis = await callAI(analysisPrompt, `Titel: ${title}\n\nInhalt:\n${sourceContent.substring(0, 8000)}`);
    console.log("Content analysis complete:", contentAnalysis?.theme?.mainTopic);

    // PHASE 2: Design World
    console.log("Phase 2: Designing world...");
    await updateStatus(supabase, worldId, 'designing');
    
    const designPrompt = `Du bist ein Creative Director und gestaltest eine EINZIGARTIGE visuelle Welt für eine Lernerfahrung.

WICHTIG: Jede Lernwelt MUSS visuell KOMPLETT ANDERS aussehen! Alle Texte auf DEUTSCH!

Basierend auf Thema und Inhalt, wähle ein passendes Design:

FACH-SPEZIFISCHE FARBEN (wähle passend zum Thema):
- Mathematik: Blau/Cyan/Grün (logisch, strukturiert) → primaryHue: 200, saturation: 70
- Deutsch/Sprachen: Warme Töne Orange/Gelb → primaryHue: 35, saturation: 75
- Geschichte: Gold/Rot/Dunkelblau (königlich) → primaryHue: 45, saturation: 80 ODER primaryHue: 0, saturation: 70
- Naturwissenschaften: Grün/Türkis (organisch) → primaryHue: 160, saturation: 60
- Kunst/Musik: Lila/Pink (kreativ) → primaryHue: 280, saturation: 65
- Sport: Dynamisches Rot/Orange → primaryHue: 15, saturation: 80

ERA (wähle basierend auf Zeitperiode des Inhalts):
- ancient: Antike/Frühe Geschichte → Erdtöne, Braun, Beige
- medieval: Mittelalter → Dunkelrot, Gold, tiefes Blau
- renaissance: Renaissance → Elegante Farben, Grün, Purpur
- modern: 20. Jahrhundert → Klare, kräftige Farben
- futuristic: Zukunft/Tech → Neon, Cyan, Lila
- timeless: Zeitlos, universell

MOOD (basierend auf Inhalt):
- playful: Kinder, spielerisch → Helle, bunte Farben
- serious: Wissenschaft, formal → Gedämpfte, professionelle Farben
- mystical: Entdeckung, Geheimnisvoll → Dunkle, geheimnisvolle Töne
- warm: Einladend, freundlich → Warme Farbtöne
- cool: Ruhig, fokussiert → Kühle Farbtöne
- natural: Organisch, natürlich → Erdtöne

PATTERN STYLE (visuelles Muster):
- geometric: Geometrische Formen (modern, strukturiert)
- organic: Organische, fließende Formen (natürlich)
- abstract: Abstrakte Kunst (kreativ)
- historical: Historische Ornamente (Geschichte)
- scientific: Wissenschaftliche Diagramme (MINT-Fächer)

KRITISCH - Du MUSST dieses EXAKTE JSON-Format zurückgeben.
KOPIERE NICHT DIE BEISPIELWERTE! Wähle eigene Werte basierend auf dem tatsächlichen Thema!

JSON-STRUKTUR:
{
  "worldConcept": {
    "name": "Einzigartiger poetischer DEUTSCHER Name",
    "tagline": "Kurze deutsche Beschreibung",
    "narrativeFrame": "Erzählerischer Kontext (2-3 Sätze, deutsch)",
    "atmosphere": "Atmosphäre in 2-3 Worten (deutsch)"
  },
  "visualIdentity": {
    "primaryHue": [WÄHLE PASSEND ZUM FACH - SIEHE OBEN],
    "saturation": [WÄHLE 40-90],
    "accentHue": [WÄHLE KOMPLEMENTÄR ZU primaryHue],
    "mood": "[WÄHLE PASSEND: warm|cool|mystical|playful|serious|natural]",
    "era": "[WÄHLE PASSEND: ancient|medieval|renaissance|modern|futuristic|timeless]",
    "patternStyle": "[WÄHLE PASSEND: geometric|organic|abstract|historical|scientific]",
    "styleHint": "Beschreibung des visuellen Stils (deutsch)"
  },
  "typography": {
    "headingFont": "serif ODER sans-serif ODER display",
    "bodyFont": "serif ODER sans-serif",
    "headingWeight": [600-900],
    "headingLetterSpacing": "[z.B. -0.02em oder 0.05em]",
    "bodyLineHeight": "[1.5 bis 1.8]"
  },
  "moduleDesigns": [...]
}

FORMAT-REGELN:
- primaryHue: NUMMER 0-360 (z.B. 45 für Gold, 160 für Grün, 280 für Lila)
- saturation: NUMMER 40-90
- accentHue: NUMMER 0-360 (z.B. primaryHue + 120 für Komplementärfarbe)
- ALLE WERTE MÜSSEN ZUM THEMA PASSEN!

BEISPIELE FÜR VERSCHIEDENE FÄCHER:

Geschichte/Pyramiden → primaryHue: 45 (Gold), mood: mystical, era: ancient, patternStyle: historical
Biologie/Pflanzen → primaryHue: 140 (Grün), mood: natural, era: timeless, patternStyle: organic
Physik/Weltraum → primaryHue: 260 (Lila), mood: cool, era: futuristic, patternStyle: scientific
Musik → primaryHue: 300 (Pink), mood: playful, era: modern, patternStyle: abstract
Sport → primaryHue: 15 (Rot/Orange), mood: warm, era: modern, patternStyle: geometric
Deutsch/Literatur → primaryHue: 35 (Orange), mood: warm, era: renaissance, patternStyle: organic

Analysiere das Thema "${title}" und wähle PASSENDE Werte!
    "patternStyle": "geometric",
    "styleHint": "Klare geometrische Formen mit kräftigen Blau- und Lilatönen"
  }
}

BEISPIEL für Französische Revolution:
{
  "worldConcept": {
    "name": "Das Zeitalter des Umbruchs",
    "tagline": "Die Revolution verändert Frankreich",
    "narrativeFrame": "Erlebe die dramatischen Ereignisse der Französischen Revolution.",
    "atmosphere": "Dramatisch und historisch"
  },
  "visualIdentity": {
    "primaryHue": 45,
    "saturation": 80,
    "accentHue": 0,
    "mood": "serious",
    "era": "medieval",
    "patternStyle": "historical",
    "styleHint": "Königliche Gold- und Rottöne mit historischen Ornamenten"
  }
}

Erstelle ein KOMPLETT EINZIGARTIGES Design für dieses spezifische Thema!`;

    const worldDesign = await callAI(designPrompt, `Titel: ${title}\nFach: ${subject}\n\nContent-Analyse:\n${JSON.stringify(contentAnalysis, null, 2)}`);
    console.log("World design complete:", worldDesign?.worldConcept?.name);

    // PHASE 3: Generate Content
    console.log("Phase 3: Generating content...");
    await updateStatus(supabase, worldId, 'generating');
    
    const contentPrompt = `Erstelle interaktive Lerninhalte mit mehreren Abschnitten.

KRITISCH WICHTIG:
- ALLE Texte müssen auf DEUTSCH sein!
- Verwende deutsche Fachbegriffe für das Unterrichtsfach
- Bei Fremdsprachen (z.B. Englisch): Erkläre die Begriffe auf Deutsch, zeige dann die fremdsprachigen Beispiele

WICHTIG - Erlaubte moduleType Werte (NUR DIESE VERWENDEN):
- "discovery": Einführung und Entdeckung neuer Konzepte
- "knowledge": Wissensvermittlung und Erklärungen
- "practice": Übungen und Anwendung
- "reflection": Reflexion und Zusammenfassung
- "challenge": Herausforderungen und Quiz

Jeder Abschnitt sollte einen dieser Komponententypen haben:
- "text": Erklärender Inhalt mit Markdown
- "quiz": Multiple-Choice-Fragen (verwende moduleType: "challenge")
- "fill-blanks": Lückentext-Übungen (verwende moduleType: "practice")
- "matching": Zuordnungsübung (verwende moduleType: "practice")

WICHTIG: Das visuelle Design wurde bereits in Phase 2 erstellt (worldDesign). Du musst KEIN neues visualTheme erstellen!

Gib JSON zurück:
{
  "poeticName": "Kreativer deutscher Name für diese Welt (falls nicht im worldDesign)",
  "description": "Kurze Beschreibung auf Deutsch",
  "sections": [
    {
      "title": "Deutscher Abschnittstitel",
      "content": "Hauptinhalt auf Deutsch (Markdown für Text-Abschnitte)",
      "moduleType": "discovery|knowledge|practice|reflection|challenge",
      "componentType": "text/quiz/fill-blanks/matching",
      "componentData": {},
      "imagePrompt": "Detaillierte Beschreibung für Illustration"
    }
  ]
}

WICHTIG: Erstelle KEIN visualTheme - das kommt aus Phase 2!

Erstelle 4-6 Abschnitte mit einer Mischung aus Erklärung und interaktiven Übungen.
ALLES AUF DEUTSCH!`;

    const generatedContent = await callAI(contentPrompt, `Titel: ${title}\nFach: ${subject}\n\nWelt-Design:\n${JSON.stringify(worldDesign, null, 2)}\n\nQuellinhalt:\n${sourceContent.substring(0, 10000)}`);
    console.log("Content generation complete with", generatedContent?.sections?.length, "sections");

    // PHASE 3.5: Generate unique React component code
    console.log("Phase 3.5: Generating unique React component code...");
    await updateStatus(supabase, worldId, 'generating_component');

    const componentPrompt = `Du bist ein preisgekrönter UI/UX Designer und Expert React Developer.
Deine Aufgabe: Erstelle eine WUNDERSCHÖNE, PROFESSIONELLE und KOMPLETT EINZIGARTIGE Landing Page für eine Lernwelt.

# 🎨 DESIGN PHILOSOPHIE
- Moderne, elegante Ästhetik mit viel Weißraum (spacing)
- Harmonische Farbpaletten mit subtilen Verläufen
- Klare visuelle Hierarchie durch Größen und Abstände
- Professionell, aber zugänglich und einladend
- KEINE überladenen Designs - weniger ist mehr!

# 🧩 VERFÜGBARE KOMPONENTEN
Hero, Grid, Card, StorySection, Timeline, TimelineItem, ParallaxSection, FloatingElement
Title, Subtitle, Paragraph, Icon, Badge, ProgressBar, ActionButton

# 🎯 FACH-SPEZIFISCHE DESIGN-RICHTLINIEN: ${subject}

${subject === 'Mathematik' ? `
MATHEMATIK Design:
- Farben: Kühle Töne (Blau, Cyan, Violett, Indigo)
  → from-blue-500, from-cyan-600, from-indigo-500, from-violet-600
- Layout: Strukturiert, Grid-basiert (2-3 Spalten)
- Pattern: "grid" oder "dots" für geometrische Präzision
- Icons: star, target, zap (Präzision & Logik)
- Mood: Klar, strukturiert, präzise
` : ''}${subject === 'Geschichte' ? `
GESCHICHTE Design:
- Farben: Warme, erdige Töne (Gold, Bernstein, Rot, Braun)
  → from-amber-600, from-yellow-700, from-red-700, from-orange-600
- Layout: Timeline oder Story-basiert (chronologisch)
- Pattern: "waves" oder "organic" für historischen Flow
- Icons: globe, map, compass, book (Entdeckung & Zeit)
- Mood: Warm, nostalgisch, erzählend
` : ''}${subject === 'Naturwissenschaft' || subject === 'Biologie' ? `
NATURWISSENSCHAFT/BIOLOGIE Design:
- Farben: Natürliche Töne (Grün, Türkis, Smaragd, Teal)
  → from-green-500, from-emerald-600, from-teal-600, from-cyan-500
- Layout: Organisch, asymmetrisch, fließend
- Pattern: "waves" oder "organic" für Natur
- Icons: globe, lightbulb, heart, sparkles (Leben & Entdeckung)
- Mood: Frisch, lebendig, exploratif
` : `
ALLGEMEIN Design:
- Farben: Wähle eine harmonische Palette passend zum Thema
- Layout: Kreativ und themengerecht
- Pattern: Passend zum Inhalt wählen
- Icons: Thematisch sinnvoll
`}

# ✅ DESIGN BEST PRACTICES

1. **Farbverläufe** (Gradients):
   - Nutze 2-3 harmonische Farben: from-[farbe]-500 to-[farbe]-700
   - Subtile Übergänge: from-blue-500 via-cyan-600 to-indigo-700
   - NICHT zu grell! 500-700 Range ist ideal

2. **Spacing & Layout**:
   - Hero: Große Abstände (py-24 oder py-32), zentriert
   - Sections: Viel Padding (p-12, p-16), großzügige Margins
   - Grid: gap-8 oder gap-12 für Luftigkeit
   - NIEMALS alles vollpacken!

3. **Typographie**:
   - Hero Title: text-5xl bis text-7xl, font-bold
   - Section Titles: text-3xl bis text-4xl, mb-8
   - Subtitles: text-xl, text-muted-foreground
   - Paragraph: text-lg, leading-relaxed, max-w-2xl

4. **Komponenten-Kombination**:
   - Starte mit Hero (großer visueller Anker)
   - 3-5 verschiedene Sections (Grid, Story, Timeline, Parallax)
   - Abwechslung: Grid → Story → Timeline (nicht alles gleich!)
   - FloatingElements für Akzente (nicht übertreiben!)

5. **Icons & Badges**:
   - Icons: size={40-64}, subtile Farben
   - Badges: Sparsam einsetzen, als Akzente
   - NICHT zu viele Icons auf einmal!

6. **Cards**:
   - hover-Effekt für Interaktivität
   - p-6 oder p-8 für Innenabstände
   - Maximal 2-4 Cards pro Grid-Row
   - Einheitliche Höhe innerhalb einer Row

# ⚠️ VERBOTEN
- ❌ Generische/langweilige Layouts (sei kreativ!)
- ❌ Zu viele Elemente (Fokus & Weißraum!)
- ❌ Grell/aggressive Farben (subtil & harmonisch!)
- ❌ Schlechte Hierarchie (klar strukturieren!)
- ❌ Vorherige Designs kopieren (jede Welt MUSS anders sein!)

# 📐 STRUKTUR-ANFORDERUNGEN
- Root Element: <> ... </>
- Deutsche Texte (professionell formuliert)
- 4-6 Sections (variiere die Komponenten!)
- Mindestens 1x Hero, 1x Grid, 1x Story/Timeline
- Alle Komponenten aus der Safe-List verwenden

# 🎭 KREATIVITÄT
Erfinde dein EIGENES Layout! Kombiniere Komponenten auf neue Weise.
KEINE zwei Welten dürfen gleich aussehen. Experimentiere mit:
- Verschiedenen Grid-Layouts (2 vs 3 vs 4 Spalten)
- Timeline horizontal oder vertikal
- ParallaxSection mit unterschiedlichen Geschwindigkeiten
- FloatingElements an verschiedenen Positionen

Denke wie ein professioneller Designer: Harmonie, Balance, Weißraum, Hierarchie!

Generiere NUR sauberen JSX Code, keine Markdown-Blöcke, keine Erklärungen!`;

    let generatedComponentCode: string | null = null;
    try {
      // Use callAIRaw for JSX generation (no JSON formatting)
      const componentRaw = await callAIRaw(componentPrompt, `Titel: ${title}\nFach: ${subject}\n\nWorld Design:\n${JSON.stringify(worldDesign?.worldConcept || {}, null, 2)}\n\nContent Summary:\n${generatedContent.description || ''}`);

      console.log("Component generation raw result type:", typeof componentRaw);

      if (componentRaw && typeof componentRaw === 'string') {
        generatedComponentCode = componentRaw.trim();

        // Clean up code if it has markdown code fences
        if (generatedComponentCode.includes('```')) {
          generatedComponentCode = generatedComponentCode
            .replace(/```jsx?\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        }

        console.log("✅ Component code generated successfully, length:", generatedComponentCode.length);
        console.log("Component code preview:", generatedComponentCode.substring(0, 150));
      } else {
        console.error("❌ Component generation returned non-string:", typeof componentRaw);
      }
    } catch (error) {
      console.error("❌ Component generation failed:", error);
      // Continue without component code - will use fallback template
    }

    // PHASE 4: Save to database
    console.log("Phase 4: Saving to database...");
    await updateStatus(supabase, worldId, 'finalizing');

    // Update world with generated data - USE worldDesign.visualIdentity for visual_theme
    const { error: worldUpdateError } = await supabase
      .from('learning_worlds')
      .update({
        poetic_name: generatedContent.poeticName || worldDesign?.worldConcept?.name || null,
        description: generatedContent.description || worldDesign?.worldConcept?.tagline || null,
        visual_theme: worldDesign?.visualIdentity || generatedContent.visualTheme || {},
        world_design: worldDesign || {},
        generated_code: JSON.stringify({ contentAnalysis, worldDesign, generatedContent }),
        generated_component_code: generatedComponentCode, // NEW: AI-generated React component
        status: 'draft',
      })
      .eq('id', worldId);

    if (worldUpdateError) {
      throw new Error(`Failed to update world: ${worldUpdateError.message}`);
    }

    // Create sections - ENFORCE design from worldDesign.moduleDesigns
    // Valid module types according to DB constraint
    const validModuleTypes = ['discovery', 'knowledge', 'practice', 'reflection', 'challenge'];
    
    // Map common AI-generated types to valid types
    const moduleTypeMap: Record<string, string> = {
      'quiz': 'challenge',
      'test': 'challenge',
      'exercise': 'practice',
      'übung': 'practice',
      'intro': 'discovery',
      'introduction': 'discovery',
      'einführung': 'discovery',
      'summary': 'reflection',
      'zusammenfassung': 'reflection',
      'learn': 'knowledge',
      'lernen': 'knowledge',
    };
    
    if (generatedContent.sections && generatedContent.sections.length > 0) {
      const sections = generatedContent.sections.map((section: any, index: number) => {
        // Versuche passendes Design aus worldDesign.moduleDesigns zu finden
        const matchingDesign = worldDesign?.moduleDesigns?.[index] ||
          worldDesign?.moduleDesigns?.find((d: any) =>
            d.title?.toLowerCase().includes(section.title?.toLowerCase()) ||
            section.title?.toLowerCase().includes(d.title?.toLowerCase())
          );

        // Get module type with fallback and validation
        let rawModuleType = matchingDesign?.moduleType || section.moduleType || "knowledge";
        rawModuleType = rawModuleType.toLowerCase();
        
        // Map to valid type or use as-is if valid
        let finalModuleType = validModuleTypes.includes(rawModuleType) 
          ? rawModuleType 
          : (moduleTypeMap[rawModuleType] || "knowledge");

        return {
          world_id: worldId,
          title: matchingDesign?.title || section.title,
          content: section.content,
          module_type: finalModuleType,
          component_type: section.componentType || "text",
          component_data: section.componentData || {},
          image_prompt: matchingDesign?.imagePrompt || section.imagePrompt || null,
          order_index: index,
        };
      });

      const { data: createdSections, error: sectionsError } = await supabase
        .from('learning_sections')
        .insert(sections)
        .select();

      if (sectionsError) {
        console.error("Error creating sections:", sectionsError);
      } else {
        console.log("Created", createdSections?.length, "sections");

        // PHASE 5: Generate images
        console.log("Phase 5: Generating images...");
        await updateStatus(supabase, worldId, 'images');

        // Get visual style from worldDesign
        const visualStyle = worldDesign?.visualIdentity?.styleHint || generatedContent.visualTheme?.styleHint || 'freundlich, farbenfroh, lehrreich';

        // Generate images for first 3 sections
        const sectionsToGenerate = (createdSections || []).slice(0, 3);
        
        for (const section of sectionsToGenerate) {
          if (section.image_prompt) {
            try {
              console.log("Generating image for section:", section.id);
              
              // Call image generation AI
              const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${lovableApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash-image-preview",
                  messages: [
                    {
                      role: "user",
                      content: `Erstelle eine lehrreiche Illustration: ${section.image_prompt}. Stil: ${visualStyle}. Klar, einfach, altersgerecht für Kinder.`
                    }
                  ],
                  modalities: ["image", "text"]
                }),
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                
                if (base64Image && base64Image.startsWith('data:image')) {
                  // Extract base64 data from data URL
                  const base64Data = base64Image.split(',')[1];
                  const binaryString = atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  
                  const imagePath = `worlds/${worldId}/${section.id}.png`;
                  const { error: uploadError } = await supabase.storage
                    .from('learning-materials')
                    .upload(imagePath, bytes, {
                      contentType: 'image/png',
                      upsert: true,
                    });

                  if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                      .from('learning-materials')
                      .getPublicUrl(imagePath);

                    await supabase
                      .from('learning_sections')
                      .update({ image_url: publicUrl })
                      .eq('id', section.id as string);
                      
                    console.log("Image saved for section:", section.id);
                  } else {
                    console.error("Upload error:", uploadError);
                  }
                }
              } else {
                console.error("Image generation failed:", await imageResponse.text());
              }
            } catch (imgError) {
              console.error("Error generating image for section:", section.id, imgError);
            }
          }
        }
      }
    }

    // COMPLETE!
    console.log("Generation complete!");
    await updateStatus(supabase, worldId, 'complete');

  } catch (error) {
    console.error("Generation error:", error);
    await updateStatus(supabase, worldId, 'error', error instanceof Error ? error.message : 'Unknown error');
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const { title, subject, sourceContent }: GenerationRequest = await req.json();

    if (!title || !sourceContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Starting generation for:", title);

    // Create world entry with pending status
    const { data: world, error: createError } = await supabaseClient
      .from('learning_worlds')
      .insert({
        title,
        subject: subject || 'allgemein',
        creator_id: user.id,
        source_content: sourceContent,
        status: 'draft',
        generation_status: 'pending',
        moon_phase: 'neumond',
      })
      .select()
      .single();

    if (createError || !world) {
      console.error("Failed to create world:", createError);
      return new Response(JSON.stringify({ error: 'Failed to create world' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("World created:", world.id);

    // Start background generation
    EdgeRuntime.waitUntil(runGeneration(supabaseClient, world.id, title, sourceContent, subject));

    // Return immediately with world ID
    return new Response(JSON.stringify({ 
      worldId: world.id,
      message: 'Generation started' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in start-generation:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
