import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bookly - Умная система записи через Telegram',
  description: 'Революционная система управления записями на прием с интеграцией Telegram бота. Создайте своего бота за 10 минут и начните принимать записи уже сегодня!',
  keywords: 'запись на прием, telegram бот, система записи, онлайн бронирование, медицинские записи, салоны красоты, консультации',
  authors: [{ name: 'Bookly Team' }],
  creator: 'Bookly',
  publisher: 'Bookly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bookly.app'),
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/ru',
      'en-US': '/en',
      'he-IL': '/he',
    },
  },
  openGraph: {
    title: 'Bookly - Умная система записи через Telegram',
    description: 'Революционная система управления записями на прием с интеграцией Telegram бота. Создайте своего бота за 10 минут!',
    url: 'https://bookly.app',
    siteName: 'Bookly',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bookly - Система записи через Telegram',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookly - Умная система записи через Telegram',
    description: 'Революционная система управления записями на прием с интеграцией Telegram бота.',
    images: ['/og-image.jpg'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
