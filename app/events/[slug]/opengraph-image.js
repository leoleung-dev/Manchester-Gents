import { ImageResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { getOgLogoDataUrl } from '@/lib/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(request, { params }) {
  const { slug } = params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      title: true,
      subtitle: true,
      startTime: true,
      location: true
    }
  });

  const logo = getOgLogoDataUrl();
  const title = event?.title || 'Manchester Gents Event';
  const subtitle = event?.subtitle || 'Club socials for well-dressed gents';
  const detail = event?.startTime
    ? `${format(new Date(event.startTime), 'EEEE d MMM yyyy')} • ${event.location || 'The Lodge, Manchester'}`
    : event?.location || 'Manchester, United Kingdom';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: 'linear-gradient(160deg, #102033 0%, #0b1523 55%, #20344e 100%)',
          color: '#f7f4ed',
          padding: '80px 120px',
          gap: 40
        }}
      >
        <img src={logo} alt="Manchester Gents" style={{ width: 260, height: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
          <span style={{ fontSize: 26, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.7 }}>
            Manchester Gents Presents
          </span>
          <h1 style={{ fontSize: 68, margin: 0, lineHeight: 1.1 }}>{title}</h1>
          <p style={{ fontSize: 30, margin: 0, opacity: 0.85 }}>{subtitle}</p>
          <p style={{ fontSize: 26, margin: 0, opacity: 0.7 }}>{detail}</p>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
