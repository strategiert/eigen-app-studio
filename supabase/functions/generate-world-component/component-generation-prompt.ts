/**
 * AI Prompt Template for Generating React Component Code
 *
 * Instructs AI to generate complete, unique React components for learning worlds
 */

export const COMPONENT_GENERATION_PROMPT = `Du bist ein Expert React Developer und Creative Designer.
Deine Aufgabe: Erstelle eine KOMPLETT EINZIGARTIGE React-Seite für eine Lernwelt.

# WICHTIGE REGELN

1. **EINZIGARTIGKEIT**: Jede Welt MUSS komplett anders sein! Kein Template, keine Wiederholungen!
2. **NUR SAFE COMPONENTS**: Du darfst NUR die vordefinierten Safe Components verwenden (siehe unten)
3. **GÜLTIGES JSX**: Der Code muss valides React/JSX sein ohne Syntaxfehler
4. **DEUTSCHE TEXTE**: Alle Texte auf Deutsch!
5. **KEIN IMPORT**: Keine import Statements - Components sind bereits im Scope!
6. **FRAGMENT ROOT**: Nutze <> </> als Root-Element

# VERFÜGBARE SAFE COMPONENTS

## Layout Components:
- <Hero gradient="from-X to-Y" pattern="dots|grid|waves|none">{children}</Hero>
- <Grid columns={1|2|3|4} gap={number}>{children}</Grid>
- <Card color="bg-..." hover={boolean} padding="p-...">{children}</Card>
- <StorySection background="bg-...">{children}</StorySection>
- <Timeline>{children}</Timeline>
- <TimelineItem side="left|right">{children}</TimelineItem>

## Content Components:
- <Title size="text-..." color="text-..." glow={boolean}>{text}</Title>
- <Subtitle color="text-...">{text}</Subtitle>
- <Paragraph align="left|center|right">{text}</Paragraph>
- <Icon name="sparkles|star|rocket|book|globe|lightbulb|trophy|target|map|compass|heart|zap" size={number} color="#HEX" animate={boolean} />
- <Badge variant="default|success|warning|info">{text}</Badge>
- <ProgressBar value={number} max={number} color="bg-..." />
- <ActionButton variant="default|outline|ghost" size="default|sm|lg">{text}</ActionButton>

## Interactive Components:
- <FloatingElement delay={number}>{children}</FloatingElement>
- <ParallaxSection speed={number}>{children}</ParallaxSection>

# DESIGN-STILE PRO FACH

## Mathematik
- **Layout**: Grid oder geometrische Strukturen
- **Farben**: Blau, Cyan, Violett (logisch, strukturiert)
- **Icons**: star, target, lightbulb
- **Stil**: Klar, modern, geometrisch
- **Pattern**: grid oder dots

## Geschichte
- **Layout**: Timeline oder Story-basiert
- **Farben**: Gold, Rot, Braun (historisch, warm)
- **Icons**: globe, map, book
- **Stil**: Elegant, narrativ, zeitlich
- **Pattern**: waves oder grid

## Naturwissenschaften
- **Layout**: Organisch, fließend
- **Farben**: Grün, Türkis, Blau (natürlich)
- **Icons**: globe, lightbulb, zap
- **Stil**: Lebendig, dynamisch
- **Pattern**: waves oder dots

## Sprachen/Literatur
- **Layout**: Story-Sections, lesbar
- **Farben**: Orange, Gelb, Rot (warm, einladend)
- **Icons**: book, heart, star
- **Stil**: Erzählerisch, fließend
- **Pattern**: none oder waves

## Kunst/Musik
- **Layout**: Kreativ, asymmetrisch
- **Farben**: Lila, Pink, Regenbogen (kreativ)
- **Icons**: sparkles, heart, star
- **Stil**: Verspielt, künstlerisch
- **Pattern**: dots oder abstract

# BEISPIEL-STRUKTUR (VARIIERE STARK!)

\`\`\`jsx
<>
  {/* Hero Section - ALWAYS individuell! */}
  <Hero gradient="from-[FARBE1] to-[FARBE2]" pattern="[PATTERN]">
    <FloatingElement delay={0}>
      <Icon name="[ICON]" size={80} color="#[HEX]" />
    </FloatingElement>
    <Title size="text-6xl" color="text-[COLOR]" glow>
      [POETISCHER TITEL]
    </Title>
    <Subtitle color="text-[COLOR]">
      [EINLADENDER UNTERTITEL]
    </Subtitle>
    <div className="mt-8">
      <ActionButton size="lg">
        [CALL TO ACTION]
      </ActionButton>
    </div>
  </Hero>

  {/* Main Content - WÄHLE EINES: Grid, Timeline, oder StorySection */}

  {/* Option A: Grid Layout */}
  <Grid columns={3} gap={6}>
    <Card hover>
      <div className="text-center space-y-4">
        <Icon name="[ICON]" size={48} color="#[HEX]" />
        <h3 className="text-xl font-bold">[TITEL]</h3>
        <Paragraph align="center">[TEXT]</Paragraph>
        <Badge variant="info">[LABEL]</Badge>
      </div>
    </Card>
    {/* Mehr Cards... */}
  </Grid>

  {/* Option B: Timeline (für Geschichte/Chronologie) */}
  <Timeline>
    <TimelineItem side="left">
      <h3 className="text-xl font-bold mb-2">[DATUM/EREIGNIS]</h3>
      <Paragraph>[BESCHREIBUNG]</Paragraph>
    </TimelineItem>
    {/* Mehr TimelineItems... */}
  </Timeline>

  {/* Option C: Story Sections (für Narrative) */}
  <StorySection background="bg-gradient-to-b from-[COLOR] to-transparent">
    <Card color="bg-[COLOR]/50">
      <div className="flex items-start gap-6">
        <Icon name="[ICON]" size={64} color="#[HEX]" />
        <div>
          <h2 className="text-2xl font-bold mb-4">[ÜBERSCHRIFT]</h2>
          <Paragraph>[LÄNGERER TEXT]</Paragraph>
        </div>
      </div>
    </Card>
  </StorySection>

  {/* Interactive Elements */}
  <ParallaxSection speed={0.5}>
    <div className="text-center py-20">
      <FloatingElement delay={0.2}>
        <Icon name="[ICON]" size={100} color="#[HEX]" />
      </FloatingElement>
      <Title size="text-5xl">[ABSCHLUSS-TITEL]</Title>
    </div>
  </ParallaxSection>
</>
\`\`\`

# DEINE AUFGABE

Generiere JETZT eine komplett einzigartige React-Seite für folgendes Thema:

**Titel**: {title}
**Fach**: {subject}
**Inhalt**: {content}

WICHTIG:
1. Nutze fach-spezifische Farben und Layouts
2. Erstelle mindestens 3-5 Sections
3. Variiere die Struktur basierend auf dem Thema
4. Mache es visuell einzigartig und fesselnd
5. KEIN Boilerplate-Code, komplett individuell!

RÜCKGABE:
Nur der JSX-Code, ohne \`\`\`jsx, ohne Erklärungen, direkt ausführbar!
`;

export const SAFE_COMPONENT_LIST = `
Available components in scope:
- motion (from framer-motion)
- Button
- Hero, Grid, Card, StorySection, Timeline, TimelineItem
- Title, Subtitle, Paragraph, Icon, Badge, ProgressBar, ActionButton
- FloatingElement, ParallaxSection
- Icons: Sparkles, Star, Rocket, Book, Globe, Lightbulb, Trophy, Target, Map, Compass, Heart, Zap
`;
