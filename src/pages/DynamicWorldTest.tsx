/**
 * TEST PAGE: Dynamic World Renderer
 *
 * Diese Seite testet den DynamicWorldRenderer mit Beispiel-Code
 * Zugriff via /test-dynamic-world
 */

import { DynamicWorldRenderer, EXAMPLE_WORLD_CODE } from '@/components/world/DynamicWorldRenderer';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Eye } from 'lucide-react';

export default function DynamicWorldTest() {
  const [showCode, setShowCode] = useState(false);
  const [customCode, setCustomCode] = useState(EXAMPLE_WORLD_CODE);

  // Weitere Beispiel-Codes
  const examples = {
    math: EXAMPLE_WORLD_CODE,

    history: `
<>
  <Hero gradient="from-amber-700 via-orange-600 to-red-700" pattern="grid">
    <FloatingElement delay={0}>
      <Icon name="globe" size={80} color="#FFD700" />
    </FloatingElement>
    <Title size="text-6xl" color="text-amber-100" glow>
      Das Römische Reich
    </Title>
    <Subtitle color="text-amber-200">
      Eine Reise durch die antike Geschichte
    </Subtitle>
  </Hero>

  <Timeline>
    <TimelineItem side="left">
      <h3 className="text-xl font-bold mb-2">753 v. Chr.</h3>
      <Paragraph>
        Die Gründung Roms - Romulus und Remus
      </Paragraph>
    </TimelineItem>

    <TimelineItem side="right">
      <h3 className="text-xl font-bold mb-2">509 v. Chr.</h3>
      <Paragraph>
        Beginn der Römischen Republik
      </Paragraph>
    </TimelineItem>

    <TimelineItem side="left">
      <h3 className="text-xl font-bold mb-2">27 v. Chr.</h3>
      <Paragraph>
        Augustus wird erster römischer Kaiser
      </Paragraph>
    </TimelineItem>
  </Timeline>

  <StorySection background="bg-gradient-to-b from-amber-900/20 to-transparent">
    <Card color="bg-amber-950/50">
      <div className="text-center space-y-4">
        <Icon name="trophy" size={64} color="#FFD700" />
        <h2 className="text-3xl font-bold text-amber-100">
          Die Größe Roms
        </h2>
        <Paragraph align="center">
          Auf dem Höhepunkt seiner Macht erstreckte sich das Römische Reich
          über drei Kontinente und umfasste über 50 Millionen Menschen.
        </Paragraph>
      </div>
    </Card>
  </StorySection>
</>
    `,

    space: `
<>
  <Hero gradient="from-indigo-900 via-purple-900 to-black" pattern="dots">
    <div className="space-y-8">
      <FloatingElement delay={0}>
        <Icon name="rocket" size={100} color="#8B5CF6" />
      </FloatingElement>
      <Title size="text-7xl" color="text-purple-200" glow>
        Das Sonnensystem
      </Title>
      <Subtitle color="text-purple-300">
        Eine kosmische Entdeckungsreise
      </Subtitle>
      <ProgressBar value={75} max={100} color="bg-purple-500" />
      <div className="flex gap-4 justify-center mt-6">
        <ActionButton size="lg">Mission starten</ActionButton>
        <ActionButton variant="outline" size="lg">Mehr erfahren</ActionButton>
      </div>
    </div>
  </Hero>

  <Grid columns={4} gap={4}>
    <Card hover color="bg-gray-800/90">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500" />
        <h3 className="font-bold text-white">Sonne</h3>
        <Badge variant="warning">Stern</Badge>
      </div>
    </Card>

    <Card hover color="bg-gray-800/90">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-500" />
        <h3 className="font-bold text-white">Erde</h3>
        <Badge variant="info">Planet</Badge>
      </div>
    </Card>

    <Card hover color="bg-gray-800/90">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-600" />
        <h3 className="font-bold text-white">Mars</h3>
        <Badge variant="default">Planet</Badge>
      </div>
    </Card>

    <Card hover color="bg-gray-800/90">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-orange-400" />
        <h3 className="font-bold text-white">Jupiter</h3>
        <Badge variant="success">Gasriese</Badge>
      </div>
    </Card>
  </Grid>

  <StorySection>
    <ParallaxSection speed={0.5}>
      <Card color="bg-purple-950/50">
        <div className="flex items-start gap-6">
          <Icon name="compass" size={64} color="#8B5CF6" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-100 mb-4">
              Erkunde die Planeten
            </h2>
            <Paragraph>
              Jeder Planet in unserem Sonnensystem ist einzigartig.
              Von der glühenden Hitze der Venus bis zur eisigen Kälte des Neptun -
              eine faszinierende Vielfalt wartet auf dich!
            </Paragraph>
          </div>
        </div>
      </Card>
    </ParallaxSection>
  </StorySection>
</>
    `
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Control Panel */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Link>
              </Button>
              <h1 className="text-lg font-bold">Dynamic World Renderer Test</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showCode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? <Eye className="mr-2 h-4 w-4" /> : <Code className="mr-2 h-4 w-4" />}
                {showCode ? 'Preview' : 'Code'}
              </Button>

              <select
                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                onChange={(e) => setCustomCode(examples[e.target.value as keyof typeof examples])}
              >
                <option value="math">Mathe Beispiel</option>
                <option value="history">Geschichte Beispiel</option>
                <option value="space">Weltraum Beispiel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor oder Preview */}
      {showCode ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-muted rounded-lg p-4">
            <textarea
              className="w-full h-[600px] font-mono text-sm bg-background border border-border rounded p-4"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button onClick={() => setShowCode(false)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview anzeigen
            </Button>
          </div>
        </div>
      ) : (
        <DynamicWorldRenderer
          code={customCode}
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Fallback Template</h2>
                <p className="text-muted-foreground">
                  Dieser Fallback wird angezeigt wenn der generierte Code fehlerhaft ist.
                </p>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
