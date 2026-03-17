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
  /traefik          - Traefik reverse proxy for VPS deployment
    /traefik.yml        - Traefik configuration
    /docker-compose.yml # Traefik containers
    /letsencrypt/       - SSL certificates storage
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

## VPS Deployment

Pre-configured files are in `traefik/` and `docker-compose.yml` in this directory.

### Quick Deploy

1. **Clone repository on your VPS:**
   ```bash
   cd ~
   git clone <your-repo-url>
   cd baiturrahim-app/backend
   ```

2. **Create required directories:**
   ```bash
   mkdir -p postgres-data traefik/letsencrypt
   touch traefik/letsencrypt/acme.json
   chmod 600 traefik/letsencrypt/acme.json
   ```

3. **Configure Traefik:**
   ```bash
   cd traefik
   nano traefik.yml
   ```
   Change `your-email@example.com` to your email.

4. **Configure Backend:**
   ```bash
   cd ..
   nano docker-compose.yml
   ```
   Change:
   - `api.your-domain.com` to your API subdomain
   - `JWT_SECRET` to a secure random string
   - `FRONTEND_URL` to your frontend domain
   - Database password (recommended)

5. **Create Docker network:**
   ```bash
   docker network create traefik-network
   ```

6. **Start Traefik:**
   ```bash
   cd traefik
   docker compose up -d
   ```

7. **Start Backend:**
   ```bash
   cd ..
   docker compose up -d --build
   ```

### Common Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Update and redeploy
cd ~/baiturrahim-app
git pull
cd backend
docker compose up -d --build

# Access database
docker exec -it baiturrahim-postgres psql -U heulasuser -d baiturrahim_app
```

### Server Setup (First Time - Rocky Linux)

If this is a fresh Rocky Linux VPS, first install Docker:

```bash
# Update packages
sudo dnf update -y

# Install required packages
sudo dnf install -y dnf-plugins-core nano

# Add Docker repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Configure SELinux (important for Rocky Linux)
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config

# Configure firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

See `../docs/deployment/backend-vps-guide.md` for detailed guide.

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

A default admin user is created automatically if users table is empty:
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
