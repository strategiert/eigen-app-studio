import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Eye, Edit, Trash2, Globe, Lock, Sparkles, Share2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareWorldDialog } from "./ShareWorldDialog";

interface WorldCardProps {
  world: {
    id: string;
    title: string;
    poetic_name: string | null;
    description: string | null;
    subject: string;
    status: string;
    is_public: boolean;
    moon_phase: string;
    created_at: string;
    updated_at: string;
    generation_status?: string | null;
    generation_error?: string | null;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onWorldUpdated?: () => void;
}

const subjectColors: Record<string, string> = {
  mathematik: "bg-subject-math/20 text-subject-math border-subject-math/30",
  deutsch: "bg-subject-german/20 text-subject-german border-subject-german/30",
  englisch: "bg-subject-english/20 text-subject-english border-subject-english/30",
  biologie: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  chemie: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  physik: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  geschichte: "bg-subject-history/20 text-subject-history border-subject-history/30",
  geografie: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  informatik: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  kunst: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  musik: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  sport: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  allgemein: "bg-accent/20 text-accent border-accent/30",
};

const moonPhaseIcons: Record<string, string> = {
  neumond: "🌑",
  zunehmend: "🌒",
  halbmond: "🌓",
  vollmond: "🌕",
  abnehmend: "🌘",
};

const generationStageLabels: Record<string, string> = {
  pending: "Wird vorbereitet...",
  analyzing: "Analysiere Inhalt...",
  designing: "Gestalte Welt...",
  generating: "Generiere Lektionen...",
  finalizing: "Speichere Daten...",
  images: "Erstelle Bilder...",
  complete: "Fertig!",
  error: "Fehler",
  idle: "",
};

export const WorldCard = ({ world, onEdit, onDelete, onView, onWorldUpdated }: WorldCardProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const subjectColor = subjectColors[world.subject] || subjectColors.allgemein;
  const moonIcon = moonPhaseIcons[world.moon_phase] || "🌙";
  
  const isGenerating = world.generation_status && 
    !['complete', 'idle', 'error', null, undefined].includes(world.generation_status);
  
  const hasError = world.generation_status === 'error';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: isGenerating ? 0 : -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-300 overflow-hidden group ${
          isGenerating ? 'opacity-80' : 'hover:border-moon/30'
        }`}>
          {/* Generation progress bar */}
          {isGenerating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-moon via-aurora to-accent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ width: '50%' }}
              />
            </div>
          )}
          
          {!isGenerating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-moon via-aurora to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin text-moon" />
                  ) : hasError ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <span className="text-xl">{moonIcon}</span>
                  )}
                  <h3 className="font-semibold text-foreground truncate">{world.title}</h3>
                </div>
                {isGenerating ? (
                  <p className="text-sm text-moon italic flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {generationStageLabels[world.generation_status || ''] || 'Generiere...'}
                  </p>
                ) : hasError ? (
                  <p className="text-sm text-destructive italic truncate" title={world.generation_error || ''}>
                    {world.generation_error || 'Generierung fehlgeschlagen'}
                  </p>
                ) : world.poetic_name && (
                  <p className="text-sm text-muted-foreground italic truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {world.poetic_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {world.is_public ? (
                  <Globe className="w-4 h-4 text-moon" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            {!isGenerating && world.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {world.description}
              </p>
            )}
            
            {isGenerating && (
              <div className="h-10 flex items-center">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-moon"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <span className="ml-3 text-sm text-muted-foreground">
                  Bitte warten...
                </span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={subjectColor}>
                {world.subject}
              </Badge>
              {!isGenerating && (
                <Badge 
                  variant="outline" 
                  className={world.status === "published" 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : hasError
                    ? "bg-destructive/20 text-destructive border-destructive/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }
                >
                  {hasError ? "Fehler" : world.status === "published" ? "Veröffentlicht" : "Entwurf"}
                </Badge>
              )}
              {isGenerating && (
                <Badge variant="outline" className="bg-moon/20 text-moon border-moon/30">
                  Generiert...
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/30 pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(world.updated_at)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onView(world.id)}
                disabled={isGenerating}
                title="Ansehen"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-moon"
                onClick={() => setShareDialogOpen(true)}
                disabled={isGenerating}
                title="Teilen"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-moon"
                onClick={() => onEdit(world.id)}
                disabled={isGenerating}
                title="Bearbeiten"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(world.id)}
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <ShareWorldDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        world={world}
        onWorldUpdated={onWorldUpdated || (() => {})}
      />
    </>
  );
};
