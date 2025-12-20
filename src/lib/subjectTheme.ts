import { 
  Calculator, 
  BookOpen, 
  Globe, 
  FlaskConical, 
  Music, 
  Palette, 
  Dumbbell, 
  History, 
  Languages, 
  Laptop, 
  Church, 
  Sparkles,
  type LucideIcon
} from "lucide-react";

export type SubjectType = 
  | 'mathe' 
  | 'deutsch' 
  | 'englisch' 
  | 'sachunterricht' 
  | 'naturwissenschaften' 
  | 'geschichte' 
  | 'geografie' 
  | 'musik' 
  | 'kunst' 
  | 'sport' 
  | 'religion' 
  | 'informatik' 
  | 'allgemein';

export type MoonPhase = 'neumond' | 'zunehmend' | 'vollmond' | 'abnehmend';

interface SubjectTheme {
  color: string;
  colorVariable: string;
  icon: LucideIcon;
  label: string;
  pattern: string;
  animation: string;
}

interface MoonPhaseInfo {
  label: string;
  difficulty: number;
  emoji: string;
  description: string;
}

const subjectThemes: Record<SubjectType, SubjectTheme> = {
  mathe: {
    color: 'hsl(var(--subject-math))',
    colorVariable: '--subject-math',
    icon: Calculator,
    label: 'Mathematik',
    pattern: 'radial-gradient(circle at 20% 80%, hsl(var(--subject-math) / 0.1) 0%, transparent 50%)',
    animation: 'animate-pulse-slow'
  },
  deutsch: {
    color: 'hsl(var(--subject-german))',
    colorVariable: '--subject-german',
    icon: BookOpen,
    label: 'Deutsch',
    pattern: 'linear-gradient(135deg, hsl(var(--subject-german) / 0.05) 0%, transparent 100%)',
    animation: 'animate-float'
  },
  englisch: {
    color: 'hsl(var(--subject-english))',
    colorVariable: '--subject-english',
    icon: Languages,
    label: 'Englisch',
    pattern: 'radial-gradient(ellipse at top right, hsl(var(--subject-english) / 0.1) 0%, transparent 60%)',
    animation: 'animate-float'
  },
  sachunterricht: {
    color: 'hsl(var(--subject-science))',
    colorVariable: '--subject-science',
    icon: Globe,
    label: 'Sachunterricht',
    pattern: 'radial-gradient(circle at bottom left, hsl(var(--subject-science) / 0.1) 0%, transparent 50%)',
    animation: 'animate-pulse-slow'
  },
  naturwissenschaften: {
    color: 'hsl(var(--subject-nature))',
    colorVariable: '--subject-nature',
    icon: FlaskConical,
    label: 'Naturwissenschaften',
    pattern: 'linear-gradient(180deg, hsl(var(--subject-nature) / 0.08) 0%, transparent 100%)',
    animation: 'animate-glow'
  },
  geschichte: {
    color: 'hsl(var(--subject-history))',
    colorVariable: '--subject-history',
    icon: History,
    label: 'Geschichte',
    pattern: 'radial-gradient(circle at center, hsl(var(--subject-history) / 0.08) 0%, transparent 70%)',
    animation: 'animate-pulse-slow'
  },
  geografie: {
    color: 'hsl(var(--subject-geography))',
    colorVariable: '--subject-geography',
    icon: Globe,
    label: 'Geografie',
    pattern: 'radial-gradient(ellipse at bottom, hsl(var(--subject-geography) / 0.1) 0%, transparent 60%)',
    animation: 'animate-float'
  },
  musik: {
    color: 'hsl(var(--subject-music))',
    colorVariable: '--subject-music',
    icon: Music,
    label: 'Musik',
    pattern: 'linear-gradient(45deg, hsl(var(--subject-music) / 0.05) 0%, transparent 100%)',
    animation: 'animate-pulse-slow'
  },
  kunst: {
    color: 'hsl(var(--subject-art))',
    colorVariable: '--subject-art',
    icon: Palette,
    label: 'Kunst',
    pattern: 'radial-gradient(circle at top left, hsl(var(--subject-art) / 0.12) 0%, transparent 50%)',
    animation: 'animate-glow'
  },
  sport: {
    color: 'hsl(var(--subject-sport))',
    colorVariable: '--subject-sport',
    icon: Dumbbell,
    label: 'Sport',
    pattern: 'linear-gradient(90deg, hsl(var(--subject-sport) / 0.05) 0%, transparent 100%)',
    animation: 'animate-float'
  },
  religion: {
    color: 'hsl(var(--subject-religion))',
    colorVariable: '--subject-religion',
    icon: Church,
    label: 'Religion/Ethik',
    pattern: 'radial-gradient(circle at top, hsl(var(--subject-religion) / 0.1) 0%, transparent 60%)',
    animation: 'animate-pulse-slow'
  },
  informatik: {
    color: 'hsl(var(--subject-computer))',
    colorVariable: '--subject-computer',
    icon: Laptop,
    label: 'Informatik',
    pattern: 'linear-gradient(135deg, hsl(var(--subject-computer) / 0.08) 0%, transparent 100%)',
    animation: 'animate-glow'
  },
  allgemein: {
    color: 'hsl(var(--moon))',
    colorVariable: '--moon',
    icon: Sparkles,
    label: 'Allgemein',
    pattern: 'radial-gradient(circle at center, hsl(var(--moon) / 0.1) 0%, transparent 60%)',
    animation: 'animate-twinkle'
  }
};

const moonPhases: Record<MoonPhase, MoonPhaseInfo> = {
  neumond: {
    label: 'Neumond',
    difficulty: 1,
    emoji: '🌑',
    description: 'Einfach – Perfekt zum Starten'
  },
  zunehmend: {
    label: 'Zunehmend',
    difficulty: 2,
    emoji: '🌓',
    description: 'Mittel – Schon anspruchsvoller'
  },
  vollmond: {
    label: 'Vollmond',
    difficulty: 3,
    emoji: '🌕',
    description: 'Schwer – Für Fortgeschrittene'
  },
  abnehmend: {
    label: 'Abnehmend',
    difficulty: 4,
    emoji: '🌗',
    description: 'Experte – Die größte Herausforderung'
  }
};

export function getSubjectTheme(subject: SubjectType): SubjectTheme {
  return subjectThemes[subject] || subjectThemes.allgemein;
}

export function getMoonPhaseInfo(phase: MoonPhase): MoonPhaseInfo {
  return moonPhases[phase] || moonPhases.neumond;
}

export function getSubjectIcon(subject: SubjectType): LucideIcon {
  return subjectThemes[subject]?.icon || Sparkles;
}

export function getSubjectColor(subject: SubjectType): string {
  return subjectThemes[subject]?.color || 'hsl(var(--moon))';
}

export function getSubjectLabel(subject: SubjectType): string {
  return subjectThemes[subject]?.label || 'Allgemein';
}

export function calculateStarsFromScore(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
}
