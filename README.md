# Masjid Baiturrahim - Management Website

Full-stack mosque management website with separated API architecture.

## Project Structure

```
/baiturrahim-app
  /frontend (Next.js 16 with App Router)
    /app
      /(public) - Public pages (landing, tentang, kegiatan, kontak)
      /(dashboard) - Dashboard pages (protected)
      /login - Login page
    /components
      /landing - Landing page components
      /dashboard - Dashboard components
      /ui - shadcn/ui components
      /shared - Shared components (navbar, footer)
    /lib - Utilities and API client
    /public - Static assets
    /styles - Global styles

  /backend (Go - Completely Separated)
    /cmd/server - Main application entry point
    /internal
      /handlers - API controllers
      /models - GORM models
      /middleware - Auth, CORS, logging
      /database - Connection and migrations
      /services - Business logic
      /utils - Helpers and validators
    /config - Configuration

  /deployment - VPS deployment files
    /README.md - Quick deployment guide
    /traefik - Traefik reverse proxy config
    /backend - Backend + PostgreSQL docker-compose
```

## Tech Stack

### Frontend
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4 with custom Islamic theme
- shadcn/ui components
- TanStack Query (data fetching)
- Zod (validation)
- axios (API calls)
- next-themes (dark mode)
- react-hook-form (forms)
- date-fns (date formatting)

### Backend
- Go 1.21+
- Gin framework
- GORM v2
- JWT-go (authentication)
- golang-jwt/jwt/v5
- PostgreSQL 15+

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Go 1.21+
- Docker and Docker Compose (optional)
- PostgreSQL 15+ (if not using Docker)

### Local Development

**Using Docker Compose:**

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432, backend API on port 8080, and frontend on port 3000.

**Manual Setup:**

```bash
# Backend
cd backend
cp .env.example .env
go mod download
go run cmd/server/main.go

# Frontend (new terminal)
cd frontend
bun install
bun run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user (protected)

### Public Endpoints
- `GET /api/v1/mosque-info` - Mosque information
- `GET /api/v1/content` - Content sections
- `GET /api/v1/structure` - Organizational structure
- `GET /api/v1/prayer-times` - Prayer times
- `GET /api/v1/events` - Events
- `GET /api/v1/announcements` - Announcements
- `GET /api/v1/donation-methods` - Donation methods
- `POST /api/v1/donations` - Create donation

### Admin Endpoints (Protected)
- Content: `GET/POST/PUT/DELETE /api/v1/admin/content/*`
- Structure: `GET/POST/PUT/DELETE /api/v1/admin/structure/*`
- Prayer Times: `GET/POST/PUT/DELETE /api/v1/admin/prayer-times/*`
- Events: `GET/POST/PUT/DELETE /api/v1/admin/events/*`
- Announcements: `GET/POST/PUT/DELETE /api/v1/admin/announcements/*`
- Donations: `GET/PUT /api/v1/admin/donations/*`
- Users: `GET/POST/PUT/DELETE /api/v1/admin/users/*`

## VPS Deployment

Pre-configured deployment files are available in the `deployment/` directory.

### Quick Deploy

1. **Clone repository on your VPS:**
   ```bash
   cd ~
   git clone <your-repo-url>
   cd baiturrahim-app
   ```

2. **Create required directories:**
   ```bash
   mkdir -p postgres-data deployment/traefik/letsencrypt
   touch deployment/traefik/letsencrypt/acme.json
   chmod 600 deployment/traefik/letsencrypt/acme.json
   ```

3. **Configure deployment files:**
   ```bash
   # Edit Traefik config (change email)
   nano deployment/traefik/traefik.yml

   # Edit backend config (change domain, secrets)
   nano deployment/backend/docker-compose.yml
   ```

4. **Create Docker network and start:**
   ```bash
   docker network create traefik-network
   cd deployment/traefik
   docker compose up -d
   cd ../backend
   docker compose up -d --build
   ```

See `deployment/README.md` for complete deployment guide.

## Design System

Islamic-inspired design system with:
- **Colors**: Emerald/Teal (primary), Gold (secondary), Deep Blue (accent)
- **Typography**: Amiri/Cairo for headings, Inter for body, Scheherazade New for Arabic
- **Mobile-first**: Responsive design optimized for mobile devices
- **Dark mode**: Optimized for night prayers
- **RTL support**: Ready for Arabic text

## Development

### Frontend Development
```bash
cd frontend
bun run dev
```

### Backend Development
```bash
cd backend
go run cmd/server/main.go
```

### Database Migrations
Migrations run automatically on server start using GORM AutoMigrate.

## License

MIT
