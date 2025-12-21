// DOM INSPECTION DIAGNOSTIC
// Kopiere diesen Code in die Browser Console während die Lernwelt geladen ist

console.log('=== 🔍 DOM STYLE INSPECTION ===\n');

// 1. Prüfe die Farbleiste im Header
const colorBar = document.querySelector('header div[style*="backgroundColor"]');
if (colorBar) {
  const computedStyle = window.getComputedStyle(colorBar);
  console.log('🎨 Header Color Bar:');
  console.log('  Inline Style:', colorBar.style.backgroundColor);
  console.log('  Computed Style:', computedStyle.backgroundColor);
  console.log('  Element:', colorBar);
} else {
  console.error('❌ Header Color Bar nicht gefunden!');
}

// 2. Prüfe den Hintergrund
const mainContainer = document.querySelector('div[style*="background"]');
if (mainContainer) {
  console.log('\n🖼️ Main Background:');
  console.log('  Inline background:', mainContainer.style.background);
  console.log('  Inline backgroundImage:', mainContainer.style.backgroundImage);
} else {
  console.error('❌ Main Container nicht gefunden!');
}

// 3. Prüfe alle Elemente mit inline backgroundColor
const coloredElements = document.querySelectorAll('[style*="backgroundColor"]');
console.log(`\n🎨 Gefundene Elemente mit backgroundColor: ${coloredElements.length}`);
coloredElements.forEach((el, i) => {
  if (i < 5) { // Zeige nur erste 5
    console.log(`  ${i+1}. ${el.tagName}: ${el.style.backgroundColor}`);
  }
});

// 4. Prüfe CSS Custom Properties
const root = document.documentElement;
const rootStyle = window.getComputedStyle(root);
console.log('\n🎨 CSS Custom Properties:');
console.log('  --primary:', rootStyle.getPropertyValue('--primary'));
console.log('  --accent:', rootStyle.getPropertyValue('--accent'));

// 5. Suche nach allen hsl() Werten
console.log('\n🔍 Suche nach HSL-Werten in Inline-Styles...');
const allElements = document.querySelectorAll('*');
let foundHsl = false;
allElements.forEach(el => {
  const style = el.getAttribute('style');
  if (style && style.includes('hsl(')) {
    if (!foundHsl) {
      console.log('Gefundene HSL-Werte:');
      foundHsl = true;
    }
    console.log(`  ${el.tagName}: ${style}`);
  }
});

if (!foundHsl) {
  console.error('❌ KEINE HSL-Werte in Inline-Styles gefunden!');
  console.log('   → Das ist das Problem! Styles werden nicht applied.');
}

console.log('\n=== ANALYSE ===');
console.log('WENN du siehst:');
console.log('  ✅ backgroundColor: "hsl(45, 85%, 35%)" → Styles sind da, aber werden visuell überschrieben');
console.log('  ❌ backgroundColor: "" oder fehlt → React rendert nicht korrekt');
console.log('  ⚠️  backgroundColor: "hsl(var(--primary))" → Nutzt CSS Variable statt echtem Wert');
