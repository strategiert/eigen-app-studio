import { motion } from 'framer-motion';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorldDesign } from '@/lib/worldDesignTypes';
import { getWorldPrimaryColor, getWorldAccentColor } from '@/lib/worldDesignTypes';

interface Section {
  id: string;
  title: string;
  componentType: string;
  moduleType?: string;
}

interface DynamicSectionNavigationProps {
  sections: Section[];
  currentIndex: number;
  completedSections: Set<string>;
  onNavigate: (index: number) => void;
  worldDesign: WorldDesign | null;
}

/**
 * Section navigation that uses AI-generated design instead of hardcoded module type colors
 */
export function DynamicSectionNavigation({
  sections,
  currentIndex,
  completedSections,
  onNavigate,
  worldDesign
}: DynamicSectionNavigationProps) {
  const primaryColor = getWorldPrimaryColor(worldDesign);
  const accentColor = getWorldAccentColor(worldDesign);
  
  // Get module designs from worldDesign to use their titles
  const moduleDesigns = worldDesign?.moduleDesigns || [];

  return (
    <nav className="overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
      <motion.div 
        className="flex gap-1.5 sm:gap-2 min-w-max"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          const isCurrent = index === currentIndex;
          const isAccessible = index <= currentIndex || isCompleted || sections.slice(0, index).every(s => completedSections.has(s.id));
          
          // Use AI-generated module title if available
          const moduleDesign = moduleDesigns[index];
          const displayTitle = moduleDesign?.title || section.title;

          return (
            <motion.button
              key={section.id}
              onClick={() => isAccessible && onNavigate(index)}
              disabled={!isAccessible}
              className={cn(
                "relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all",
                "border-2 min-w-[80px] sm:min-w-[120px] justify-center",
                !isCurrent && isCompleted && "border-green-500/50 bg-green-500/10 text-green-400",
                !isCurrent && !isCompleted && isAccessible && "border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-background/80",
                !isAccessible && "border-border/30 bg-background/30 text-muted-foreground/50 cursor-not-allowed"
              )}
              style={isCurrent ? { 
                borderColor: primaryColor, 
                backgroundColor: `${primaryColor}15`, 
                color: primaryColor 
              } : undefined}
              whileHover={isAccessible ? { scale: 1.02 } : undefined}
              whileTap={isAccessible ? { scale: 0.98 } : undefined}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Status indicator using world colors instead of module type icons */}
              <motion.span 
                className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                initial={isCompleted ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : !isAccessible ? (
                  <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                ) : (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isCurrent ? primaryColor : accentColor }}
                  />
                )}
              </motion.span>

              {/* AI-generated title */}
              <span className="truncate max-w-[60px] sm:max-w-[100px] hidden xs:inline">
                {displayTitle}
              </span>

              {/* Index on very small screens */}
              <span className="xs:hidden">
                {index + 1}
              </span>

              {/* Current indicator */}
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}
