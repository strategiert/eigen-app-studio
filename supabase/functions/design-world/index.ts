import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Authentication helper using JWT token directly
async function validateAuth(req: Request): Promise<{ user: any; error: Response | null }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('No authorization header provided');
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  // Use service role key to validate the JWT
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Extract JWT from Bearer token
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    console.error('Auth error:', authError?.message || 'No user found');
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
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

    console.log("Design world request from user:", user.id);

    const { contentAnalysis, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!contentAnalysis) {
      throw new Error("Missing required field: contentAnalysis");
    }

    console.log("Designing world for:", title);

    const systemPrompt = `Du bist ein kreativer Art Director und Visual Designer für interaktive Lernwelten.

Basierend auf einer Content-Analyse entwickelst du ein KOMPLETT EINZIGARTIGES visuelles Konzept.

WICHTIG: Du erstellst KEINE Templates. Jedes Design ist eine NEUSCHÖPFUNG.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN-PRINZIPIEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Das Design muss DIREKT aus dem Inhalt abgeleitet sein
2. Keine generischen "Schul-Farben" oder Standard-Paletten
3. Jedes Element muss zur Epoche, Stimmung und zum Thema passen
4. Die Bildsprache muss für Kinder (8-16) zugänglich aber nicht kindisch sein
5. Das Design erzählt selbst eine Geschichte

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "worldConcept": {
    "name": "Poetischer, einzigartiger Name für diese Lernwelt",
    "tagline": "Kurzer, einladender Satz",
    "narrativeFrame": "Beschreibung des narrativen Rahmens (wie eine kleine Geschichte)",
    "worldType": "Beschreibung der 'Welt' - ist es eine Zeitreise? Ein Ort? Eine Entdeckung?"
  },
  "visualIdentity": {
    "primaryHue": 0-360,
    "saturation": 40-90,
    "accentHue": 0-360,
    "mood": "warm | cool | mystical | playful | serious | natural",
    "era": "ancient | medieval | renaissance | modern | futuristic | timeless",
    "patternStyle": "geometric | organic | abstract | historical | scientific",
    "styleHint": "SEHR DETAILLIERTE Beschreibung für Bildgenerierung (mind. 3 Sätze). Beschreibe: Setting, Objekte, Lichtstimmung, Texturen, Farbpalette, Atmosphäre."
  },
  "moduleDesigns": [
    {
      "title": "Einzigartiger, thematischer Modultitel",
      "moduleType": "discovery | knowledge | practice | reflection | challenge",
      "narrativeRole": "Welche Rolle spielt dieses Modul in der Erzählung?",
      "visualFocus": "Welches visuelle Element steht im Mittelpunkt?",
      "imagePrompt": "Detaillierter Bildprompt für dieses spezifische Modul",
      "interactionTypes": ["text", "quiz", "fill-in-blanks", "matching"],
      "emotionalGoal": "Welches Gefühl soll dieses Modul auslösen?"
    }
  ],
  "imagery": {
    "heroImagePrompt": "Detaillierter Prompt für ein Titelbild der Lernwelt",
    "recurringMotifs": ["Wiederkehrende visuelle Motive"],
    "avoidElements": ["Elemente, die NICHT verwendet werden sollen"]
  },
  "typography": {
    "headingStyle": "Beschreibung des Titel-Stils (z.B. 'elegant mit Serifen' oder 'modern und clean')",
    "toneOfVoice": "Beschreibung des Sprachstils"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEISPIEL für Martin Luther
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Für einen Inhalt über Martin Luther würdest du NICHT einfach "braun und alt" wählen.

Stattdessen:
- primaryHue: 35 (warmes, goldenes Braun wie altes Pergament)
- accentHue: 15 (rötliches Gold wie Kerzenschein)
- era: "medieval"
- mood: "mystical" (wegen der spirituellen Dimension)
- styleHint: "Warmes Kerzenlicht flackert in einem mittelalterlichen Kloster-Studierzimmer. Schwere Holzmöbel, aufgeschlagene Bibeln mit gotischer Schrift, Federkiele und Tintenfässer. Durch ein gotisches Fenster fallen Lichtstrahlen auf Pergamentrollen. Die Atmosphäre ist zugleich gelehrt und andächtig, mit Sepiatönen, dunklem Holz und goldenen Highlights von Kerzenflammen."

Module könnten sein:
1. "Die Klosterzelle" (discovery) - Eintauchen in Luthers Welt
2. "Das Studium der Schriften" (knowledge) - Die 95 Thesen verstehen
3. "Worte, die die Welt veränderten" (practice) - Kernaussagen zuordnen
etc.`;

    const userPrompt = `Entwickle ein einzigartiges visuelles Konzept für die Lernwelt "${title}".

Hier ist die Content-Analyse:
${JSON.stringify(contentAnalysis, null, 2)}

WICHTIG:
1. Leite ALLES aus der Analyse ab
2. Erstelle 3-6 Module mit einzigartigen Titeln und Bildprompts
3. Das Design muss sich von allen anderen Lernwelten unterscheiden
4. Sei KREATIV und SPEZIFISCH`;

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
      throw new Error("World design failed");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No design generated");
    }

    console.log("Generated design:", generatedContent);

    // Parse the JSON from the response
    let worldDesign;
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : generatedContent.trim();
      worldDesign = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse design:", parseError);
      throw new Error("Failed to parse world design");
    }

    console.log("World design complete:", worldDesign.worldConcept?.name);

    return new Response(JSON.stringify(worldDesign), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in design-world function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
