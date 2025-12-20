import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { WorldHeader } from '@/components/world/WorldHeader';
import { SectionNavigation } from '@/components/world/SectionNavigation';
import { ModuleRenderer } from '@/components/world/ModuleRenderer';
import { CompletionCelebration, StarCollectAnimation } from '@/components/world/CompletionCelebration';
import { FloatingStars } from '@/components/world/StarProgress';
import { PageTransition } from '@/components/world/PageTransition';
import { RatingWidget } from '@/components/ratings/RatingWidget';
import { RatingDisplay } from '@/components/ratings/RatingDisplay';
import { ForkWorldButton } from '@/components/world/ForkWorldButton';
import { CreatorBadge } from '@/components/world/CreatorBadge';
import { useWorldProgress } from '@/hooks/useWorldProgress';
import { useAuth } from '@/hooks/useAuth';
import { getSubjectTheme, type SubjectType, type MoonPhase } from '@/lib/subjectTheme';
import { type WorldVisualTheme, getWorldGradient, getWorldPattern, defaultWorldTheme } from '@/lib/worldTheme';
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
  visual_theme: WorldVisualTheme | null;
}

interface LearningModule {
  id: string;
  title: string;
  content: string | null;
  module_type: string;
  component_type: string;
  component_data: Json;
  order_index: number;
  image_url: string | null;
  image_prompt: string | null;
}

export default function WorldView() {
  const { worldId } = useParams<{ worldId: string }>();
  const { user } = useAuth();
  const [world, setWorld] = useState<LearningWorld | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'section' | 'world'>('section');
  const [showStars, setShowStars] = useState(false);
  const [lastEarnedStars, setLastEarnedStars] = useState(0);
  const [creatorProfile, setCreatorProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [worldRating, setWorldRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [existingUserRating, setExistingUserRating] = useState<number | undefined>(undefined);

  const {
    progress,
    updateSectionProgress,
    isSectionCompleted
  } = useWorldProgress(worldId || '', modules.length);

  const isCreator = user?.id === world?.creator_id;

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

        setWorld({
          ...worldData,
          visual_theme: worldData.visual_theme as unknown as WorldVisualTheme | null
        } as LearningWorld);

        // Fetch creator profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', worldData.creator_id)
          .maybeSingle();
        
        setCreatorProfile(profileData);

        // Fetch world rating
        const { data: ratingData } = await supabase.rpc('get_world_rating', { world_uuid: worldId });
        if (ratingData && ratingData[0]) {
          setWorldRating({
            average: ratingData[0].average_rating || 0,
            count: Number(ratingData[0].total_ratings) || 0
          });
        }

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

  // Fetch existing user rating
  useEffect(() => {
    async function fetchUserRating() {
      if (!worldId || !user) return;
      
      const { data } = await supabase
        .from('world_ratings')
        .select('rating')
        .eq('world_id', worldId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setExistingUserRating(data.rating);
      }
    }
    
    fetchUserRating();
  }, [worldId, user]);

  const handleRatingSubmit = () => {
    // Refresh rating after submission
    supabase.rpc('get_world_rating', { world_uuid: worldId! }).then(({ data }) => {
      if (data && data[0]) {
        setWorldRating({
          average: data[0].average_rating || 0,
          count: Number(data[0].total_ratings) || 0
        });
      }
    });
  };

  const subjectTheme = useMemo(() => {
    return world ? getSubjectTheme(world.subject) : null;
  }, [world?.subject]);

  const visualTheme = useMemo(() => {
    return world?.visual_theme || defaultWorldTheme;
  }, [world?.visual_theme]);

  const worldBackground = useMemo(() => {
    if (!visualTheme) return undefined;
    return getWorldGradient(visualTheme);
  }, [visualTheme]);

  const worldPattern = useMemo(() => {
    if (!visualTheme) return undefined;
    return getWorldPattern(visualTheme);
  }, [visualTheme]);

  const completedModules = useMemo(() => {
    return new Set(
      Object.entries(progress.sections)
        .filter(([_, section]) => section.completed)
        .map(([id]) => id)
    );
  }, [progress.sections]);

  const currentModule = modules[currentModuleIndex];

  const handleModuleComplete = async (moduleId: string, score: number, maxScore: number) => {
    const wasCompleted = isSectionCompleted(moduleId);
    await updateSectionProgress(moduleId, score, maxScore, true);
    
    // Calculate stars earned (1 star per correct answer, max 5)
    const starsEarned = Math.min(Math.round((score / maxScore) * 5), 5);
    
    if (!wasCompleted && starsEarned > 0) {
      setLastEarnedStars(starsEarned);
      setShowStars(true);
    }

    // Check if this was the last module
    const allCompleted = modules.every(m => 
      m.id === moduleId || isSectionCompleted(m.id)
    );
    
    if (allCompleted) {
      setCelebrationType('world');
      setShowCelebration(true);
    } else if (!wasCompleted) {
      setCelebrationType('section');
      setShowCelebration(true);
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </motion.div>
          <p className="text-muted-foreground text-sm sm:text-base">Lernwelt wird geladen...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !world) {
    return (
      <PageTransition className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {error || 'Lernwelt nicht gefunden'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Die angeforderte Lernwelt existiert nicht oder du hast keinen Zugriff darauf.
          </p>
          <Button asChild>
            <a href="/dashboard">Zum Dashboard</a>
          </Button>
        </div>
      </PageTransition>
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
      className="min-h-screen relative"
      style={{
        background: worldBackground,
        backgroundImage: worldPattern,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Floating stars background */}
      <FloatingStars count={6} />

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

      {/* Creator info and actions bar */}
      <div className="container mx-auto px-3 sm:px-4 py-4 relative z-10">
        <motion.div 
          className="flex flex-wrap items-center justify-between gap-4 bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Link to={`/profile/${world.creator_id}`}>
              <CreatorBadge
                creatorId={world.creator_id}
                displayName={creatorProfile?.display_name}
                avatarUrl={creatorProfile?.avatar_url}
              />
            </Link>
            <RatingDisplay average={worldRating.average} count={worldRating.count} />
          </div>
          
          {world.is_public && !isCreator && user && (
            <ForkWorldButton
              worldId={world.id}
              worldTitle={world.title}
              userId={user.id}
            />
          )}
        </motion.div>
      </div>

      {/* Main content - Mobile optimized */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
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
          subjectColor={subjectTheme?.color || 'hsl(var(--primary))'}
        />

        {/* Current module */}
        <div className="mt-4 sm:mt-8">
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
                subjectColor={subjectTheme?.color || 'hsl(var(--primary))'}
                worldId={worldId || ''}
                subject={world.subject}
                onComplete={handleModuleComplete}
                onContinue={handleNext}
                isCompleted={isSectionCompleted(currentModule.id)}
                previousScore={progress.sections[currentModule.id]?.score}
                isLastModule={currentModuleIndex === modules.length - 1}
                isCreator={isCreator}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons - Mobile optimized */}
        <motion.div 
          className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentModuleIndex === 0}
            size="sm"
            className="gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>

          <motion.span 
            className="text-xs sm:text-sm text-muted-foreground font-medium"
            key={currentModuleIndex}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {currentModuleIndex + 1} / {modules.length}
          </motion.span>

          <Button
            onClick={handleNext}
            disabled={currentModuleIndex === modules.length - 1}
            size="sm"
            className="gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4"
            style={{ backgroundColor: subjectTheme?.color }}
          >
            <span className="hidden sm:inline">Weiter</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Rating Widget - Show after navigation for non-creators */}
        {user && !isCreator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <RatingWidget
              worldId={worldId!}
              userId={user.id}
              existingRating={existingUserRating}
              onRatingSubmit={handleRatingSubmit}
            />
          </motion.div>
        )}
      </main>

      {/* Celebration animations */}
      <CompletionCelebration
        show={showCelebration}
        type={celebrationType}
        stars={progress.totalStars}
        onComplete={() => setShowCelebration(false)}
      />

      <StarCollectAnimation
        show={showStars}
        count={lastEarnedStars}
        onComplete={() => setShowStars(false)}
      />
    </div>
  );
}
