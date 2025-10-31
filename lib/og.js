import logoSvg from '@/../public/images/Horizontal Logo.svg?raw';

let logoDataUrl;

export function getOgLogoDataUrl() {
  if (!logoDataUrl) {
    logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
  }
  return logoDataUrl;
}
