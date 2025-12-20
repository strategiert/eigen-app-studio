import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Comment {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  worldId: string;
  refreshTrigger?: number;
}

export const CommentSection = ({ worldId, refreshTrigger }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [worldId, refreshTrigger]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("world_ratings")
      .select(`
        id, rating, comment, created_at, user_id,
        profiles!world_ratings_user_id_fkey(display_name, avatar_url)
      `)
      .eq("world_id", worldId)
      .not("comment", "is", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as unknown as Comment[]);
    }
    setLoading(false);
  };

  const displayedComments = expanded ? comments : comments.slice(0, 3);

  if (loading) {
    return null;
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="font-medium flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4" />
        Kommentare ({comments.length})
      </h4>

      <div className="space-y-4">
        <AnimatePresence>
          {displayedComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="bg-muted/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(comment.profiles?.display_name || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {comment.profiles?.display_name || "Anonym"}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-3 w-3 ${
                            value <= comment.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {comments.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Alle {comments.length} Kommentare anzeigen
            </>
          )}
        </Button>
      )}
    </div>
  );
};
