// World-specific visual theme system for unique learning worlds

export interface WorldVisualTheme {
  // Primary mood color (HEX)
  primaryHue: number;
  // Color saturation (0-100)
  saturation: number;
  // Overall mood
  mood: 'warm' | 'cool' | 'mystical' | 'playful' | 'serious' | 'natural';
  // Historical era feeling
  era: 'ancient' | 'medieval' | 'renaissance' | 'modern' | 'futuristic' | 'timeless';
  // Visual style hint for images
  styleHint: string;
  // Background pattern style
  patternStyle: 'geometric' | 'organic' | 'abstract' | 'historical' | 'scientific';
  // Accent color hue
  accentHue: number;
}

export const defaultWorldTheme: WorldVisualTheme = {
  primaryHue: 250,
  saturation: 70,
  mood: 'playful',
  era: 'modern',
  styleHint: 'Freundlich und einladend',
  patternStyle: 'abstract',
  accentHue: 45
};

export function getWorldGradient(theme: WorldVisualTheme): string {
  const { primaryHue, saturation, mood } = theme;
  
  switch (mood) {
    case 'warm':
      return `linear-gradient(135deg, hsl(${primaryHue} ${saturation}% 20%) 0%, hsl(${primaryHue + 20} ${saturation - 10}% 15%) 100%)`;
    case 'cool':
      return `linear-gradient(180deg, hsl(${primaryHue} ${saturation}% 12%) 0%, hsl(${primaryHue - 20} ${saturation}% 8%) 100%)`;
    case 'mystical':
      return `linear-gradient(135deg, hsl(${primaryHue} ${saturation}% 15%) 0%, hsl(${primaryHue + 60} ${saturation - 20}% 10%) 50%, hsl(${primaryHue + 120} ${saturation - 30}% 12%) 100%)`;
    case 'natural':
      return `linear-gradient(180deg, hsl(${primaryHue} ${saturation - 20}% 18%) 0%, hsl(${primaryHue + 10} ${saturation - 10}% 12%) 100%)`;
    case 'serious':
      return `linear-gradient(180deg, hsl(${primaryHue} ${saturation - 40}% 15%) 0%, hsl(${primaryHue} ${saturation - 50}% 8%) 100%)`;
    default:
      return `linear-gradient(135deg, hsl(${primaryHue} ${saturation}% 15%) 0%, hsl(${primaryHue + 30} ${saturation}% 10%) 100%)`;
  }
}

export function getWorldPattern(theme: WorldVisualTheme): string {
  const { primaryHue, saturation, patternStyle } = theme;
  
  switch (patternStyle) {
    case 'geometric':
      return `
        radial-gradient(circle at 20% 80%, hsl(${primaryHue} ${saturation}% 50% / 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, hsl(${primaryHue + 30} ${saturation}% 50% / 0.06) 0%, transparent 40%)
      `;
    case 'organic':
      return `
        radial-gradient(ellipse at 10% 90%, hsl(${primaryHue} ${saturation - 20}% 40% / 0.1) 0%, transparent 60%),
        radial-gradient(ellipse at 90% 10%, hsl(${primaryHue + 40} ${saturation}% 50% / 0.08) 0%, transparent 50%)
      `;
    case 'historical':
      return `
        radial-gradient(circle at 50% 50%, hsl(${primaryHue} ${saturation - 30}% 30% / 0.12) 0%, transparent 70%),
        linear-gradient(180deg, hsl(${primaryHue} ${saturation - 40}% 20% / 0.05) 0%, transparent 100%)
      `;
    case 'scientific':
      return `
        repeating-linear-gradient(0deg, transparent, transparent 50px, hsl(${primaryHue} ${saturation}% 50% / 0.03) 50px, hsl(${primaryHue} ${saturation}% 50% / 0.03) 51px),
        repeating-linear-gradient(90deg, transparent, transparent 50px, hsl(${primaryHue} ${saturation}% 50% / 0.03) 50px, hsl(${primaryHue} ${saturation}% 50% / 0.03) 51px)
      `;
    default:
      return `radial-gradient(circle at center, hsl(${primaryHue} ${saturation}% 50% / 0.08) 0%, transparent 60%)`;
  }
}

export function getWorldAccentColor(theme: WorldVisualTheme): string {
  return `hsl(${theme.accentHue} ${theme.saturation}% 55%)`;
}

export function getWorldPrimaryColor(theme: WorldVisualTheme): string {
  return `hsl(${theme.primaryHue} ${theme.saturation}% 55%)`;
}

// Map subject to recommended theme defaults
export function getSubjectThemeDefaults(subject: string): Partial<WorldVisualTheme> {
  const subjectMappings: Record<string, Partial<WorldVisualTheme>> = {
    mathematik: { primaryHue: 220, mood: 'cool', era: 'modern', patternStyle: 'geometric', saturation: 80 },
    deutsch: { primaryHue: 350, mood: 'warm', era: 'timeless', patternStyle: 'organic', saturation: 70 },
    englisch: { primaryHue: 200, mood: 'playful', era: 'modern', patternStyle: 'abstract', saturation: 75 },
    biologie: { primaryHue: 140, mood: 'natural', era: 'timeless', patternStyle: 'organic', saturation: 65 },
    physik: { primaryHue: 270, mood: 'mystical', era: 'futuristic', patternStyle: 'scientific', saturation: 75 },
    chemie: { primaryHue: 30, mood: 'warm', era: 'modern', patternStyle: 'scientific', saturation: 80 },
    geschichte: { primaryHue: 25, mood: 'warm', era: 'medieval', patternStyle: 'historical', saturation: 55 },
    geografie: { primaryHue: 160, mood: 'natural', era: 'timeless', patternStyle: 'organic', saturation: 60 },
    kunst: { primaryHue: 320, mood: 'playful', era: 'renaissance', patternStyle: 'abstract', saturation: 75 },
    musik: { primaryHue: 280, mood: 'mystical', era: 'timeless', patternStyle: 'abstract', saturation: 70 },
    sport: { primaryHue: 15, mood: 'warm', era: 'modern', patternStyle: 'geometric', saturation: 85 },
    informatik: { primaryHue: 200, mood: 'cool', era: 'futuristic', patternStyle: 'geometric', saturation: 80 },
    religion: { primaryHue: 35, mood: 'mystical', era: 'ancient', patternStyle: 'historical', saturation: 50 },
    allgemein: { primaryHue: 250, mood: 'playful', era: 'modern', patternStyle: 'abstract', saturation: 70 }
  };

  return subjectMappings[subject] || subjectMappings.allgemein;
}
