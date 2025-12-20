import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: theme.color }}
      />

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Top row: Back button and stats */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 -ml-2"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Zurück</span>
              </Link>
            </Button>

            {/* Stats */}
            <div className="flex items-center gap-4">
              {/* Stars */}
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">
                  {totalStars}
                </span>
              </div>

              {/* Moon phase / difficulty */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-lg">{phaseInfo.emoji}</span>
                <span className="hidden sm:inline text-sm">
                  {phaseInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Title row */}
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl shrink-0"
              style={{ backgroundColor: `${theme.color}20` }}
            >
              <SubjectIcon 
                className="h-6 w-6" 
                style={{ color: theme.color }} 
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                {title}
              </h1>
              {poeticName && (
                <p 
                  className="text-sm truncate"
                  style={{ color: theme.color }}
                >
                  {poeticName}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedSections} von {totalSections} Abschnitten</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                // @ts-ignore - CSS custom property
                '--progress-color': theme.color
              }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
