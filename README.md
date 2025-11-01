# Content Viral Center (CVC)

A modern web application for content creators to discover trends, analyze content, and get AI-powered recommendations for creating viral content.

## Features

- **Authentication**
  - Secure login/signup with email and password
  - Remember me functionality
  - Single active session per user
  - Password reset flow

- **Content Analysis**
  - SEO analyzer with recommendations
  - Real-time content scraping
  - Trend discovery
  - AI-powered content generation

- **Real-time Updates**
  - Server-Sent Events (SSE) for live updates
  - Real-time scraping status
  - Trending content notifications

## Setup

### Local Development

1. **Clone and Install**
   ```powershell
   git clone https://github.com/yourusername/cvc.git
   cd cvc
   npm install
   ```

### Free Deployment

1. **Prerequisites**
   - Create a free account on [Vercel](https://vercel.com)
   - Create a free account on [Neon](https://neon.tech)
   - Install Vercel CLI: `npm i -g vercel`

2. **Database Setup on Neon**
   - Create a new project on Neon
   - Copy your database connection strings
   - In your project settings on Vercel, add these environment variables:
     ```
     POSTGRES_PRISMA_URL=your-pooling-connection-string
     POSTGRES_URL_NON_POOLING=your-direct-connection-string
     ```

3. **Deploy to Vercel**
   ```powershell
   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

Your app will be deployed to a URL like: `https://your-app.vercel.app`

2. **Environment Setup**
   Create a `.env` file with:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```powershell
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and core logic
- `src/ai/` - AI integration and content generation
- `prisma/` - Database schema and migrations

## Database Schema

The project uses SQLite in development and supports Postgres in production. Key models:

- `User`: Authentication and profile data
- `Session`: Session management
- `ScrapedItem`: Scraped content storage
- `WorkerStatus`: Background task tracking

## Background Workers

To run the scraper worker:
```powershell
npx tsx src/ai/scraper-worker.ts
```

The worker automatically:
1. Scrapes configured sites
2. Updates database entries
3. Broadcasts updates via SSE
4. Updates its status in WorkerStatus

## API Routes

- **Authentication**
  - POST `/api/auth/register` - Create new account
  - POST `/api/auth/login` - Sign in
  - POST `/api/auth/logout` - Sign out
  - GET `/api/auth/session` - Get current session

- **Scraper**
  - GET `/api/scraper/latest` - Get latest scraped items
  - GET `/api/scraper/subscribe` - Subscribe to real-time updates

## Protected Routes

The following routes require authentication:
- `/creator-studio`
- `/seo-analyzer`
- `/ai-assistant`
- `/scraped-items`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Final deployment steps (what still needs to be done)

I deployed the app to Vercel already, but there are a couple of manual steps left in the Vercel dashboard before the production URL is publicly usable and the database migrations are applied.

1) Add environment variables to Vercel (Production)

   Required variables (set these under Project → Settings → Environment Variables):
   - `POSTGRES_PRISMA_URL` — your Neon pooled connection URL (used by Prisma)
   - `POSTGRES_URL_NON_POOLING` — the direct Neon URL (if used anywhere)
   - `NEXTAUTH_SECRET` — a secure random value (32+ bytes base64)

   Example using the Vercel CLI (you must be logged in):

   ```powershell
   vercel env add POSTGRES_PRISMA_URL production
   vercel env add POSTGRES_URL_NON_POOLING production
   vercel env add NEXTAUTH_SECRET production
   ```

2) Disable Deployment Protection (optional — required for public access)

   If your deployment is protected by Vercel Access / Deployment Protection, visitors will get a 401. To make the site public:
   - Vercel → your Project → Settings → General → Deployment Protection / Access
   - Turn off protection or set Production to "Public"

3) Add GitHub Secrets for CI (optional but recommended)

   The repository includes a GitHub Actions workflow at `.github/workflows/prisma-migrate.yml` that runs `prisma migrate deploy` on pushes to `master`.
   Add these secrets under GitHub → Settings → Secrets → Actions:
   - `POSTGRES_PRISMA_URL` (same value as above)
   - `NEXTAUTH_SECRET`
   - `BASE_URL` (optional — used by the smoke test)
   - `VERCEL_BYPASS_TOKEN` (optional — used by the smoke test)

4) Trigger a redeploy

   - Push a commit to `master` or trigger a redeploy in Vercel. The GitHub Action will run migrations automatically if the secrets are configured.

5) Run the smoke test (local)

   Locally you can run:
   ```powershell
   # without Vercel bypass (will show 401 if protection is enabled)
   npm run smoke

   # with Vercel bypass token (if you want to keep protection enabled)
   $env:BYPASS_TOKEN='your_token_here'; npm run smoke
   ```

If you want me to run the smoke tests and verify signup/login for you, either:
- Disable deployment protection and reply "done", or
- Provide a Vercel bypass token here (private) and I will run the tests immediately.

If you'd like I can also add a helper script to set Vercel env vars via the Vercel API — you'll need to provide a Vercel token or run the script locally.
