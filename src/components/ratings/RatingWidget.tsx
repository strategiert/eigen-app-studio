import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface RatingWidgetProps {
  worldId: string;
  userId: string;
  existingRating?: { rating: number; comment: string | null };
  onRatingSubmit?: () => void;
}

export const RatingWidget = ({ worldId, userId, existingRating, onRatingSubmit }: RatingWidgetProps) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComment, setShowComment] = useState(!!existingRating?.comment);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Bewertung fehlt",
        description: "Bitte wähle mindestens einen Stern.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("world_ratings")
      .upsert(
        {
          world_id: worldId,
          user_id: userId,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: "world_id,user_id" }
      );

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Fehler",
        description: "Die Bewertung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: existingRating ? "Bewertung aktualisiert" : "Danke für deine Bewertung!",
      description: "Dein Feedback hilft anderen Lernenden.",
    });

    onRatingSubmit?.();
  };

  const displayRating = hoveredRating || rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <h3 className="font-semibold text-lg mb-4">
        {existingRating ? "Deine Bewertung bearbeiten" : "Diese Lernwelt bewerten"}
      </h3>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                value <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </motion.button>
        ))}
        <span className="ml-3 text-muted-foreground">
          {displayRating > 0 ? `${displayRating} von 5` : "Klicke zum Bewerten"}
        </span>
      </div>

      {/* Comment toggle */}
      {!showComment && rating > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComment(true)}
          className="mb-4"
        >
          + Kommentar hinzufügen
        </Button>
      )}

      {/* Comment field */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Textarea
              placeholder="Was hat dir gefallen? Was könnte verbessert werden?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Wird gespeichert...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {existingRating ? "Aktualisieren" : "Bewertung abgeben"}
          </>
        )}
      </Button>
    </motion.div>
  );
};
