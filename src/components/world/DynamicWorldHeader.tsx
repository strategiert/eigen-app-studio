import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StarProgress } from './StarProgress';
import { RestModeToggle } from './RestModeToggle';
import type { WorldDesign } from '@/lib/worldDesignTypes';
import { getWorldPrimaryColor, getWorldTypographyStyles } from '@/lib/worldDesignTypes';

interface DynamicWorldHeaderProps {
  title: string;
  poeticName?: string | null;
  worldDesign: WorldDesign | null;
  totalStars: number;
  completedSections: number;
  totalSections: number;
}

/**
 * World header that uses AI-generated design instead of subject-based themes
 */
export function DynamicWorldHeader({
  title,
  poeticName,
  worldDesign,
  totalStars,
  completedSections,
  totalSections
}: DynamicWorldHeaderProps) {
  const primaryColor = getWorldPrimaryColor(worldDesign);
  const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  const typography = getWorldTypographyStyles(worldDesign);

  // Get mood-based styling
  const mood = worldDesign?.visualIdentity?.mood || 'playful';
  const era = worldDesign?.visualIdentity?.era || 'modern';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50"
      style={{ 
        background: `linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background) / 0.9))`
      }}
    >
      {/* World-unique color bar instead of subject color */}
      <motion.div 
        className="h-1 w-full"
        style={{ backgroundColor: primaryColor }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top row: Back button and stats */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 sm:gap-2 -ml-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Zurück</span>
              </Link>
            </Button>

            {/* Stats */}
            <div className="flex items-center gap-2 sm:gap-4">
              <StarProgress 
                totalStars={totalStars} 
                size="sm"
                showLabel={false}
              />
              
              {/* Mood/Era indicator instead of moon phase */}
              <motion.div 
                className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs sm:text-sm capitalize">
                  {mood} · {era}
                </span>
              </motion.div>

              <RestModeToggle className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>

          {/* Title row */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Dynamic world icon using primary color */}
            <motion.div 
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"
              style={{ backgroundColor: `${primaryColor}20` }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <div 
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                style={{ backgroundColor: primaryColor }} 
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h1
                className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate"
                style={{
                  fontFamily: typography.headingFont,
                  fontWeight: typography.headingWeight,
                  letterSpacing: typography.headingLetterSpacing
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {title}
              </motion.h1>
              {/* Show poetic name OR tagline from world concept */}
              {(poeticName || worldDesign?.worldConcept?.tagline) && (
                <motion.p 
                  className="text-xs sm:text-sm truncate"
                  style={{ color: primaryColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  {poeticName || worldDesign?.worldConcept?.tagline}
                </motion.p>
              )}
            </div>
          </div>

          {/* Progress bar with world-unique color */}
          <motion.div 
            className="space-y-1 sm:space-y-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
              <span>{completedSections}/{totalSections} Abschnitte</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
