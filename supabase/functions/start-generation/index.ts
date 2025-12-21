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
- Mathematik: Blau/Cyan/Grün (logisch, strukturiert) → hsl(200, 70%, 50%)
- Deutsch/Sprachen: Warme Töne Orange/Gelb → hsl(35, 75%, 55%)
- Geschichte: Gold/Rot/Dunkelblau (königlich) → hsl(45, 80%, 50%) oder hsl(0, 70%, 45%)
- Naturwissenschaften: Grün/Türkis (organisch) → hsl(160, 60%, 45%)
- Kunst/Musik: Lila/Pink (kreativ) → hsl(280, 65%, 55%)
- Sport: Dynamisches Rot/Orange → hsl(15, 80%, 50%)

ERA (wähle basierend auf Zeitperiode des Inhalts):
- ancient: Antike/Frühe Geschichte → Erdtöne, Braun, Beige
- medieval: Mittelalter → Dunkelrot, Gold, tiefes Blau
- renaissance: Renaissance → Elegante Farben, Grün, Purpur
- modern: 20. Jahrhundert → Klare, kräftige Farben
- contemporary: Heute → Helle, freundliche Farben
- futuristic: Zukunft/Tech → Neon, Cyan, Lila

MOOD (basierend auf Inhalt):
- playful: Kinder, spielerisch → Helle, bunte Farben
- serious: Wissenschaft, formal → Gedämpfte, professionelle Farben
- mysterious: Entdeckung → Dunkle, geheimnisvolle Töne
- epic: Große Ereignisse → Dramatische, intensive Farben
- calm: Meditation, Natur → Sanfte, beruhigende Farben

WICHTIG: Wähle PRIMARY/SECONDARY/ACCENT Farben die ZUSAMMEN PASSEN aber EINZIGARTIG für dieses Thema sind!

Basierend auf der Content-Analyse erstelle ein einzigartiges visuelles Konzept, das zum Thema passt.

Gib ein JSON-Objekt zurück mit:
{
  "worldConcept": {
    "name": "Poetischer DEUTSCHER Name (passend zum Thema)",
    "tagline": "Kurze deutsche Beschreibung",
    "narrativeFrame": "Erzählerischer Kontext der Lernwelt (2-3 Sätze, deutsch)",
    "atmosphere": "Visuelle Atmosphäre (deutsch)"
  },
  "visualIdentity": {
    "era": "ancient/medieval/renaissance/modern/contemporary/futuristic",
    "mood": "playful/serious/mysterious/epic/calm",
    "primaryColor": "HSL Farbe als 'hsl(h, s%, l%)' - Hauptfarbe passend zum Fach",
    "secondaryColor": "HSL Farbe - Komplementär zur Hauptfarbe",
    "accentColor": "HSL Farbe - Kontrastfarbe für Highlights",
    "gradient": "linear-gradient mit den gewählten Farben",
    "pattern": "geometric/organic/abstract/dots/waves - passend zur Era",
    "styleHint": "Detaillierte Beschreibung des visuellen Stils"
  },
  "typography": {
    "headingFont": "serif/sans-serif/display - passend zur Era",
    "bodyFont": "serif/sans-serif - lesbar",
    "headingWeight": 600-900,
    "headingLetterSpacing": "-0.02em bis 0.1em",
    "bodyLineHeight": "1.5 bis 1.8"
  },
  "moduleDesigns": [
    {
      "title": "Modulname (deutsch)",
      "moduleType": "discovery/knowledge/practice/reflection/challenge",
      "imagePrompt": "Detaillierter deutscher Prompt für Modul-Bild",
      "visualFocus": "Kurze Beschreibung des visuellen Fokus (deutsch)"
    }
  ]
}

BEISPIEL für Mathematik (10-12 Jahre):
{
  "visualIdentity": {
    "era": "contemporary",
    "mood": "playful",
    "primaryColor": "hsl(200, 70%, 50%)",  // Blau
    "secondaryColor": "hsl(160, 60%, 45%)", // Grün
    "accentColor": "hsl(280, 65%, 55%)"     // Lila
  }
}

BEISPIEL für Französische Revolution:
{
  "visualIdentity": {
    "era": "medieval",
    "mood": "epic",
    "primaryColor": "hsl(45, 80%, 50%)",   // Gold
    "secondaryColor": "hsl(0, 70%, 45%)",  // Rot
    "accentColor": "hsl(220, 60%, 40%)"    // Königsblau
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

Gib JSON zurück:
{
  "poeticName": "Kreativer deutscher Name für diese Welt",
  "description": "Kurze Beschreibung auf Deutsch",
  "visualTheme": {
    "primaryColor": "hsl(...)",
    "secondaryColor": "hsl(...)",
    "accentColor": "hsl(...)",
    "styleHint": "Visueller Stil für Bilder"
  },
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

Erstelle 4-6 Abschnitte mit einer Mischung aus Erklärung und interaktiven Übungen.
ALLES AUF DEUTSCH!`;

    const generatedContent = await callAI(contentPrompt, `Titel: ${title}\nFach: ${subject}\n\nWelt-Design:\n${JSON.stringify(worldDesign, null, 2)}\n\nQuellinhalt:\n${sourceContent.substring(0, 10000)}`);
    console.log("Content generation complete with", generatedContent?.sections?.length, "sections");

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
