import { describe, it, expect } from 'vitest';
import {
  getWorldPrimaryColor,
  getWorldAccentColor,
  getWorldGradient,
  getWorldPattern,
  getWorldTypographyStyles,
  type WorldDesign
} from '../worldDesignTypes';

const mockWorldDesign: WorldDesign = {
  worldConcept: {
    name: 'Test World',
    tagline: 'A test world',
    narrativeFrame: 'This is a test'
  },
  visualIdentity: {
    primaryHue: 210,
    saturation: 70,
    accentHue: 30,
    mood: 'playful',
    era: 'modern',
    patternStyle: 'geometric',
    styleHint: 'Modern and clean'
  },
  moduleDesigns: [],
  heroImagePrompt: 'A beautiful landscape',
  imagery: {
    keyVisuals: ['mountains', 'sky'],
    colorMeaning: 'Blue represents calm'
  },
  typography: {
    headingStyle: 'Bold and modern',
    bodyStyle: 'Clean and readable'
  }
};

describe('getWorldPrimaryColor', () => {
  it('should return primary color based on design', () => {
    const color = getWorldPrimaryColor(mockWorldDesign);
    expect(color).toBe('hsl(210, 70%, 45%)');
  });

  it('should return fallback for null design', () => {
    const color = getWorldPrimaryColor(null);
    expect(color).toBe('hsl(var(--primary))');
  });

  it('should adjust lightness for mystical mood', () => {
    const mysticalDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        mood: 'mystical' as const
      }
    };
    const color = getWorldPrimaryColor(mysticalDesign);
    expect(color).toBe('hsl(210, 70%, 35%)');
  });
});

describe('getWorldAccentColor', () => {
  it('should return accent color based on design', () => {
    const color = getWorldAccentColor(mockWorldDesign);
    expect(color).toBe('hsl(30, 70%, 55%)');
  });

  it('should return fallback for null design', () => {
    const color = getWorldAccentColor(null);
    expect(color).toBe('hsl(var(--accent))');
  });

  it('should adjust lightness for playful mood', () => {
    const color = getWorldAccentColor(mockWorldDesign);
    expect(color).toContain('55%');
  });
});

describe('getWorldGradient', () => {
  it('should return gradient based on design', () => {
    const gradient = getWorldGradient(mockWorldDesign);
    expect(gradient).toContain('linear-gradient');
    expect(gradient).toContain('deg');
  });

  it('should return fallback for null design', () => {
    const gradient = getWorldGradient(null);
    expect(gradient).toBe('linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))');
  });

  it('should adjust angle for ancient era', () => {
    const ancientDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        era: 'ancient' as const
      }
    };
    const gradient = getWorldGradient(ancientDesign);
    expect(gradient).toContain('180deg');
  });

  it('should adjust lightness for mystical mood', () => {
    const mysticalDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        mood: 'mystical' as const
      }
    };
    const gradient = getWorldGradient(mysticalDesign);
    expect(gradient).toBeDefined();
  });
});

describe('getWorldPattern', () => {
  it('should return geometric pattern', () => {
    const pattern = getWorldPattern(mockWorldDesign);
    expect(pattern).toContain('repeating-linear-gradient');
    expect(pattern).toContain('45deg');
  });

  it('should return organic pattern', () => {
    const organicDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        patternStyle: 'organic' as const
      }
    };
    const pattern = getWorldPattern(organicDesign);
    expect(pattern).toContain('radial-gradient');
  });

  it('should return historical pattern', () => {
    const historicalDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        patternStyle: 'historical' as const
      }
    };
    const pattern = getWorldPattern(historicalDesign);
    expect(pattern).toContain('0deg');
  });

  it('should return scientific pattern', () => {
    const scientificDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        patternStyle: 'scientific' as const
      }
    };
    const pattern = getWorldPattern(scientificDesign);
    expect(pattern).toContain('90deg');
  });

  it('should return none for null design', () => {
    const pattern = getWorldPattern(null);
    expect(pattern).toBe('none');
  });
});

describe('getWorldTypographyStyles', () => {
  it('should return modern fonts for modern era', () => {
    const typo = getWorldTypographyStyles(mockWorldDesign);
    expect(typo.headingFont).toContain('system-ui');
    expect(typo.bodyFont).toContain('system-ui');
  });

  it('should return serif fonts for ancient era', () => {
    const ancientDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        era: 'ancient' as const
      }
    };
    const typo = getWorldTypographyStyles(ancientDesign);
    expect(typo.headingFont).toContain('Georgia');
    expect(typo.bodyFont).toContain('Georgia');
  });

  it('should adjust weight for serious mood', () => {
    const seriousDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        mood: 'serious' as const
      }
    };
    const typo = getWorldTypographyStyles(seriousDesign);
    expect(typo.headingWeight).toBe(800);
    expect(typo.headingLetterSpacing).toBe('-0.02em');
  });

  it('should adjust weight for playful mood', () => {
    const typo = getWorldTypographyStyles(mockWorldDesign);
    expect(typo.headingWeight).toBe(600);
    expect(typo.headingLetterSpacing).toBe('0.01em');
    expect(typo.bodyLineHeight).toBe('1.6');
  });

  it('should adjust line height for mystical mood', () => {
    const mysticalDesign = {
      ...mockWorldDesign,
      visualIdentity: {
        ...mockWorldDesign.visualIdentity,
        mood: 'mystical' as const
      }
    };
    const typo = getWorldTypographyStyles(mysticalDesign);
    expect(typo.bodyLineHeight).toBe('1.8');
  });

  it('should return defaults for null design', () => {
    const typo = getWorldTypographyStyles(null);
    expect(typo.headingFont).toBe('inherit');
    expect(typo.headingWeight).toBe(700);
    expect(typo.headingLetterSpacing).toBe('normal');
    expect(typo.bodyFont).toBe('inherit');
    expect(typo.bodyLineHeight).toBe('1.6');
  });

  it('should handle all era types', () => {
    const eras = ['ancient', 'medieval', 'renaissance', 'modern', 'futuristic', 'timeless'] as const;

    eras.forEach(era => {
      const design = {
        ...mockWorldDesign,
        visualIdentity: {
          ...mockWorldDesign.visualIdentity,
          era
        }
      };
      const typo = getWorldTypographyStyles(design);
      expect(typo).toBeDefined();
      expect(typo.headingFont).toBeTruthy();
      expect(typo.bodyFont).toBeTruthy();
    });
  });
});
