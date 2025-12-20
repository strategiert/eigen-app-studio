import { TextSection } from './sections/TextSection';
import { QuizSection } from './sections/QuizSection';
import { FillInBlanksSection } from './sections/FillInBlanksSection';
import { MatchingSection } from './sections/MatchingSection';

interface ComponentData {
  questions?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
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
}

interface Section {
  id: string;
  title: string;
  content: string | null;
  component_type: string;
  component_data: ComponentData;
}

interface SectionRendererProps {
  section: Section;
  subjectColor: string;
  onComplete: (sectionId: string, score: number, maxScore: number) => void;
  isCompleted: boolean;
  previousScore?: number;
}

export function SectionRenderer({
  section,
  subjectColor,
  onComplete,
  isCompleted,
  previousScore
}: SectionRendererProps) {
  const handleComplete = (score: number = 1, maxScore: number = 1) => {
    onComplete(section.id, score, maxScore);
  };

  switch (section.component_type) {
    case 'text':
      return (
        <TextSection
          title={section.title}
          content={section.content || ''}
          subjectColor={subjectColor}
          onComplete={() => handleComplete(1, 1)}
          isCompleted={isCompleted}
        />
      );

    case 'quiz':
      const quizQuestions = section.component_data?.questions || [];
      return (
        <QuizSection
          title={section.title}
          questions={quizQuestions}
          subjectColor={subjectColor}
          onComplete={(score, maxScore) => handleComplete(score, maxScore)}
          isCompleted={isCompleted}
          previousScore={previousScore}
        />
      );

    case 'fill-in-blanks':
      const fillItems = section.component_data?.items || [];
      return (
        <FillInBlanksSection
          title={section.title}
          items={fillItems}
          subjectColor={subjectColor}
          onComplete={(score, maxScore) => handleComplete(score, maxScore)}
          isCompleted={isCompleted}
        />
      );

    case 'matching':
      const matchingPairs = section.component_data?.pairs || [];
      return (
        <MatchingSection
          title={section.title}
          pairs={matchingPairs}
          subjectColor={subjectColor}
          onComplete={(score, maxScore) => handleComplete(score, maxScore)}
          isCompleted={isCompleted}
        />
      );

    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>Unbekannter Komponententyp: {section.component_type}</p>
        </div>
      );
  }
}
