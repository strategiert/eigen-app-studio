import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Heart, Sparkles, Users, GraduationCap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Über Meoluna
            </h1>
            <p className="text-xl text-muted-foreground">
              Wir verwandeln Schulprüfungen in magische Lernwelten, die Kinder begeistern und Lehrer entlasten.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Unsere Mission
              </h2>
              <p className="text-muted-foreground mb-4">
                Lernen sollte sich wie ein Abenteuer anfühlen, nicht wie eine Prüfung. 
                Meoluna nutzt KI, um Lernmaterialien in interaktive Welten zu verwandeln, 
                die Schüler:innen erkunden können.
              </p>
              <p className="text-muted-foreground">
                Für Lehrer:innen bedeutet das weniger Vorbereitungszeit und mehr Zeit 
                für das, was wirklich zählt: die Beziehung zu ihren Schüler:innen.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Kindgerecht</h3>
                <p className="text-sm text-muted-foreground mt-1">Spielerisch & motivierend</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">KI-gestützt</h3>
                <p className="text-sm text-muted-foreground mt-1">Automatisch generiert</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Für alle</h3>
                <p className="text-sm text-muted-foreground mt-1">Lehrer & Schüler</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <GraduationCap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Lehrplankonform</h3>
                <p className="text-sm text-muted-foreground mt-1">Für echte Prüfungen</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Unsere Geschichte
              </h2>
              <p className="text-muted-foreground mb-4">
                Meoluna entstand aus einer einfachen Beobachtung: Kinder lieben es zu 
                entdecken und zu spielen, aber klassische Prüfungsvorbereitung fühlt 
                sich oft wie eine Last an.
              </p>
              <p className="text-muted-foreground mb-4">
                Wir fragten uns: Was wäre, wenn wir Prüfungsinhalte in Welten verwandeln 
                könnten, die Kinder freiwillig erkunden wollen? Was wäre, wenn Lernen 
                sich anfühlen würde wie eine Mondlandung – voller Wunder und Entdeckungen?
              </p>
              <p className="text-muted-foreground">
                So wurde Meoluna geboren: Eine Plattform, die mit KI Lernwelten erschafft, 
                in denen jedes Kind zum Entdecker wird.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Unsere Werte
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌙</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Magie des Lernens</h3>
                <p className="text-sm text-muted-foreground">
                  Wir glauben, dass Lernen sich magisch anfühlen sollte.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Sicherheit</h3>
                <p className="text-sm text-muted-foreground">
                  Datenschutz und sichere Lernumgebungen haben höchste Priorität.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Zusammenarbeit</h3>
                <p className="text-sm text-muted-foreground">
                  Lehrer, Eltern und Schüler arbeiten gemeinsam für den Lernerfolg.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
