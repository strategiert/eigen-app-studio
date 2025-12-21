import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create client with user's auth for validation
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, sectionId, worldId, subject } = await req.json();
    
    // ========== INPUT VALIDATION ==========
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Limit prompt length to prevent abuse
    const MAX_PROMPT_LENGTH = 2000;
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(JSON.stringify({ 
        error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate sectionId and worldId format if provided
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (sectionId && !uuidRegex.test(sectionId)) {
      return new Response(JSON.stringify({ error: 'Invalid sectionId format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (worldId && !uuidRegex.test(worldId)) {
      return new Response(JSON.stringify({ error: 'Invalid worldId format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate subject if provided
    const validSubjects = ['mathematik', 'deutsch', 'englisch', 'biologie', 'physik', 'chemie', 
                           'geschichte', 'geografie', 'kunst', 'musik', 'sport', 'informatik', 'allgemein'];
    if (subject && !validSubjects.includes(subject)) {
      return new Response(JSON.stringify({ error: 'Invalid subject' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ========== END INPUT VALIDATION ==========
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating image for user:", user.id, "section:", sectionId, "world:", worldId, "prompt length:", prompt.length);

    // If worldId is provided, verify the user owns this world
    if (worldId) {
      const { data: worldData, error: worldError } = await supabaseAuth
        .from('learning_worlds')
        .select('creator_id')
        .eq('id', worldId)
        .single();
      
      if (worldError || !worldData) {
        console.error('World not found:', worldError);
        return new Response(JSON.stringify({ error: 'World not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (worldData.creator_id !== user.id) {
        console.error('User does not own this world:', { userId: user.id, creatorId: worldData.creator_id });
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create enhanced prompt for educational illustrations
    const enhancedPrompt = `Educational illustration for children (ages 8-16), subject: ${subject || 'general'}. 
Style: Friendly, colorful, clear, child-appropriate, modern flat design.
Scene: ${prompt}
Requirements: No text in image, bright colors, simple shapes, engaging and inviting visual.`;

    // Generate image using Lovable AI (Gemini Flash Image)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        modalities: ["image", "text"]
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
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received for user:", user.id);

    // Extract image from response
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If sectionId is provided, store the image in Supabase Storage
    let storedUrl = imageData;
    
    if (sectionId && worldId) {
      try {
        // Extract base64 data
        const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const imageType = base64Match[1];
          const base64Data = base64Match[2];
          const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          // Use service role client for storage operations
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          
          const fileName = `${worldId}/${sectionId}.${imageType}`;
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('learning-materials')
            .upload(fileName, imageBuffer, {
              contentType: `image/${imageType}`,
              upsert: true
            });
          
          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            // Continue with base64 if upload fails
          } else {
            // Get public URL
            const { data: urlData } = supabase
              .storage
              .from('learning-materials')
              .getPublicUrl(fileName);
            
            storedUrl = urlData.publicUrl;
            
            // Update section with image URL
            const { error: updateError } = await supabase
              .from('learning_sections')
              .update({ 
                image_url: storedUrl,
                image_prompt: prompt 
              })
              .eq('id', sectionId);
            
            if (updateError) {
              console.error("Section update error:", updateError);
            }
            
            console.log("Image stored and section updated:", storedUrl, "for user:", user.id);
          }
        }
      } catch (storageError) {
        console.error("Storage error:", storageError);
        // Continue with base64 image
      }
    }

    return new Response(JSON.stringify({ 
      imageUrl: storedUrl,
      prompt: prompt 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-image function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});