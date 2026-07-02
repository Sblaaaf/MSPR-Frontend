import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n-context'
import { OfflineBanner } from '@/components/offline-banner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom autorisé : WCAG 2.1 SC 1.4.4 (Resize text) & 1.4.10 (Reflow).
  // Ne jamais remettre maximumScale/userScalable qui bloquent l'agrandissement.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fdf9' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2f20' },
  ],
}

export const metadata: Metadata = {
  title: 'Jarmy - Coach Nutrition',
  description: 'Votre coach nutrition intelligent. Analysez vos repas, suivez vos calories et atteignez vos objectifs de santé.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Lien d'évitement clavier — WCAG 2.1 SC 2.4.1 (Bypass Blocks) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <I18nProvider>
          <OfflineBanner />
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
