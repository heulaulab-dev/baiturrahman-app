# Masjid Baiturrahim Frontend

Next.js 15 frontend for Masjid Baiturrahim mosque management system.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query, Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ or Bun (recommended)
- npm, yarn, pnpm, or bun

## Installation

```bash
# Install dependencies
bun install
# or
npm install
# or
pnpm install
```

## Environment Variables

Create a `.env.local` file in the root of the frontend directory:

```env
# API Base URL (without /v1 - it's added automatically)
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# For local development:
# NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Development

```bash
# Start development server with Turbopack (faster)
bun run dev
# or
npm run dev

# The app will be available at http://localhost:3000
```

## Building

```bash
# Create production build
bun run build

# Start production server
bun run start
```

## Linting

```bash
bun run lint
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages (landing, about, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/               # shadcn/ui primitives
│   └── shared/           # Navbar, footer, etc.
├── lib/                  # Utilities
│   ├── api.ts           # Axios instance with interceptors
│   ├── utils.ts         # Helper functions
│   └── constants.ts     # App constants
└── public/               # Static assets
```

## Deploying to Vercel

### Prerequisites

1. Your backend API must be deployed and accessible
2. Have your API URL ready (e.g., `https://api.your-domain.com/api`)

### Step 1: Install Vercel CLI (Optional)

```bash
bun add -g vercel
# or
npm install -g vercel
```

### Step 2: Set Environment Variables

Create a `.env.production` file or add environment variables in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

### Step 3: Deploy via Vercel CLI

```bash
# From the frontend directory
cd frontend

# Login to Vercel (first time only)
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 4: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, Bitbucket)
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or `bun run build`)
   - **Output Directory**: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.your-domain.com/api`
6. Click "Deploy"

### Step 5: Update Backend CORS

After deploying, update your backend `.env` file:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Step 6: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Notes

- The frontend automatically appends `/v1` to the API URL
- JWT tokens are stored in `localStorage`
- 401 responses automatically redirect to `/login`
- Image domains are configured in `next.config.js` for dynamic loading

## Troubleshooting

**Build fails on Vercel:**
- Ensure `bun` is installed or change the install command in Vercel settings to `npm install`

**API calls failing:**
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend CORS includes your frontend domain
- Check network tab in browser for error details

**Missing styles after deploy:**
- Ensure Tailwind CSS is properly configured
- Check that `postcss.config.js` exists in the frontend directory
