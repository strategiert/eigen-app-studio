import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarProgressProps {
  totalStars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export function StarProgress({
  totalStars,
  maxStars = 15,
  size = 'md',
  showLabel = true,
  animate = true
}: StarProgressProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const containerPadding = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  // Calculate filled stars (max 5 display stars)
  const filledStars = Math.min(Math.floor(totalStars / 3), 5);
  const partialFill = (totalStars % 3) / 3;

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full",
        containerPadding[size]
      )}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={animate ? { scale: 0, rotate: -180 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: animate ? 0.1 + i * 0.08 : 0,
              type: 'spring',
              stiffness: 300,
              damping: 15
            }}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-300",
                i < filledStars
                  ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                  : i === filledStars && partialFill > 0
                  ? "text-yellow-400/50 fill-yellow-400/30"
                  : "text-muted-foreground/30"
              )}
              style={
                i === filledStars && partialFill > 0
                  ? { 
                      clipPath: `inset(0 ${(1 - partialFill) * 100}% 0 0)`,
                      position: 'relative'
                    }
                  : undefined
              }
            />
          </motion.div>
        ))}
      </div>

      {showLabel && (
        <motion.span
          className="text-sm font-medium text-muted-foreground"
          initial={animate ? { opacity: 0, x: -10 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {totalStars} <span className="hidden sm:inline">Sterne</span>
        </motion.span>
      )}
    </motion.div>
  );
}

// Animated star burst for achievements
export function StarBurst({ 
  count = 3, 
  onComplete 
}: { 
  count?: number; 
  onComplete?: () => void;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const distance = 80 + Math.random() * 40;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              scale: 0, 
              x: 0, 
              y: 0,
              rotate: 0
            }}
            animate={{ 
              scale: [0, 1.5, 0.8, 0],
              x: Math.cos(angle * Math.PI / 180) * distance,
              y: Math.sin(angle * Math.PI / 180) * distance,
              rotate: 360
            }}
            transition={{ 
              duration: 1,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            onAnimationComplete={i === count - 1 ? onComplete : undefined}
            className="absolute"
          >
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
          </motion.div>
        );
      })}
      
      {/* Central sparkle */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 3], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.6 }}
      >
        <Sparkles className="h-12 w-12 text-yellow-300" />
      </motion.div>
    </div>
  );
}

// Floating star animation for background
export function FloatingStars({ count = 8 }: { count?: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            scale: 0.3 + Math.random() * 0.5
          }}
          animate={{
            y: [null, `${Math.random() * 100}%`],
            opacity: [null, 0.1, 0.5, 0.2]
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        >
          <Star 
            className="text-yellow-400/30 fill-yellow-400/20" 
            style={{ 
              width: 8 + Math.random() * 16,
              height: 8 + Math.random() * 16
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
