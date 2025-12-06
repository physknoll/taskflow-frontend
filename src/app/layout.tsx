import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from './providers';

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
    { media: '(prefers-color-scheme: light)', color: '#5c7cfa' },
    { media: '(prefers-color-scheme: dark)', color: '#212529' },
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

