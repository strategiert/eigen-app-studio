import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-8">
              Allgemeine Geschäftsbedingungen
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                Stand: Dezember 2024
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Geltungsbereich
                </h2>
                <p className="text-muted-foreground">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der 
                  Plattform Meoluna. Mit der Registrierung und Nutzung unserer Dienste 
                  erklären Sie sich mit diesen AGB einverstanden.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Leistungsbeschreibung
                </h2>
                <p className="text-muted-foreground mb-4">
                  Meoluna bietet eine Plattform zur Erstellung und Nutzung interaktiver Lernwelten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Erstellung von Lernwelten aus Unterrichtsmaterialien</li>
                  <li>KI-gestützte Generierung von interaktiven Inhalten</li>
                  <li>Teilen von Lernwelten mit Schüler:innen</li>
                  <li>Tracking des Lernfortschritts</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Registrierung und Nutzerkonto
                </h2>
                <p className="text-muted-foreground mb-4">
                  Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. 
                  Sie sind verpflichtet:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Wahrheitsgemäße Angaben bei der Registrierung zu machen</li>
                  <li>Ihre Zugangsdaten vertraulich zu behandeln</li>
                  <li>Uns über unbefugte Nutzung Ihres Kontos zu informieren</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Nutzungsrechte und -pflichten
                </h2>
                <p className="text-muted-foreground mb-4">
                  Sie erhalten ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung 
                  unserer Dienste. Sie verpflichten sich:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Keine rechtswidrigen Inhalte hochzuladen</li>
                  <li>Urheberrechte Dritter zu respektieren</li>
                  <li>Die Plattform nicht für kommerzielle Zwecke zu missbrauchen</li>
                  <li>Keine schädliche Software zu verbreiten</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Inhalte und Urheberrecht
                </h2>
                <p className="text-muted-foreground mb-4">
                  Sie behalten alle Rechte an den von Ihnen erstellten Inhalten. Mit dem 
                  Hochladen gewähren Sie uns jedoch eine Lizenz zur:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Speicherung und Anzeige Ihrer Inhalte</li>
                  <li>Verarbeitung durch unsere KI-Systeme</li>
                  <li>Bereitstellung für die von Ihnen autorisierten Nutzer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Kostenpflichtige Leistungen
                </h2>
                <p className="text-muted-foreground">
                  Einige Funktionen sind kostenpflichtig. Die aktuellen Preise finden Sie 
                  auf unserer Preisseite. Bei Abonnements gilt die jeweils gewählte 
                  Abrechnungsperiode. Kündigungen sind jederzeit zum Ende der laufenden 
                  Periode möglich.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Haftungsbeschränkung
                </h2>
                <p className="text-muted-foreground">
                  Wir haften unbeschränkt nur für Vorsatz und grobe Fahrlässigkeit sowie 
                  für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit. 
                  Im Übrigen ist unsere Haftung auf vorhersehbare, vertragstypische Schäden begrenzt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Verfügbarkeit
                </h2>
                <p className="text-muted-foreground">
                  Wir bemühen uns um eine hohe Verfügbarkeit unserer Dienste, können diese 
                  jedoch nicht garantieren. Wartungsarbeiten werden nach Möglichkeit 
                  angekündigt. Für Datenverluste aufgrund technischer Störungen übernehmen 
                  wir keine Haftung.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Änderungen der AGB
                </h2>
                <p className="text-muted-foreground">
                  Wir behalten uns vor, diese AGB zu ändern. Wesentliche Änderungen werden 
                  Ihnen per E-Mail mitgeteilt. Die fortgesetzte Nutzung nach Inkrafttreten 
                  der Änderungen gilt als Zustimmung.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Kündigung
                </h2>
                <p className="text-muted-foreground">
                  Sie können Ihr Konto jederzeit kündigen. Bei Verstößen gegen diese AGB 
                  behalten wir uns vor, Ihr Konto zu sperren oder zu löschen. Im Falle 
                  einer Kündigung werden Ihre Daten gemäß unserer Datenschutzerklärung behandelt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Schlussbestimmungen
                </h2>
                <p className="text-muted-foreground">
                  Es gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam 
                  sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Kontakt
                </h2>
                <p className="text-muted-foreground">
                  Bei Fragen zu diesen AGB wenden Sie sich bitte an:<br />
                  E-Mail: info@meoluna.de
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
