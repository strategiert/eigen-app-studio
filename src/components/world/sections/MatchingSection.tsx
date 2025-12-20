import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Star, Shuffle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingSectionProps {
  title: string;
  pairs: MatchingPair[];
  subjectColor: string;
  onComplete: (score: number, maxScore: number) => void;
  isCompleted: boolean;
}

interface DraggableItemProps {
  item: string;
  index: number;
  subjectColor: string;
  isMatched: boolean;
  showResults: boolean;
  isCorrect?: boolean;
}

function DraggableItem({ item, subjectColor, isMatched, showResults, isCorrect }: DraggableItemProps) {
  const controls = useDragControls();
  
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "w-full p-4 rounded-xl transition-all border-2 cursor-grab active:cursor-grabbing",
        "flex items-center gap-3 bg-background/50",
        !showResults && "border-border/50 hover:border-primary/50 hover:bg-primary/5",
        showResults && isCorrect && "border-green-500 bg-green-500/10",
        showResults && !isCorrect && "border-red-500 bg-red-500/10"
      )}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        zIndex: 50
      }}
    >
      <div 
        className="touch-none cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
        onPointerDown={(e) => {
          if (!showResults) {
            controls.start(e);
          }
        }}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="text-foreground flex-1">{item}</span>
      {isMatched && !showResults && (
        <div 
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: subjectColor }}
        />
      )}
      {showResults && (
        isCorrect ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        )
      )}
    </Reorder.Item>
  );
}

export function MatchingSection({
  title,
  pairs,
  subjectColor,
  onComplete,
  isCompleted
}: MatchingSectionProps) {
  const [orderedRight, setOrderedRight] = useState(() => 
    [...pairs].sort(() => Math.random() - 0.5).map(p => p.right)
  );
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const shuffleItems = useCallback(() => {
    setOrderedRight(prev => [...prev].sort(() => Math.random() - 0.5));
    setShowResults(false);
    setResults([]);
  }, []);

  const handleCheck = () => {
    // Check each position: is orderedRight[i] the correct match for pairs[i]?
    const newResults = pairs.map((pair, index) => {
      return orderedRight[index] === pair.right;
    });

    setResults(newResults);
    setShowResults(true);
    
    const correctCount = newResults.filter(Boolean).length;
    onComplete(correctCount, pairs.length);
  };

  const handleRetry = () => {
    shuffleItems();
  };

  const score = results.filter(Boolean).length;
  const percentage = pairs.length > 0 ? Math.round((score / pairs.length) * 100) : 0;
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: subjectColor }}
        />
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            {!showResults && (
              <Button
                variant="ghost"
                size="sm"
                onClick={shuffleItems}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Mischen
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Ziehe die rechten Begriffe in die richtige Reihenfolge, sodass sie zu den linken Begriffen passen.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column - fixed */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Begriff
              </p>
              {pairs.map((pair, index) => {
                const isCorrect = showResults && results[index];
                const isIncorrect = showResults && !results[index];

                return (
                  <motion.div
                    key={pair.left}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 flex items-center gap-3",
                      !showResults && "border-border/50 bg-background/50",
                      isCorrect && "border-green-500 bg-green-500/10",
                      isIncorrect && "border-red-500 bg-red-500/10"
                    )}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: subjectColor }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-foreground font-medium">{pair.left}</span>
                    {showResults && (
                      isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 ml-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-auto" />
                      )
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Right column - draggable */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Zuordnung (Drag & Drop)
              </p>
              <Reorder.Group 
                axis="y" 
                values={orderedRight} 
                onReorder={showResults ? () => {} : setOrderedRight}
                className="space-y-3"
              >
                {orderedRight.map((item, index) => (
                  <DraggableItem
                    key={item}
                    item={item}
                    index={index}
                    subjectColor={subjectColor}
                    isMatched={true}
                    showResults={showResults}
                    isCorrect={showResults ? results[index] : undefined}
                  />
                ))}
              </Reorder.Group>
            </div>
          </div>

          {/* Show correct answers after checking */}
          {showResults && score < pairs.length && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50"
            >
              <p className="text-sm font-medium text-foreground mb-2">
                Richtige Zuordnungen:
              </p>
              <div className="space-y-1">
                {pairs.map((pair, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    <span className="font-medium">{index + 1}.</span> {pair.left} → {pair.right}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star 
                        key={starNum}
                        className={cn(
                          "h-8 w-8",
                          starNum <= stars 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {score} von {pairs.length} richtig
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}% korrekt
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nochmal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Check button */}
      {!showResults && (
        <div className="flex justify-end">
          <Button
            onClick={handleCheck}
            style={{ backgroundColor: subjectColor }}
          >
            Überprüfen
          </Button>
        </div>
      )}
    </motion.div>
  );
}
