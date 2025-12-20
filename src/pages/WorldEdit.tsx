import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Loader2, Globe, Lock, 
  Sparkles, BookOpen, BarChart3, Settings,
  Eye, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { StarField } from '@/components/landing/StarField';
import { WorldAnalytics } from '@/components/dashboard/WorldAnalytics';
import { ShareWorldDialog } from '@/components/dashboard/ShareWorldDialog';
import type { Database } from '@/integrations/supabase/types';

type LearningWorld = Database['public']['Tables']['learning_worlds']['Row'];
type SubjectType = Database['public']['Enums']['subject_type'];
type MoonPhase = Database['public']['Enums']['moon_phase'];

const subjects: { value: SubjectType; label: string }[] = [
  { value: 'mathematik', label: 'Mathematik' },
  { value: 'deutsch', label: 'Deutsch' },
  { value: 'englisch', label: 'Englisch' },
  { value: 'biologie', label: 'Biologie' },
  { value: 'physik', label: 'Physik' },
  { value: 'chemie', label: 'Chemie' },
  { value: 'geschichte', label: 'Geschichte' },
  { value: 'geografie', label: 'Geografie' },
  { value: 'kunst', label: 'Kunst' },
  { value: 'musik', label: 'Musik' },
  { value: 'sport', label: 'Sport' },
  { value: 'informatik', label: 'Informatik' },
  { value: 'allgemein', label: 'Allgemein' },
];

const moonPhases: { value: MoonPhase; label: string; emoji: string }[] = [
  { value: 'neumond', label: 'Neumond (Einsteiger)', emoji: '🌑' },
  { value: 'zunehmend', label: 'Zunehmend (Leicht)', emoji: '🌒' },
  { value: 'halbmond', label: 'Halbmond (Mittel)', emoji: '🌓' },
  { value: 'vollmond', label: 'Vollmond (Fortgeschritten)', emoji: '🌕' },
  { value: 'abnehmend', label: 'Abnehmend (Experte)', emoji: '🌘' },
];

export default function WorldEdit() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [world, setWorld] = useState<LearningWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [poeticName, setPoeticName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<SubjectType>('allgemein');
  const [moonPhase, setMoonPhase] = useState<MoonPhase>('neumond');
  const [isPublic, setIsPublic] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (worldId && user) {
      fetchWorld();
    }
  }, [worldId, user]);

  const fetchWorld = async () => {
    if (!worldId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('learning_worlds')
        .select('*')
        .eq('id', worldId)
        .single();

      if (error) throw error;
      if (!data) {
        toast({
          title: 'Nicht gefunden',
          description: 'Diese Lernwelt existiert nicht.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setWorld(data);
      setTitle(data.title);
      setPoeticName(data.poetic_name || '');
      setDescription(data.description || '');
      setSubject(data.subject);
      setMoonPhase(data.moon_phase);
      setIsPublic(data.is_public);
      setIsPublished(data.status === 'published');
    } catch (error) {
      console.error('Error fetching world:', error);
      toast({
        title: 'Fehler',
        description: 'Konnte Lernwelt nicht laden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!worldId || !title.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Titel ein.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('learning_worlds')
        .update({
          title: title.trim(),
          poetic_name: poeticName.trim() || null,
          description: description.trim() || null,
          subject,
          moon_phase: moonPhase,
          is_public: isPublic,
          status: isPublished ? 'published' : 'draft',
        })
        .eq('id', worldId);

      if (error) throw error;

      toast({
        title: 'Gespeichert',
        description: 'Die Änderungen wurden gespeichert.',
      });
      fetchWorld();
    } catch (error) {
      console.error('Error saving world:', error);
      toast({
        title: 'Fehler',
        description: 'Änderungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-moon" />
      </div>
    );
  }

  if (!world) {
    return null;
  }

  return (
    <div className="min-h-screen bg-hero relative">
      <StarField />

      <div className="relative z-10 container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate(`/w/${worldId}`)}
            >
              <Eye className="h-4 w-4" />
              Vorschau
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Speichern
            </Button>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Lernwelt bearbeiten
          </h1>
          <p className="text-muted-foreground">
            Passe die Einstellungen deiner Lernwelt an.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Inhalte
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Grundeinstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Name der Lernwelt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poeticName" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-moon" />
                      Poetischer Name
                    </Label>
                    <Input
                      id="poeticName"
                      value={poeticName}
                      onChange={(e) => setPoeticName(e.target.value)}
                      placeholder="z.B. 'Reise durch die Sterne'"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Kurze Beschreibung der Lernwelt..."
                      rows={3}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fach</Label>
                      <Select value={subject} onValueChange={(v) => setSubject(v as SubjectType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Schwierigkeit</Label>
                      <Select value={moonPhase} onValueChange={(v) => setMoonPhase(v as MoonPhase)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moonPhases.map((phase) => (
                            <SelectItem key={phase.value} value={phase.value}>
                              {phase.emoji} {phase.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Sichtbarkeit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPublished ? (
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <BookOpen className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <BookOpen className="h-5 w-5 text-yellow-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">Veröffentlicht</p>
                        <p className="text-sm text-muted-foreground">
                          Veröffentlichte Welten können von Schülern besucht werden
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPublic ? (
                        <div className="p-2 rounded-lg bg-moon/10">
                          <Globe className="h-5 w-5 text-moon" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-muted">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">Öffentlich</p>
                        <p className="text-sm text-muted-foreground">
                          Öffentliche Welten können von jedem mit dem Link besucht werden
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Inhalte werden automatisch generiert
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Die Abschnitte und Übungen dieser Lernwelt wurden durch KI erstellt.
                  </p>
                  <Button variant="outline" onClick={() => navigate(`/w/${worldId}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Inhalte ansehen
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <WorldAnalytics worldId={worldId!} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Dialog */}
      {world && (
        <ShareWorldDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          world={world}
          onWorldUpdated={fetchWorld}
        />
      )}
    </div>
  );
}
