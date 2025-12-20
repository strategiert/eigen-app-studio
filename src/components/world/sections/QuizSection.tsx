import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizSectionProps {
  title: string;
  questions: QuizQuestion[];
  subjectColor: string;
  onComplete: (score: number, maxScore: number) => void;
  onContinue?: () => void;
  isCompleted: boolean;
  previousScore?: number;
  isLastModule?: boolean;
}

export function QuizSection({ 
  title, 
  questions, 
  subjectColor, 
  onComplete,
  onContinue,
  isCompleted,
  previousScore,
  isLastModule = false
}: QuizSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      const finalScore = score + (isCorrect ? 1 : 0);
      onComplete(finalScore, questions.length);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((starNum) => (
                <motion.div
                  key={starNum}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: starNum <= stars ? 1 : 0.3, 
                    scale: 1 
                  }}
                  transition={{ delay: starNum * 0.2 }}
                >
                  <Star 
                    className={cn(
                      "h-12 w-12",
                      starNum <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    )}
                  />
                </motion.div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-2">
              {percentage >= 70 ? 'Gut gemacht!' : percentage >= 50 ? 'Weiter üben!' : 'Nicht aufgeben!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              Du hast {finalScore} von {questions.length} Fragen richtig beantwortet ({percentage}%)
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRetry}
                variant="outline"
              >
                Nochmal versuchen
              </Button>
              {onContinue && (
                <Button
                  onClick={onContinue}
                  style={{ backgroundColor: subjectColor }}
                >
                  {isLastModule ? 'Lernwelt abschließen' : 'Weiter'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Frage {currentQuestionIndex + 1} von {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: subjectColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctIndex;
                
                let buttonState = 'default';
                if (showResult) {
                  if (isCorrectAnswer) buttonState = 'correct';
                  else if (isSelected && !isCorrectAnswer) buttonState = 'incorrect';
                } else if (isSelected) {
                  buttonState = 'selected';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all border-2",
                      "flex items-center gap-4",
                      buttonState === 'default' && "border-border/50 bg-background/50 hover:border-border hover:bg-background/80",
                      buttonState === 'selected' && "border-primary bg-primary/10",
                      buttonState === 'correct' && "border-green-500 bg-green-500/20",
                      buttonState === 'incorrect' && "border-red-500 bg-red-500/20"
                    )}
                    whileHover={!showResult ? { scale: 1.01 } : undefined}
                    whileTap={!showResult ? { scale: 0.99 } : undefined}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                        buttonState === 'default' && "bg-muted text-muted-foreground",
                        buttonState === 'selected' && "bg-primary text-primary-foreground",
                        buttonState === 'correct' && "bg-green-500 text-white",
                        buttonState === 'incorrect' && "bg-red-500 text-white"
                      )}
                    >
                      {showResult && isCorrectAnswer ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showResult && isSelected && !isCorrectAnswer ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50"
              >
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Erklärung:</strong> {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button
            onClick={handleConfirm}
            disabled={selectedAnswer === null}
            style={{ backgroundColor: subjectColor }}
          >
            Prüfen
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            style={{ backgroundColor: subjectColor }}
            className="gap-2"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Weiter
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              'Ergebnis anzeigen'
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
