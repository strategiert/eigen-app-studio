import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Eye, GitFork, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSubjectIcon, getSubjectColor } from "@/lib/subjectTheme";

interface WorldGalleryCardProps {
  world: {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    thumbnail_url: string | null;
    created_at: string;
    creator_id: string;
    fork_count: number;
    view_count: number;
    poetic_name: string | null;
    visual_theme: Record<string, unknown> | null;
    profiles?: {
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  };
  rating?: { average: number; count: number };
  index?: number;
  hideCreator?: boolean;
}

export const WorldGalleryCard = ({ world, rating, index = 0, hideCreator = false }: WorldGalleryCardProps) => {
  const SubjectIcon = getSubjectIcon(world.subject as any);
  const subjectColor = getSubjectColor(world.subject as any);
  const visualTheme = world.visual_theme as { primaryHue?: number; mood?: string } | null;
  
  const primaryHue = visualTheme?.primaryHue || 220;
  const mood = visualTheme?.mood || "dreamy";

  const gradientStyle = {
    background: `linear-gradient(135deg, 
      hsl(${primaryHue}, 60%, ${mood === "dark" ? "15%" : "85%"}),
      hsl(${primaryHue + 30}, 50%, ${mood === "dark" ? "25%" : "75%"})
    )`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/w/${world.id}`}>
        <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          {/* Thumbnail */}
          <div 
            className="h-40 relative overflow-hidden"
            style={world.thumbnail_url ? undefined : gradientStyle}
          >
            {world.thumbnail_url ? (
              <img
                src={world.thumbnail_url}
                alt={world.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white/30" />
              </div>
            )}
            
            {/* Subject Badge */}
            <Badge
              className="absolute top-3 left-3 text-white border-0"
              style={{ backgroundColor: subjectColor }}
            >
              <SubjectIcon className="h-3 w-3 mr-1" />
              {world.subject}
            </Badge>

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
              <div className="flex items-center gap-3 text-white/90 text-sm">
                {rating && rating.count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{rating.average.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{world.view_count || 0}</span>
                </div>
                {world.fork_count > 0 && (
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    <span>{world.fork_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {world.title}
            </h3>
            
            {/* Poetic name */}
            {world.poetic_name && (
              <p className="text-sm text-muted-foreground italic line-clamp-1 mt-0.5">
                {world.poetic_name}
              </p>
            )}

            {/* Description */}
            {world.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {world.description}
              </p>
            )}

            {/* Creator */}
            {!hideCreator && world.profiles && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={world.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(world.profiles.display_name || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {world.profiles.display_name || "Anonym"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
