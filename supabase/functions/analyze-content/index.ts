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

    console.log("Analyze content request from user:", user.id);

    const { sourceContent, title } = await req.json();
    
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
    // ========== END INPUT VALIDATION ==========
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing content for:", title, "- Content length:", sourceContent.length);

    const systemPrompt = `Du bist ein erfahrener Lerndesigner und Content-Analyst.

Deine Aufgabe ist es, den gegebenen Lerninhalt TIEFGEHEND zu analysieren und die ESSENZ des Themas zu extrahieren.

Du darfst NICHTS erfinden. Du analysierst NUR was im Text steht.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSE-ERGEBNIS (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "theme": {
    "mainTopic": "Das Hauptthema in 2-5 Worten",
    "subTopics": ["Unterthema 1", "Unterthema 2", "..."],
    "keywords": ["Schlüsselwort 1", "Schlüsselwort 2", "..."]
  },
  "epoch": {
    "timeframe": "Konkrete Zeitangabe oder 'zeitlos'",
    "era": "ancient | medieval | renaissance | modern | futuristic | timeless",
    "historicalContext": "Kurze Beschreibung des historischen Kontexts (falls relevant)"
  },
  "mood": {
    "primaryMood": "warm | cool | mystical | playful | serious | natural",
    "emotionalTone": "Beschreibung der emotionalen Tonalität",
    "atmosphere": "Beschreibung der Atmosphäre, die der Inhalt vermittelt"
  },
  "concepts": {
    "coreConcepts": ["Kernkonzept 1", "Kernkonzept 2", "..."],
    "learningObjectives": ["Lernziel 1", "Lernziel 2", "..."],
    "difficulty": "beginner | intermediate | advanced"
  },
  "targetAudience": {
    "ageRange": "8-10 | 10-12 | 12-14 | 14-16",
    "priorKnowledge": "Beschreibung benötigter Vorkenntnisse"
  },
  "visualMetaphors": {
    "setting": "Beschreibung eines passenden visuellen Settings (z.B. 'mittelalterliches Kloster')",
    "objects": ["Typische Objekte, die zum Thema passen"],
    "characters": ["Mögliche Charaktere oder Figuren"],
    "colors": {
      "primary": "Hauptfarbfamilie (z.B. 'warme Erdtöne')",
      "accent": "Akzentfarbe (z.B. 'goldene Highlights')"
    },
    "lightMood": "Beschreibung der Lichtstimmung (z.B. 'warmes Kerzenlicht')"
  },
  "suggestedStructure": {
    "moduleCount": 3-6,
    "moduleTypes": ["discovery", "knowledge", "practice", "reflection", "challenge"],
    "narrative": "Vorgeschlagene narrative Struktur oder Reise"
  },
  "uniqueElements": {
    "specialFeatures": ["Besondere Merkmale des Inhalts"],
    "potentialInteractions": ["Mögliche interaktive Elemente"],
    "hooks": ["Interessante Aufhänger für Schüler"]
  }
}

WICHTIG:
- Analysiere NUR den gegebenen Inhalt
- Sei SPEZIFISCH, nicht generisch
- Wenn der Inhalt historisch ist, erfasse die genaue Epoche
- Wenn der Inhalt wissenschaftlich ist, erfasse die Fachrichtung
- Die visualMetaphors müssen DIREKT aus dem Inhalt abgeleitet sein`;

    const userPrompt = `Analysiere folgenden Lerninhalt zum Thema "${title}":

${sourceContent}

Extrahiere alle relevanten Informationen für die Gestaltung einer einzigartigen Lernwelt.`;

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
      throw new Error("Content analysis failed");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No analysis generated");
    }

    console.log("Generated analysis:", generatedContent);

    // Parse the JSON from the response
    let contentAnalysis;
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : generatedContent.trim();
      contentAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse analysis:", parseError);
      throw new Error("Failed to parse content analysis");
    }

    console.log("Content analysis complete:", contentAnalysis.theme.mainTopic);

    return new Response(JSON.stringify(contentAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-content function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
