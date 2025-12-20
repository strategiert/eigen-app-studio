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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError) return authError;

    console.log("Generate content request from user:", user.id);

    const { sourceContent, worldDesign, contentAnalysis, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!sourceContent || !worldDesign) {
      throw new Error("Missing required fields: sourceContent and worldDesign");
    }

    console.log("Generating content for:", title);

    const systemPrompt = `Du bist ein erfahrener Pädagoge und Lerndesigner.

Du erhältst:
1. Den Original-Lerninhalt (sourceContent)
2. Ein fertig designtes visuelles Konzept (worldDesign)
3. Optional: Eine Content-Analyse (contentAnalysis)

Deine Aufgabe: Erstelle die INTERAKTIVEN INHALTE für jedes Modul.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WICHTIGE REGELN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Übernimm ALLE Modultitel und imagePrompts aus worldDesign UNVERÄNDERT
2. Erstelle NUR die interaktiven Inhalte (Text, Quiz, Lückentext, Zuordnung)
3. Alle Inhalte müssen aus dem sourceContent abgeleitet sein
4. Passe den Sprachstil an die Epoche und Stimmung an
5. Für Kinder zwischen 8-16 Jahren geeignet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERAKTIONS-TYPEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. text: Erklärender Text
{
  "componentType": "text",
  "componentData": {
    "content": "Der erklärende Text..."
  }
}

2. quiz: Multiple-Choice-Fragen
{
  "componentType": "quiz",
  "componentData": {
    "questions": [
      {
        "question": "Die Frage?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Warum diese Antwort richtig ist..."
      }
    ]
  }
}

3. fill-in-blanks: Lückentext
{
  "componentType": "fill-in-blanks",
  "componentData": {
    "items": [
      {
        "text": "Der ___ war ein wichtiger Reformator.",
        "blanks": ["Luther"]
      }
    ]
  }
}

4. matching: Zuordnung
{
  "componentType": "matching",
  "componentData": {
    "pairs": [
      { "left": "Begriff", "right": "Erklärung" }
    ]
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "sections": [
    {
      "title": "Exakter Titel aus worldDesign",
      "moduleType": "Exakter moduleType aus worldDesign",
      "imagePrompt": "Exakter imagePrompt aus worldDesign",
      "content": "Optionaler einleitender Text für das Modul",
      "components": [
        {
          "componentType": "text | quiz | fill-in-blanks | matching",
          "componentData": { ... }
        }
      ]
    }
  ]
}

WICHTIG: Die Anzahl der sections MUSS mit den moduleDesigns aus worldDesign übereinstimmen!`;

    const userPrompt = `Erstelle die interaktiven Inhalte für die Lernwelt "${title}".

WORLD DESIGN (übernimm Titel und imagePrompts unverändert):
${JSON.stringify(worldDesign, null, 2)}

${contentAnalysis ? `CONTENT ANALYSIS:
${JSON.stringify(contentAnalysis, null, 2)}` : ''}

SOURCE CONTENT (daraus alle Fakten und Informationen entnehmen):
${sourceContent}

Erstelle für JEDES Modul aus moduleDesigns passende interaktive Inhalte.
Nutze verschiedene Interaktionstypen je nach moduleType.`;

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
      throw new Error("Content generation failed");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    console.log("Generated content:", generatedContent);

    // Parse the JSON from the response
    let contentData;
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : generatedContent.trim();
      contentData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse content:", parseError);
      throw new Error("Failed to parse generated content");
    }

    // Transform sections for database compatibility
    if (contentData.sections) {
      contentData.sections = contentData.sections.map((section: any) => {
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

    // Include worldDesign data in response for database storage
    const result = {
      poeticName: worldDesign.worldConcept?.name || title,
      description: worldDesign.worldConcept?.tagline || '',
      visualTheme: {
        primaryHue: worldDesign.visualIdentity?.primaryHue || 250,
        saturation: worldDesign.visualIdentity?.saturation || 70,
        accentHue: worldDesign.visualIdentity?.accentHue || 45,
        mood: worldDesign.visualIdentity?.mood || 'playful',
        era: worldDesign.visualIdentity?.era || 'modern',
        patternStyle: worldDesign.visualIdentity?.patternStyle || 'abstract',
        styleHint: worldDesign.visualIdentity?.styleHint || ''
      },
      sections: contentData.sections || [],
      worldDesign: worldDesign,
      contentAnalysis: contentAnalysis
    };

    console.log("Content generation complete with", result.sections.length, "sections");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
