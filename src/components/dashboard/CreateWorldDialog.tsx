import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, BookOpen, FileText, Wand2, Upload, File, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SubjectType = Database["public"]["Enums"]["subject_type"];

interface CreateWorldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorldCreated: () => void;
}

const subjects: { value: SubjectType; label: string; emoji: string }[] = [
  { value: "mathematik", label: "Mathematik", emoji: "🔢" },
  { value: "deutsch", label: "Deutsch", emoji: "📝" },
  { value: "englisch", label: "Englisch", emoji: "🇬🇧" },
  { value: "biologie", label: "Biologie", emoji: "🧬" },
  { value: "chemie", label: "Chemie", emoji: "⚗️" },
  { value: "physik", label: "Physik", emoji: "⚡" },
  { value: "geschichte", label: "Geschichte", emoji: "🏛️" },
  { value: "geografie", label: "Geografie", emoji: "🌍" },
  { value: "informatik", label: "Informatik", emoji: "💻" },
  { value: "kunst", label: "Kunst", emoji: "🎨" },
  { value: "musik", label: "Musik", emoji: "🎵" },
  { value: "sport", label: "Sport", emoji: "⚽" },
  { value: "allgemein", label: "Allgemein", emoji: "📚" },
];

export const CreateWorldDialog = ({ open, onOpenChange, onWorldCreated }: CreateWorldDialogProps) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<SubjectType>("allgemein");
  const [sourceContent, setSourceContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contentMode, setContentMode] = useState<"text" | "pdf">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleReset = () => {
    setStep(1);
    setTitle("");
    setSubject("allgemein");
    setSourceContent("");
    setUploadedFile(null);
    setContentMode("text");
    setIsGenerating(false);
    setIsUploadingPdf(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(handleReset, 300);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte lade eine PDF-Datei hoch.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 50 MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploadingPdf(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // Upload to Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("learning-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Parse PDF using edge function
      const { data: parseData, error: parseError } = await supabase.functions.invoke("parse-pdf", {
        body: { filePath },
      });

      if (parseError) throw parseError;

      if (parseData?.text) {
        setSourceContent(parseData.text);
        toast({
          title: "PDF erfolgreich verarbeitet",
          description: `${parseData.pageCount || 0} Seiten wurden extrahiert.`,
        });
      } else {
        throw new Error("Kein Text konnte extrahiert werden");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Fehler beim Verarbeiten",
        description: error instanceof Error ? error.message : "PDF konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSourceContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || !sourceContent.trim()) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the AI generation function
      const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-world", {
        body: { title, subject, sourceContent },
      });

      if (aiError) {
        throw new Error(aiError.message || "KI-Generierung fehlgeschlagen");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // Create the learning world
      const { data: world, error: worldError } = await supabase
        .from("learning_worlds")
        .insert({
          title,
          subject,
          creator_id: user.id,
          poetic_name: aiData.poeticName || null,
          description: aiData.description || null,
          source_content: sourceContent,
          generated_code: JSON.stringify(aiData),
          status: "draft",
          moon_phase: "neumond",
        })
        .select()
        .single();

      if (worldError) throw worldError;

      // Create the learning sections/modules
      if (aiData.sections && world) {
        const sections = aiData.sections.map((section: {
          title: string;
          content: string;
          moduleType?: string;
          componentType: string;
          componentData: Record<string, unknown>;
        }, index: number) => ({
          world_id: world.id,
          title: section.title,
          content: section.content,
          module_type: section.moduleType || "knowledge",
          component_type: section.componentType || "text",
          component_data: section.componentData || {},
          order_index: index,
        }));

        const { error: sectionsError } = await supabase
          .from("learning_sections")
          .insert(sections);

        if (sectionsError) {
          console.error("Error creating sections:", sectionsError);
        }
      }

      toast({
        title: "Lernwelt erstellt! ✨",
        description: `"${title}" wurde erfolgreich generiert.`,
      });

      handleClose();
      onWorldCreated();
    } catch (error) {
      console.error("Error creating world:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Konnte die Lernwelt nicht erstellen.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-moon" />
            Neue Lernwelt erstellen
          </DialogTitle>
          <DialogDescription>
            Verwandle deinen Lernstoff in eine interaktive Lernwelt mit KI
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-moon text-night-sky"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-all ${
                    step > s ? "bg-moon" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Titel der Lernwelt
                </Label>
                <Input
                  id="title"
                  placeholder="z.B. Das Sonnensystem, Bruchrechnung, Die Römer..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Fach
                </Label>
                <Select value={subject} onValueChange={(v) => setSubject(v as SubjectType)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          <span>{s.emoji}</span>
                          <span>{s.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!title.trim()}
                className="w-full bg-moon text-night-sky hover:bg-moon-glow"
              >
                Weiter
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Lerninhalt
                </Label>
                <p className="text-sm text-muted-foreground">
                  Füge Text ein oder lade eine PDF-Datei hoch.
                </p>
              </div>

              <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as "text" | "pdf")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text eingeben</TabsTrigger>
                  <TabsTrigger value="pdf">PDF hochladen</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Kopiere hier den Lernstoff hinein... Texte aus Büchern, Arbeitsblättern, Wikipedia, etc."
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    className="min-h-[200px] bg-background/50"
                  />
                </TabsContent>

                <TabsContent value="pdf" className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!uploadedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-moon/50 hover:bg-moon/5 transition-all"
                    >
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-foreground font-medium mb-1">PDF-Datei auswählen</p>
                      <p className="text-sm text-muted-foreground">Maximal 50 MB</p>
                    </div>
                  ) : (
                    <div className="border border-border/50 rounded-xl p-4 bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-moon/10 rounded-lg">
                          <File className="w-6 h-6 text-moon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isUploadingPdf ? "Wird verarbeitet..." : "Erfolgreich verarbeitet"}
                          </p>
                        </div>
                        {!isUploadingPdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {isUploadingPdf && (
                          <Loader2 className="w-5 h-5 animate-spin text-moon" />
                        )}
                      </div>
                    </div>
                  )}

                  {sourceContent && contentMode === "pdf" && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{sourceContent.length.toLocaleString()}</span> Zeichen extrahiert
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isUploadingPdf || !sourceContent.trim()}
                  className="flex-1 bg-gradient-to-r from-moon to-aurora text-night-sky hover:opacity-90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generiere...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Mit KI generieren
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};