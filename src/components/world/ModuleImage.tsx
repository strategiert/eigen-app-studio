import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleImageProps {
  imageUrl?: string | null;
  imagePrompt?: string | null;
  sectionId: string;
  worldId: string;
  subject: string;
  moduleTitle: string;
  moduleContent?: string | null;
  subjectColor: string;
  onImageGenerated?: (url: string) => void;
  canGenerate?: boolean;
}

export function ModuleImage({
  imageUrl,
  imagePrompt,
  sectionId,
  worldId,
  subject,
  moduleTitle,
  moduleContent,
  subjectColor,
  onImageGenerated,
  canGenerate = false
}: ModuleImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [imageError, setImageError] = useState(false);

  const generateImage = async () => {
    setIsLoading(true);
    setImageError(false);

    try {
      // Use the designed image prompt if available, otherwise create one from module content
      const prompt = imagePrompt || `${moduleTitle}. ${moduleContent || ''}`.slice(0, 500);

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          sectionId,
          worldId,
          subject
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setCurrentUrl(data.imageUrl);
        onImageGenerated?.(data.imageUrl);
        toast.success('Bild wurde generiert!');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      toast.error('Bildgenerierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  // If we have an image, show it
  if (currentUrl && !imageError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl mb-4"
      >
        <img
          src={currentUrl}
          alt={moduleTitle}
          className="w-full h-48 sm:h-64 object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
        />
      </motion.div>
    );
  }

  // If generation is allowed but no image yet
  if (canGenerate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 mb-4",
          "flex flex-col items-center justify-center gap-3",
          "bg-muted/30"
        )}
        style={{ borderColor: `${subjectColor}40` }}
      >
        {isLoading ? (
          <>
            <Loader2 
              className="h-8 w-8 animate-spin" 
              style={{ color: subjectColor }}
            />
            <p className="text-sm text-muted-foreground">
              Bild wird generiert...
            </p>
          </>
        ) : (
          <>
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: `${subjectColor}20` }}
            >
              <ImageIcon 
                className="h-6 w-6" 
                style={{ color: subjectColor }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateImage}
              className="gap-2"
              style={{ borderColor: subjectColor, color: subjectColor }}
            >
              <Sparkles className="h-4 w-4" />
              Bild generieren
            </Button>
          </>
        )}
      </motion.div>
    );
  }

  // No image and can't generate - show nothing
  return null;
}
