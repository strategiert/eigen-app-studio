import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map MIME types to format types
const mimeTypeMap: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create client with user's auth for validation
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
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

    console.log("Parse document request from user:", user.id);

    const { filePath, mimeType } = await req.json();
    
    // ========== INPUT VALIDATION ==========
    // Validate filePath
    if (!filePath || typeof filePath !== 'string') {
      return new Response(JSON.stringify({ error: 'File path is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Prevent path traversal attacks
    if (filePath.includes('..') || filePath.includes('//')) {
      console.error('Potential path traversal attempt:', { userId: user.id, filePath });
      return new Response(JSON.stringify({ error: 'Invalid file path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Limit file path length
    if (filePath.length > 500) {
      return new Response(JSON.stringify({ error: 'File path too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate mimeType if provided
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (mimeType && !allowedMimeTypes.includes(mimeType)) {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate that the file belongs to the requesting user
    const fileFolder = filePath.split('/')[0];
    if (fileFolder !== user.id) {
      console.error('User attempting to access another user\'s file:', { userId: user.id, filePath });
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ========== END INPUT VALIDATION ==========

    console.log("Parsing document from path:", filePath, "MIME type:", mimeType);

    // Create Supabase client with service role for storage access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("learning-materials")
      .download(filePath);

    if (downloadError) {
      console.error("Download error:", downloadError);
      throw new Error(`Could not download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error("No file data received");
    }

    // Convert blob to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    // Determine file format
    const format = mimeTypeMap[mimeType] || 'unknown';
    const fileName = filePath.split('/').pop() || "document";

    // Use Lovable AI with vision capabilities to extract text
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build message content based on file type
    let messageContent: Array<{ type: string; text?: string; image_url?: { url: string }; file?: { filename: string; file_data: string } }>;

    if (format === 'image') {
      // For images, use image_url format
      messageContent = [
        {
          type: "text",
          text: "Extrahiere und transkribiere den gesamten Text aus diesem Bild. Wenn es sich um handschriftliche Notizen handelt, transkribiere sie so genau wie möglich. Beschreibe auch relevante Diagramme oder Grafiken."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64}`
          }
        }
      ];
    } else {
      // For PDFs, Word docs, etc., use file format
      messageContent = [
        {
          type: "text",
          text: "Extrahiere den gesamten Text aus diesem Dokument:"
        },
        {
          type: "file",
          file: {
            filename: fileName,
            file_data: `data:${mimeType};base64,${base64}`
          }
        }
      ];
    }

    // Send to AI for text extraction
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du bist ein Textextraktions-Assistent. Deine Aufgabe ist es, den gesamten Text aus dem Dokument zu extrahieren und als reinen Text zurückzugeben.

Regeln:
- Extrahiere ALLEN lesbaren Text aus dem Dokument
- Behalte die Struktur (Absätze, Listen, Überschriften) bei
- Ignoriere Seitenzahlen und Kopf-/Fußzeilen
- Gib NUR den extrahierten Text zurück, keine zusätzlichen Kommentare
- Wenn das Dokument Bilder enthält, beschreibe sie kurz in [Klammern]
- Bei handschriftlichen Notizen: transkribiere so genau wie möglich
- Bei Tabellen: strukturiere sie übersichtlich`
          },
          {
            role: "user",
            content: messageContent
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI extraction error:", response.status, errorText);
      throw new Error("Could not extract text from document");
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "";

    if (!extractedText) {
      throw new Error("No text could be extracted from the document");
    }

    console.log("Extracted text length:", extractedText.length, "for user:", user.id);

    return new Response(JSON.stringify({
      text: extractedText,
      format: format,
      characterCount: extractedText.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-document function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to parse document" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});