import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, FileText, Upload, File, X, Mic, Loader2 } from "lucide-react";
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
import { VoiceRecorder } from "./VoiceRecorder";
import { GenerationProgress } from "./GenerationProgress";
import { logger } from "@/lib/logger";
import { retrySupabaseFunction } from "@/lib/retry";

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

// Accepted file types
const ACCEPTED_TYPES = ".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.gif";
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const CreateWorldDialog = ({ open, onOpenChange, onWorldCreated }: CreateWorldDialogProps) => {
  const [step, setStep] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<SubjectType>("allgemein");
  const [sourceContent, setSourceContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contentMode, setContentMode] = useState<"text" | "file" | "voice">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleReset = () => {
    setStep(1);
    setTitle("");
    setSubject("allgemein");
    setSourceContent("");
    setUploadedFile(null);
    setContentMode("text");
    setIsStarting(false);
    setIsUploadingFile(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(handleReset, 300);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte lade ein PDF, Word-Dokument oder Bild hoch.",
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
    setIsUploadingFile(true);

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

      // Parse document using edge function
      const { data: parseData, error: parseError } = await supabase.functions.invoke("parse-document", {
        body: { filePath, mimeType: file.type },
      });

      if (parseError) throw parseError;

      if (parseData?.text) {
        setSourceContent(parseData.text);
        toast({
          title: "Datei erfolgreich verarbeitet",
          description: `${parseData.characterCount?.toLocaleString() || 0} Zeichen wurden extrahiert.`,
        });
      } else {
        throw new Error("Kein Text konnte extrahiert werden");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Fehler beim Verarbeiten",
        description: error instanceof Error ? error.message : "Datei konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSourceContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setSourceContent(prev => prev ? `${prev}\n\n${transcript}` : transcript);
    toast({
      title: "Sprache erkannt",
      description: `${transcript.length.toLocaleString()} Zeichen wurden transkribiert.`,
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-6 h-6 text-moon" />;
    if (mimeType.startsWith("image/")) return <File className="w-6 h-6 text-green-500" />;
    if (mimeType.includes("word")) return <File className="w-6 h-6 text-blue-500" />;
    return <File className="w-6 h-6 text-moon" />;
  };

  const handleStartGeneration = async () => {
    if (!title.trim() || !sourceContent.trim()) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(true);

    try {
      logger.userAction('create_world_started', { title, contentLength: sourceContent.length });

      // Call the start-generation edge function
      const { data, error } = await supabase.functions.invoke("start-generation", {
        body: { title, subject, sourceContent },
      });

      if (error) {
        throw new Error(error.message || "Generierung konnte nicht gestartet werden");
      }

      if (!data?.worldId) {
        throw new Error("Keine World-ID erhalten");
      }

      console.log("Generation started for world:", data.worldId);

      // Close dialog and show success toast
      toast({
        title: "Generierung gestartet! ✨",
        description: `"${title}" wird im Hintergrund erstellt.`,
      });

      handleClose();
      onWorldCreated();
    } catch (error) {
      logger.error("Failed to start generation", error, {
        component: 'CreateWorldDialog',
        title,
      });

      let userMessage = "Konnte die Generierung nicht starten.";
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          userMessage = "Zu viele Anfragen. Bitte versuche es in ein paar Minuten erneut.";
        } else if (error.message.includes('timeout')) {
          userMessage = "Die Generierung hat zu lange gedauert. Bitte versuche es erneut.";
        } else if (error.message.includes('Nicht angemeldet')) {
          userMessage = "Du musst angemeldet sein. Bitte melde dich erneut an.";
        } else {
          userMessage = error.message;
        }
      }

      toast({
        title: "Fehler",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
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

        {/* Step indicators */}
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
              <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as "text" | "file" | "voice")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Datei
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-1">
                    <Mic className="w-4 h-4" />
                    Sprache
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-2">
                  <Label>Lerninhalt eingeben</Label>
                  <Textarea
                    placeholder="Füge hier deinen Lernstoff ein: Schulbuchkapitel, Notizen, Wikipedia-Artikel..."
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    className="min-h-[200px] bg-background/50"
                  />
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Datei hochladen</Label>
                    <p className="text-sm text-muted-foreground">
                      PDF, Word-Dokumente oder Bilder (max. 50 MB)
                    </p>
                  </div>

                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-moon/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">
                        Klicke zum Hochladen oder ziehe eine Datei hierher
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOCX, DOC, JPG, PNG, WEBP, GIF
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="bg-background/50 rounded-lg p-4 flex items-center gap-3">
                      {getFileIcon(uploadedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {isUploadingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin text-moon" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {sourceContent && uploadedFile && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-sm text-green-400">
                        ✓ {sourceContent.length.toLocaleString()} Zeichen extrahiert
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                  <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  
                  {sourceContent && contentMode === "voice" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-sm text-green-400">
                        ✓ {sourceContent.length.toLocaleString()} Zeichen transkribiert
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
                  onClick={handleStartGeneration}
                  disabled={!sourceContent.trim() || isStarting || isUploadingFile}
                  className="flex-1 bg-moon text-night-sky hover:bg-moon-glow"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gestartet...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Lernwelt erstellen
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
