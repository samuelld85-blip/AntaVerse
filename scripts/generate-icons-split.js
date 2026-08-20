const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const appSource = path.join(__dirname, '../public/brand/app-source.png');
const webSource = path.join(__dirname, '../public/brand/web-source.png');
const appDir = path.join(__dirname, '../public/icons/app');
const webDir = path.join(__dirname, '../public/icons/web');

const appSizes = [
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 512, height: 512, name: 'icon-512.png' },
  { width: 512, height: 512, name: 'maskable-icon.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' }
];

const webSizes = [
  { width: 32, height: 32, name: 'favicon-32.png' },
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  console.log('🎨 Génération des icônes...\n');

  console.log('📱 APP icons (sans texte, fond noir):');
  await Promise.all(
    appSizes.map(size =>
      sharp(appSource)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(appDir, size.name))
        .then(() => {
          const stat = fs.statSync(path.join(appDir, size.name));
          console.log(`  ✓ ${size.name} (${size.width}x${size.height}) - ${Math.round(stat.size / 1024)}K`);
        })
    )
  );

  console.log('\n🌐 WEB icons (avec ANTAVERSE, fond transparent):');
  await Promise.all(
    webSizes.map(size =>
      sharp(webSource)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(webDir, size.name))
        .then(() => {
          const stat = fs.statSync(path.join(webDir, size.name));
          console.log(`  ✓ ${size.name} (${size.width}x${size.height}) - ${Math.round(stat.size / 1024)}K`);
        })
    )
  );

  console.log('\n✅ Toutes les icônes générées avec succès!');
}

generateIcons().catch(err => console.error('❌ Erreur:', err));
