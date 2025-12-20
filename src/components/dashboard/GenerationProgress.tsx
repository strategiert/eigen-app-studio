import { motion } from "framer-motion";
import { Check, FileText, Brain, Sparkles, Loader2 } from "lucide-react";
import { MoonLogo } from "@/components/icons/MoonLogo";

interface GenerationProgressProps {
  stage: "uploading" | "extracting" | "analyzing" | "generating" | "images" | "finalizing" | "complete";
  progress?: number;
}

const stages = [
  { id: "uploading", label: "Hochladen...", icon: FileText },
  { id: "extracting", label: "Text wird extrahiert...", icon: FileText },
  { id: "analyzing", label: "Analysiere Lerninhalt...", icon: Brain },
  { id: "generating", label: "Erstelle interaktive Module...", icon: Sparkles },
  { id: "images", label: "Generiere Bilder...", icon: Sparkles },
  { id: "finalizing", label: "Füge Quiz-Fragen hinzu...", icon: Sparkles },
  { id: "complete", label: "Fertig!", icon: Check },
];

export const GenerationProgress = ({ stage, progress }: GenerationProgressProps) => {
  const currentIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="space-y-6">
      {/* Animated moon logo */}
      <div className="flex justify-center">
        <motion.div
          animate={{ 
            scale: stage === "complete" ? [1, 1.2, 1] : 1,
            rotate: stage !== "complete" ? 360 : 0 
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 8, ease: "linear" },
            scale: { duration: 0.5 }
          }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-moon via-moon-glow to-aurora flex items-center justify-center">
            {stage === "complete" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Check className="w-10 h-10 text-night-sky" />
              </motion.div>
            ) : (
              <MoonLogo className="w-12 h-12 text-night-sky" />
            )}
          </div>
          
          {/* Orbiting particles */}
          {stage !== "complete" && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-moon rounded-full"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + i * 0.5,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    marginTop: -4,
                    marginLeft: -4,
                    transformOrigin: `${40 + i * 10}px 0`,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      </div>

      {/* Progress stages */}
      <div className="space-y-3">
        {stages.slice(0, -1).map((s, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = s.icon;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrent
                  ? "bg-moon/10 border border-moon/30"
                  : isCompleted
                  ? "bg-muted/30"
                  : "opacity-40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-green-500/20 text-green-500"
                    : isCurrent
                    ? "bg-moon/20 text-moon"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar (optional) */}
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-moon to-aurora"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">{progress}%</p>
        </div>
      )}

      {/* Motivational messages */}
      <motion.p
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-muted-foreground"
      >
        {stage === "uploading" && "Datei wird hochgeladen..."}
        {stage === "extracting" && "KI liest und analysiert das Dokument..."}
        {stage === "analyzing" && "Struktur und Kernkonzepte werden erkannt..."}
        {stage === "generating" && "Interaktive Lernmodule werden erstellt..."}
        {stage === "images" && "Illustrationen werden generiert..."}
        {stage === "finalizing" && "Quizfragen und Übungen werden generiert..."}
        {stage === "complete" && "Deine Lernwelt ist bereit! ✨"}
      </motion.p>
    </div>
  );
};
