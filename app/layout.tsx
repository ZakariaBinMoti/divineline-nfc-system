import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DivineLine Media — TruthTap™',
  description: 'Divinely Connected. Purposefully Aligned. NFC-powered scripture experience by DivineLine Media.',
  metadataBase: new URL('https://tap.divineline.com'),
  openGraph: {
    title: 'DivineLine Media — TruthTap™',
    description: 'Tap your bracelet to receive a daily word from God.',
    siteName: 'DivineLine Media',
  },
  icons: {
    icon: '/favicontruthtap.png?v=2',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
