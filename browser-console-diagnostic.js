// BROWSER CONSOLE DIAGNOSTIC
// Kopiere diesen Code und füge ihn in die Browser Console ein (F12 → Console Tab)
// während du eine Lernwelt offen hast

console.log('=== 🔍 WORLD DESIGN DIAGNOSTIC ===');

// Versuche das Supabase Client Objekt zu finden
const supabaseClient = window.supabase ||
                        (window.__SUPABASE_CLIENT__ ? window.__SUPABASE_CLIENT__ : null);

if (!supabaseClient) {
  console.error('❌ Supabase Client nicht gefunden! App nicht korrekt geladen.');
} else {
  console.log('✅ Supabase Client gefunden');
}

// Hole die World ID aus der URL
const worldId = window.location.pathname.split('/w/')[1]?.split('/')[0];
console.log('World ID:', worldId);

if (!worldId) {
  console.error('❌ Keine World ID in URL gefunden!');
  console.log('Stelle sicher dass du auf einer /w/[id] Seite bist');
} else {
  console.log('✅ World ID gefunden:', worldId);

  // Versuche die World-Daten direkt aus dem Supabase Client zu laden
  if (supabaseClient) {
    console.log('\n📡 Lade World-Daten von Supabase...\n');

    supabaseClient
      .from('learning_worlds')
      .select('*')
      .eq('id', worldId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ FEHLER beim Laden:', error);
          console.log('Error Code:', error.code);
          console.log('Error Message:', error.message);

          if (error.code === 'PGRST116') {
            console.log('→ Welt nicht gefunden oder RLS blockiert Zugriff!');
          }
        } else if (!data) {
          console.error('❌ Keine Daten zurückgegeben');
        } else {
          console.log('✅ World-Daten erfolgreich geladen!\n');

          // Prüfe world_design
          console.group('🎨 WORLD_DESIGN Analyse');
          if (!data.world_design) {
            console.error('❌ world_design ist NULL oder undefined');
          } else if (Object.keys(data.world_design).length === 0) {
            console.warn('⚠️ world_design ist LEER: {}');
          } else {
            console.log('✅ world_design existiert');
            console.log('Keys:', Object.keys(data.world_design));

            if (data.world_design.visualIdentity) {
              console.log('\n✅ visualIdentity gefunden:');
              console.log('  primaryHue:', data.world_design.visualIdentity.primaryHue);
              console.log('  saturation:', data.world_design.visualIdentity.saturation);
              console.log('  accentHue:', data.world_design.visualIdentity.accentHue);
              console.log('  mood:', data.world_design.visualIdentity.mood);
              console.log('  era:', data.world_design.visualIdentity.era);

              // Farb-Interpretation
              const hue = data.world_design.visualIdentity.primaryHue;
              if (typeof hue === 'number') {
                let colorName = '???';
                if (hue >= 0 && hue <= 60) colorName = '🟡 GOLD/ORANGE';
                else if (hue >= 61 && hue <= 180) colorName = '🟢 GRÜN';
                else if (hue >= 181 && hue <= 240) colorName = '🔵 BLAU';
                else if (hue >= 241 && hue <= 300) colorName = '🟣 LILA';
                else colorName = '🔴 ROT/PINK';

                console.log(`\n  → Erwartete Farbe: ${colorName} (Hue ${hue})`);

                if (hue === 220) {
                  console.warn('  ⚠️ HUE 220 = STANDARD BLAU! Kein einzigartiges Design!');
                }
              } else if (typeof hue === 'string') {
                console.warn(`  ⚠️ primaryHue ist STRING: "${hue}" (sollte NUMBER sein!)`);
                console.log('  → HSL Parser sollte dies konvertieren');
              } else {
                console.error(`  ❌ primaryHue ist ${typeof hue}: ${hue}`);
              }
            } else {
              console.warn('⚠️ Kein visualIdentity in world_design');
            }

            console.log('\n📋 Komplettes world_design:');
            console.log(JSON.stringify(data.world_design, null, 2));
          }
          console.groupEnd();

          // Prüfe visual_theme
          console.group('\n🎭 VISUAL_THEME Analyse');
          if (!data.visual_theme) {
            console.warn('⚠️ visual_theme ist NULL oder undefined');
          } else if (Object.keys(data.visual_theme).length === 0) {
            console.warn('⚠️ visual_theme ist LEER: {}');
          } else {
            console.log('✅ visual_theme existiert');
            console.log('Keys:', Object.keys(data.visual_theme));
            console.log('  primaryHue:', data.visual_theme.primaryHue);
            console.log('  saturation:', data.visual_theme.saturation);

            console.log('\n📋 Komplettes visual_theme:');
            console.log(JSON.stringify(data.visual_theme, null, 2));
          }
          console.groupEnd();

          // Zusammenfassung
          console.group('\n📊 ZUSAMMENFASSUNG');
          console.log('Title:', data.title);
          console.log('Poetic Name:', data.poetic_name);
          console.log('Status:', data.status);
          console.log('Is Public:', data.is_public);

          const effectiveHue =
            data.world_design?.visualIdentity?.primaryHue ||
            data.visual_theme?.primaryHue ||
            220;

          console.log('\n🎯 Effektive Primary Hue:', effectiveHue);

          if (effectiveHue === 220) {
            console.error('\n❌ PROBLEM GEFUNDEN: Nutzt Default-Wert 220 (Blau)');
            console.log('   → Weder world_design noch visual_theme haben primaryHue!');
          } else if (typeof effectiveHue === 'string') {
            console.warn('\n⚠️ WARNUNG: Hue ist String, nicht Number');
            console.log('   → HSL Parser sollte funktionieren, aber prüfe Code');
          } else {
            console.log('\n✅ Korrekte Hue gefunden! Farbe sollte sichtbar sein.');
            console.log('   WENN du trotzdem Blau siehst:');
            console.log('   1. Hard Refresh (Strg+Shift+R)');
            console.log('   2. Prüfe ob CSS wirklich applied wird (Inspect Element)');
            console.log('   3. Prüfe ob Frontend-Code deployed ist');
          }
          console.groupEnd();
        }
      });
  }
}

console.log('\n=== ENDE DIAGNOSTIC ===\n');
console.log('Falls du Fehler siehst, mache einen Screenshot und zeige ihn mir!');
