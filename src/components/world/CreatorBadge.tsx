import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CreatorBadgeProps {
  creatorId: string;
  displayName: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
  className?: string;
}

export const CreatorBadge = ({ 
  creatorId, 
  displayName, 
  avatarUrl, 
  size = "md",
  className 
}: CreatorBadgeProps) => {
  const sizeClasses = {
    sm: {
      avatar: "h-5 w-5",
      text: "text-xs",
    },
    md: {
      avatar: "h-7 w-7",
      text: "text-sm",
    },
  };

  return (
    <Link
      to={`/profile/${creatorId}`}
      className={cn(
        "inline-flex items-center gap-2 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <Avatar className={sizeClasses[size].avatar}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {(displayName || "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className={cn("text-muted-foreground", sizeClasses[size].text)}>
        {displayName || "Anonym"}
      </span>
    </Link>
  );
};
