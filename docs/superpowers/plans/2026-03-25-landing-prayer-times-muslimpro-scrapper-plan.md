# Landing Prayer Times: External MuslimPro Scrapper Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded landing `PrayerTimesSection` prayer times and Hijri line with data fetched from `muslimpro-scrapper.lleans.dev` (using `calcMethod=KEMENAG&day=YYYY-MM-DD`), and highlight the current/next prayer exactly per the approved algorithm; show Ramadhan range from `ramadhan[currentYear].start/end`.

**Architecture:** The landing component becomes a client-side data consumer using TanStack Query to fetch a single location/day from the scrapper. UI highlight state is computed locally from fetched times plus a `now` state that updates every 60 seconds, so network refetch happens only when the computed `day` changes at midnight.

**Tech Stack:** Next.js (App Router), React client component, TypeScript, TanStack Query, framer-motion, Tailwind CSS.

---

## Task 1: Replace hardcoded prayer times with scrapper data

**Files:**
- Modify: `frontend/src/components/landing/PrayerTimesSection.tsx`

- [ ] **Step 1: Remove the hardcoded prayer time array**
  - Confirm this file stays a client component (it must include `"use client"` at the top) because it will use `useState`/`useEffect` and TanStack Query.
  - Confirm the app already provides a TanStack `QueryClientProvider` above this component; if not, stop and add the provider in the correct app root (do not guess the location inside this plan).
  - Introduce the `now` state in this task (before defining the TanStack Query `day` input) so `day`/`queryKey` can update when the browser date flips at midnight.
  - Delete the existing static `prayerTimes` constant and refactor the component so it can render pills based on fetched data.
  - Keep the pill layout structure and styling approach intact so the UX matches the current section immediately.

- [ ] **Step 2: Add TanStack Query fetch for `Jakarta` + `calcMethod=KEMENAG&day=YYYY-MM-DD`**
  - Create a TanStack Query `useQuery` call inside the landing `PrayerTimesSection`.
  - Fetch from `https://muslimpro-scrapper.lleans.dev/Jakarta?calcMethod=KEMENAG&day=${day}` where `day` is derived from browser local time (`YYYY-MM-DD`).
  - Ensure month/day are zero-padded to 2 digits (`padStart(2, "0")`) so single-digit months/days produce `MM`/`DD` correctly.
  - Derive `day` from the `now` state introduced in Task 1 so the `queryKey` updates only when the local date flips at midnight (do not derive `day` once from a static `new Date()`).
  - Ensure the `queryKey` is EXACTLY (same order):
    - `["landing-prayer-times", "muslimpro-scrapper", query /* Jakarta */, calcMethod /* KEMENAG */, day]`
  - Apply query settings per spec: `enabled` based on day truthiness, `staleTime` ~1 hour, `refetchOnWindowFocus` false, and no refetch interval.

- [ ] **Step 3: Map scrapper prayer keys to the landing pill order**
  - Implement an internal mapping so pill indices are exactly:
    - index 0 (`Subuh`) <- scrapper `Fajr`
    - index 1 (`Dzuhur`) <- scrapper `Zuhr`
    - index 2 (`Ashar`) <- scrapper `Asr`
    - index 3 (`Maghrib`) <- scrapper `Maghrib`
    - index 4 (`Isya`) <- scrapper `Isha`
  - Ensure the component renders pills in this exact order regardless of the scrapper response ordering.

- [ ] **Step 4: Implement loading and error/fallback UI for pills**
  - Loading: render 5 skeleton pills using the same pill layout (names + time area), and avoid applying highlight gold styles until real times exist.
  - Error/no data: render pills with `--:--` placeholder times and ensure highlight gold border classes are not applied.
  - Add the inline message near the date display area: `Jadwal belum tersedia` only for error/no-data (not during the loading skeleton).

- [ ] **Step 5: Swap the hardcoded Hijri line for Ramadhan range placeholder logic**
  - Remove the hardcoded `17 Ramadhan 1446 H`.
  - Prepare the component to show either Ramadhan range (when available) or `Ramadhan info unavailable` (when the `ramadhan` structure exists but the current year key is missing).

- [ ] **Step 6: Commit after this task**
  - Commit the data wiring + basic loading/error fallback changes before moving on to highlight correctness.

## Task 2: Implement today-key mapping + exact current/next highlight algorithm

**Files:**
- Modify: `frontend/src/components/landing/PrayerTimesSection.tsx`

- [ ] **Step 1: Implement the “today key” formatter using browser local time**
  - Compute todayKey from browser local `Date` using `en-US` formatting with:
    - weekday: short
    - month: short
    - day: numeric
  - Normalize the string using the same normalization on ALL candidate keys:
    - remove commas
    - collapse multiple whitespace to a single space
    - trim
  - Example:
    - `Wed, Mar 25` -> `Wed Mar 25`

- [ ] **Step 2: Implement exact `praytimes[todayKey]` selection, then fallback key matching**
  - Guard: if the fetched response has missing `data` or missing `data.praytimes`, treat it as “no data” and enter the neutral fallback (do not attempt key iteration).
  - First try `data.praytimes[todayKey]`.
  - If exact indexing fails, iterate all keys in `data.praytimes` and apply the spec fallback:
    - match weekday token, month token, and numeric day token
    - implement matching deterministically by splitting normalized labels (e.g. `Wed Mar 25`) on whitespace into `[weekdayToken, monthToken, dayNumericToken]`
    - before splitting candidate labels, apply the same normalization to each label key (remove commas, collapse multiple whitespace, and trim)
    - if multiple candidates exist, pick lexicographically smallest using the normalized label string (after comma removal/whitespace normalization) to be deterministic
    - if zero matches, enter a neutral state where highlight is not computed from an invalid set

- [ ] **Step 3: Add `now` state and 60-second highlight recomputation**
  - Maintain/verify the `now` state created in Task 1 and update it every 60 seconds via `setInterval` to keep the current/next highlight accurate.
  - Use an effect to `setInterval` every 60 seconds to update `now`, and cleanup on unmount.
  - Ensure highlight computations depend on `now`.
  - Ensure the derived `day` used in the TanStack Query `queryKey` is recomputed from `now` so refetch occurs only when the date flips at midnight.

- [ ] **Step 4: Parse fetched `HH:mm` times to minutes and compute highlight indices**
  - Build the ordered `prayerMinutes` array in the exact landing pill/index order derived from the spec mapping: `[Fajr, Zuhr, Asr, Maghrib, Isha] -> [Subuh, Dzuhur, Ashar, Maghrib, Isya]`.
  - Prerequisite ordering: compute `prayerTimesForToday` first, then compute `hasPrayerTimes` from it; only then enter parsing/highlight logic.
  - Define `hasPrayerTimes` EXACTLY:
    - `hasPrayerTimes = Boolean(prayerTimesForToday?.Fajr && prayerTimesForToday?.Zuhr && prayerTimesForToday?.Asr && prayerTimesForToday?.Maghrib && prayerTimesForToday?.Isha)`
  - Guard parsing and highlight computation: only parse/compute `prayerMinutes`, `currentPrayer`, and `nextPrayer` when `hasPrayerTimes` is true; otherwise skip parsing to avoid runtime crashes from missing/undefined time strings.
  - Convert each prayer time string in that ordered array into minutes since midnight.
  - Convert `now` into minutes since midnight.
  - Compute `currentPrayer` exactly as:
    - greatest index `i` where `prayerMinutes[i] <= nowMinutes`
    - if none match, set `currentPrayer = 0` (Subuh)
  - Compute `nextPrayer` exactly as `currentPrayer + 1` with wrap back to 0.
  - Confirm tie behavior uses `<=` so equality counts as current prayer.

- [ ] **Step 5: Enforce the “gold border only when hasPrayerTimes is true” styling rule**
  - Re-use `hasPrayerTimes` computed from `prayerTimesForToday` (Step 4 prerequisite).
  - Apply gold highlight styling only when `hasPrayerTimes` is true.
  - When false:
    - show `--:--`
    - never apply gold border classes for current/next pills (regardless of any computed indices)
    - treat highlight state as neutral by ensuring the highlight algorithm is not used to drive styling when `hasPrayerTimes` is false (so no gold borders appear).
    - keep neutral borders consistent with the error/fallback UX.

- [ ] **Step 6: Commit after this task**
  - Commit once highlight correctness + todayKey mapping + conditional styling rules are implemented.

## Task 3: Finalize Ramadhan line derivation from scrapper response

**Files:**
- Modify: `frontend/src/components/landing/PrayerTimesSection.tsx`

- [ ] **Step 1: Derive `currentYear` from browser local date**
  - Use the already-maintained `now` state (`now.getFullYear()`), not a fresh `new Date()`, so midnight transitions stay consistent with the `day` used for fetching.

- [ ] **Step 2: Render `Ramadhan {year}: {start} - {end}` from scrapper `ramadhan[currentYear]`**
  - If `ramadhan` exists and the year key exists, render `Ramadhan {year}: {start} - {end}` exactly.
  - If `ramadhan` exists but the year key is missing, render `Ramadhan info unavailable`.
  - If `ramadhan` is missing entirely/undefined, treat it like the loading/neutral case (hide or show a neutral placeholder), and do not show `Ramadhan info unavailable`.
  - If data is still loading, hide or render a neutral skeleton line until fetch completes (match the spec preference).

- [ ] **Step 3: Ensure Ramadhan fallback matches loading/error rules**
  - On error/no data, keep Ramadhan neutral/fallback consistent with the pills placeholder state.

- [ ] **Step 4: Commit after this task**

## Task 4: Automated verification (build/lint/typecheck via existing repo scripts)

**Files:**
- Modify: (verification only; no code changes)

- [ ] **Step 1: Run frontend lint**
  - Run: `cd frontend && bun run lint`
  - Expected: no lint errors.

- [ ] **Step 2: Run frontend build (includes typecheck)**
  - Run: `cd frontend && bun run build`
  - Expected: build succeeds; TypeScript errors (if any) are resolved.

- [ ] **Step 3: Smoke-check the landing route manually in dev**
  - Run: `cd frontend && bun run dev`
  - Open the landing page route in a browser and confirm the section renders without runtime exceptions.

- [ ] **Step 4: Commit after verification**

## Task 5: Manual UX verification for acceptance criteria

**Files:**
- Modify: (manual verification only)

- [ ] **Step 1: Confirm prayer pills populate with correct formatting**
  - Load the landing page and verify the times show in `HH:mm` format.
  - Confirm the pill order is exactly: `Subuh`, `Dzuhur`, `Ashar`, `Maghrib`, `Isya`.

- [ ] **Step 2: Confirm current/next highlight updates**
  - Observe that at page load, the highlighted pills correspond to the “currentPrayer” and “nextPrayer” computed by the spec algorithm.
  - Keep the tab open for at least 1-2 minute transitions (or refresh near a prayer boundary if convenient) to ensure highlight updates every 60 seconds.

- [ ] **Step 3: Confirm Ramadhan line is correct**
  - Verify the line displays `Ramadhan {year}: {start} - {end}` for the current Gregorian year when available.
  - If you temporarily change the year logic or block parts of the response (e.g., using devtools to emulate missing keys), verify `Ramadhan info unavailable` appears as specified.

- [ ] **Step 4: Confirm fallback UI on external request failure**
  - Temporarily block the external request (browser devtools network block) or change the query to an invalid one so the fetch fails.
  - Verify the pills show `--:--`, gold borders are never applied, and the inline `Jadwal belum tersedia` message appears.

- [ ] **Step 5: Commit (optional if fixes were needed)**

## Notes / Follow-ups (not part of this iteration)
- If CORS blocks browser requests to `muslimpro-scrapper.lleans.dev`, implement a proxy (follow-up) using either a Next.js route handler or a backend proxy. This plan assumes direct client fetch works.

---

Two execution options: Subagent-driven (recommended) vs Inline execution
- Subagent-driven (recommended): I split implementation into task-by-task units and review between tasks.
- Inline execution: I implement all tasks in this session using a checkpointed approach.

