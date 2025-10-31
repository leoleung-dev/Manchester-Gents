const PUBLIC_LOGO_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mg-new.vercel.app'}/images/Horizontal%20Logo.svg`;

export function getOgLogoDataUrl() {
  return PUBLIC_LOGO_URL;
}
