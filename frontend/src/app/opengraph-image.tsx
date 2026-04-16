import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #064e3b 100%)',
          color: '#ecfdf5',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              'linear-gradient(45deg, transparent 25%, #34d399 25%, #34d399 50%, transparent 50%, transparent 75%, #34d399 75%)',
            backgroundSize: '120px 120px',
          }}
        />

        <div
          style={{
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '76px',
              borderRadius: '999px',
              backgroundColor: '#facc15',
            }}
          />
          <div style={{ fontSize: '32px', letterSpacing: '2px' }}>MASJID RESMI</div>
        </div>

        <div
          style={{
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.1 }}>
            Masjid Baiturrahim
            <br />
            Sungai Bambu
          </div>
          <div style={{ fontSize: '34px', color: '#bbf7d0' }}>Pusat Ibadah dan Pembinaan Umat</div>
        </div>
      </div>
    ),
    size
  )
}
