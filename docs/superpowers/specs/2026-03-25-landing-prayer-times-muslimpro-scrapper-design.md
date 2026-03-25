# Landing Prayer Times: External MuslimPro Scrapper Integration

**Date:** 2026-03-25  
**Scope:** Replace hardcoded prayer times in `frontend/src/components/landing/PrayerTimesSection.tsx` with data fetched from `muslimpro-scrapper.lleans.dev`, using `calcMethod=KEMENAG`. Update the secondary “Hijri/Ramadhan” line to show Ramadhan range instead of hardcoded Hijri day.

---

## Goals
1. Remove hardcoded `prayerTimes` array in the landing `PrayerTimesSection`.
2. Fetch prayer times for a single location (initially **Jakarta, Indonesia**) from `muslimpro-scrapper`.
3. Use `calcMethod=KEMENAG` so the calculation matches KEMENAG convention parameters.
4. Replace the hardcoded Hijri line (`17 Ramadhan 1446 H`) with Ramadhan range for the current Gregorian year, based on scrapper response.

## Non-goals (for this iteration)
1. Implement full location selection UI on landing (we only support a fixed query string).
2. Add Hijri day conversion beyond the Ramadhan range.
3. Add a full test suite (repo currently has no configured test framework).

---

## Data Sources

### External: MuslimPro Scrapper (cache-based)
Server: `https://muslimpro-scrapper.lleans.dev`

Observed endpoints (tested):
- `GET /health`
- `GET /{query}?calcMethod=KEMENAG`
- `GET /{query}?day=<date>` (example accepts `day=2026-03-25`)

Response shape (key fields):
- `data.location`: string
- `data.calculationMethod`: string
- `data.praytimes`: object keyed by date labels (example keys like `Wed Mar 25`)
  - each date contains:
    - `Fajr`, `Zuhr`, `Asr`, `Maghrib`, `Isha` (24h time strings `HH:mm`)
- `data.ramadhan`: object keyed by Gregorian year
  - `data.ramadhan[year].start`
  - `data.ramadhan[year].end`

References:
- Scrapper docs landing: https://muslimpro-scrapper.lleans.dev/docs
- Example response from live endpoint:
  - `https://muslimpro-scrapper.lleans.dev/Jakarta?calcMethod=KEMENAG`

---

## UI Contract (Landing `PrayerTimesSection`)

### Existing UI behavior to preserve
The section currently:
1. Renders five “pills” for the prayer names and their times.
2. Highlights:
   - `currentPrayer`: the last prayer whose time is <= now
   - `nextPrayer`: index + 1 (wrap to Subuh)
3. Shows Gregorian date in the top-right panel via `new Date().toLocaleDateString('id-ID', ...)`

### Changes
1. Prayer pills must use fetched times (no hardcoded array).
2. Hijri line must be replaced:
   - Remove hardcoded `17 Ramadhan 1446 H`
   - Display: `Ramadhan {year}: {start} - {end}` when available
   - Fallback: `Ramadhan info unavailable` if the year key is missing.

---

## Integration Design

### Client-side fetching approach
Prefer TanStack Query (since the repo already uses it in other sections), but the landing component can remain a client component.

Implementation plan (conceptual):
1. Add a small client service for `muslimpro-scrapper`.
   - Base URL constant: `https://muslimpro-scrapper.lleans.dev`
   - Function: `fetchPrayerTimesForToday(query: string, calcMethod: string)`
2. Add a hook:
   - `useMuslimProScrapperPrayerTimes({ query, calcMethod, date })`
   - Internally:
     - calls `GET /{query}?day=<YYYY-MM-DD>` (or the minimal query form that still includes `praytimes` keys)
     - uses `calcMethod=KEMENAG`
3. Update `PrayerTimesSection` to:
   - compute the “todayKey” used to index `data.praytimes`
   - derive prayer times for the day from `data.praytimes[todayKey]`
   - compute `currentPrayer` and `nextPrayer` using the same minute-based logic as before
   - render loading skeletons until the day’s prayer times are available

### “Today key” mapping strategy
Because `data.praytimes` keys are label strings (e.g. `Wed Mar 25`), we must compute the same format.

Strategy:
1. Format today with:
   - locale: `en-US`
   - weekday: `short`
   - month: `short`
   - day: `numeric`
2. Normalize string:
   - remove commas (`Wed, Mar 25` -> `Wed Mar 25`)
3. Use the normalized result to index `praytimes`.

Fallback:
If indexing fails:
1. try a comma-removed variant
2. otherwise fall back to “first date key in `praytimes` whose day matches today.day”

### Location selection assumption
Initial implementation assumption:
- `query = "Jakarta"`

Rationale:
- We can validate end-to-end integration quickly.
- Future improvement: derive the query from backend `MosqueInfo` address/city.

---

## Error Handling & Fallback UI
1. Loading:
   - show 5 skeleton pills with existing styling pattern (e.g. muted/animate-pulse if available)
2. Error / no data:
   - keep the UI stable (render pills but disabled or with placeholder `--:--`)
   - show a small inline message near the “date display” area:
     - `Jadwal belum tersedia`
3. Ramadhan range:
   - if `data.ramadhan[currentYear]` exists, show range
   - else show `Ramadhan info unavailable`

---

## Caching / Performance
Suggested React Query settings:
- `staleTime`: 1 hour (prayer times change daily)
- `cacheTime`: 6-12 hours (optional)
- `refetchOnWindowFocus`: false (avoid repeated external calls)

---

## Security / Compliance Notes
1. This integration relies on a third-party endpoint without our own API authorization layer.
2. If CORS blocks browser requests, we should move the fetch into:
   - a Next.js server route handler (proxy), or
   - the Go backend (preferred for consistent domain/caching).

---

## Acceptance Criteria (Definition of Done)
1. Landing page shows prayer times populated from external scrapper (no hardcoded prayer times).
2. The currently highlighted pill updates according to the browser current time.
3. The Ramadhan line is derived from scrapper `ramadhan[year].start/end` and is not hardcoded.
4. Page does not crash on missing data keys; it shows a fallback UI.

---

## Manual Test Plan
1. Open landing page and verify:
   - pill times match expected format `HH:mm`
   - current/next highlight changes as time passes (or simulate by checking computation on refresh)
2. Verify Ramadhan range:
   - ensure it displays `Ramadhan {year}: {start} - {end}`
3. Verify failure path:
   - temporarily block the external request (or change the query) to confirm fallback UI works.

