# Database Cleanup Script - Design Spec

## Overview

One-time Go script to clean all data from development database while preserving admin users and essential system data.

## Scope

### Tables to Clean (delete all records)
- `organization_structures`
- `prayer_times`
- `content_sections`
- `events`
- `announcements`
- `donations`
- `payment_methods`
- `khutbahs`
- `settings`
- `history_entries`
- `strukturs`
- `aset_tetaps`
- `barang_tidak_tetaps`
- `reservations`
- `gallery_items`
- `hero_slides`
- `sponsors`
- `finance_transactions`
- `qurban_settings`
- `qurban_animals`
- `qurban_participants`

### Tables to Preserve
- Admin users (`role = 'admin'` or `role = 'super_admin'`)
- `permissions` table
- `role_permissions` table
- `mosque_infos` table

## Usage

```bash
cd backend

# Dry run (preview only)
go run scripts/cleanup.go --dry-run

# Execute (requires ENVIRONMENT=development or --force)
go run scripts/cleanup.go

# Skip confirmation prompt
go run scripts/cleanup.go --force
```

## Safety Features

1. **Dry-run mode**: Preview what would be deleted without making changes
2. **Environment check**: Only runs on `development` unless `--force` is used
3. **Interactive confirmation**: Prompts for "yes" input unless `--force` is used
4. **Non-destructive first**: Admin users are preserved, not deleted

## Implementation

- Location: `backend/scripts/cleanup.go`
- Uses GORM to connect and execute TRUNCATE with CASCADE
- Reads DATABASE_URL from config/environment
- Logs all operations for transparency