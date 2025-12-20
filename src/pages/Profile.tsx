import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, School, BookOpen, Star, Users, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { WorldGalleryCard } from "@/components/explore/WorldGalleryCard";
import { PageTransition } from "@/components/world/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

interface ProfileData {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  school: string | null;
  website: string | null;
  is_public: boolean;
}

interface PublicWorld {
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
}

interface ProfileStats {
  totalWorlds: number;
  totalViews: number;
  totalForks: number;
  averageRating: number;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [worlds, setWorlds] = useState<PublicWorld[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ totalWorlds: 0, totalViews: 0, totalForks: 0, averageRating: 0 });
  const [worldRatings, setWorldRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchWorlds();
    }
  }, [userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Check if profile is viewable
    if (!data.is_public && user?.id !== userId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(data as ProfileData);
    setLoading(false);
  };

  const fetchWorlds = async () => {
    let query = supabase
      .from("learning_worlds")
      .select("*")
      .eq("creator_id", userId)
      .eq("status", "published");

    // Only show public worlds for other users
    if (user?.id !== userId) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (!error && data) {
      setWorlds(data as PublicWorld[]);
      
      // Calculate stats
      const totalViews = data.reduce((sum, w) => sum + (w.view_count || 0), 0);
      const totalForks = data.reduce((sum, w) => sum + (w.fork_count || 0), 0);
      
      // Fetch ratings
      const ratings: Record<string, { average: number; count: number }> = {};
      let totalRating = 0;
      let ratedWorlds = 0;
      
      for (const world of data) {
        const { data: ratingData } = await supabase.rpc("get_world_rating", { world_uuid: world.id });
        if (ratingData && ratingData[0]) {
          const avg = ratingData[0].average_rating || 0;
          ratings[world.id] = {
            average: avg,
            count: Number(ratingData[0].total_ratings) || 0,
          };
          if (avg > 0) {
            totalRating += avg;
            ratedWorlds++;
          }
        }
      }
      
      setWorldRatings(ratings);
      setStats({
        totalWorlds: data.length,
        totalViews,
        totalForks,
        averageRating: ratedWorlds > 0 ? totalRating / ratedWorlds : 0,
      });
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <Skeleton className="h-64 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 text-center">
          <PageTransition>
            <h1 className="text-2xl font-bold mb-4">Profil nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Dieses Profil existiert nicht oder ist nicht öffentlich.
            </p>
            <Link to="/explore">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zur Galerie
              </Button>
            </Link>
          </PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <PageTransition>
          {/* Back button */}
          <Link to="/explore" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Galerie
          </Link>

          {/* Profile Header */}
          <ProfileHeader
            profile={profile!}
            stats={stats}
            isOwnProfile={isOwnProfile}
            currentUserId={user?.id}
            onEdit={() => setIsEditing(true)}
          />

          {/* Profile Editor Dialog */}
          {isOwnProfile && (
            <ProfileEditor
              profile={profile!}
              open={isEditing}
              onOpenChange={setIsEditing}
              onSave={handleProfileUpdate}
            />
          )}

          {/* Worlds Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Lernwelten
              <span className="text-muted-foreground font-normal text-lg">({worlds.length})</span>
            </h2>

            {worlds.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "Du hast noch keine veröffentlichten Lernwelten."
                    : "Keine öffentlichen Lernwelten vorhanden."}
                </p>
                {isOwnProfile && (
                  <Link to="/dashboard">
                    <Button className="mt-4">Erste Lernwelt erstellen</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worlds.map((world, index) => (
                  <WorldGalleryCard
                    key={world.id}
                    world={{
                      ...world,
                      profiles: {
                        display_name: profile?.display_name || null,
                        avatar_url: profile?.avatar_url || null,
                      },
                    }}
                    rating={worldRatings[world.id]}
                    index={index}
                    hideCreator
                  />
                ))}
              </div>
            )}
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default Profile;
