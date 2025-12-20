import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscript, disabled }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      
      if (final) {
        setFinalTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Restart if still supposed to be recording
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // Simulate audio level for visual feedback
  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 0.7 + 0.3);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setFinalTranscript("");
    setInterimTranscript("");
    setIsRecording(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setIsRecording(false);
    recognitionRef.current.stop();
    
    const fullTranscript = (finalTranscript + interimTranscript).trim();
    if (fullTranscript) {
      onTranscript(fullTranscript);
    }
    
    setFinalTranscript("");
    setInterimTranscript("");
  }, [finalTranscript, interimTranscript, onTranscript]);

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-xl">
        <MicOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Spracherkennung wird in diesem Browser nicht unterstützt.
          <br />
          Bitte verwende Chrome oder Edge.
        </p>
      </div>
    );
  }

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
            disabled={disabled}
            className={`relative z-10 w-20 h-20 rounded-full ${
              isRecording 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-moon hover:bg-moon-glow text-night-sky"
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </motion.div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isRecording 
          ? "Sprich jetzt... Klicke zum Beenden"
          : "Klicke um die Aufnahme zu starten"
        }
      </p>

      {/* Live transcript display */}
      <AnimatePresence>
        {(isRecording || finalTranscript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/50 rounded-xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto"
          >
            <p className="text-foreground">
              {finalTranscript}
              <span className="text-muted-foreground">{interimTranscript}</span>
              {isRecording && (
                <span className="inline-block w-2 h-4 bg-moon animate-pulse ml-1" />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
