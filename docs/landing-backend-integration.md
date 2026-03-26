# Landing Page Backend Integration

This document describes the integration of backend APIs for all landing page sections.

## Overview

All landing page sections now fetch data dynamically from the backend instead of using hardcoded values.

| Section | Backend API | Endpoints |
|---------|-------------|------------|
| PrayerTimesSection | External Scrapper | `GET /api/muslimpro-scrapper/prayer-times` |
| DonationSection | Backend API | `GET /v1/payment-methods`, `POST /v1/donations` |
| KajianSection | Backend API | `GET /v1/events` |
| BeritaSection | Backend API | `GET /v1/announcements` |
| ContactSection | Backend API | `GET /v1/mosque` |
| MimbarJumatSection | Backend API | `GET /v1/khutbahs/latest`, `GET /v1/khutbahs/archive` |

## Components

### PrayerTimesSection
- Uses external MuslimPro scrapper service
- Displays current day's prayer times with next prayer highlight
- Shows Ramadhan info when applicable
- Fetch URL: `/api/muslimpro-scrapper/prayer-times?day=YYYY-MM-DD`

### DonationSection
- Fetches active payment methods from backend
- Groups by type: `bank_transfer`, `qris`, `ewallet`
- Features:
  - Copy account number to clipboard
  - Donation form with submission to backend
  - Zakat calculator (static, UI only)
- Payment Method Fields: name, type, account_number, account_name, qr_code_url, instructions

### KajianSection
- Fetches published events from backend
- Displays featured event (first by date) + list of others
- Features:
  - Event date/time/location display
  - Event image support
  - Loading and empty states
- Event Fields: title, slug, description, date, time, location, image_url

### BeritaSection
- Fetches published announcements from backend
- Displays featured announcement + archive list
- Features:
  - Loading and empty states
  - Date formatted in Indonesian locale
- Announcement Fields: title, content, created_at

### ContactSection
- Fetches mosque info from backend
- Displays address, phone, email, website
- Social links: instagram, youtube, facebook (if configured)
- Contact form (static, not yet connected to backend)
- MosqueInfo Fields: address, phone, email, website, instagram, youtube, facebook

### MimbarJumatSection
- Fetches khutbah (Friday sermon) from backend
- Displays latest khutbah + archive
- Features:
  - Download link for khutbah file
  - Khatib, Imam, Muadzin display
  - Loading and empty states
- Khutbah Fields: khatib, tema, imam, muadzin, date, content, file_url, status

## Backend APIs

### Khutbah (New)

**Model:**
```go
type Khutbah struct {
    ID          uuid.UUID     `json:"id"`
    Khatib      string        `json:"khatib"`
    Tema        string        `json:"tema"`
    Imam        *string       `json:"imam,omitempty"`
    Muadzin     *string       `json:"muadzin,omitempty"`
    Date        time.Time     `json:"date"`
    Content     *string       `json:"content,omitempty"`
    FileURL     *string       `json:"file_url,omitempty"`
    Status      KhutbahStatus  `json:"status"`
    CreatedBy   uuid.UUID     `json:"created_by"`
    CreatedAt   time.Time     `json:"created_at"`
    UpdatedAt   time.Time     `json:"updated_at"`
}
```

**Endpoints:**

| Method | Route | Description | Auth |
|--------|-------|-------------|-------|
| GET | `/v1/khutbahs/latest` | Get latest published khutbah | Public |
| GET | `/v1/khutbahs/archive` | Get archive (excluding latest) | Public |
| GET | `/admin/khutbahs` | List all khutbahs | Admin |
| GET | `/admin/khutbahs/:id` | Get by ID | Admin |
| POST | `/admin/khutbahs` | Create khutbah | Admin |
| PUT | `/admin/khutbahs/:id` | Update khutbah | Admin |
| DELETE | `/admin/khutbahs/:id` | Delete khutbah | Admin |
| PUT | `/admin/khutbahs/:id/toggle` | Toggle publish status | Admin |

## Frontend Types

Updated types in `frontend/src/types/index.ts`:

```typescript
export interface PaymentMethod {
  id: string
  name: string
  type: 'bank_transfer' | 'ewallet' | 'qris'
  account_number?: string
  account_name?: string
  qr_code_url?: string
  instructions?: string
  is_active: boolean
  display_order: number
}

export interface Khutbah {
  id: string
  khatib: string
  tema: string
  imam?: string
  muadzin?: string
  date: string
  content?: string
  file_url?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}
```

## API Services

Added to `frontend/src/services/apiService.ts`:

```typescript
// Khutbah
export const getLatestKhutbah = async (): Promise<Khutbah>
export const getKhutbahArchive = async (): Promise<Khutbah[]>
```

Added to `frontend/src/services/hooks.ts`:

```typescript
export const useLatestKhutbah = () => { ... }
export const useKhutbahArchive = () => { ... }
```

## Accessibility Improvements

Fixed the following accessibility issues:
- Added `htmlFor` attributes to all form labels
- Changed `<a href="#">` to `<button type="button">` where appropriate
- Added `type="button"` to non-submit buttons
- Used Next.js `Image` component for QR codes

## Migration Notes

When running the backend, the new `Khutbah` table will be auto-created via GORM AutoMigrate.

To seed initial khutbah data, insert via admin API or directly into database:

```sql
INSERT INTO khutbahs (id, khatib, tema, imam, muadzin, date, status, created_by, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Ustadz Dr. Abdullah Hakim, M.A.',
  'Membangun Keluarga Sakinah di Era Digital',
  'KH. Ahmad Fauzan',
  'Ust. Budi Santoso',
  '2026-03-14',
  'published',
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
);
```
