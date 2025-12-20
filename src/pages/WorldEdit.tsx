import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WorldEdit() {
  const { worldId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Dashboard
          </Button>
        </Link>

        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Bearbeitung kommt bald
            </h1>
            <p className="text-muted-foreground mb-6">
              Die Bearbeitungsfunktion für Lernwelten wird in Phase 4 implementiert.
            </p>
            <p className="text-sm text-muted-foreground">
              World ID: {worldId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
