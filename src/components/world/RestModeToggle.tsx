import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRestMode } from '@/hooks/useRestMode';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RestModeToggleProps {
  className?: string;
}

export function RestModeToggle({ className }: RestModeToggleProps) {
  const { isRestMode, toggleRestMode } = useRestMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRestMode}
            className={cn(
              "relative rounded-full transition-all duration-500",
              isRestMode 
                ? "bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300" 
                : "bg-secondary hover:bg-secondary/80",
              className
            )}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isRestMode ? 360 : 0, scale: isRestMode ? 1.1 : 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {isRestMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </motion.div>
            
            {/* Animated glow for rest mode */}
            {isRestMode && (
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            {isRestMode ? 'Ruhemodus deaktivieren' : 'Ruhemodus aktivieren'}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Larger toggle for settings or prominent placement
export function RestModeCard() {
  const { isRestMode, toggleRestMode } = useRestMode();

  return (
    <motion.button
      onClick={toggleRestMode}
      className={cn(
        "relative w-full p-4 rounded-xl border transition-all duration-500",
        "flex items-center gap-4",
        isRestMode
          ? "bg-indigo-950/30 border-indigo-800/50 text-indigo-100"
          : "bg-card border-border hover:bg-accent/50"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className={cn(
        "p-3 rounded-xl transition-colors duration-300",
        isRestMode 
          ? "bg-indigo-900/50" 
          : "bg-secondary"
      )}>
        <motion.div
          animate={{ rotate: isRestMode ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {isRestMode ? (
            <Moon className="h-5 w-5 text-indigo-300" />
          ) : (
            <Sun className="h-5 w-5 text-foreground" />
          )}
        </motion.div>
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <h3 className={cn(
          "font-medium transition-colors",
          isRestMode ? "text-indigo-100" : "text-foreground"
        )}>
          Ruhemodus
        </h3>
        <p className={cn(
          "text-sm transition-colors",
          isRestMode ? "text-indigo-300/80" : "text-muted-foreground"
        )}>
          {isRestMode 
            ? 'Entspanntes Lernen mit gedämpften Farben' 
            : 'Aktivieren für entspanntes Lernen'
          }
        </p>
      </div>

      {/* Toggle indicator */}
      <div className={cn(
        "w-12 h-6 rounded-full relative transition-colors duration-300",
        isRestMode ? "bg-indigo-600" : "bg-muted"
      )}>
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ x: isRestMode ? 26 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>

      {/* Floating stars in rest mode */}
      {isRestMode && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                y: [0, -20, -40],
                x: [0, (i - 1) * 20, (i - 1) * 30]
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 1
              }}
              style={{ left: `${30 + i * 20}%`, bottom: '50%' }}
            >
              <Sparkles className="h-3 w-3 text-indigo-300" />
            </motion.div>
          ))}
        </>
      )}
    </motion.button>
  );
}
