# Changelog

All notable changes to Masjid Baiturrahim project will be documented in this file.

## [Unreleased]

### Added
- **Khutbah Backend**: New Khutbah model and API endpoints for Friday sermon management
  - CRUD operations (Create, Read, Update, Delete)
  - Latest khutbah endpoint for landing page
  - Archive endpoint for historical khutbahs
  - Toggle publish status endpoint

### Changed
- **DonationSection**: Now fetches payment methods from backend API
  - Displays bank accounts, QRIS codes, e-wallets dynamically
  - Grouped by payment method type
  - Added copy-to-clipboard for account numbers
  - Added donation form submission to backend

- **KajianSection**: Now fetches events from backend API
  - Displays featured event and upcoming events list
  - Shows event date, time, location, and image
  - Added loading and empty states

- **BeritaSection**: Now fetches announcements from backend API
  - Displays featured announcement and archive list
  - Added loading and empty states

- **ContactSection**: Now fetches mosque info from backend API
  - Displays address, phone, email, website dynamically
  - Shows social media links if configured in backend

- **MimbarJumatSection**: Now fetches khutbah from backend API
  - Displays latest khutbah with khatib, tema, imam, muadzin
  - Archive list for historical khutbahs
  - Download link for khutbah files

### Fixed
- **PaymentMethod Type**: Updated to match backend model structure
  - Added `type` field (bank_transfer, ewallet, qris)
  - Renamed `account_holder` to `account_name`
  - Added `qr_code_url`, `instructions`, `display_order` fields

- **Accessibility Issues**:
  - Added `htmlFor` attributes to all form labels
  - Changed empty anchor links to buttons
  - Added proper button types
  - Used Next.js Image component for QR codes

### Technical
- **Frontend Services**: Added Khutbah API service functions and React hooks
- **Backend Routes**: Registered Khutbah routes in main.go
- **Database**: Added Khutbah table to AutoMigrate

---

## [Previous]

### Documentation
- Added prayer times scrapper integration specification
- Added prayer times implementation plan
