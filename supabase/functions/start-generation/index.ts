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
    
    const analysisPrompt = `Analyze this educational content and extract key information for creating a learning experience.

Return a JSON object with:
{
  "theme": {
    "mainTopic": "The central subject of the content",
    "keywords": ["list", "of", "key", "terms"],
    "targetAge": "estimated age group (e.g., '10-12')",
    "difficulty": "beginner/intermediate/advanced"
  },
  "structure": {
    "conceptCount": number of main concepts,
    "hasExamples": true/false,
    "contentType": "theoretical/practical/mixed"
  },
  "learningObjectives": ["what students will learn"]
}`;

    const contentAnalysis = await callAI(analysisPrompt, `Title: ${title}\n\nContent:\n${sourceContent.substring(0, 8000)}`);
    console.log("Content analysis complete:", contentAnalysis?.theme?.mainTopic);

    // PHASE 2: Design World
    console.log("Phase 2: Designing world...");
    await updateStatus(supabase, worldId, 'designing');
    
    const designPrompt = `You are a creative director designing a unique visual world for an educational experience.

Based on the content analysis, create a unique visual concept that reflects the subject matter.

Return a JSON object with:
{
  "worldConcept": {
    "name": "A poetic/creative name for this learning world",
    "tagline": "A short, inspiring description",
    "atmosphere": "Description of the visual atmosphere"
  },
  "visualTheme": {
    "primaryColor": "HSL color as 'hsl(h, s%, l%)'",
    "secondaryColor": "HSL color",
    "accentColor": "HSL color",
    "backgroundGradient": "CSS gradient",
    "styleHint": "Visual style description for image generation"
  },
  "sections": [
    {
      "title": "Section title",
      "type": "knowledge/practice/quiz",
      "description": "What this section covers"
    }
  ]
}`;

    const worldDesign = await callAI(designPrompt, `Title: ${title}\n\nContent Analysis:\n${JSON.stringify(contentAnalysis, null, 2)}`);
    console.log("World design complete:", worldDesign?.worldConcept?.name);

    // PHASE 3: Generate Content
    console.log("Phase 3: Generating content...");
    await updateStatus(supabase, worldId, 'generating');
    
    const contentPrompt = `Create interactive educational content with multiple sections.

Each section should have one of these component types:
- "text": Explanatory content with markdown
- "quiz": Multiple choice questions
- "fill-blanks": Fill in the blank exercises
- "matching": Match pairs exercise

Return JSON:
{
  "poeticName": "Creative name for this world",
  "description": "Brief description",
  "visualTheme": {
    "primaryColor": "hsl(...)",
    "secondaryColor": "hsl(...)",
    "accentColor": "hsl(...)",
    "styleHint": "visual style for images"
  },
  "sections": [
    {
      "title": "Section title",
      "content": "Main content (markdown for text sections)",
      "moduleType": "knowledge/practice",
      "componentType": "text/quiz/fill-blanks/matching",
      "componentData": {
        // For quiz: { questions: [{ question, options: [], correctIndex, explanation }] }
        // For fill-blanks: { sentences: [{ text: "The ___ is...", blanks: ["answer"] }] }
        // For matching: { pairs: [{ left: "term", right: "definition" }] }
      },
      "imagePrompt": "Detailed prompt for generating an illustration"
    }
  ]
}

Create 4-6 sections mixing explanation and interactive exercises.`;

    const generatedContent = await callAI(contentPrompt, `Title: ${title}\nSubject: ${subject}\n\nWorld Design:\n${JSON.stringify(worldDesign, null, 2)}\n\nSource Content:\n${sourceContent.substring(0, 10000)}`);
    console.log("Content generation complete with", generatedContent?.sections?.length, "sections");

    // PHASE 4: Save to database
    console.log("Phase 4: Saving to database...");
    await updateStatus(supabase, worldId, 'finalizing');

    // Update world with generated data
    const { error: worldUpdateError } = await supabase
      .from('learning_worlds')
      .update({
        poetic_name: generatedContent.poeticName || worldDesign?.worldConcept?.name || null,
        description: generatedContent.description || worldDesign?.worldConcept?.tagline || null,
        visual_theme: generatedContent.visualTheme || {},
        world_design: worldDesign || {},
        generated_code: JSON.stringify({ contentAnalysis, worldDesign, generatedContent }),
        status: 'draft',
      })
      .eq('id', worldId);

    if (worldUpdateError) {
      throw new Error(`Failed to update world: ${worldUpdateError.message}`);
    }

    // Create sections
    if (generatedContent.sections && generatedContent.sections.length > 0) {
      const sections = generatedContent.sections.map((section: any, index: number) => ({
        world_id: worldId,
        title: section.title,
        content: section.content,
        module_type: section.moduleType || "knowledge",
        component_type: section.componentType || "text",
        component_data: section.componentData || {},
        image_prompt: section.imagePrompt || null,
        order_index: index,
      }));

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
                      content: `Generate an educational illustration: ${section.image_prompt}. Style: ${generatedContent.visualTheme?.styleHint || 'friendly, colorful, educational'}. Clean, simple, age-appropriate for children.`
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
