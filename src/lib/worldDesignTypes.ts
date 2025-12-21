/**
 * Type definitions for AI-generated world designs
 * Each world has a unique design that determines its visual identity
 */

export interface WorldConcept {
  name: string;
  tagline: string;
  narrativeFrame: string;
  atmosphere?: string;
}

export interface VisualIdentity {
  primaryHue: number;
  saturation: number;
  accentHue: number;
  mood: 'warm' | 'cool' | 'mystical' | 'playful' | 'serious' | 'natural';
  era: 'ancient' | 'medieval' | 'renaissance' | 'modern' | 'futuristic' | 'timeless';
  patternStyle: 'geometric' | 'organic' | 'abstract' | 'historical' | 'scientific';
  styleHint: string;
}

export interface ModuleDesign {
  title: string;
  moduleType: 'discovery' | 'knowledge' | 'practice' | 'reflection' | 'challenge';
  visualFocus: string;
  imagePrompt: string;
}

export interface WorldDesign {
  worldConcept: WorldConcept;
  visualIdentity: VisualIdentity;
  moduleDesigns: ModuleDesign[];
  heroImagePrompt: string;
  imagery: {
    keyVisuals: string[];
    colorMeaning: string;
  };
  typography: {
    headingStyle: string;
    bodyStyle: string;
  };
}

/**
 * Parse hue value from legacy HSL string format
 * Example: "hsl(210, 60%, 40%)" -> 210
 */
function parseHueFromHSL(hslString: string | undefined): number | null {
  if (!hslString || typeof hslString !== 'string') return null;
  const match = hslString.match(/hsl\(\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse saturation from legacy HSL string format
 * Example: "hsl(210, 60%, 40%)" -> 60
 */
function parseSaturationFromHSL(hslString: string | undefined): number | null {
  if (!hslString || typeof hslString !== 'string') return null;
  const match = hslString.match(/hsl\(\s*\d+\s*,\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Get safe color values from world design, with fallback for legacy string format
 */
function safeColorValues(design: WorldDesign | null): {
  primaryHue: number;
  saturation: number;
  accentHue: number;
  mood: 'warm' | 'cool' | 'mystical' | 'playful' | 'serious' | 'natural';
  era: 'ancient' | 'medieval' | 'renaissance' | 'modern' | 'futuristic' | 'timeless';
  patternStyle: 'geometric' | 'organic' | 'abstract' | 'historical' | 'scientific';
} {
  const vi = design?.visualIdentity as any;

  // Try primaryHue directly, fallback to parsing primaryColor string
  let primaryHue = typeof vi?.primaryHue === 'number' ? vi.primaryHue : null;
  if (primaryHue === null && vi?.primaryColor) {
    primaryHue = parseHueFromHSL(vi.primaryColor);
  }
  primaryHue = primaryHue ?? 220;

  // Try saturation directly, fallback to parsing from primaryColor string
  let saturation = typeof vi?.saturation === 'number' ? vi.saturation : null;
  if (saturation === null && vi?.primaryColor) {
    saturation = parseSaturationFromHSL(vi.primaryColor);
  }
  saturation = saturation ?? 70;

  // Try accentHue directly, fallback to parsing accentColor string
  let accentHue = typeof vi?.accentHue === 'number' ? vi.accentHue : null;
  if (accentHue === null && vi?.accentColor) {
    accentHue = parseHueFromHSL(vi.accentColor);
  }
  accentHue = accentHue ?? 280;

  return {
    primaryHue,
    saturation,
    accentHue,
    mood: vi?.mood || 'playful',
    era: vi?.era || 'timeless',
    patternStyle: vi?.patternStyle || 'geometric',
  };
}

/**
 * Get CSS variables for a world's unique visual identity
 */
export function getWorldCSSVariables(design: WorldDesign | null): React.CSSProperties {
  if (!design?.visualIdentity) {
    return {};
  }

  const { primaryHue, saturation, accentHue, mood } = safeColorValues(design);

  // Mood-based lightness adjustments
  const baseLightness = mood === 'mystical' ? 35 : mood === 'serious' ? 40 : 45;
  const accentLightness = mood === 'playful' ? 55 : 50;

  return {
    '--world-primary': `hsl(${primaryHue}, ${saturation}%, ${baseLightness}%)`,
    '--world-primary-light': `hsl(${primaryHue}, ${saturation}%, ${baseLightness + 15}%)`,
    '--world-primary-dark': `hsl(${primaryHue}, ${saturation}%, ${baseLightness - 10}%)`,
    '--world-accent': `hsl(${accentHue}, ${saturation}%, ${accentLightness}%)`,
    '--world-accent-light': `hsl(${accentHue}, ${saturation}%, ${accentLightness + 20}%)`,
  } as React.CSSProperties;
}

/**
 * Get the primary color string from a world design
 */
export function getWorldPrimaryColor(design: WorldDesign | null): string {
  if (!design?.visualIdentity) {
    return 'hsl(var(--primary))';
  }
  const { primaryHue, saturation, mood } = safeColorValues(design);
  const lightness = mood === 'mystical' ? 35 : 45;
  return `hsl(${primaryHue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get the accent color string from a world design
 */
export function getWorldAccentColor(design: WorldDesign | null): string {
  if (!design?.visualIdentity) {
    return 'hsl(var(--accent))';
  }
  const { accentHue, saturation, mood } = safeColorValues(design);
  const lightness = mood === 'playful' ? 55 : 50;
  return `hsl(${accentHue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a unique gradient based on world design
 */
export function getWorldGradient(design: WorldDesign | null): string {
  if (!design?.visualIdentity) {
    return 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))';
  }

  const { primaryHue, saturation, accentHue, mood, era } = safeColorValues(design);

  // Era-based gradient angles
  const angle = era === 'ancient' ? 180 : era === 'futuristic' ? 135 : 160;

  // Mood-based lightness
  const startLightness = mood === 'mystical' ? 8 : mood === 'serious' ? 10 : 12;
  const endLightness = mood === 'mystical' ? 15 : mood === 'serious' ? 18 : 20;

  return `linear-gradient(${angle}deg,
    hsl(${primaryHue}, ${saturation * 0.3}%, ${startLightness}%),
    hsl(${accentHue}, ${saturation * 0.2}%, ${endLightness}%))`;
}

/**
 * Generate a pattern overlay based on world design
 */
export function getWorldPattern(design: WorldDesign | null): string {
  if (!design?.visualIdentity) {
    return 'none';
  }

  const { patternStyle, primaryHue, saturation } = safeColorValues(design);
  const patternColor = `hsla(${primaryHue}, ${saturation}%, 50%, 0.03)`;

  switch (patternStyle) {
    case 'geometric':
      return `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 30px,
        ${patternColor} 30px,
        ${patternColor} 31px
      )`;
    case 'organic':
      return `radial-gradient(
        circle at 20% 80%,
        ${patternColor} 0%,
        transparent 50%
      ), radial-gradient(
        circle at 80% 20%,
        ${patternColor} 0%,
        transparent 40%
      )`;
    case 'historical':
      return `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 50px,
        ${patternColor} 50px,
        ${patternColor} 51px
      )`;
    case 'scientific':
      return `linear-gradient(${patternColor} 1px, transparent 1px),
        linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`;
    default:
      return 'none';
  }
}

/**
 * Get typography styles based on world design era and mood
 */
export function getWorldTypographyStyles(design: WorldDesign | null): {
  headingFont: string;
  headingWeight: number;
  headingLetterSpacing: string;
  bodyFont: string;
  bodyLineHeight: string;
} {
  // Default fallback values
  const defaults = {
    headingFont: 'inherit',
    headingWeight: 700,
    headingLetterSpacing: 'normal',
    bodyFont: 'inherit',
    bodyLineHeight: '1.6'
  };

  // Early return if no valid design or visualIdentity
  if (!design?.visualIdentity) {
    return defaults;
  }

  const { era, mood } = safeColorValues(design);

  // Era-based font families
  const eraFonts: Record<string, { heading: string; body: string }> = {
    ancient: {
      heading: 'Georgia, "Times New Roman", serif',
      body: 'Georgia, serif'
    },
    medieval: {
      heading: 'Georgia, "Times New Roman", serif',
      body: 'Georgia, serif'
    },
    renaissance: {
      heading: 'Georgia, Garamond, serif',
      body: 'Georgia, serif'
    },
    modern: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif'
    },
    futuristic: {
      heading: 'ui-rounded, system-ui, sans-serif',
      body: 'system-ui, sans-serif'
    },
    timeless: {
      heading: 'inherit',
      body: 'inherit'
    }
  };

  // Mood-based weight and spacing
  const headingWeight = mood === 'serious' ? 800 : mood === 'playful' ? 600 : 700;
  const headingLetterSpacing = mood === 'serious' ? '-0.02em' : mood === 'playful' ? '0.01em' : 'normal';
  const bodyLineHeight = mood === 'mystical' ? '1.8' : mood === 'playful' ? '1.6' : '1.65';

  // Safe access with fallback to timeless
  const fonts = eraFonts[era] || eraFonts.timeless;

  return {
    headingFont: fonts.heading,
    headingWeight,
    headingLetterSpacing,
    bodyFont: fonts.body,
    bodyLineHeight
  };
}
