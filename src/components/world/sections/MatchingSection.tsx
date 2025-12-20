import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Star, Shuffle } from 'lucide-react';
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

export function MatchingSection({
  title,
  pairs,
  subjectColor,
  onComplete,
  isCompleted
}: MatchingSectionProps) {
  const [shuffledRight, setShuffledRight] = useState(() => 
    [...pairs].sort(() => Math.random() - 0.5).map(p => p.right)
  );
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  const shuffleRight = useCallback(() => {
    setShuffledRight(prev => [...prev].sort(() => Math.random() - 0.5));
    setMatches({});
    setSelectedLeft(null);
    setShowResults(false);
    setResults({});
  }, []);

  const handleLeftClick = (index: number) => {
    if (showResults) return;
    setSelectedLeft(index === selectedLeft ? null : index);
  };

  const handleRightClick = (index: number) => {
    if (showResults || selectedLeft === null) return;
    
    // Check if this right item is already matched
    const existingMatch = Object.entries(matches).find(([_, rightIdx]) => rightIdx === index);
    if (existingMatch) {
      // Remove the existing match
      const newMatches = { ...matches };
      delete newMatches[Number(existingMatch[0])];
      setMatches(newMatches);
    }

    // Create new match
    setMatches(prev => ({ ...prev, [selectedLeft]: index }));
    setSelectedLeft(null);
  };

  const handleCheck = () => {
    const newResults: Record<number, boolean> = {};
    
    pairs.forEach((pair, leftIndex) => {
      const matchedRightIndex = matches[leftIndex];
      if (matchedRightIndex !== undefined) {
        const matchedRight = shuffledRight[matchedRightIndex];
        newResults[leftIndex] = matchedRight === pair.right;
      } else {
        newResults[leftIndex] = false;
      }
    });

    setResults(newResults);
    setShowResults(true);
    
    const correctCount = Object.values(newResults).filter(Boolean).length;
    onComplete(correctCount, pairs.length);
  };

  const handleRetry = () => {
    shuffleRight();
  };

  const getMatchedRightIndex = (leftIndex: number) => matches[leftIndex];
  const isRightMatched = (rightIndex: number) => Object.values(matches).includes(rightIndex);
  const getLeftIndexForRight = (rightIndex: number) => 
    Object.entries(matches).find(([_, rIdx]) => rIdx === rightIndex)?.[0];

  const score = Object.values(results).filter(Boolean).length;
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
                onClick={shuffleRight}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Mischen
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Begriff
              </p>
              {pairs.map((pair, index) => {
                const matchedRightIndex = getMatchedRightIndex(index);
                const hasMatch = matchedRightIndex !== undefined;
                const isSelected = selectedLeft === index;
                const isCorrect = showResults && results[index];
                const isIncorrect = showResults && !results[index];

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleLeftClick(index)}
                    disabled={showResults}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all border-2",
                      "flex items-center justify-between gap-2",
                      !showResults && !isSelected && !hasMatch && "border-border/50 bg-background/50 hover:border-border",
                      !showResults && isSelected && "border-primary bg-primary/10",
                      !showResults && hasMatch && !isSelected && "border-muted bg-muted/50",
                      isCorrect && "border-green-500 bg-green-500/10",
                      isIncorrect && "border-red-500 bg-red-500/10"
                    )}
                    whileHover={!showResults ? { scale: 1.01 } : undefined}
                    whileTap={!showResults ? { scale: 0.99 } : undefined}
                  >
                    <span className="text-foreground font-medium">{pair.left}</span>
                    {showResults && (
                      isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )
                    )}
                    {hasMatch && !showResults && (
                      <div 
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: subjectColor }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Zuordnung
              </p>
              <AnimatePresence mode="popLayout">
                {shuffledRight.map((right, index) => {
                  const matched = isRightMatched(index);
                  const leftIndex = getLeftIndexForRight(index);
                  const isCorrect = showResults && leftIndex !== undefined && results[Number(leftIndex)];
                  const isIncorrect = showResults && leftIndex !== undefined && !results[Number(leftIndex)];

                  return (
                    <motion.button
                      key={right}
                      layout
                      onClick={() => handleRightClick(index)}
                      disabled={showResults}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all border-2",
                        "flex items-center justify-between gap-2",
                        !showResults && !matched && "border-border/50 bg-background/50 hover:border-border",
                        !showResults && matched && "border-muted bg-muted/50",
                        !showResults && selectedLeft !== null && !matched && "hover:border-primary hover:bg-primary/5",
                        isCorrect && "border-green-500 bg-green-500/10",
                        isIncorrect && "border-red-500 bg-red-500/10"
                      )}
                      whileHover={!showResults && selectedLeft !== null ? { scale: 1.01 } : undefined}
                      whileTap={!showResults && selectedLeft !== null ? { scale: 0.99 } : undefined}
                    >
                      <span className="text-foreground">{right}</span>
                      {matched && !showResults && (
                        <div 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: subjectColor }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
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
                    {pair.left} → {pair.right}
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
            disabled={Object.keys(matches).length !== pairs.length}
            style={{ backgroundColor: subjectColor }}
          >
            Überprüfen
          </Button>
        </div>
      )}
    </motion.div>
  );
}
