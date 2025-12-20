import { motion } from "framer-motion";
import { Globe, School, BookOpen, Star, Eye, GitFork, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    school: string | null;
    website: string | null;
    is_public: boolean;
  };
  stats: {
    totalWorlds: number;
    totalViews: number;
    totalForks: number;
    averageRating: number;
  };
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export const ProfileHeader = ({ profile, stats, isOwnProfile, onEdit }: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {(profile.display_name || "?")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile.display_name || "Anonym"}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
                {profile.school && (
                  <span className="flex items-center gap-1 text-sm">
                    <School className="h-4 w-4" />
                    {profile.school}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {!profile.is_public && isOwnProfile && (
                  <Badge variant="outline" className="text-xs">
                    Privates Profil
                  </Badge>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalWorlds}</p>
                <p className="text-xs text-muted-foreground">Lernwelten</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "–"}
                </p>
                <p className="text-xs text-muted-foreground">Ø Bewertung</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalViews}</p>
                <p className="text-xs text-muted-foreground">Aufrufe</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <GitFork className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalForks}</p>
                <p className="text-xs text-muted-foreground">Forks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
