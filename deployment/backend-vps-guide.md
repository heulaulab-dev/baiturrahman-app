# Backend VPS Deployment Guide

Complete guide for deploying the Baiturrahim backend to a Rocky Linux VPS using Docker Compose and Traefik for automatic SSL.

## Quick Start

Pre-configured deployment files are in `deployment/` directory. See `deployment/README.md` for the fastest deployment.

## Prerequisites

- Rocky Linux 9.x VPS
- Domain name pointing to your VPS IP
- SSH access to the VPS
- At least 2GB RAM, 20GB storage

## Step 1: Server Setup (Rocky Linux)

### Install Docker and Docker Compose

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
# Log out and back in for this to take effect

# Verify installation
docker --version
docker compose version
```

### Configure SELinux (Important for Rocky Linux)

Rocky Linux has SELinux enabled by default. Choose one option:

**Option 1: Permissive mode (recommended for simplicity)**

```bash
# Set SELinux to permissive mode
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config

# Check status
sestatus
```

**Option 2: Keep SELinux enabled**

```bash
# Allow containers to use volumes
sudo setsebool -P container_manage_cgroup on

# Use :Z flag in docker-compose volumes
volumes:
  - ../postgres-data:/var/lib/postgresql/data:z
```

### Configure Firewall

```bash
# Enable and start firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow required ports
sudo firewall-cmd --permanent --add-service=ssh      # SSH (port 22)
sudo firewall-cmd --permanent --add-service=http     # HTTP (port 80)
sudo firewall-cmd --permanent --add-service=https    # HTTPS (port 443)

# Reload to apply changes
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-all
```

## Step 2: Clone and Setup

```bash
# Clone repository
cd ~
git clone <your-repo-url>
cd baiturrahim-app

# Create required directories
mkdir -p postgres-data deployment/traefik/letsencrypt
touch deployment/traefik/letsencrypt/acme.json
chmod 600 deployment/traefik/letsencrypt/acme.json
```

## Step 3: Configure Deployment

### Edit Traefik Config

```bash
cd deployment/traefik
nano traefik.yml
```

Change `your-email@example.com` to your email for Let's Encrypt.

### Edit Backend Config

```bash
cd ../backend
nano docker-compose.yml
```

Change:
- `api.your-domain.com` → Your API subdomain
- `JWT_SECRET` → Secure random string (min 32 chars)
- `FRONTEND_URL` → Your frontend domain
- Database passwords (recommended)

### Create Environment File (Optional)

```bash
nano .env
```

Copy from `.env.example`:
```env
PORT=8080
ENVIRONMENT=production
DATABASE_URL=postgres://heulasuser:heulaspassword@postgres:5432/baiturrahim_app?sslmode=disable
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_32_CHARS
FRONTEND_URL=https://your-frontend-domain.com
```

## Step 4: Deploy

```bash
# Create Docker network
docker network create traefik-network

# Start Traefik
cd ~/baiturrahim-app/deployment/traefik
docker compose up -d

# Check Traefik logs
docker compose logs -f

# Start Backend
cd ~/baiturrahim-app/deployment/backend
docker compose up -d --build

# Check Backend logs
docker compose logs -f
```

## Step 5: Verify Deployment

1. **Check containers running:**
   ```bash
   docker ps
   ```

2. **Test API:**
   ```bash
   curl https://api.your-domain.com/api/v1/mosque-info
   ```

3. **Check Traefik dashboard:**
   - Go to `http://your-vps-ip:8080`

## Common Commands

```bash
# View logs
cd ~/baiturrahim-app/deployment/backend && docker compose logs -f

# Restart backend
cd ~/baiturrahim-app/deployment/backend && docker compose restart backend

# Restart all
cd ~/baiturrahim-app/deployment/backend && docker compose restart

# Stop all
cd ~/baiturrahim-app/deployment/backend && docker compose down

# Update and redeploy
cd ~/baiturrahim-app
git pull
cd deployment/backend
docker compose up -d --build

# Access database
docker exec -it baiturrahim-postgres psql -U heulasuser -d baiturrahim_app

# Backup database
docker exec baiturrahim-postgres pg_dump -U heulasuser baiturrahim_app > backup.sql

# Restore database
docker exec -i baiturrahim-postgres psql -U heulasuser baiturrahim_app < backup.sql
```

## Security Checklist

- [ ] Change `JWT_SECRET` to secure random string
- [ ] Change default database password
- [ ] Configure firewall (firewalld)
- [ ] Set up Traefik dashboard authentication
- [ ] Set up automated backups
- [ ] Monitor resources (CPU, RAM, disk space)

### Secure Traefik Dashboard

Generate password hash (install httpd-tools first):
```bash
sudo dnf install -y httpd-tools
htpasswd -nb user password
```

Add to `deployment/traefik/docker-compose.yml`:
```yaml
labels:
  - "traefik.http.routers.dashboard.rule=Host(`dashboard.your-domain.com`)"
  - "traefik.http.routers.dashboard.tls=true"
  - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
  - "traefik.http.routers.dashboard.service=api@internal"
  - "traefik.http.routers.dashboard.middlewares=auth"
  - "traefik.http.middlewares.auth.basicauth.users=user:$$apr1$$hash"
```

## Troubleshooting

### SSL Certificate Issues

```bash
# Check acme.json
cat deployment/traefik/letsencrypt/acme.json

# Restart Traefik
cd deployment/traefik && docker compose restart

# Check Traefik logs
cd deployment/traefik && docker compose logs -f
```

### SELinux Issues

```bash
# Check SELinux status
sestatus

# Temporarily disable to test
sudo setenforce 0

# Re-enable after testing
sudo setenforce 1
```

### Database Connection Issues

```bash
# Check if Postgres is running
docker ps | grep postgres

# Check Postgres logs
docker logs baiturrahim-postgres -f
```

### Backend Not Starting

```bash
# Check logs
cd deployment/backend && docker compose logs backend

# Enter container for debugging
docker exec -it baiturrahim-backend sh
```

## Useful Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL on Docker](https://hub.docker.com/_/postgres)
