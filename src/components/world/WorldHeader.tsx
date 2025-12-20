import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StarProgress } from './StarProgress';
import { RestModeToggle } from './RestModeToggle';
import { 
  getSubjectTheme, 
  getMoonPhaseInfo, 
  type SubjectType, 
  type MoonPhase 
} from '@/lib/subjectTheme';

interface WorldHeaderProps {
  title: string;
  poeticName?: string | null;
  subject: SubjectType;
  moonPhase: MoonPhase;
  totalStars: number;
  completedSections: number;
  totalSections: number;
}

export function WorldHeader({
  title,
  poeticName,
  subject,
  moonPhase,
  totalStars,
  completedSections,
  totalSections
}: WorldHeaderProps) {
  const theme = getSubjectTheme(subject);
  const phaseInfo = getMoonPhaseInfo(moonPhase);
  const SubjectIcon = theme.icon;
  const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/50"
      style={{ 
        background: `linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background) / 0.9))`
      }}
    >
      {/* Subject color bar */}
      <motion.div 
        className="h-1 w-full"
        style={{ backgroundColor: theme.color }}
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
              {/* Star Progress */}
              <StarProgress 
                totalStars={totalStars} 
                size="sm"
                showLabel={false}
              />

              {/* Moon phase / difficulty */}
              <motion.div 
                className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-base sm:text-lg">{phaseInfo.emoji}</span>
                <span className="hidden md:inline text-xs sm:text-sm">
                  {phaseInfo.label}
                </span>
              </motion.div>

              {/* Rest Mode Toggle */}
              <RestModeToggle className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>

          {/* Title row - Mobile optimized */}
          <div className="flex items-start gap-3 sm:gap-4">
            <motion.div 
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"
              style={{ backgroundColor: `${theme.color}20` }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <SubjectIcon 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                style={{ color: theme.color }} 
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {title}
              </motion.h1>
              {poeticName && (
                <motion.p 
                  className="text-xs sm:text-sm truncate"
                  style={{ color: theme.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  {poeticName}
                </motion.p>
              )}
            </div>
          </div>

          {/* Progress bar - Mobile optimized */}
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
            <Progress 
              value={progress} 
              className="h-1.5 sm:h-2"
              style={{
                // @ts-ignore - CSS custom property
                '--progress-color': theme.color
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
