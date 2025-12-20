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

    const systemPrompt = `Du bist ein erfahrener Pädagoge und Lerndesigner für Kinder zwischen 8 und 16 Jahren.
Deine Aufgabe ist es, aus dem gegebenen Lerninhalt eine interaktive Lernwelt zu erstellen.

Die Lernwelt soll:
- Kindgerecht und motivierend sein
- In 3-5 Abschnitte unterteilt sein
- Jeder Abschnitt hat einen kreativen Titel und einen poetischen Namen
- Verschiedene interaktive Komponenten enthalten (Text, Quiz, Lückentext, Zuordnung)

Antworte IMMER im folgenden JSON-Format:
{
  "poeticName": "Ein poetischer Name für die gesamte Lernwelt",
  "description": "Eine kurze, ansprechende Beschreibung der Lernwelt",
  "sections": [
    {
      "title": "Abschnitt-Titel",
      "content": "Der Lerninhalt als Fließtext",
      "componentType": "text|quiz|fill-in-blanks|matching",
      "componentData": {
        // Für quiz: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0 }] }
        // Für fill-in-blanks: { "text": "Der ___ ist blau.", "blanks": ["Himmel"] }
        // Für matching: { "pairs": [{ "left": "Begriff", "right": "Definition" }] }
        // Für text: {}
      }
    }
  ]
}`;

    const userPrompt = `Erstelle eine Lernwelt zum Thema "${title}" für das Fach "${subject}".

Hier ist der Quellinhalt:
${sourceContent}

Generiere eine strukturierte, interaktive Lernwelt mit verschiedenen Komponententypen.`;

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
    } catch (parseError) {
      console.error("Failed to parse generated content:", parseError);
      // Return raw content if parsing fails
      worldData = {
        poeticName: title,
        description: "Generierte Lernwelt",
        sections: [{
          title: "Einführung",
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
