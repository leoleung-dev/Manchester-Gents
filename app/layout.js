import './globals.css';
import Providers from '@/components/Providers';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mg-new.vercel.app';

const headingFont = localFont({
  src: '../public/fonts/Thelorin.otf',
  variable: '--font-heading',
  display: 'swap'
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Manchester Gents',
  description:
    'Relaxed socials for suited gents at The Lodge in Manchester — drinks, conversation, and effortless style.',
  openGraph: {
    title: 'Manchester Gents',
    description:
      'Relaxed socials for suited gents at The Lodge in Manchester — drinks, conversation, and effortless style.',
    url: APP_URL,
    siteName: 'Manchester Gents',
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Manchester Gents'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manchester Gents',
    description:
      'Relaxed socials for suited gents at The Lodge in Manchester — drinks, conversation, and effortless style.',
    images: ['/opengraph-image']
  },
  icons: {
    icon: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/icons/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/icons/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/icons/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/icons/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
