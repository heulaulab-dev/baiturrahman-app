# Baiturrahim Backend API

Go-based REST API for the Baiturrahim mosque management system.

## Tech Stack

- Go 1.21+
- Gin framework
- GORM v2 (ORM)
- PostgreSQL 15+
- JWT authentication
- godotenv (environment variables)

## Project Structure

```
/backend
  /cmd/server       - Application entry point
  /internal
    /handlers       - HTTP request handlers (controllers)
    /models         - GORM database models
    /middleware     - Auth, CORS, logging, rate limiting
    /database       - Connection, migrations, seeding
    /services       - Business logic layer
    /utils          - Validators, helpers
  /config           - Configuration loading
```

## Getting Started

### Prerequisites

- Go 1.21+
- PostgreSQL 15+

### Local Development

```bash
# Install dependencies
go mod download

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (automatic on start)
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

### Environment Variables

```env
PORT=8080                      # Server port
ENVIRONMENT=development           # development | production
DATABASE_URL=postgres://...      # PostgreSQL connection string
JWT_SECRET=your-secret-key       # JWT signing key (min 32 chars)
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
```

## API Routes

### Public Routes
- `GET /api/v1/mosque-info` - Mosque information
- `GET /api/v1/content` - Content sections
- `GET /api/v1/structure` - Organizational structure
- `GET /api/v1/prayer-times` - Prayer times
- `GET /api/v1/events` - Events
- `GET /api/v1/announcements` - Announcements
- `GET /api/v1/donation-methods` - Donation methods
- `POST /api/v1/donations` - Create donation

### Auth Routes
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Admin Routes (Protected)
All `/api/v1/admin/*` routes require authentication + admin role.

**Content**: `GET/POST/PUT/DELETE /api/v1/admin/content/*`
- Toggle visibility: `PUT /api/v1/admin/content/:id/toggle`
- Reorder: `PUT /api/v1/admin/content/reorder`

**Structure**: `GET/POST/PUT/DELETE /api/v1/admin/structure/*`
- Reorder: `PUT /api/v1/admin/structure/reorder`

**Prayer Times**: `GET/POST/PUT/DELETE /api/v1/admin/prayer-times/*`
- Monthly view: `GET /api/v1/admin/prayer-times/month?year=2024&month=1`
- Generate: `POST /api/v1/admin/prayer-times/generate`

**Events**: `GET/POST/PUT/DELETE /api/v1/admin/events/*`

**Announcements**: `GET/POST/PUT/DELETE /api/v1/admin/announcements/*`

**Donations**:
- List: `GET /api/v1/admin/donations`
- Confirm: `PUT /api/v1/admin/donations/:id/confirm`
- Stats: `GET /api/v1/admin/donations/stats`
- Export: `GET /api/v1/admin/donations/export`

**Users**: `GET/POST/PUT/DELETE /api/v1/admin/users/*`

**Uploads**:
- Upload image: `POST /api/v1/admin/upload`
- Delete image: `DELETE /api/v1/admin/upload`

## Authentication

The API uses JWT tokens for authentication:

1. **Login**: `POST /api/v1/auth/login` with email and password
2. **Receive JWT**: Response includes `access_token`
3. **Use token**: Include `Authorization: Bearer <token>` header
4. **Refresh**: Use `POST /api/v1/auth/refresh` to get new token

## Deployment

For VPS deployment, use the pre-configured files in `../deployment/` directory.

See `deployment/README.md` for complete deployment guide.

Quick deploy:
```bash
cd ../deployment/backend
docker compose up -d --build
```

## Hot Reload Development

Using Air for hot reload during development:

```bash
# Install Air
go install github.com/cosmtrek/air@latest

# Run with Air
air
```

Or use the provided `.air.toml` configuration:
```bash
air
```

## Database

### Migrations

Migrations run automatically on server startup using GORM AutoMigrate.

### Seeding

A default admin user is created automatically if the users table is empty:
- Email: `admin@baiturrahim.com`
- Password: `admin123`

**Important:** Change the default admin password on first login!

### Manual Database Connection

```bash
# Using docker
docker exec -it baiturrahim-postgres psql -U heulasuser -d baiturrahim_app
```

## Development Commands

```bash
# Run server
go run cmd/server/main.go

# Build binary
go build -o server cmd/server/main.go

# Run tests
go test ./...

# Format code
go fmt ./...

# Run linter
go vet ./...
```

## License

MIT
