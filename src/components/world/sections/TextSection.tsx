import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DOMPurify from 'dompurify';

interface TextSectionProps {
  title: string;
  content: string;
  subjectColor: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export function TextSection({ 
  title, 
  content, 
  subjectColor, 
  onComplete,
  isCompleted 
}: TextSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: subjectColor }}
        />
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${subjectColor}20` }}
            >
              <BookOpen 
                className="h-6 w-6" 
                style={{ color: subjectColor }} 
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground pt-2">
              {title}
            </h2>
          </div>

          <div className="prose prose-invert max-w-none">
            <div 
              className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(content.replace(/\n/g, '<br/>'), {
                  ALLOWED_TAGS: ['br', 'b', 'strong', 'i', 'em', 'u', 'p', 'span'],
                  ALLOWED_ATTR: []
                })
              }}
            />
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button
          onClick={onComplete}
          disabled={isCompleted}
          size="lg"
          className="gap-2"
          style={{ 
            backgroundColor: isCompleted ? undefined : subjectColor,
            borderColor: subjectColor
          }}
        >
          {isCompleted ? (
            <>
              <Check className="h-5 w-5" />
              Gelesen
            </>
          ) : (
            <>
              <BookOpen className="h-5 w-5" />
              Als gelesen markieren
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
