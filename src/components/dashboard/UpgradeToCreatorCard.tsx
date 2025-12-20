import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UpgradeToCreatorCardProps {
  onUpgraded: () => void;
}

export const UpgradeToCreatorCard = ({ onUpgraded }: UpgradeToCreatorCardProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { error } = await supabase.rpc("upgrade_to_creator");
      
      if (error) throw error;

      toast({
        title: "Willkommen als Creator! 🎉",
        description: "Du kannst jetzt eigene Lernwelten erstellen.",
      });
      
      onUpgraded();
    } catch (error) {
      console.error("Error upgrading:", error);
      toast({
        title: "Fehler",
        description: "Upgrade fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-moon/20 max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-moon/20 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-moon" />
          </div>
          <CardTitle className="text-2xl">Werde Creator</CardTitle>
          <CardDescription className="text-base">
            Erstelle eigene Lernwelten und teile dein Wissen mit Schülern
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-moon" />
              <span>KI-gestützte Lernwelt-Generierung</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-moon" />
              <span>Interaktive Übungen erstellen</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-moon" />
              <span>Fortschritt deiner Schüler verfolgen</span>
            </li>
          </ul>
          
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-to-r from-moon to-aurora text-night-sky hover:opacity-90"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Upgrade läuft...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Jetzt Creator werden
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};