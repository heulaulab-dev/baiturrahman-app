import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono, Noto_Naskh_Arabic } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { SmoothScrollHandler } from '@/components/providers/SmoothScrollHandler'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'

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
  metadataBase: new URL('https://masjidbaiturrahimsb.org'),
  title: {
    default: 'Masjid Baiturrahim Sungai Bambu',
    template: '%s | Masjid Baiturrahim Sungai Bambu',
  },
  description:
    'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Masjid Baiturrahim Sungai Bambu',
    title: 'Masjid Baiturrahim Sungai Bambu',
    description:
      'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Masjid Baiturrahim Sungai Bambu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masjid Baiturrahim Sungai Bambu',
    description:
      'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
		<html lang='id' className='scroll-smooth' suppressHydrationWarning>
			<body
				className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} ${notoNaskhArabic.variable}`}
			>
				<AuthProvider>
					<QueryProvider>
						<SmoothScroll />
						<SmoothScrollHandler />
						<div className='flex flex-col min-h-screen'>
							<main className='flex-1'>{children}</main>
							<Toaster />
						</div>
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
