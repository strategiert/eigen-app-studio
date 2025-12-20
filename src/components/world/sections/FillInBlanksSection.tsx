import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FillInBlanksItem {
  text: string;
  blanks: string[];
}

interface FillInBlanksSectionProps {
  title: string;
  items: FillInBlanksItem[];
  subjectColor: string;
  onComplete: (score: number, maxScore: number) => void;
  isCompleted: boolean;
}

export function FillInBlanksSection({
  title,
  items,
  subjectColor,
  onComplete,
  isCompleted
}: FillInBlanksSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Parse text and find blank positions
  const parsedItems = useMemo(() => {
    return items.map((item, itemIndex) => {
      const parts: Array<{ type: 'text' | 'blank'; content: string; blankIndex: number }> = [];
      let blankIndex = 0;
      
      // Split by ___ or [blank] patterns
      const regex = /___+|\[blank\]/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(item.text)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: item.text.slice(lastIndex, match.index),
            blankIndex: -1
          });
        }
        parts.push({
          type: 'blank',
          content: item.blanks[blankIndex] || '',
          blankIndex
        });
        blankIndex++;
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < item.text.length) {
        parts.push({
          type: 'text',
          content: item.text.slice(lastIndex),
          blankIndex: -1
        });
      }

      return { parts, itemIndex, totalBlanks: blankIndex };
    });
  }, [items]);

  const totalBlanks = parsedItems.reduce((sum, item) => sum + item.totalBlanks, 0);

  const handleAnswerChange = (itemIndex: number, blankIndex: number, value: string) => {
    const key = `${itemIndex}-${blankIndex}`;
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleCheck = () => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    items.forEach((item, itemIndex) => {
      item.blanks.forEach((correctAnswer, blankIndex) => {
        const key = `${itemIndex}-${blankIndex}`;
        const userAnswer = answers[key]?.trim().toLowerCase() || '';
        const isCorrect = userAnswer === correctAnswer.toLowerCase();
        newResults[key] = isCorrect;
        if (isCorrect) correctCount++;
      });
    });

    setResults(newResults);
    setShowResults(true);
    onComplete(correctCount, totalBlanks);
  };

  const handleRetry = () => {
    setAnswers({});
    setResults({});
    setShowResults(false);
  };

  const score = Object.values(results).filter(Boolean).length;
  const percentage = totalBlanks > 0 ? Math.round((score / totalBlanks) * 100) : 0;
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
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {title}
          </h3>

          <div className="space-y-6">
            {parsedItems.map(({ parts, itemIndex }) => (
              <div 
                key={itemIndex}
                className="flex flex-wrap items-baseline gap-1 text-lg leading-loose"
              >
                {parts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return (
                      <span key={partIndex} className="text-foreground">
                        {part.content}
                      </span>
                    );
                  }

                  const key = `${itemIndex}-${part.blankIndex}`;
                  const isChecked = showResults;
                  const isCorrect = results[key];
                  const correctAnswer = items[itemIndex].blanks[part.blankIndex];

                  return (
                    <span key={partIndex} className="inline-flex items-center gap-1">
                      <Input
                        value={answers[key] || ''}
                        onChange={(e) => handleAnswerChange(itemIndex, part.blankIndex, e.target.value)}
                        disabled={showResults}
                        placeholder="..."
                        className={cn(
                          "w-32 h-8 text-center font-medium inline-block",
                          isChecked && isCorrect && "border-green-500 bg-green-500/10 text-green-400",
                          isChecked && !isCorrect && "border-red-500 bg-red-500/10 text-red-400"
                        )}
                        style={{
                          borderColor: !isChecked ? subjectColor : undefined
                        }}
                      />
                      {isChecked && (
                        <span className="inline-flex items-center">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-green-400">
                                ({correctAnswer})
                              </span>
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
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
                      {score} von {totalBlanks} richtig
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
            disabled={Object.keys(answers).length === 0}
            style={{ backgroundColor: subjectColor }}
          >
            Überprüfen
          </Button>
        </div>
      )}
    </motion.div>
  );
}
