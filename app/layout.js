import './globals.css';
import Providers from '@/components/Providers';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

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
  title: 'Manchester Gents',
  description:
    'Relaxed socials for suited gents at The Lodge in Manchester — drinks, conversation, and effortless style.'
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
