import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono, Noto_Naskh_Arabic } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SmoothScrollHandler } from '@/components/providers/SmoothScrollHandler'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400'],
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Masjid Baiturrahim',
  description: 'Website resmi Masjid Baiturrahim - Pusat ibadah dan kegiatan keagamaan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} ${notoNaskhArabic.variable}`}>
        <QueryProvider>
          <ThemeProvider>
            <SmoothScroll />
            <SmoothScrollHandler />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
