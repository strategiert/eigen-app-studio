import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, School, Rocket } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    name: "Kostenlos",
    monthlyPrice: "0€",
    yearlyPrice: "0€",
    period: "für immer",
    yearlyPeriod: "für immer",
    description: "Perfekt zum Ausprobieren",
    icon: Sparkles,
    features: [
      "3 Lernwelten erstellen",
      "Grundlegende Quiz-Typen",
      "Community-Welten entdecken",
      "Fortschritts-Tracking",
    ],
    cta: "Kostenlos starten",
    highlighted: false,
    yearlySaving: null,
  },
  {
    name: "Pro",
    monthlyPrice: "9€",
    yearlyPrice: "7€",
    period: "pro Monat",
    yearlyPeriod: "pro Monat",
    description: "Für engagierte Lehrer:innen",
    icon: Rocket,
    features: [
      "Unbegrenzte Lernwelten",
      "Alle Interaktions-Typen",
      "KI-Bildgenerierung",
      "Eigene Welten veröffentlichen",
      "Detaillierte Schüler-Analysen",
      "Prioritäts-Support",
    ],
    cta: "Pro werden",
    highlighted: true,
    yearlySaving: "24€",
  },
  {
    name: "Schule",
    monthlyPrice: "Individuell",
    yearlyPrice: "Individuell",
    period: "pro Schule",
    yearlyPeriod: "pro Schule",
    description: "Für ganze Schulen & Institutionen",
    icon: School,
    features: [
      "Alles aus Pro",
      "Unbegrenzte Lehrer-Accounts",
      "Zentrale Verwaltung",
      "SSO Integration",
      "DSGVO-konformes Hosting",
      "Dedizierter Ansprechpartner",
      "Schulungen & Onboarding",
    ],
    cta: "Kontakt aufnehmen",
    highlighted: false,
    yearlySaving: null,
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Faire Preise für alle
            </h1>
            <p className="text-xl text-muted-foreground">
              Ob einzelner Lehrer oder ganze Schule – wir haben den passenden Plan für dich.
            </p>
          </motion.div>
        </section>

        {/* Billing Toggle */}
        <section className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monatlich
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Zwischen monatlicher und jährlicher Abrechnung wechseln"
            />
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Jährlich
            </span>
            <AnimatePresence>
              {isYearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  Spare bis zu 22%
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className={`relative bg-card border rounded-2xl p-6 ${
                  plan.highlighted 
                    ? "border-primary shadow-lg shadow-primary/10" 
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Beliebteste Wahl
                  </div>
                )}
                
                {/* Yearly savings badge */}
                {isYearly && plan.yearlySaving && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    Spare {plan.yearlySaving}/Jahr
                  </motion.div>
                )}
                
                <div className="text-center mb-6">
                  <plan.icon className={`h-10 w-10 mx-auto mb-3 ${
                    plan.highlighted ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="text-center mb-6 h-16 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isYearly ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-bold text-foreground">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{isYearly ? plan.yearlyPeriod : plan.period}
                      </span>
                      {isYearly && plan.yearlySaving && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Jährlich abgerechnet
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  <Link to="/auth">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                Häufige Fragen
              </h2>
              
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Kann ich jederzeit kündigen?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ja, du kannst dein Abo jederzeit kündigen. Deine Welten bleiben erhalten, 
                    aber du kannst keine neuen mehr erstellen über dem kostenlosen Limit.
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Gibt es Rabatte für Schulen?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ja! Wir bieten spezielle Schullizenzen an, die auf eure Bedürfnisse 
                    zugeschnitten sind. Kontaktiere uns für ein individuelles Angebot.
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Sind meine Daten sicher?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Absolut. Wir speichern alle Daten DSGVO-konform in der EU. 
                    Schülerdaten werden nur anonymisiert verarbeitet.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
