import { useState, useCallback } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscript, disabled }: VoiceRecorderProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => {
      // Simulate audio level from transcript activity
      setAudioLevel(Math.random() * 0.7 + 0.3);
    },
    onCommittedTranscript: (data) => {
      if (data.text) {
        onTranscript(data.text);
      }
      setAudioLevel(0);
    },
  });

  const startRecording = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error: tokenError } = await supabase.functions.invoke(
        "elevenlabs-scribe-token"
      );

      if (tokenError || !data?.token) {
        throw new Error(tokenError?.message || "Kein Token erhalten");
      }

      // Start the scribe session
      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Starten");
    } finally {
      setIsConnecting(false);
    }
  }, [scribe]);

  const stopRecording = useCallback(() => {
    scribe.disconnect();
    setAudioLevel(0);
  }, [scribe]);

  const isRecording = scribe.isConnected;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <motion.div
          animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
          className="relative"
        >
          {/* Audio level rings */}
          <AnimatePresence>
            {isRecording && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ 
                      scale: 1 + (audioLevel * 0.3 * (i + 1)),
                      opacity: 0.6 - (i * 0.2)
                    }}
                    exit={{ scale: 1, opacity: 0 }}
                    className="absolute inset-0 rounded-full border-2 border-moon"
                    style={{ 
                      transform: `scale(${1 + (i * 0.15)})`,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <Button
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isConnecting}
            className={`relative z-10 w-20 h-20 rounded-full ${
              isRecording 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-moon hover:bg-moon-glow text-night-sky"
            }`}
          >
            {isConnecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-2 border-current border-t-transparent rounded-full"
              />
            ) : isRecording ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </motion.div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isConnecting 
          ? "Verbinde mit ElevenLabs..."
          : isRecording 
          ? "Sprich jetzt... Klicke zum Beenden"
          : "Klicke um die Aufnahme zu starten"
        }
      </p>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Live transcript display */}
      <AnimatePresence>
        {(isRecording || scribe.partialTranscript || scribe.committedTranscripts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/50 rounded-xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto"
          >
            <p className="text-foreground font-sans" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              {scribe.committedTranscripts.map(t => t.text).join(" ")}
              <span className="text-muted-foreground">{scribe.partialTranscript}</span>
              {isRecording && (
                <span className="inline-block w-2 h-4 bg-moon animate-pulse ml-1" />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ElevenLabs branding */}
      <p className="text-center text-xs text-muted-foreground/60">
        Powered by ElevenLabs
      </p>
    </div>
  );
};
