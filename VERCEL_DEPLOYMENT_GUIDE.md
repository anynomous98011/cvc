# 🚀 Vercel Deployment Guide - Step by Step

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub account with your project repository
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) for cloud database

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

This ensures your user data is stored safely in the cloud and accessible from Vercel.

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with your email
4. Verify your email

### 1.2 Create a Cluster
1. After login, click "Create" → "Create a Deployment"
2. Select "M0 FREE" plan (free tier, perfect for testing)
3. Select your preferred cloud provider (AWS/GCP/Azure)
4. Choose the region closest to your users
5. Click "Create Deployment"
6. Wait 2-3 minutes for cluster to initialize

### 1.3 Create Database User
1. In the cluster view, go to "Database Access"
2. Click "Add New Database User"
3. Enter username: `cvc_user` (or your choice)
4. Generate a strong password (save it securely!)
5. Select "Built-in Role" → "Atlas Admin"
6. Click "Add User"

### 1.4 Get Connection String
1. Go to "Database" → Your Cluster
2. Click "Connect"
3. Click "Drivers"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `cvc`
7. Final URL should look like:
   ```
   mongodb+srv://cvc_user:YourPasswordHere@cluster123.mongodb.net/cvc?retryWrites=true&w=majority
   ```

### 1.5 Whitelist IP Addresses
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Vercel servers to connect
   - Production note: You can later restrict to specific IPs
4. Click "Confirm"

---

## Step 2: Push Code to GitHub

Your project must be on GitHub for Vercel to access it.

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for Vercel deployment"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Click "Import"

### 3.2 Configure Environment Variables
Vercel will show you an environment variables section. Add these:

| Variable Name | Value | Type |
|---------------|-------|------|
| `DATABASE_URL` | Your MongoDB Atlas connection string | Environment Variable |
| `GOOGLE_GENAI_API_KEY` | Your Google AI API key | Environment Variable |
| `NEXT_PUBLIC_API_URL` | `https://your-project.vercel.app` | Environment Variable |

**Add variables:**
1. Click "Environment Variables"
2. For each variable:
   - Enter the name
   - Enter the value
   - Select scope: "Production" (or "Production, Preview, Development" for all)
   - Click "Add"

### 3.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete (2-5 minutes)
3. Once done, you'll see "Congratulations! Your app is live"
4. Click the domain link to view your live app

---

## Step 4: Verify Deployment

### 4.1 Test the Application
1. Go to your Vercel domain (e.g., `https://your-project.vercel.app`)
2. Test signup at `/signup`
3. Create a test account
4. Verify you can login
5. Check MongoDB Atlas - you should see data in the `cvc` database

### 4.2 Monitor Logs
1. In Vercel dashboard, go to "Deployments"
2. Click the latest deployment
3. Click "Logs" to see deployment and runtime logs
4. Check for any errors

---

## Step 5: Update Your Previous Vercel Project (If Applicable)

If you had a previous version deployed:

### Option A: Update Existing Project
1. Keep the same Vercel project
2. Just push new code to GitHub
3. Vercel will automatically redeploy
4. Update environment variables if needed

### Option B: Create New Project
1. Follow steps 1-3 above
2. Delete old project from Vercel if desired

---

## Environment Variables Reference

### Required Variables

**DATABASE_URL** (Production)
```
mongodb+srv://cvc_user:PASSWORD@cluster123.mongodb.net/cvc?retryWrites=true&w=majority
```

**GOOGLE_GENAI_API_KEY**
- Get from: https://aistudio.google.com/app/apikey
- Your API key for AI content generation

**NEXT_PUBLIC_API_URL** (Production)
```
https://your-vercel-domain.vercel.app
```

### Optional Variables

**NODE_ENV** (automatically set to `production` by Vercel)

---

## Troubleshooting

### Error: "MongoDB connection failed"
**Solution:** Check MongoDB Atlas:
- Verify connection string in vercel.json
- Confirm IP whitelist includes 0.0.0.0/0
- Check database user password is correct
- Verify network access is enabled

### Error: "Cannot find module 'prisma'"
**Solution:**
- Vercel builds and runs `npm install` automatically
- If issue persists, add to build command: `npx prisma generate`

### Error: "NEXT_PUBLIC_API_URL is not defined"
**Solution:**
- Add NEXT_PUBLIC_API_URL environment variable in Vercel dashboard
- Redeploy after adding

### Signup still not working
**Steps to debug:**
1. Check Vercel logs: Deployments → Your Deployment → Logs
2. Check MongoDB connection is working
3. Verify all environment variables are set
4. Check browser console for errors (F12)
5. Check Network tab in DevTools for API responses

---

## Vercel Dashboard Shortcuts

- **Settings** → Configure project
- **Analytics** → View traffic and performance
- **Logs** → See deployment and function logs
- **Domains** → Add custom domain
- **Git** → Connected repository info
- **Environment Variables** → Manage env vars

---

## Database Backup & Security

### Regular Backups
MongoDB Atlas provides free backups on M0 tier:
- Automatic 2-hour snapshots
- Retention: 2 days (limited free tier)

### Security Best Practices
1. ✅ Use strong password for database user
2. ✅ Enable IP whitelist (only allow Vercel)
3. ✅ Use MongoDB built-in encryption
4. ✅ Enable activity monitoring
5. ✅ Regularly review access logs

---

## Performance Tips

1. **CDN:** Vercel automatically uses Vercel Edge Network
2. **Database:** Use MongoDB Atlas M0 for dev, M2+ for production
3. **Environment:** Frankfurt region is good for EU users
4. **Caching:** Configure Vercel cache settings in vercel.json

---

## Next Steps After Deployment

1. ✅ Test all features work (signup, login, features)
2. ✅ Set up custom domain (optional)
3. ✅ Enable analytics (optional)
4. ✅ Set up alerts (optional)
5. ✅ Configure production monitoring

---

## Commands Reference

```bash
# Build locally before deploying
npm run build

# Start production server locally
npm start

# Check for build errors
npm run typecheck

# Run tests
npm test
```

---

## Support

**Vercel Help:** https://vercel.com/support
**MongoDB Help:** https://docs.atlas.mongodb.com
**Next.js Help:** https://nextjs.org/docs

Good luck with your deployment! 🎉
