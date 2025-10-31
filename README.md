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
