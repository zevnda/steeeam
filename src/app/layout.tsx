import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'

import './globals.css'

import Providers from '@/app/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '',
}

export const metadata: Metadata = {
  title: 'Steeeam - Visualize your Steam profile',
  description:
    'Steeeam is a modern web app that allows you to visualize and share your Steam profile with customizable cards.',
  keywords: [
    'Steam library calculator',
    'Steam playtime tracker',
    'Steam game cost analyzer',
    'free Steam library calculator',
    'compare Steam playtime with friends',
    'Steam profile stats',
    'Steam library stats generator',
    'shareable Steam library image',
    'Discord Steam library image',
  ],
  authors: [{ name: 'zevnda' }],
  generator: 'Next.js',
  applicationName: 'Steeeam',
  referrer: 'origin-when-cross-origin',
  creator: 'zevnda',
  publisher: 'Steeeam',
  metadataBase: new URL('https://steeeam.vercel.app'),
  alternates: {
    canonical: 'https://steeeam.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://steeeam.vercel.app',
    title: 'Steeeam - Visualize your Steam profile',
    description:
      'Steeeam is a modern web app that allows you to visualize and share your Steam profile with customizable cards.',
    siteName: 'Steeeam',
    images: [
      {
        url: 'https://steeeam.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Steeeam Open Graph Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steeeam - Visualize your Steam profile',
    description:
      'Steeeam is a modern web app that allows you to visualize and share your Steam profile with customizable cards.',
    images: ['https://steeeam.vercel.app/og-image.png'],
  },
  other: {
    'og:logo': 'https://steeeam.vercel.app/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='bg-black'>
      <body className={`${inter.variable} antialiased dark`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
