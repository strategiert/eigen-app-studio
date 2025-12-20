import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  currentUserId: string;
  onFollowChange?: () => void;
}

export const FollowButton = ({ userId, currentUserId, onFollowChange }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId, currentUserId]);

  const checkFollowStatus = async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_followers")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .maybeSingle();

    if (!error) {
      setIsFollowing(!!data);
    }
    setIsLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast.error("Du musst angemeldet sein, um zu folgen");
      return;
    }

    setIsSubmitting(true);

    if (isFollowing) {
      const { error } = await supabase
        .from("user_followers")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId);

      if (error) {
        toast.error("Fehler beim Entfolgen");
      } else {
        setIsFollowing(false);
        toast.success("Du folgst dieser Person nicht mehr");
        onFollowChange?.();
      }
    } else {
      const { error } = await supabase
        .from("user_followers")
        .insert({ follower_id: currentUserId, following_id: userId });

      if (error) {
        toast.error("Fehler beim Folgen");
      } else {
        setIsFollowing(true);
        toast.success("Du folgst jetzt dieser Person");
        onFollowChange?.();
      }
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={handleFollowToggle}
        disabled={isSubmitting}
        className="gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="h-4 w-4" />
            Entfolgen
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Folgen
          </>
        )}
      </Button>
    </motion.div>
  );
};
