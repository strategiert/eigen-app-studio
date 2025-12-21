/**
 * DynamicWorldRenderer - Rendert KI-generierte React Components
 *
 * Verwendet react-live um sicher AI-generierten Code auszuführen.
 * Nur pre-approved Komponenten aus safeComponents sind verfügbar.
 */

import { LiveProvider, LiveError, LivePreview, LiveContext } from 'react-live';
import { SafeComponentScope } from '@/lib/safeComponents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';

interface DynamicWorldRendererProps {
  /**
   * AI-generierter React/JSX Code
   */
  code: string;

  /**
   * Fallback wenn Code fehlerhaft ist
   */
  fallback?: React.ReactNode;

  /**
   * Callback wenn Rendering fehlschlägt
   */
  onError?: (error: Error) => void;
}

/**
 * Inner component that watches for errors from LiveContext
 */
function ErrorWatcher({ onError }: { onError: (error: string) => void }) {
  const { error } = useContext(LiveContext);
  
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);
  
  return null;
}

/**
 * Rendert AI-generierten React Code sicher
 */
export function DynamicWorldRenderer({
  code,
  fallback,
  onError
}: DynamicWorldRendererProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleError = (error: string) => {
    console.error('🔴 Dynamic World Render Error:', error);
    setHasError(true);
    setErrorMessage(error);

    if (onError) {
      onError(new Error(error));
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
  };

  // Wenn Error und Fallback vorhanden → zeige Fallback
  if (hasError && fallback) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Die KI-generierte Welt konnte nicht geladen werden. Zeige Fallback-Version.
          </AlertDescription>
        </Alert>
        {fallback}
      </div>
    );
  }

  // Wenn Error aber kein Fallback → zeige Error UI
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-2xl w-full space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="mt-2">
              <div className="font-semibold mb-2">Fehler beim Laden der Lernwelt</div>
              <div className="text-sm opacity-90">
                {errorMessage}
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
                {code}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <LiveProvider
      code={code}
      scope={SafeComponentScope}
      noInline={false}
    >
      {/* Error Watcher - detects errors from LiveContext */}
      <ErrorWatcher onError={handleError} />
      
      {/* Preview des AI-generierten Codes */}
      <LivePreview className="min-h-screen" />

      {/* Error Display (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <LiveError className="bg-destructive text-destructive-foreground p-4 rounded-lg text-sm font-mono shadow-lg" />
        </div>
      )}
    </LiveProvider>
  );
}

/**
 * Wrapper Component für vollständige World Page
 */
interface DynamicWorldPageProps {
  /**
   * World-Daten aus Datenbank
   */
  world: {
    id: string;
    title: string;
    poetic_name?: string | null;
    generated_component_code?: string | null;
    world_design?: any;
  };

  /**
   * Fallback Template wenn kein generierter Code vorhanden
   */
  fallbackTemplate?: React.ReactNode;
}

export function DynamicWorldPage({
  world,
  fallbackTemplate
}: DynamicWorldPageProps) {
  // Wenn kein generierter Code → Fallback Template
  if (!world.generated_component_code) {
    console.warn('⚠️ No generated component code found for world:', world.id);

    if (fallbackTemplate) {
      return <>{fallbackTemplate}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Diese Lernwelt hat noch keinen generierten Content.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DynamicWorldRenderer
      code={world.generated_component_code}
      fallback={fallbackTemplate}
      onError={(error) => {
        console.error('Failed to render world:', world.id, error);
        // TODO: Track error in analytics
      }}
    />
  );
}

/**
 * Beispiel-Code für Testing
 */
export const EXAMPLE_WORLD_CODE = `
<>
  <Hero gradient="from-purple-600 via-pink-600 to-red-600" pattern="waves">
    <Title size="text-7xl" glow>
      Die Magie der Zahlen
    </Title>
    <Subtitle>
      Entdecke die geheimnisvolle Welt der Mathematik
    </Subtitle>
    <div className="mt-8">
      <ActionButton size="lg">
        Abenteuer starten
      </ActionButton>
    </div>
  </Hero>

  <StorySection>
    <Card>
      <div className="flex items-start gap-4">
        <Icon name="lightbulb" size={64} color="#FFD700" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Willkommen, junger Entdecker!</h2>
          <Paragraph>
            In dieser magischen Welt lernst du die Geheimnisse der Zahlen kennen.
            Jede Zahl hat ihre eigene Geschichte, ihre eigene Persönlichkeit.
          </Paragraph>
        </div>
      </div>
    </Card>
  </StorySection>

  <Grid columns={3} gap={6}>
    <Card hover>
      <div className="text-center space-y-4">
        <Icon name="star" size={48} color="#FFD700" />
        <h3 className="text-xl font-bold">Kapitel 1</h3>
        <Paragraph align="center">
          Die Addition - Zahlen verbinden sich
        </Paragraph>
        <Badge variant="info">Leicht</Badge>
      </div>
    </Card>

    <Card hover>
      <div className="text-center space-y-4">
        <Icon name="rocket" size={48} color="#FF6B6B" />
        <h3 className="text-xl font-bold">Kapitel 2</h3>
        <Paragraph align="center">
          Die Multiplikation - Zahlen im Sprung
        </Paragraph>
        <Badge variant="warning">Mittel</Badge>
      </div>
    </Card>

    <Card hover>
      <div className="text-center space-y-4">
        <Icon name="trophy" size={48} color="#4ECDC4" />
        <h3 className="text-xl font-bold">Kapitel 3</h3>
        <Paragraph align="center">
          Die Division - Zahlen teilen Geheimnisse
        </Paragraph>
        <Badge variant="success">Fortgeschritten</Badge>
      </div>
    </Card>
  </Grid>
</>
`;
