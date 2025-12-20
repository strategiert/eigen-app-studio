import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "meoluna-cookie-consent";

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp));
    setIsVisible(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const saveCustomSettings = () => {
    saveConsent(consent);
    setShowSettings(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {!showSettings ? (
                // Main banner view
                <div className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Cookie className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Wir verwenden Cookies 🍪
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Wir nutzen Cookies, um dir die bestmögliche Erfahrung auf unserer Plattform zu bieten. 
                        Einige sind notwendig, andere helfen uns, Meoluna zu verbessern. 
                        Mehr erfährst du in unserer{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Datenschutzerklärung
                        </Link>.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={acceptAll} size="sm">
                          Alle akzeptieren
                        </Button>
                        <Button onClick={acceptNecessary} variant="outline" size="sm">
                          Nur notwendige
                        </Button>
                        <Button
                          onClick={() => setShowSettings(true)}
                          variant="ghost"
                          size="sm"
                        >
                          Einstellungen
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={acceptNecessary}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Schließen"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                // Settings view
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Cookie-Einstellungen
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Zurück"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {/* Necessary cookies */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Notwendige Cookies</p>
                        <p className="text-sm text-muted-foreground">
                          Diese Cookies sind für den Betrieb der Website erforderlich.
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">Immer aktiv</div>
                    </div>
                    
                    {/* Analytics cookies */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Analyse-Cookies</p>
                        <p className="text-sm text-muted-foreground">
                          Helfen uns zu verstehen, wie die Plattform genutzt wird.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={consent.analytics}
                          onChange={(e) =>
                            setConsent({ ...consent, analytics: e.target.checked })
                          }
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                    
                    {/* Marketing cookies */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Marketing-Cookies</p>
                        <p className="text-sm text-muted-foreground">
                          Werden verwendet, um personalisierte Werbung anzuzeigen.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={consent.marketing}
                          onChange={(e) =>
                            setConsent({ ...consent, marketing: e.target.checked })
                          }
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={saveCustomSettings} size="sm">
                      Einstellungen speichern
                    </Button>
                    <Button onClick={acceptAll} variant="outline" size="sm">
                      Alle akzeptieren
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper to reset cookie consent (useful for footer link)
export const resetCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.location.reload();
};
