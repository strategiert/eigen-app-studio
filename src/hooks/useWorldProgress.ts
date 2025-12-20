import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateStarsFromScore } from '@/lib/subjectTheme';

interface SectionProgress {
  sectionId: string;
  completed: boolean;
  score: number;
  starsCollected: number;
  attempts: number;
}

interface WorldProgress {
  worldId: string;
  totalStars: number;
  completedSections: number;
  totalSections: number;
  lastAccessed: Date;
  sections: Record<string, SectionProgress>;
}

const STORAGE_KEY_PREFIX = 'meoluna_progress_';

export function useWorldProgress(worldId: string, totalSections: number) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WorldProgress>({
    worldId,
    totalStars: 0,
    completedSections: 0,
    totalSections,
    lastAccessed: new Date(),
    sections: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from Supabase or localStorage
  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true);
      
      if (user) {
        // Logged in user: load from Supabase
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('world_id', worldId)
          .eq('user_id', user.id);

        if (!error && data) {
          const sections: Record<string, SectionProgress> = {};
          let totalStars = 0;
          let completedCount = 0;

          data.forEach(record => {
            if (record.section_id) {
              sections[record.section_id] = {
                sectionId: record.section_id,
                completed: record.completed,
                score: record.score || 0,
                starsCollected: record.stars_collected,
                attempts: record.attempts
              };
              totalStars += record.stars_collected;
              if (record.completed) completedCount++;
            }
          });

          setProgress({
            worldId,
            totalStars,
            completedSections: completedCount,
            totalSections,
            lastAccessed: new Date(),
            sections
          });
        }
      } else {
        // Anonymous user: load from localStorage
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${worldId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProgress({
              ...parsed,
              totalSections,
              lastAccessed: new Date()
            });
          } catch {
            // Invalid stored data, use default
          }
        }
      }
      
      setIsLoading(false);
    }

    loadProgress();
  }, [worldId, user, totalSections]);

  // Save progress to localStorage for anonymous users
  const saveToLocalStorage = useCallback((newProgress: WorldProgress) => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${worldId}`,
      JSON.stringify(newProgress)
    );
  }, [worldId]);

  // Update section progress
  const updateSectionProgress = useCallback(async (
    sectionId: string,
    score: number,
    maxScore: number,
    completed: boolean
  ) => {
    const stars = calculateStarsFromScore(score, maxScore);
    const existingSection = progress.sections[sectionId];
    const newAttempts = (existingSection?.attempts || 0) + 1;
    
    // Only update if better score or first attempt
    const shouldUpdate = !existingSection || score > existingSection.score;
    
    if (!shouldUpdate && existingSection?.completed) {
      return progress.sections[sectionId];
    }

    const sectionProgress: SectionProgress = {
      sectionId,
      completed,
      score: shouldUpdate ? score : existingSection?.score || 0,
      starsCollected: shouldUpdate ? stars : existingSection?.starsCollected || 0,
      attempts: newAttempts
    };

    const newSections = {
      ...progress.sections,
      [sectionId]: sectionProgress
    };

    // Calculate totals
    let totalStars = 0;
    let completedCount = 0;
    Object.values(newSections).forEach(section => {
      totalStars += section.starsCollected;
      if (section.completed) completedCount++;
    });

    const newProgress: WorldProgress = {
      ...progress,
      sections: newSections,
      totalStars,
      completedSections: completedCount,
      lastAccessed: new Date()
    };

    setProgress(newProgress);

    if (user) {
      // Save to Supabase
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          world_id: worldId,
          section_id: sectionId,
          completed,
          score: sectionProgress.score,
          stars_collected: sectionProgress.starsCollected,
          attempts: newAttempts,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,world_id,section_id'
        });

      if (error) {
        console.error('Failed to save progress:', error);
      }
    } else {
      // Save to localStorage
      saveToLocalStorage(newProgress);
    }

    return sectionProgress;
  }, [progress, user, worldId, saveToLocalStorage]);

  // Get progress for a specific section
  const getSectionProgress = useCallback((sectionId: string): SectionProgress | undefined => {
    return progress.sections[sectionId];
  }, [progress.sections]);

  // Check if section is completed
  const isSectionCompleted = useCallback((sectionId: string): boolean => {
    return progress.sections[sectionId]?.completed || false;
  }, [progress.sections]);

  // Get completion percentage
  const getCompletionPercentage = useCallback((): number => {
    if (totalSections === 0) return 0;
    return Math.round((progress.completedSections / totalSections) * 100);
  }, [progress.completedSections, totalSections]);

  return {
    progress,
    isLoading,
    updateSectionProgress,
    getSectionProgress,
    isSectionCompleted,
    getCompletionPercentage
  };
}
