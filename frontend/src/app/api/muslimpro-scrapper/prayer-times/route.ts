import { NextResponse } from 'next/server'

const SCRAPPER_BASE = 'https://muslimpro-scrapper.lleans.dev'
const DEFAULT_QUERY = 'Jakarta'
const DEFAULT_CALC_METHOD = 'KEMENAG'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Keep iteration 1 scoped: fixed location + method unless explicitly provided.
  const query = searchParams.get('query')?.trim() || DEFAULT_QUERY
  const calcMethod = searchParams.get('calcMethod')?.trim() || DEFAULT_CALC_METHOD
  const day = searchParams.get('day')?.trim()

  if (!day) {
    return NextResponse.json({ error: 'Missing required query param: day' }, { status: 400 })
  }

  // Basic hardening: only allow the approved combination for now.
  if (query !== DEFAULT_QUERY || calcMethod !== DEFAULT_CALC_METHOD) {
    return NextResponse.json(
      { error: 'Unsupported query/calcMethod for this endpoint' },
      { status: 400 }
    )
  }

  const upstreamUrl = `${SCRAPPER_BASE}/${encodeURIComponent(query)}?calcMethod=${encodeURIComponent(
    calcMethod
  )}&day=${encodeURIComponent(day)}`

  const res = await fetch(upstreamUrl, {
    // Avoid cached failures, but let Next.js cache be controlled by headers below.
    cache: 'no-store',
  })

  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Upstream error', status: res.status, body },
      { status: 502 }
    )
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      // Cache at the edge/browser briefly; times are daily.
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}

