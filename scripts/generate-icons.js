const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../public/brand/antaverse-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

const sizes = [
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 512, height: 512, name: 'icon-512.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' },
  { width: 512, height: 512, name: 'maskable-icon.png' }
];

Promise.all(
  sizes.map(size =>
    sharp(source)
      .resize(size.width, size.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, size.name))
      .then(() => console.log(`✓ ${size.name} créé (${size.width}x${size.height})`))
  )
).then(() => {
  console.log('\n✓ Toutes les déclinaisons créées!');
  sizes.forEach(s => {
    const stat = fs.statSync(path.join(outputDir, s.name));
    console.log(`  ${s.name}: ${Math.round(stat.size / 1024)}K`);
  });
}).catch(err => console.error('Erreur:', err));
