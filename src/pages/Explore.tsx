import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { WorldGalleryCard } from "@/components/explore/WorldGalleryCard";
import { GalleryFilters } from "@/components/explore/GalleryFilters";
import { PageTransition } from "@/components/world/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";

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
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

type SortOption = "newest" | "popular" | "rating" | "forks";

const Explore = () => {
  const [worlds, setWorlds] = useState<PublicWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [worldRatings, setWorldRatings] = useState<Record<string, { average: number; count: number }>>({});

  useEffect(() => {
    fetchWorlds();
  }, [selectedSubject, sortBy]);

  const fetchWorlds = async () => {
    setLoading(true);
    
    let query = supabase
      .from("learning_worlds")
      .select(`
        id, title, description, subject, thumbnail_url, created_at,
        creator_id, fork_count, view_count, poetic_name, visual_theme
      `)
      .eq("is_public", true)
      .eq("status", "published");

    if (selectedSubject !== "all") {
      query = query.eq("subject", selectedSubject as any);
    }

    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "popular":
        query = query.order("view_count", { ascending: false });
        break;
      case "forks":
        query = query.order("fork_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      // Fetch profiles separately to avoid JOIN issues
      const creatorIds = [...new Set(data.map(w => w.creator_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", creatorIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const worldsWithProfiles = data.map(world => ({
        ...world,
        profiles: profilesMap.get(world.creator_id) || null
      }));

      setWorlds(worldsWithProfiles as unknown as PublicWorld[]);
      
      // Fetch ratings for all worlds
      const ratings: Record<string, { average: number; count: number }> = {};
      for (const world of data) {
        const { data: ratingData } = await supabase.rpc("get_world_rating", { world_uuid: world.id });
        if (ratingData && ratingData[0]) {
          ratings[world.id] = {
            average: ratingData[0].average_rating || 0,
            count: Number(ratingData[0].total_ratings) || 0,
          };
        }
      }
      setWorldRatings(ratings);
      
      // Sort by rating if needed
      if (sortBy === "rating") {
        setWorlds(prev => [...prev].sort((a, b) => {
          const ratingA = ratings[a.id]?.average || 0;
          const ratingB = ratings[b.id]?.average || 0;
          return ratingB - ratingA;
        }));
      }
    }
    
    setLoading(false);
  };

  const filteredWorlds = worlds.filter(world =>
    world.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.poetic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subjects = [
    { value: "all", label: "Alle Fächer" },
    { value: "mathematik", label: "Mathematik" },
    { value: "deutsch", label: "Deutsch" },
    { value: "englisch", label: "Englisch" },
    { value: "biologie", label: "Biologie" },
    { value: "physik", label: "Physik" },
    { value: "chemie", label: "Chemie" },
    { value: "geschichte", label: "Geschichte" },
    { value: "geographie", label: "Geographie" },
    { value: "kunst", label: "Kunst" },
    { value: "musik", label: "Musik" },
    { value: "sport", label: "Sport" },
    { value: "informatik", label: "Informatik" },
    { value: "allgemein", label: "Allgemein" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <PageTransition>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Lernwelten entdecken
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Erkunde von der Community erstellte Lernwelten und finde Inspiration für deinen Unterricht
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Lernwelten durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Fach wählen" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Neueste
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Beliebteste
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Beste Bewertung
                  </div>
                </SelectItem>
                <SelectItem value="forks">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Meiste Forks
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Results count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mb-6"
            >
              {filteredWorlds.length} Lernwelt{filteredWorlds.length !== 1 ? "en" : ""} gefunden
            </motion.p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : filteredWorlds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-2">Keine Lernwelten gefunden</h3>
              <p className="text-muted-foreground">
                Versuche andere Suchbegriffe oder Filter
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredWorlds.map((world, index) => (
                <WorldGalleryCard
                  key={world.id}
                  world={world}
                  rating={worldRatings[world.id]}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </PageTransition>
      </main>
    </div>
  );
};

export default Explore;
