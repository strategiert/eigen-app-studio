import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  average: number;
  count: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay = ({ 
  average, 
  count, 
  size = "md", 
  showCount = true,
  className 
}: RatingDisplayProps) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (count === 0) {
    return (
      <span className={cn("text-muted-foreground", textClasses[size], className)}>
        Noch keine Bewertungen
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= Math.round(average);
        const partial = value === Math.ceil(average) && average % 1 !== 0;
        
        return (
          <Star
            key={value}
            className={cn(
              sizeClasses[size],
              filled || partial
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        );
      })}
      <span className={cn("ml-1 text-muted-foreground", textClasses[size])}>
        {average.toFixed(1)}
        {showCount && <span className="ml-1">({count})</span>}
      </span>
    </div>
  );
};
