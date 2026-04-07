export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative size-16">
        <span className="absolute inset-0 rounded-full border-2 border-sacred-green/15" aria-hidden />
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sacred-gold border-r-sacred-green/50"
          aria-hidden
        />
      </div>
      <div className="text-center">
        <p className="font-serif-cormorant text-xl font-semibold text-sacred-green">Memuat…</p>
        <p className="mt-1 text-sm text-muted-foreground">Masjid Baiturrahim</p>
      </div>
    </div>
  )
}
