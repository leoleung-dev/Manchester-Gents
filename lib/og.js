const DEFAULT_PRIMARY_URL = 'https://manchestergents.com';
const LOCAL_FALLBACK_URL = 'http://localhost:3000';

function parseAppUrlList(raw) {
  const entries = (raw || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  if (entries.length === 0) return [LOCAL_FALLBACK_URL];

  const validOrigins = [];
  for (const entry of entries) {
    try {
      validOrigins.push(new URL(entry).origin);
    } catch (err) {
      console.warn(`Ignoring invalid NEXT_PUBLIC_APP_URL entry: ${entry}`, err);
    }
  }
  return validOrigins.length ? validOrigins : [LOCAL_FALLBACK_URL];
}

function pickPrimaryAppUrl(urls) {
  const preferred = urls.find((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return host === 'manchestergents.com';
    } catch {
      return false;
    }
  });
  const candidate = preferred || urls[0] || DEFAULT_PRIMARY_URL;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_PRIMARY_URL;
  }
}

const appUrlList = parseAppUrlList(process.env.NEXT_PUBLIC_APP_URL);
const validAppUrl = pickPrimaryAppUrl(appUrlList);

const PUBLIC_LOGO_URL = `${validAppUrl}/images/Horizontal%20Logo.svg`;

export function getOgLogoDataUrl() {
  return PUBLIC_LOGO_URL;
}
