import { motion } from 'framer-motion';
import { Check, Lock, ChevronRight, Search, BookOpen, Pencil, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODULE_TYPE_ICONS = {
  discovery: Search,
  knowledge: BookOpen,
  practice: Pencil,
  reflection: Brain,
  challenge: Zap
} as const;

const MODULE_TYPE_COLORS = {
  discovery: 'hsl(45, 93%, 47%)',
  knowledge: 'hsl(210, 79%, 46%)',
  practice: 'hsl(142, 71%, 45%)',
  reflection: 'hsl(280, 65%, 60%)',
  challenge: 'hsl(16, 90%, 50%)'
} as const;

interface Section {
  id: string;
  title: string;
  componentType: string;
  moduleType?: string;
}

interface SectionNavigationProps {
  sections: Section[];
  currentIndex: number;
  completedSections: Set<string>;
  onNavigate: (index: number) => void;
  subjectColor: string;
}

export function SectionNavigation({
  sections,
  currentIndex,
  completedSections,
  onNavigate,
  subjectColor
}: SectionNavigationProps) {
  return (
    <nav className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isAccessible = index <= currentIndex || isCompleted || sections.slice(0, index).every(s => completedSections.has(s.id));
          
          const moduleType = (section.moduleType || 'knowledge') as keyof typeof MODULE_TYPE_ICONS;
          const ModuleIcon = MODULE_TYPE_ICONS[moduleType] || BookOpen;
          const moduleColor = MODULE_TYPE_COLORS[moduleType] || subjectColor;

          return (
            <motion.button
              key={section.id}
              onClick={() => isAccessible && onNavigate(index)}
              disabled={!isAccessible}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                "border-2 min-w-[120px] justify-center",
                isCurrent && "border-primary bg-primary/10 text-primary",
                !isCurrent && isCompleted && "border-green-500/50 bg-green-500/10 text-green-400",
                !isCurrent && !isCompleted && isAccessible && "border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-background/80",
                !isAccessible && "border-border/30 bg-background/30 text-muted-foreground/50 cursor-not-allowed"
              )}
              style={isCurrent ? { borderColor: moduleColor, backgroundColor: `${moduleColor}15`, color: moduleColor } : undefined}
              whileHover={isAccessible ? { scale: 1.02 } : undefined}
              whileTap={isAccessible ? { scale: 0.98 } : undefined}
            >
              {/* Module type icon */}
              <span className="w-5 h-5 flex items-center justify-center">
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : !isAccessible ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <ModuleIcon className="h-4 w-4" style={isCurrent ? { color: moduleColor } : undefined} />
                )}
              </span>

              {/* Title */}
              <span className="truncate max-w-[100px]">
                {section.title}
              </span>

              {/* Current indicator */}
              {isCurrent && (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
