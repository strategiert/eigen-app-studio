import { motion } from "framer-motion";
import { 
  Calculator, 
  BookText, 
  Languages, 
  Leaf, 
  Atom, 
  FlaskConical,
  Landmark,
  Globe,
  Palette,
  Music,
  Trophy,
  Code
} from "lucide-react";

const subjects = [
  { icon: Calculator, name: "Mathematik", world: "Zahlenwald", color: "bg-subject-math" },
  { icon: BookText, name: "Deutsch", world: "Wortwiese", color: "bg-subject-german" },
  { icon: Languages, name: "Englisch", world: "Sprachozean", color: "bg-subject-english" },
  { icon: Leaf, name: "Biologie", world: "Naturreich", color: "bg-subject-biology" },
  { icon: Atom, name: "Physik", world: "Kraftfeld", color: "bg-subject-physics" },
  { icon: FlaskConical, name: "Chemie", world: "Elementland", color: "bg-subject-chemistry" },
  { icon: Landmark, name: "Geschichte", world: "Zeitreise", color: "bg-subject-history" },
  { icon: Globe, name: "Geografie", world: "Weltenkarte", color: "bg-subject-geography" },
  { icon: Palette, name: "Kunst", world: "Farbgalaxie", color: "bg-subject-art" },
  { icon: Music, name: "Musik", world: "Klanggarten", color: "bg-subject-music" },
  { icon: Trophy, name: "Sport", world: "Bewegungspark", color: "bg-subject-sport" },
  { icon: Code, name: "Informatik", world: "Datenraum", color: "bg-subject-informatics" },
];

export const SubjectsSection = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Für jedes Fach eine eigene Welt
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Jedes Schulfach hat sein eigenes thematisches Design und passende Metaphern
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl ${subject.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <subject.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{subject.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{subject.world}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
