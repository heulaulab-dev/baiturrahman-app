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
     - calls `GET /{query}?calcMethod=KEMENAG&day=<YYYY-MM-DD>`
     - expects response fields:
       - `data.praytimes` keyed by date label strings (e.g. `Wed Mar 25`)
       - `data.ramadhan` keyed by Gregorian year (e.g. `data.ramadhan[2026]`)
3. Update `PrayerTimesSection` to:
   - compute the “todayKey” used to index `data.praytimes`
   - derive prayer times for the day from `data.praytimes[todayKey]`
   - compute `currentPrayer` and `nextPrayer` using the deterministic minute-based logic defined below
   - render loading skeletons until the day’s prayer times are available

### Time parsing & highlight algorithm
Assumptions:
1. Use **browser local time** for “now” and for deriving the highlight.
2. Prayer times are returned as `HH:mm` 24-hour strings.

Algorithm (run on render and re-run on an interval):
1. Convert each prayer time string to minutes since midnight:
   - `minutes = hours * 60 + minutes`
2. Convert browser “now” to minutes:
   - `nowMinutes = now.getHours() * 60 + now.getMinutes()`
3. Define `currentPrayer` as:
   - the greatest index `i` where `prayerMinutes[i] <= nowMinutes`
   - if none match (all times are in the future), set `currentPrayer = 0` (Subuh)
4. Define `nextPrayer` as:
   - `currentPrayer + 1`, but wrap to `0` if it reaches the array length
5. Tie handling:
   - equality (`nowMinutes === prayerMinutes[i]`) counts as current prayer (because of `<=`)

Update cadence:
1. Recompute highlight on mount.
2. Recompute highlight every 60 seconds using `setInterval` to keep the “current/next” highlight accurate without page refresh.

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
3. Use the normalized result to index `praytimes` (exact match on the normalized label).

Fallback:
If exact indexing fails:
1. Iterate all keys in `praytimes`.
2. Choose keys where:
   - the month short token matches today's month short token
   - and the day numeric matches today's day numeric
   - and the weekday short token matches today's weekday short token
3. If exactly one key matches, use it.
4. If multiple keys match (unexpected), pick the one whose label string is lexicographically smallest (deterministic).
5. If zero keys match, show fallback UI and do not attempt to highlight (or highlight all pills in a neutral state).

### Location selection assumption
Initial implementation assumption:
- `query = "Jakarta"`

Rationale:
- We can validate end-to-end integration quickly.
- Future improvement: derive the query from backend `MosqueInfo` address/city.

---

## Error Handling & Fallback UI
1. Loading:
   - show 5 skeleton pills with the same layout as the final UI
   - hide the Ramadhan line until data arrives (or show a neutral skeleton line)
2. Error / no data:
   - render pills with placeholder time `--:--` and disable highlight styling (no gold border)
   - show a small inline message near the “date display” area:
     - `Jadwal belum tersedia`
   - Ramadhan line:
     - if `ramadhan` exists but the year key is missing, show `Ramadhan info unavailable`
     - otherwise keep neutral fallback
3. Ramadhan year:
   - compute `currentYear` from browser local date (`new Date().getFullYear()`), not from server date

---

## Caching / Performance
Suggested React Query settings:
- `staleTime`: 1 hour (prayer times change daily)
- `cacheTime`: 6-12 hours (optional)
- `refetchOnWindowFocus`: false (avoid repeated external calls)

---

## Security / Compliance Notes
Default for this iteration:
1. Use direct client-side fetch from the browser to `muslimpro-scrapper`.

If CORS blocks browser requests:
1. Implement a proxy (choose one) as a follow-up step:
   - Next.js server route handler (recommended for fast iteration)
   - or Go backend proxy (recommended for consistency/caching)

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

