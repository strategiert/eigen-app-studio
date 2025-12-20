import { useState } from 'react';
import { Copy, Check, Globe, Lock, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShareWorldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  world: {
    id: string;
    title: string;
    is_public: boolean;
    status: string;
  };
  onWorldUpdated: () => void;
}

export function ShareWorldDialog({
  open,
  onOpenChange,
  world,
  onWorldUpdated
}: ShareWorldDialogProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(world.is_public);
  const [isPublished, setIsPublished] = useState(world.status === 'published');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const shareUrl = `${window.location.origin}/w/${world.id}`;
  const canShare = isPublic && isPublished;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link kopiert!',
        description: 'Der Link wurde in die Zwischenablage kopiert.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Fehler',
        description: 'Link konnte nicht kopiert werden.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('learning_worlds')
        .update({
          is_public: isPublic,
          status: isPublished ? 'published' : 'draft',
        })
        .eq('id', world.id);

      if (error) throw error;

      toast({
        title: 'Einstellungen gespeichert',
        description: 'Die Freigabe-Einstellungen wurden aktualisiert.',
      });
      onWorldUpdated();
    } catch (error) {
      console.error('Error updating world:', error);
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Lernwelt teilen
          </DialogTitle>
          <DialogDescription>
            {world.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibility Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublished ? (
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Lock className="h-4 w-4 text-yellow-500" />
                  </div>
                )}
                <div>
                  <Label htmlFor="published" className="font-medium">
                    Veröffentlicht
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Nur veröffentlichte Welten sind spielbar
                  </p>
                </div>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <div className="p-2 rounded-lg bg-moon/10">
                    <Globe className="h-4 w-4 text-moon" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Label htmlFor="public" className="font-medium">
                    Öffentlich
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Jeder mit dem Link kann zugreifen
                  </p>
                </div>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Teilbarer Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className={!canShare ? 'opacity-50' : ''}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!canShare}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!canShare && (
              <p className="text-xs text-muted-foreground">
                Aktiviere "Veröffentlicht" und "Öffentlich" um den Link zu teilen.
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
