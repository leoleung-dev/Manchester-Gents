import { ImageResponse } from 'next/og';
import { getOgLogoDataUrl } from '@/lib/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function GET() {
  const logo = getOgLogoDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(140deg, #111f33 0%, #0b1523 60%, #1c2f4d 100%)',
          color: '#f7f4ed',
          gap: 48,
          textAlign: 'center',
          padding: '80px'
        }}
      >
        <div
          style={{
            width: 320,
            height: 120,
            position: 'relative'
          }}
        >
          <Logo dataUrl={logo} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 760
          }}
        >
          <span style={{ fontSize: 28, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.7 }}>
            Relaxed socials for suited gents
          </span>
          <h1 style={{ fontSize: 72, margin: 0, lineHeight: 1.1 }}>Manchester Gents</h1>
          <p style={{ fontSize: 28, margin: 0, opacity: 0.8 }}>
            Tailored evenings at The Lodge • Drinks, conversation, effortless style
          </p>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}

function Logo({ dataUrl }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(${dataUrl})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    />
  );
}
export const revalidate = 3600;
