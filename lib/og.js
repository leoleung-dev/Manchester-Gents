import fs from 'fs';
import path from 'path';

let logoDataUrl;

export function getOgLogoDataUrl() {
  if (!logoDataUrl) {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'Horizontal Logo.svg');
    const svgBuffer = fs.readFileSync(logoPath);
    logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgBuffer).toString('base64')}`;
  }
  return logoDataUrl;
}
