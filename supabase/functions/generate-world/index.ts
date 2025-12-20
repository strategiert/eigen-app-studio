import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceContent, subject, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating learning world for:", { title, subject });

const systemPrompt = `Du bist ein erfahrener Pädagoge, Lerndesigner und didaktischer Story-Architekt
für Kinder und Jugendliche zwischen 8 und 16 Jahren.

Deine Aufgabe ist es, aus dem gegebenen Lerninhalt eine EINZIGARTIGE,
interaktive Lernwelt zu erschaffen.

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
MODUL-REGELN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jedes Modul:
- hat einen individuellen, kreativen Titel
- erfüllt eine klare didaktische Funktion
- nutzt passende Interaktionen
- fühlt sich thematisch eingebettet an (Story, Metapher, Welt)

Die folgenden Aspekte müssen IMMER individuell erzeugt werden:
- Texte und Erklärungen
- Fragen und Aufgaben
- Beispiele und Metaphern
- Modulnamen
- Feedback und Erklärungen
- Story-Elemente

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUSGABEFORMAT (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antworte IMMER im folgenden JSON-Format:

{
  "poeticName": "Poetischer, einzigartiger Name der Lernwelt",
  "description": "Kurze, einladende Beschreibung der Lernwelt",
  "sections": [
    {
      "title": "Individueller Modultitel",
      "moduleType": "discovery | knowledge | practice | reflection | challenge",
      "content": "Optionaler erklärender Text für das Modul",
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

    const userPrompt = `Erstelle eine einzigartige Lernwelt zum Thema "${title}" für das Fach "${subject}".

Hier ist der Quellinhalt:
${sourceContent}

Generiere eine kreative, strukturierte Lernwelt mit verschiedenen Modultypen und passenden Interaktionen.
Jedes Modul kann mehrere Komponenten haben. Sei kreativ und individuell!`;

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
      // Each section now has moduleType and components array
      if (worldData.sections) {
        worldData.sections = worldData.sections.map((section: any, index: number) => {
          // If section uses new format with components array
          if (section.components && Array.isArray(section.components)) {
            return {
              title: section.title,
              moduleType: section.moduleType || 'knowledge',
              content: section.content || '',
              // Store components array in component_data
              componentType: 'multi', // New type to indicate multi-component module
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
            componentType: section.componentType || 'text',
            componentData: section.componentData || {}
          };
        });
      }
    } catch (parseError) {
      console.error("Failed to parse generated content:", parseError);
      // Return raw content if parsing fails
      worldData = {
        poeticName: title,
        description: "Generierte Lernwelt",
        sections: [{
          title: "Einführung",
          moduleType: "discovery",
          content: generatedContent,
          componentType: "text",
          componentData: {}
        }]
      };
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
