import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TextSection } from './sections/TextSection';
import { QuizSection } from './sections/QuizSection';
import { FillInBlanksSection } from './sections/FillInBlanksSection';
import { MatchingSection } from './sections/MatchingSection';
import { ModuleImage } from './ModuleImage';
import type { WorldDesign } from '@/lib/worldDesignTypes';
import { getWorldPrimaryColor, getWorldAccentColor, getWorldTypographyStyles } from '@/lib/worldDesignTypes';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Component {
  componentType: string;
  componentData: Record<string, any>;
}

interface ComponentData {
  components?: Component[];
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer?: number;
    correctIndex?: number;
    explanation?: string;
  }>;
  items?: Array<{
    text: string;
    blanks: string[];
  }>;
  pairs?: Array<{
    left: string;
    right: string;
  }>;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  content: string | null;
  module_type: string;
  component_type: string;
  component_data: ComponentData;
  image_url?: string | null;
  image_prompt?: string | null;
}

interface ModuleRendererProps {
  module: Module;
  subjectColor: string;
  worldId: string;
  subject: string;
  worldDesign: WorldDesign | null;
  onComplete: (moduleId: string, score: number, maxScore: number) => void;
  onContinue: () => void;
  isCompleted: boolean;
  previousScore?: number;
  isLastModule?: boolean;
  isCreator?: boolean;
}

export function ModuleRenderer({
  module,
  subjectColor,
  worldId,
  subject,
  worldDesign,
  onComplete,
  onContinue,
  isCompleted,
  previousScore,
  isLastModule = false,
  isCreator = false
}: ModuleRendererProps) {
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [componentScores, setComponentScores] = useState<Map<number, { score: number; maxScore: number }>>(new Map());

  // Use world-specific colors from AI-generated design
  const primaryColor = getWorldPrimaryColor(worldDesign);
  const accentColor = getWorldAccentColor(worldDesign);
  const typography = getWorldTypographyStyles(worldDesign);

  // Get module design from worldDesign if available
  const moduleDesigns = worldDesign?.moduleDesigns || [];
  const currentModuleDesign = moduleDesigns.find(md => 
    md.title.toLowerCase() === module.title.toLowerCase()
  ) || moduleDesigns[0];
  
  // Module type labels in German
  const moduleTypeLabels: Record<string, string> = {
    discovery: 'Entdecken',
    knowledge: 'Wissen',
    practice: 'Üben',
    reflection: 'Reflektieren',
    challenge: 'Herausforderung'
  };

  const moduleTypeLabel = moduleTypeLabels[module.module_type] || 'Wissen';

  const moduleType = module.module_type || 'knowledge';

  // Module-specific visual styles
  const moduleTypeStyles: Record<string, {
    gradient: string;
    icon: string;
    borderStyle: string;
  }> = {
    discovery: {
      gradient: 'linear-gradient(135deg, ${primaryColor}15, ${accentColor}15)',
      icon: '🔍',
      borderStyle: 'dashed'
    },
    knowledge: {
      gradient: 'linear-gradient(135deg, ${primaryColor}10, transparent)',
      icon: '📚',
      borderStyle: 'solid'
    },
    practice: {
      gradient: 'linear-gradient(135deg, ${accentColor}20, ${primaryColor}10)',
      icon: '✏️',
      borderStyle: 'solid'
    },
    reflection: {
      gradient: 'linear-gradient(135deg, ${primaryColor}08, ${accentColor}08)',
      icon: '💭',
      borderStyle: 'double'
    },
    challenge: {
      gradient: 'linear-gradient(135deg, ${accentColor}25, ${primaryColor}15)',
      icon: '⚡',
      borderStyle: 'solid'
    }
  };

  const currentStyle = moduleTypeStyles[moduleType] || moduleTypeStyles.knowledge;

  // Get components from the module
  const components: Component[] = useMemo(() => {
    // Multi-component module
    if (module.component_type === 'multi' && module.component_data?.components) {
      return module.component_data.components as Component[];
    }
    
    // Legacy single component - wrap it
    return [{
      componentType: module.component_type,
      componentData: module.component_data as Record<string, any>
    }];
  }, [module]);

  const currentComponent = components[currentComponentIndex];
  const totalComponents = components.length;
  const completedComponents = componentScores.size;

  // Handle component completion - NO auto-advance, let user control pace
  const handleComponentComplete = (score: number, maxScore: number) => {
    const newScores = new Map(componentScores);
    newScores.set(currentComponentIndex, { score, maxScore });
    setComponentScores(newScores);

    // If all components are done, complete the module
    if (newScores.size === totalComponents) {
      const totalScore = Array.from(newScores.values()).reduce((sum, s) => sum + s.score, 0);
      const totalMaxScore = Array.from(newScores.values()).reduce((sum, s) => sum + s.maxScore, 0);
      onComplete(module.id, totalScore, totalMaxScore);
    }
    // User navigates manually via "Weiter" button - no auto-advance
  };

  // Handle advancing to next component or module
  const handleComponentContinue = () => {
    if (currentComponentIndex < totalComponents - 1) {
      setCurrentComponentIndex(currentComponentIndex + 1);
    } else {
      onContinue();
    }
  };

  // Render a single component
  const renderComponent = (component: Component, index: number) => {
    const componentData = component.componentData as Record<string, unknown>;
    const isComponentCompleted = componentScores.has(index) || isCompleted;

    switch (component.componentType) {
      case 'text':
        return (
          <TextSection
            title=""
            content={(componentData.content as string) || module.content || ''}
            subjectColor={subjectColor}
            onComplete={() => handleComponentComplete(1, 1)}
            isCompleted={isComponentCompleted}
          />
        );

      case 'quiz':
        const isLastComponent = index === totalComponents - 1;
        const rawQuestions = (componentData.questions as Array<{
          question: string;
          options: string[];
          correctAnswer?: number;
          correctIndex?: number;
          explanation?: string;
        }>) || [];
        // Normalize questions to use correctIndex
        const questions: QuizQuestion[] = rawQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex ?? q.correctAnswer ?? 0,
          explanation: q.explanation
        }));
        return (
          <QuizSection
            title=""
            questions={questions}
            subjectColor={subjectColor}
            onComplete={(score, maxScore) => handleComponentComplete(score, maxScore)}
            onContinue={handleComponentContinue}
            isCompleted={isComponentCompleted}
            previousScore={previousScore}
            isLastModule={isLastModule && isLastComponent}
          />
        );

      case 'fill-in-blanks':
        const items = (componentData.items as Array<{ text: string; blanks: string[] }>) || [];
        return (
          <FillInBlanksSection
            title=""
            items={items}
            subjectColor={subjectColor}
            onComplete={(score, maxScore) => handleComponentComplete(score, maxScore)}
            isCompleted={isComponentCompleted}
          />
        );

      case 'matching':
        const pairs = (componentData.pairs as Array<{ left: string; right: string }>) || [];
        return (
          <MatchingSection
            title=""
            pairs={pairs}
            subjectColor={subjectColor}
            onComplete={(score, maxScore) => handleComponentComplete(score, maxScore)}
            isCompleted={isComponentCompleted}
          />
        );

      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>Unbekannter Komponententyp: {component.componentType}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Module Header - uses world-specific colors and module-specific styles */}
      <div
        className="rounded-xl p-4"
        style={{
          borderColor: primaryColor,
          borderWidth: '2px',
          borderStyle: currentStyle.borderStyle,
          background: currentStyle.gradient
            .replace('${primaryColor}', primaryColor)
            .replace('${accentColor}', accentColor)
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg text-2xl"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            {currentStyle.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                {moduleTypeLabel}
              </Badge>
              {isCompleted && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
            <h2
              className="text-xl font-semibold text-foreground mt-1"
              style={{
                fontFamily: typography.headingFont,
                fontWeight: typography.headingWeight,
                letterSpacing: typography.headingLetterSpacing
              }}
            >
              {currentModuleDesign?.title || module.title}
            </h2>
            {currentModuleDesign?.visualFocus && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {currentModuleDesign.visualFocus}
              </p>
            )}
          </div>
        </div>

        {/* Component Progress (for multi-component modules) */}
        {totalComponents > 1 && (
          <div className="mt-4 flex items-center gap-2">
            {components.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-all duration-300",
                  idx < completedComponents
                    ? "bg-green-500"
                    : idx === currentComponentIndex
                    ? "bg-primary"
                    : "bg-muted"
                )}
                style={idx === currentComponentIndex ? { backgroundColor: primaryColor } : {}}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {completedComponents}/{totalComponents}
            </span>
          </div>
        )}
      </div>

      {/* Module Image */}
      <ModuleImage
        imageUrl={module.image_url}
        imagePrompt={module.image_prompt}
        sectionId={module.id}
        worldId={worldId}
        subject={subject}
        moduleTitle={module.title}
        moduleContent={module.content}
        subjectColor={subjectColor}
        canGenerate={isCreator}
      />

      {/* Module Content */}
      {module.content && !currentComponent?.componentData?.content && (
        <div
          className="prose prose-sm max-w-none text-muted-foreground px-4"
          style={{
            fontFamily: typography.bodyFont,
            lineHeight: typography.bodyLineHeight
          }}
        >
          <p>{module.content}</p>
        </div>
      )}

      {/* Current Component */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${module.id}-${currentComponentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderComponent(currentComponent, currentComponentIndex)}
        </motion.div>
      </AnimatePresence>

      {/* Component Navigation (for multi-component modules) */}
      {totalComponents > 1 && completedComponents > currentComponentIndex && currentComponentIndex < totalComponents - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setCurrentComponentIndex(currentComponentIndex + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent"
            style={{ color: primaryColor }}
          >
            Weiter zur nächsten Aufgabe
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
