import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Generate visual theme based on subject and content
function generateVisualTheme(subject: string, title: string, content: string) {
  const themes: Record<string, any> = {
    mathematik: {
      primaryHue: 220,
      saturation: 80,
      mood: 'cool',
      era: 'modern',
      styleHint: 'Abstrakte geometrische Formen, blaue und violette Farbtöne, moderne Ästhetik',
      patternStyle: 'geometric',
      accentHue: 180
    },
    deutsch: {
      primaryHue: 350,
      saturation: 70,
      mood: 'warm',
      era: 'timeless',
      styleHint: 'Warme Rottöne, Bücher und Schrift, literarische Atmosphäre',
      patternStyle: 'organic',
      accentHue: 30
    },
    englisch: {
      primaryHue: 200,
      saturation: 75,
      mood: 'playful',
      era: 'modern',
      styleHint: 'Internationale Symbole, lebendige Blautöne, weltoffene Stimmung',
      patternStyle: 'abstract',
      accentHue: 40
    },
    geschichte: {
      primaryHue: 25,
      saturation: 55,
      mood: 'warm',
      era: 'medieval',
      styleHint: 'Sepia-Töne, historische Elemente, Pergament-Textur, antike Atmosphäre',
      patternStyle: 'historical',
      accentHue: 35
    },
    biologie: {
      primaryHue: 140,
      saturation: 65,
      mood: 'natural',
      era: 'timeless',
      styleHint: 'Naturfarben, Grüntöne, organische Formen, Lebewesen und Pflanzen',
      patternStyle: 'organic',
      accentHue: 80
    },
    physik: {
      primaryHue: 270,
      saturation: 75,
      mood: 'mystical',
      era: 'futuristic',
      styleHint: 'Kosmische Farben, Energie und Licht, wissenschaftliche Eleganz',
      patternStyle: 'scientific',
      accentHue: 200
    },
    chemie: {
      primaryHue: 30,
      saturation: 80,
      mood: 'warm',
      era: 'modern',
      styleHint: 'Laborfarben, Orange und Gelb, Moleküle und Reaktionen',
      patternStyle: 'scientific',
      accentHue: 180
    },
    geografie: {
      primaryHue: 160,
      saturation: 60,
      mood: 'natural',
      era: 'timeless',
      styleHint: 'Erdtöne, Landkarten, Kontinente und Landschaften',
      patternStyle: 'organic',
      accentHue: 30
    },
    kunst: {
      primaryHue: 320,
      saturation: 75,
      mood: 'playful',
      era: 'renaissance',
      styleHint: 'Kreative Farben, künstlerische Pinselstriche, bunte Palette',
      patternStyle: 'abstract',
      accentHue: 50
    },
    musik: {
      primaryHue: 280,
      saturation: 70,
      mood: 'mystical',
      era: 'timeless',
      styleHint: 'Harmonische Farben, Noten und Instrumente, musikalische Wellen',
      patternStyle: 'abstract',
      accentHue: 200
    },
    sport: {
      primaryHue: 15,
      saturation: 85,
      mood: 'warm',
      era: 'modern',
      styleHint: 'Dynamische Farben, Orange und Rot, Bewegung und Energie',
      patternStyle: 'geometric',
      accentHue: 60
    },
    informatik: {
      primaryHue: 200,
      saturation: 80,
      mood: 'cool',
      era: 'futuristic',
      styleHint: 'Digitale Ästhetik, Cyan und Blau, Code und Technologie',
      patternStyle: 'geometric',
      accentHue: 150
    },
    religion: {
      primaryHue: 35,
      saturation: 50,
      mood: 'mystical',
      era: 'ancient',
      styleHint: 'Goldene und warme Töne, spirituelle Symbole, feierliche Atmosphäre',
      patternStyle: 'historical',
      accentHue: 45
    },
    allgemein: {
      primaryHue: 250,
      saturation: 70,
      mood: 'playful',
      era: 'modern',
      styleHint: 'Freundliche Farben, einladende Atmosphäre, vielfältige Elemente',
      patternStyle: 'abstract',
      accentHue: 45
    }
  };

  const baseTheme = themes[subject] || themes.allgemein;
  
  // Customize based on title/content keywords
  if (title.toLowerCase().includes('luther') || content.toLowerCase().includes('reformation')) {
    baseTheme.era = 'medieval';
    baseTheme.styleHint = 'Mittelalterliche Atmosphäre, Kirchenfenster, Pergament und Federkiel, Reformationszeit';
    baseTheme.primaryHue = 30;
    baseTheme.mood = 'mystical';
  }
  
  if (title.toLowerCase().includes('römer') || content.toLowerCase().includes('antike')) {
    baseTheme.era = 'ancient';
    baseTheme.styleHint = 'Antike römische Architektur, Marmor und Gold, klassische Ästhetik';
  }
  
  if (title.toLowerCase().includes('weltkrieg') || content.toLowerCase().includes('nazi')) {
    baseTheme.mood = 'serious';
    baseTheme.saturation = 40;
    baseTheme.styleHint = 'Historische Fotografien, Sepia und Grautöne, dokumentarischer Stil';
  }

  return baseTheme;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceContent, subject: providedSubject, title, worldId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect the actual subject from content
    const detectedSubject = detectSubject(sourceContent, title);
    const actualSubject = providedSubject === 'allgemein' ? detectedSubject : providedSubject;
    
    // Generate visual theme for this world
    const visualTheme = generateVisualTheme(actualSubject, title, sourceContent);

    console.log("Generating learning world for:", { title, providedSubject, detectedSubject, actualSubject });
    console.log("Visual theme:", visualTheme);

const systemPrompt = `Du bist ein erfahrener Pädagoge, Lerndesigner und didaktischer Story-Architekt
für Kinder und Jugendliche zwischen 8 und 16 Jahren.

Deine Aufgabe ist es, aus dem gegebenen Lerninhalt eine EINZIGARTIGE,
interaktive Lernwelt zu erschaffen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUELLES THEMA DIESER WELT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Diese Lernwelt hat folgendes visuelles Thema:
- Stimmung: ${visualTheme.mood}
- Zeitepoche: ${visualTheme.era}
- Stil: ${visualTheme.styleHint}

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
- Das visuelle Thema der Welt berücksichtigen (${visualTheme.styleHint})
- Kindgerecht aber nicht kindisch sein
- Konkret und beschreibend sein
- Zur Epoche passen (${visualTheme.era})
- Die Stimmung einfangen (${visualTheme.mood})

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

Visuelles Thema: ${visualTheme.styleHint}
Epoche/Stimmung: ${visualTheme.era} / ${visualTheme.mood}

Hier ist der Quellinhalt:
${sourceContent}

Generiere eine kreative, strukturierte Lernwelt mit verschiedenen Modultypen und passenden Interaktionen.
Jedes Modul MUSS einen imagePrompt haben, der zum visuellen Thema passt.
Sei kreativ und individuell - diese Lernwelt soll einzigartig sein!`;

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
      
      // Add visual theme and detected subject to response
      worldData.visualTheme = visualTheme;
      worldData.detectedSubject = actualSubject;
      
    } catch (parseError) {
      console.error("Failed to parse generated content:", parseError);
      worldData = {
        poeticName: title,
        description: "Generierte Lernwelt",
        visualTheme: visualTheme,
        detectedSubject: actualSubject,
        sections: [{
          title: "Einführung",
          moduleType: "discovery",
          content: generatedContent,
          imagePrompt: `Einladende Illustration zum Thema ${title}, ${visualTheme.styleHint}`,
          componentType: "text",
          componentData: {}
        }]
      };
    }

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
Style: ${visualTheme.styleHint}, ${visualTheme.mood} mood, ${visualTheme.era} era.
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
