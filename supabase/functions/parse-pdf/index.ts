import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    
    if (!filePath) {
      throw new Error("No file path provided");
    }

    console.log("Parsing PDF from path:", filePath);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the PDF file from storage
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

    // Use Lovable AI with vision capabilities to extract text from PDF
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Send PDF to AI for text extraction
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
            content: `Du bist ein Textextraktions-Assistent. Deine Aufgabe ist es, den gesamten Text aus dem PDF-Dokument zu extrahieren und als reinen Text zurückzugeben.

Regeln:
- Extrahiere ALLEN lesbaren Text aus dem Dokument
- Behalte die Struktur (Absätze, Listen, Überschriften) bei
- Ignoriere Seitenzahlen und Kopf-/Fußzeilen
- Gib NUR den extrahierten Text zurück, keine zusätzlichen Kommentare
- Wenn das Dokument Bilder enthält, beschreibe sie kurz in [Klammern]`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrahiere den gesamten Text aus diesem PDF-Dokument:"
              },
              {
                type: "file",
                file: {
                  filename: filePath.split('/').pop() || "document.pdf",
                  file_data: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI extraction error:", response.status, errorText);
      throw new Error("Could not extract text from PDF");
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "";

    if (!extractedText) {
      throw new Error("No text could be extracted from the PDF");
    }

    console.log("Extracted text length:", extractedText.length);

    // Clean up the uploaded file after processing (optional)
    // await supabase.storage.from("learning-materials").remove([filePath]);

    return new Response(JSON.stringify({
      text: extractedText,
      pageCount: 1, // We can't accurately count pages with this method
      characterCount: extractedText.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-pdf function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to parse PDF" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});