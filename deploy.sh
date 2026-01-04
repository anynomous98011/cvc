#!/bin/bash

# This script helps with the deployment process

echo "🚀 Starting deployment process..."

# 1. Install Vercel CLI if not installed
echo "📦 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# 2. Build the project
echo "🔨 Building project..."
npm run build

# 3. Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# 4. Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"