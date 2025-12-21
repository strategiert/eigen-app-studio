import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Authentication helper
async function validateAuth(req: Request): Promise<{ user: any; error: Response | null }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError);
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    };
  }

  return { user, error: null };
}

// Map keywords to subjects for automatic detection
const subjectKeywords: Record<string, string[]> = {
  mathematik: ['rechnen', 'mathe', 'mathematik', 'zahlen', 'bruch', 'brüche', 'gleichung', 'geometrie', 'algebra', 'division', 'multiplikation', 'addition', 'subtraktion', 'prozent', 'wurzel', 'potenz'],
  deutsch: ['deutsch', 'grammatik', 'rechtschreibung', 'lesen', 'schreiben', 'text', 'aufsatz', 'gedicht', 'literatur', 'sprache', 'wörter', 'satz', 'märchen'],
  englisch: ['english', 'englisch', 'vocabulary', 'grammar', 'language', 'words', 'phrases'],
  geschichte: ['geschichte', 'historisch', 'krieg', 'kaiser', 'könig', 'mittelalter', 'reformation', 'luther', 'revolution', 'epoche', 'antike', 'römer', 'griechen', 'napoleon', 'weltkrieg', 'ddr', 'brd', 'weimar', 'bismarck'],
  biologie: ['biologie', 'bio', 'zelle', 'pflanze', 'tier', 'körper', 'organ', 'evolution', 'genetik', 'ökosystem', 'fotosynthese'],
  physik: ['physik', 'kraft', 'energie', 'atom', 'elektrizität', 'magnetismus', 'optik', 'mechanik', 'welle', 'newton'],
  chemie: ['chemie', 'element', 'molekül', 'reaktion', 'säure', 'base', 'periodensystem', 'atom', 'bindung'],
  geografie: ['geografie', 'erdkunde', 'land', 'kontinent', 'klima', 'wetter', 'landschaft', 'bevölkerung', 'karte'],
  kunst: ['kunst', 'malen', 'zeichnen', 'künstler', 'bild', 'skulptur', 'museum', 'stil', 'farbe', 'design'],
  musik: ['musik', 'note', 'instrument', 'komponist', 'melodie', 'rhythmus', 'orchester', 'singen', 'lied'],
  sport: ['sport', 'bewegung', 'training', 'spiel', 'fitness', 'turnen', 'leichtathletik', 'fußball', 'schwimmen'],
  informatik: ['informatik', 'computer', 'programmieren', 'code', 'software', 'hardware', 'internet', 'daten', 'algorithmus'],
  religion: ['religion', 'glaube', 'kirche', 'bibel', 'gott', 'jesus', 'christentum', 'islam', 'judentum', 'buddhismus', 'ethik', 'moral', 'reformation', 'luther', 'papst', 'kloster']
};

// Detect subject from content
function detectSubject(content: string, title: string): string {
  const combinedText = `${title} ${content}`.toLowerCase();
  
  let bestMatch = 'allgemein';
  let highestScore = 0;
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        score += 1;
        // Bonus for title matches
        if (title.toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = subject;
    }
  }
  
  console.log(`Detected subject: ${bestMatch} with score ${highestScore}`);
  return bestMatch;
}

// Default fallback theme (only used if AI fails)
function getDefaultTheme() {
  return {
    primaryHue: 250,
    saturation: 70,
    mood: 'playful',
    era: 'modern',
    styleHint: 'Freundliche Farben, einladende Atmosphäre',
    patternStyle: 'abstract',
    accentHue: 45
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError) {
      return authError;
    }

    console.log("Generate world request from user:", user.id);

    const { sourceContent, subject: providedSubject, title, worldId } = await req.json();
    
    // ========== INPUT VALIDATION ==========
    // Validate title
    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (title.length > 200) {
      return new Response(JSON.stringify({ error: 'Title must be less than 200 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate sourceContent
    if (!sourceContent || typeof sourceContent !== 'string') {
      return new Response(JSON.stringify({ error: 'Source content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Limit content to 50,000 characters to prevent expensive AI calls
    const MAX_CONTENT_LENGTH = 50000;
    if (sourceContent.length > MAX_CONTENT_LENGTH) {
      return new Response(JSON.stringify({ 
        error: `Content too large. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`,
        currentLength: sourceContent.length 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate subject if provided
    const validSubjects = ['mathematik', 'deutsch', 'englisch', 'biologie', 'physik', 'chemie', 
                           'geschichte', 'geografie', 'kunst', 'musik', 'sport', 'informatik', 'allgemein'];
    if (providedSubject && !validSubjects.includes(providedSubject)) {
      return new Response(JSON.stringify({ error: 'Invalid subject provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate worldId format if provided
    if (worldId && typeof worldId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid worldId format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ========== END INPUT VALIDATION ==========
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect the actual subject from content (use truncated content for detection)
    const contentForDetection = sourceContent.substring(0, 5000);
    const detectedSubject = detectSubject(contentForDetection, title);
    const actualSubject = providedSubject === 'allgemein' ? detectedSubject : providedSubject;

    console.log("Generating learning world for:", { title, providedSubject, detectedSubject, actualSubject, contentLength: sourceContent.length });

const systemPrompt = `Du bist ein erfahrener Pädagoge, Lerndesigner und didaktischer Story-Architekt
für Kinder und Jugendliche zwischen 8 und 16 Jahren.

Deine Aufgabe ist es, aus dem gegebenen Lerninhalt eine EINZIGARTIGE,
interaktive Lernwelt zu erschaffen - inklusive eines individuellen visuellen Themas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUELLES THEMA GENERIEREN (KRITISCH!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Du MUSST ein einzigartiges visuelles Theme für diese Lernwelt generieren.
Analysiere den Inhalt und wähle Farben, Stimmung und Stil, die GENAU zu diesem Thema passen.

Das visualTheme-Objekt muss enthalten:
- primaryHue: Zahl 0-360 (Hauptfarbton im HSL-Farbkreis)
  • 0-30: Rot/Orange (Wärme, Energie, Geschichte)
  • 30-60: Gelb/Gold (Optimismus, Antike, Reichtum)
  • 60-120: Grün (Natur, Biologie, Wachstum)
  • 120-180: Cyan/Türkis (Frische, Meer, Wissenschaft)
  • 180-240: Blau (Ruhe, Technologie, Mathematik)
  • 240-300: Violett/Lila (Mystik, Kreativität, Magie)
  • 300-360: Magenta/Pink (Kunst, Musik, Fantasie)

- saturation: Zahl 40-90 (Farbsättigung)
  • 40-55: Gedämpft, historisch, seriös
  • 55-70: Ausgewogen, professionell
  • 70-90: Lebendig, kindgerecht, energisch

- accentHue: Zahl 0-360 (Akzentfarbe, sollte komplementär oder harmonisch sein)

- mood: Eine der folgenden Stimmungen
  • warm: Einladend, gemütlich (Geschichte, Literatur)
  • cool: Klar, fokussiert (Mathematik, Technologie)
  • mystical: Geheimnisvoll, spirituell (Religion, Physik, Astronomie)
  • playful: Verspielt, lebendig (Sprachen, Kunst)
  • serious: Ernst, dokumentarisch (Kriege, schwere Themen)
  • natural: Organisch, lebendig (Biologie, Geografie)

- era: Zeitepoche, die zum Thema passt
  • ancient: Antike (Griechen, Römer, Ägypter)
  • medieval: Mittelalter (Reformation, Ritter)
  • renaissance: Renaissance (Kunst, Wissenschaft erwacht)
  • modern: Moderne (20./21. Jahrhundert)
  • futuristic: Futuristisch (Technologie, Weltraum)
  • timeless: Zeitlos (allgemeine Themen)

- patternStyle: Visuelles Muster
  • geometric: Geometrisch (Mathe, Informatik)
  • organic: Organisch (Biologie, Natur)
  • abstract: Abstrakt (Kunst, Sprachen)
  • historical: Historisch (Geschichte, Religion)
  • scientific: Wissenschaftlich (Physik, Chemie)

- styleHint: DETAILLIERTE Beschreibung für Bildgenerierung (mind. 2 Sätze!)
  Beschreibe konkret: Atmosphäre, typische Objekte, Farbpalette, Lichtstimmung.
  
  BEISPIELE:
  • Martin Luther: "Warmes Kerzenlicht in einem mittelalterlichen Kloster, Pergamentrollen und Federkiele auf einem Holzschreibtisch, gotische Kirchenfenster im Hintergrund, Sepia- und Goldtöne"
  • Bruchrechnen: "Moderne, cleane Ästhetik mit geometrischen Formen, Kreise die in Segmente geteilt werden, kühle Blautöne mit orangefarbenen Akzenten"
  • Regenwald: "Üppiges Grün mit Sonnenstrahlen durch Blätterdach, exotische Tiere, Wassertropfen auf Blättern, leuchtende Grün- und Türkistöne"

Passe deine Texte, Metaphern und Modulnamen an dieses Thema an!
Die Sprache sollte zur Epoche und Stimmung passen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUNDPRINZIP (SEHR WICHTIG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Meoluna verwendet KEINE festen Templates.

Es gibt:
- keine festen Texte
- keine festen Aufgaben
- keine festen Modul-Abfolgen
- keine wiederholenden Layouts

Stattdessen arbeitest du mit FLEXIBLEN LERNMODUL-TYPEN.

Die Struktur ist stabil.
Der Inhalt ist IMMER individuell.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LERNMODUL-SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Eine Lernwelt besteht aus 3–6 Modulen.
Jedes Modul ist einem der folgenden Modul-Typen zugeordnet:

- discovery      → Neugier wecken, Thema erkunden
- knowledge      → Inhalte erklären und strukturieren
- practice       → Anwenden ohne Leistungsdruck
- reflection     → Verständnis prüfen und festigen
- challenge      → Vertiefung und Transferdenken

Nicht jeder Modultyp muss verwendet werden.
Die Auswahl richtet sich nach dem Thema und dem Alter.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BILDGENERIERUNG (WICHTIG!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Für JEDES Modul musst du einen "imagePrompt" erstellen.
Dieser wird verwendet, um automatisch ein passendes Bild zu generieren.

Der imagePrompt sollte:
- Das visuelle Thema der Welt berücksichtigen (aus deinem generierten styleHint)
- Kindgerecht aber nicht kindisch sein
- Konkret und beschreibend sein
- Zur gewählten Epoche passen
- Die gewählte Stimmung einfangen

Beispiel für Martin Luther:
"Ein mittelalterliches Studierzimmer mit Kerzenlicht, ein Mönch studiert eine große Bibel, Federkiel und Pergament auf dem Schreibtisch, warme Sepia-Töne"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODUL-REGELN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jedes Modul:
- hat einen individuellen, kreativen Titel
- erfüllt eine klare didaktische Funktion
- nutzt passende Interaktionen
- fühlt sich thematisch eingebettet an (Story, Metapher, Welt)
- hat einen passenden imagePrompt

Die folgenden Aspekte müssen IMMER individuell erzeugt werden:
- Texte und Erklärungen
- Fragen und Aufgaben
- Beispiele und Metaphern
- Modulnamen
- Feedback und Erklärungen
- Story-Elemente
- Bildprompts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERAKTIONEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ein Modul kann eine oder mehrere der folgenden Interaktionsformen enthalten:
- text
- quiz
- fill-in-blanks
- matching

Du entscheidest selbst:
- welche Interaktion sinnvoll ist
- wie viele Interaktionen ein Modul enthält
- wie sie inhaltlich ausgestaltet sind

Es gibt KEINE Pflichtverteilung von Komponenten.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAMIFICATION & FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gamification ist subtil und thematisch passend.

- Erfolg wird positiv und erklärend bestätigt
- Keine Noten, kein Druck, kein negatives Feedback
- Feedback erklärt WARUM etwas richtig oder falsch ist
- Belohnungen sind symbolisch (z. B. Fortschritt, Sterne, Entdecken)

Animationen, Effekte und Symbole sollen zur Lernwelt passen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPRACHE & TONALITÄT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- kindgerecht, aber nicht kindisch
- klar, ruhig, motivierend
- altersgerecht angepasst
- Lernen fühlt sich wie ENTDECKEN an, nicht wie PRÜFUNG
- Passe den Sprachstil an die Epoche an (z.B. bei Geschichte etwas feierlicher)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUSGABEFORMAT (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antworte IMMER im folgenden JSON-Format:

{
  "poeticName": "Poetischer, einzigartiger Name der Lernwelt",
  "description": "Kurze, einladende Beschreibung der Lernwelt",
  "detectedSubject": "${actualSubject}",
  "visualTheme": {
    "primaryHue": 30,
    "saturation": 55,
    "accentHue": 45,
    "mood": "mystical",
    "era": "medieval",
    "patternStyle": "historical",
    "styleHint": "Detaillierte Beschreibung für Bildgenerierung..."
  },
  "sections": [
    {
      "title": "Individueller Modultitel",
      "moduleType": "discovery | knowledge | practice | reflection | challenge",
      "content": "Optionaler erklärender Text für das Modul",
      "imagePrompt": "Detaillierte Beschreibung für die Bildgenerierung",
      "components": [
        {
          "componentType": "text | quiz | fill-in-blanks | matching",
          "componentData": {}
        }
      ]
    }
  ]
}

WICHTIG: Das visualTheme-Objekt ist PFLICHT und muss einzigartig zum Thema passen!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT DATA FORMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. text
{ "content": "Der erklärende Text für diesen Abschnitt." }

2. quiz
{
  "questions": [
    {
      "question": "Frage?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Erklärendes Feedback"
    }
  ]
}

3. fill-in-blanks
{
  "items": [
    {
      "text": "Der ___ scheint am Tag.",
      "blanks": ["Sonne"]
    }
  ]
}

4. matching
{
  "pairs": [
    { "left": "Begriff", "right": "Erklärung" }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSCHLUSS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jede Lernwelt soll sich anfühlen wie:
- eine eigene kleine Welt
- handgemacht statt generisch
- didaktisch sinnvoll
- visuell und inhaltlich stimmig

Vermeide Wiederholungen, Standardformulierungen
und starre Lernmuster.`;

    const userPrompt = `Erstelle eine einzigartige Lernwelt zum Thema "${title}" für das Fach "${actualSubject}".

Hier ist der Quellinhalt:
${sourceContent}

WICHTIG: 
1. Generiere ein einzigartiges visualTheme basierend auf dem INHALT (nicht nur dem Fach!)
2. Jedes Modul MUSS einen imagePrompt haben, der zum visuellen Thema passt
3. Sei kreativ und individuell - diese Lernwelt soll einzigartig sein!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    console.log("Generated content:", generatedContent);

    // Parse the JSON from the response
    let worldData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : generatedContent.trim();
      worldData = JSON.parse(jsonString);
      
      // Transform the new format to be compatible with database structure
      if (worldData.sections) {
        worldData.sections = worldData.sections.map((section: any, index: number) => {
          // If section uses new format with components array
          if (section.components && Array.isArray(section.components)) {
            return {
              title: section.title,
              moduleType: section.moduleType || 'knowledge',
              content: section.content || '',
              imagePrompt: section.imagePrompt || '',
              componentType: 'multi',
              componentData: {
                components: section.components
              }
            };
          }
          // Backwards compatibility: single component format
          return {
            title: section.title,
            moduleType: section.moduleType || 'knowledge',
            content: section.content || '',
            imagePrompt: section.imagePrompt || '',
            componentType: section.componentType || 'text',
            componentData: section.componentData || {}
          };
        });
      }
      
      // Ensure visualTheme exists (should come from AI response)
      if (!worldData.visualTheme) {
        worldData.visualTheme = getDefaultTheme();
      }
      worldData.detectedSubject = actualSubject;
      
    } catch (parseError) {
      console.error("Failed to parse generated content:", parseError);
      const defaultTheme = getDefaultTheme();
      worldData = {
        poeticName: title,
        description: "Generierte Lernwelt",
        visualTheme: defaultTheme,
        detectedSubject: actualSubject,
        sections: [{
          title: "Einführung",
          moduleType: "discovery",
          content: generatedContent,
          imagePrompt: `Einladende Illustration zum Thema ${title}, ${defaultTheme.styleHint}`,
          componentType: "text",
          componentData: {}
        }]
      };
    }

    // Get the visual theme from worldData (generated by AI)
    const visualTheme = worldData.visualTheme || getDefaultTheme();
    console.log("AI-generated visual theme:", visualTheme);

    // Generate images for each section if we have worldId and supabase config
    if (worldId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Generating images for sections...");
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // First, update the world with visual theme and detected subject
      const { error: worldUpdateError } = await supabase
        .from('learning_worlds')
        .update({
          visual_theme: visualTheme,
          detected_subject: actualSubject,
          subject: actualSubject
        })
        .eq('id', worldId);
        
      if (worldUpdateError) {
        console.error("Error updating world theme:", worldUpdateError);
      }
      
      // Generate images in parallel (limit to 3 concurrent to avoid rate limits)
      const generateImage = async (section: any, sectionId: string) => {
        if (!section.imagePrompt) return null;
        
        try {
          const enhancedPrompt = `Educational illustration for children (ages 8-16), subject: ${actualSubject}. 
Style: ${visualTheme.styleHint || 'Educational and engaging'}, ${visualTheme.mood || 'playful'} mood, ${visualTheme.era || 'modern'} era.
Scene: ${section.imagePrompt}
Requirements: No text in image, bright colors, engaging and inviting visual, child-appropriate.`;

          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [{ role: "user", content: enhancedPrompt }],
              modalities: ["image", "text"]
            }),
          });

          if (!imageResponse.ok) {
            console.error(`Image generation failed for section ${sectionId}`);
            return null;
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (!imageUrl) {
            console.error("No image in response");
            return null;
          }

          // Upload to storage
          const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
          if (base64Match) {
            const imageType = base64Match[1];
            const base64Data = base64Match[2];
            const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const fileName = `${worldId}/${sectionId}.${imageType}`;
            
            const { error: uploadError } = await supabase
              .storage
              .from('learning-materials')
              .upload(fileName, imageBuffer, {
                contentType: `image/${imageType}`,
                upsert: true
              });
            
            if (uploadError) {
              console.error("Storage upload error:", uploadError);
              return null;
            }
            
            const { data: urlData } = supabase
              .storage
              .from('learning-materials')
              .getPublicUrl(fileName);
            
            return urlData.publicUrl;
          }
          
          return null;
        } catch (error) {
          console.error("Image generation error:", error);
          return null;
        }
      };
      
      // We'll return the world data now and let the caller handle image generation
      // This is because image generation can take a while
      worldData.imagesWillBeGenerated = true;
    }

    return new Response(JSON.stringify(worldData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-world function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
