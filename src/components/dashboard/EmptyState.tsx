import { motion } from "framer-motion";
import { Sparkles, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState = ({ onCreateClick }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-moon/20 to-aurora/20 flex items-center justify-center">
          <Moon className="w-12 h-12 text-moon" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-full border border-dashed border-moon/30"
        />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        Noch keine Lernwelten
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Erstelle deine erste Lernwelt und verwandle Unterrichtsmaterial in
        interaktive Lernabenteuer für deine Schüler.
      </p>

      <Button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-moon to-aurora text-night-sky hover:opacity-90"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Erste Lernwelt erstellen
      </Button>
    </motion.div>
  );
};
