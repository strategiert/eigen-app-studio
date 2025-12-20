import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { WorldHeader } from '@/components/world/WorldHeader';
import { SectionNavigation } from '@/components/world/SectionNavigation';
import { ModuleRenderer } from '@/components/world/ModuleRenderer';
import { useWorldProgress } from '@/hooks/useWorldProgress';
import { getSubjectTheme, type SubjectType, type MoonPhase } from '@/lib/subjectTheme';
import type { Json } from '@/integrations/supabase/types';

interface LearningWorld {
  id: string;
  title: string;
  poetic_name: string | null;
  subject: SubjectType;
  moon_phase: MoonPhase;
  description: string | null;
  is_public: boolean;
  status: string;
  creator_id: string;
}

interface LearningModule {
  id: string;
  title: string;
  content: string | null;
  module_type: string;
  component_type: string;
  component_data: Json;
  order_index: number;
}

export default function WorldView() {
  const { worldId } = useParams<{ worldId: string }>();
  const [world, setWorld] = useState<LearningWorld | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const {
    progress,
    updateSectionProgress,
    isSectionCompleted
  } = useWorldProgress(worldId || '', modules.length);

  // Fetch world and modules
  useEffect(() => {
    async function fetchWorld() {
      if (!worldId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Fetch world
        const { data: worldData, error: worldError } = await supabase
          .from('learning_worlds')
          .select('*')
          .eq('id', worldId)
          .single();

        if (worldError) {
          if (worldError.code === 'PGRST116') {
            setError('Diese Lernwelt wurde nicht gefunden.');
          } else {
            setError('Fehler beim Laden der Lernwelt.');
          }
          return;
        }

        setWorld(worldData as LearningWorld);

        // Fetch modules (formerly sections)
        const { data: modulesData, error: modulesError } = await supabase
          .from('learning_sections')
          .select('*')
          .eq('world_id', worldId)
          .order('order_index', { ascending: true });

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
        } else {
          // Map database fields to module structure
          const mappedModules = (modulesData || []).map(section => ({
            ...section,
            module_type: section.module_type || 'knowledge'
          }));
          setModules(mappedModules);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Ein unerwarteter Fehler ist aufgetreten.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorld();
  }, [worldId]);

  const theme = useMemo(() => {
    return world ? getSubjectTheme(world.subject) : null;
  }, [world?.subject]);

  const completedModules = useMemo(() => {
    return new Set(
      Object.entries(progress.sections)
        .filter(([_, section]) => section.completed)
        .map(([id]) => id)
    );
  }, [progress.sections]);

  const currentModule = modules[currentModuleIndex];

  const handleModuleComplete = async (moduleId: string, score: number, maxScore: number) => {
    await updateSectionProgress(moduleId, score, maxScore, true);
  };

  const handleNavigate = (index: number) => {
    setCurrentModuleIndex(index);
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Lernwelt wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !world) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {error || 'Lernwelt nicht gefunden'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Die angeforderte Lernwelt existiert nicht oder du hast keinen Zugriff darauf.
          </p>
          <Button asChild>
            <a href="/dashboard">Zum Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  // No modules state
  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <WorldHeader
          title={world.title}
          poeticName={world.poetic_name}
          subject={world.subject}
          moonPhase={world.moon_phase}
          totalStars={0}
          completedSections={0}
          totalSections={0}
        />
        <div className="container mx-auto px-4 py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Diese Lernwelt hat noch keine Inhalte
          </h2>
          <p className="text-muted-foreground">
            Der Ersteller arbeitet noch daran.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: theme?.pattern,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <WorldHeader
        title={world.title}
        poeticName={world.poetic_name}
        subject={world.subject}
        moonPhase={world.moon_phase}
        totalStars={progress.totalStars}
        completedSections={progress.completedSections}
        totalSections={modules.length}
      />

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Module navigation */}
        <SectionNavigation
          sections={modules.map(m => ({
            id: m.id,
            title: m.title,
            componentType: m.component_type,
            moduleType: m.module_type
          }))}
          currentIndex={currentModuleIndex}
          completedSections={completedModules}
          onNavigate={handleNavigate}
          subjectColor={theme?.color || 'hsl(var(--primary))'}
        />

        {/* Current module */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleRenderer
                module={{
                  ...currentModule,
                  component_data: currentModule.component_data as Record<string, unknown>
                }}
                subjectColor={theme?.color || 'hsl(var(--primary))'}
                onComplete={handleModuleComplete}
                onContinue={handleNext}
                isCompleted={isSectionCompleted(currentModule.id)}
                previousScore={progress.sections[currentModule.id]?.score}
                isLastModule={currentModuleIndex === modules.length - 1}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentModuleIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentModuleIndex + 1} / {modules.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={currentModuleIndex === modules.length - 1}
            className="gap-2"
            style={{ backgroundColor: theme?.color }}
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
