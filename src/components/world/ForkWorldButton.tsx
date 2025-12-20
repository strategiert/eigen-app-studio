import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitFork, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ForkWorldButtonProps {
  worldId: string;
  worldTitle: string;
  userId: string;
  className?: string;
}

export const ForkWorldButton = ({ worldId, worldTitle, userId, className }: ForkWorldButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(`${worldTitle} (Kopie)`);
  const [isForking, setIsForking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFork = async () => {
    setIsForking(true);

    try {
      // 1. Fetch original world
      const { data: originalWorld, error: fetchError } = await supabase
        .from("learning_worlds")
        .select("*")
        .eq("id", worldId)
        .single();

      if (fetchError || !originalWorld) {
        throw new Error("Konnte Originalwelt nicht laden");
      }

      // 2. Create forked world
      const { data: forkedWorld, error: createError } = await supabase
        .from("learning_worlds")
        .insert({
          title: newTitle.trim(),
          subject: originalWorld.subject,
          description: originalWorld.description,
          source_content: originalWorld.source_content,
          visual_theme: originalWorld.visual_theme,
          poetic_name: originalWorld.poetic_name,
          moon_phase: originalWorld.moon_phase,
          creator_id: userId,
          forked_from_id: worldId,
          status: "draft",
          is_public: false,
        })
        .select()
        .single();

      if (createError || !forkedWorld) {
        throw new Error("Konnte Kopie nicht erstellen");
      }

      // 3. Copy sections
      const { data: sections, error: sectionsError } = await supabase
        .from("learning_sections")
        .select("*")
        .eq("world_id", worldId)
        .order("order_index");

      if (!sectionsError && sections) {
        for (const section of sections) {
          await supabase.from("learning_sections").insert({
            world_id: forkedWorld.id,
            title: section.title,
            content: section.content,
            component_type: section.component_type,
            component_data: section.component_data,
            module_type: section.module_type,
            image_url: section.image_url,
            image_prompt: section.image_prompt,
            order_index: section.order_index,
          });
        }
      }

      // 4. Increment fork count on original
      await supabase.rpc("increment_fork_count", { world_uuid: worldId });

      toast({
        title: "Lernwelt kopiert!",
        description: "Du kannst sie jetzt bearbeiten und anpassen.",
      });

      setIsOpen(false);
      navigate(`/world/${forkedWorld.id}/edit`);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Kopieren fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsForking(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <GitFork className="h-4 w-4 mr-2" />
        Als Vorlage nutzen
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lernwelt als Vorlage nutzen</DialogTitle>
            <DialogDescription>
              Erstelle eine Kopie dieser Lernwelt, die du frei bearbeiten kannst.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="newTitle">Titel der Kopie</Label>
            <Input
              id="newTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleFork} disabled={isForking || !newTitle.trim()}>
              {isForking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kopiere...
                </>
              ) : (
                <>
                  <GitFork className="h-4 w-4 mr-2" />
                  Kopieren
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
