import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StarField } from "@/components/landing/StarField";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WorldCard } from "@/components/dashboard/WorldCard";
import { CreateWorldDialog } from "@/components/dashboard/CreateWorldDialog";
import { UpgradeToCreatorCard } from "@/components/dashboard/UpgradeToCreatorCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type LearningWorld = Database["public"]["Tables"]["learning_worlds"]["Row"];

const Dashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [worlds, setWorlds] = useState<LearningWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWorlds();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    setProfile(data);
  };

  const fetchWorlds = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("learning_worlds")
        .select("*")
        .eq("creator_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setWorlds(data || []);
    } catch (error) {
      console.error("Error fetching worlds:", error);
      toast({
        title: "Fehler",
        description: "Konnte Lernwelten nicht laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorld = async () => {
    if (!worldToDelete) return;

    try {
      const { error } = await supabase
        .from("learning_worlds")
        .delete()
        .eq("id", worldToDelete);

      if (error) throw error;

      setWorlds(worlds.filter((w) => w.id !== worldToDelete));
      toast({
        title: "Lernwelt gelöscht",
        description: "Die Lernwelt wurde erfolgreich entfernt.",
      });
    } catch (error) {
      console.error("Error deleting world:", error);
      toast({
        title: "Fehler",
        description: "Konnte Lernwelt nicht löschen.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setWorldToDelete(null);
    }
  };

  const filteredWorlds = worlds.filter((world) => {
    const matchesSearch =
      world.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      world.poetic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      world.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      filterSubject === "all" || world.subject === filterSubject;

    return matchesSearch && matchesSubject;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-moon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero relative">
      <StarField />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-aurora blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <DashboardHeader
          userName={profile?.display_name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterSubject={filterSubject}
          onFilterChange={setFilterSubject}
          onCreateClick={() => setCreateDialogOpen(true)}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-moon" />
          </div>
        ) : role !== "creator" && role !== "admin" ? (
          <UpgradeToCreatorCard onUpgraded={() => window.location.reload()} />
        ) : filteredWorlds.length === 0 ? (
          worlds.length === 0 ? (
            <EmptyState onCreateClick={() => setCreateDialogOpen(true)} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground">
                Keine Lernwelten gefunden für deine Suche.
              </p>
            </motion.div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorlds.map((world) => (
              <WorldCard
                key={world.id}
                world={world}
                onEdit={(id) => navigate(`/world/${id}/edit`)}
                onDelete={(id) => {
                  setWorldToDelete(id);
                  setDeleteDialogOpen(true);
                }}
                onView={(id) => navigate(`/w/${id}`)}
                onWorldUpdated={fetchWorlds}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWorldDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onWorldCreated={fetchWorlds}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lernwelt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Inhalte
              und der Fortschritt der Schüler werden gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorld}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
