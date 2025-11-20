import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Appointexo - Smart Appointment Management Platform',
  description: 'Revolutionary appointment management system with Telegram bot integration. Create your bot in 10 minutes and start accepting appointments today!',
  keywords: 'appointment booking, telegram bot, appointment system, online booking, medical appointments, beauty salons, consultations',
  authors: [{ name: 'Appointexo Team' }],
  creator: 'Appointexo',
  publisher: 'Appointexo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://appointexo.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/ru',
      'en-US': '/en',
      'he-IL': '/he',
    },
  },
  openGraph: {
    title: 'Appointexo - Smart Appointment Management Platform',
    description: 'Revolutionary appointment management system with Telegram bot integration. Create your bot in 10 minutes!',
    url: 'https://appointexo.com',
    siteName: 'Appointexo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Appointexo - Appointment Management Platform',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Appointexo - Smart Appointment Management Platform',
    description: 'Revolutionary appointment management system with Telegram bot integration.',
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
