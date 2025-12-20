import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, PartyPopper } from 'lucide-react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

interface CompletionCelebrationProps {
  show: boolean;
  type: 'section' | 'world';
  stars?: number;
  onComplete?: () => void;
}

const COLORS = [
  'hsl(45, 93%, 47%)',   // Gold
  'hsl(210, 79%, 46%)',  // Blue
  'hsl(142, 71%, 45%)',  // Green
  'hsl(280, 65%, 60%)',  // Purple
  'hsl(16, 90%, 50%)',   // Orange
  'hsl(340, 82%, 52%)',  // Pink
];

export function CompletionCelebration({
  show,
  type,
  stars = 0,
  onComplete
}: CompletionCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const generateConfetti = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    const count = type === 'world' ? 50 : 25;
    
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360
      });
    }
    
    return pieces;
  }, [type]);

  useEffect(() => {
    if (show) {
      setConfetti(generateConfetti());
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
        setConfetti([]);
        onComplete?.();
      }, type === 'world' ? 4000 : 2500);

      return () => clearTimeout(timer);
    }
  }, [show, type, generateConfetti, onComplete]);

  if (!show && confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Confetti */}
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ 
              top: -20, 
              left: `${piece.x}%`,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              top: '100%',
              rotate: piece.rotation + 360,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5 + Math.random(),
              delay: piece.delay,
              ease: 'linear'
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        ))}
      </AnimatePresence>

      {/* Celebration Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 15,
              stiffness: 200 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border max-w-sm mx-4 text-center">
              {type === 'world' ? (
                <>
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Lernwelt abgeschlossen!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Du hast alle Module gemeistert!
                  </p>
                  {stars > 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-semibold text-foreground">
                        {stars} Sterne gesammelt
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center gap-2 mb-4"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                    <PartyPopper className="h-8 w-8 text-yellow-500" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Super gemacht!
                  </h2>
                  <p className="text-muted-foreground">
                    Weiter zum nächsten Abschnitt!
                  </p>
                  {stars > 0 && (
                    <motion.div 
                      className="flex items-center justify-center gap-1 mt-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Star animation component for collecting stars
export function StarCollectAnimation({ 
  show, 
  count = 1,
  onComplete 
}: { 
  show: boolean; 
  count?: number;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            scale: 0, 
            y: 0,
            x: (i - count / 2) * 30
          }}
          animate={{ 
            scale: [0, 1.5, 1],
            y: -100,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 1.2,
            delay: i * 0.1,
            ease: 'easeOut'
          }}
        >
          <Star className="h-8 w-8 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
        </motion.div>
      ))}
    </div>
  );
}
