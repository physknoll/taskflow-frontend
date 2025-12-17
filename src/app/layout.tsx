import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://taskflow.ai'),
  title: {
    default: 'TaskFlow AI - Project Management',
    template: '%s | TaskFlow AI',
  },
  description: 'AI-powered project management and review platform. Streamline workflows with intelligent ticket management, automated reviews, and AI-assisted tracking.',
  keywords: [
    'project management',
    'AI',
    'task management',
    'team collaboration',
    'workflow automation',
    'ticket tracking',
    'code review',
    'productivity',
  ],
  authors: [{ name: 'TaskFlow AI' }],
  creator: 'TaskFlow AI',
  publisher: 'TaskFlow AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'TaskFlow AI',
    title: 'TaskFlow AI - AI-Powered Project Management',
    description: 'Streamline your workflow with intelligent ticket management, automated reviews, and AI-assisted project tracking.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskFlow AI - AI-Powered Project Management',
    description: 'Streamline your workflow with intelligent ticket management and AI-assisted tracking.',
    creator: '@taskflowai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F97316' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
