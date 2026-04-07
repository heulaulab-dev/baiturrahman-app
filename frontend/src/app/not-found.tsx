import Link from 'next/link'
import { Home, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div
          className="mb-6 flex size-20 items-center justify-center rounded-full border-2 border-sacred-green/20 bg-sacred-green/5 text-sacred-green"
          aria-hidden
        >
          <SearchX className="size-10 stroke-[1.5]" />
        </div>
        <p className="font-mono-jetbrains text-sm font-medium tracking-widest text-sacred-gold">404</p>
        <h1 className="mt-2 font-serif-cormorant text-3xl font-semibold text-sacred-green md:text-4xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          Alamat yang Anda buka tidak ada atau telah dipindahkan. Periksa URL atau kembali ke beranda.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 border-2 border-sacred-green bg-sacred-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sacred-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sacred-gold focus-visible:ring-offset-2"
      >
        <Home className="size-4" aria-hidden />
        Kembali ke beranda
      </Link>
    </div>
  )
}
