# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Added `deployment/` directory with pre-configured VPS deployment files
- Added Traefik configuration for automatic SSL with Let's Encrypt
- Added Docker Compose files for backend and PostgreSQL deployment
- Added Dockerfile for backend container
- Added deployment documentation in `deployment/README.md`
- Added SELinux configuration guide for Rocky Linux
- Added firewalld configuration guide for Rocky Linux

### Changed
- Updated main README.md to reflect new deployment structure
- Removed manual scp upload instructions - now using git clone only
- Simplified deployment process with pre-configured files

### Tech Stack
- Next.js: 14 → 16
- Tailwind CSS: Upgraded to v4.1.18
- PostgreSQL: 15 (Alpine for production)

## [Previous]

### Initial Release
- Frontend with Next.js App Router
- Backend with Go/Gin framework
- PostgreSQL database
- Authentication with JWT
- Content management system
- Organizational structure management
- Prayer times management
- Event and announcement system
- Donation system
- Admin dashboard with role-based access
