import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";

const Privacy = () => {
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
              Datenschutzerklärung
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                Stand: Dezember 2024
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Verantwortlicher
                </h2>
                <p className="text-muted-foreground">
                  Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
                  Meoluna<br />
                  E-Mail: datenschutz@meoluna.de
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Welche Daten wir erheben
                </h2>
                <p className="text-muted-foreground mb-4">
                  Wir erheben und verarbeiten folgende Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Nutzerkonto:</strong> E-Mail-Adresse, Name (optional), Profilbild (optional)</li>
                  <li><strong>Lernwelten:</strong> Von Ihnen erstellte Inhalte und Materialien</li>
                  <li><strong>Lernfortschritt:</strong> Anonymisierte Fortschrittsdaten für Schüler:innen</li>
                  <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeiten</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Zweck der Datenverarbeitung
                </h2>
                <p className="text-muted-foreground mb-4">
                  Wir verarbeiten Ihre Daten zu folgenden Zwecken:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Bereitstellung und Verbesserung unserer Dienste</li>
                  <li>Verwaltung Ihres Nutzerkontos</li>
                  <li>Speicherung und Anzeige Ihrer Lernwelten</li>
                  <li>Tracking des Lernfortschritts (anonymisiert für Schüler)</li>
                  <li>Kommunikation bezüglich Ihres Kontos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Rechtsgrundlage
                </h2>
                <p className="text-muted-foreground">
                  Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO 
                  (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Datenspeicherung und -löschung
                </h2>
                <p className="text-muted-foreground">
                  Ihre Daten werden so lange gespeichert, wie Sie ein aktives Konto bei uns haben. 
                  Nach Löschung Ihres Kontos werden Ihre personenbezogenen Daten innerhalb von 30 Tagen 
                  gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Datensicherheit
                </h2>
                <p className="text-muted-foreground">
                  Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten 
                  zu schützen. Alle Daten werden verschlüsselt übertragen (SSL/TLS) und in der EU gespeichert.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Cookies
                </h2>
                <p className="text-muted-foreground">
                  Wir verwenden nur technisch notwendige Cookies, die für den Betrieb der Website 
                  erforderlich sind. Diese speichern keine personenbezogenen Daten und erfordern 
                  keine Einwilligung.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Ihre Rechte
                </h2>
                <p className="text-muted-foreground mb-4">
                  Sie haben folgende Rechte bezüglich Ihrer Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                  <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                  <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                  <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                  <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                  <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Kontakt
                </h2>
                <p className="text-muted-foreground">
                  Bei Fragen zum Datenschutz können Sie uns jederzeit kontaktieren:<br />
                  E-Mail: datenschutz@meoluna.de
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Beschwerderecht
                </h2>
                <p className="text-muted-foreground">
                  Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die 
                  Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
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

export default Privacy;
