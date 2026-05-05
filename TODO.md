# Authentication &amp; Protection Implementation Plan

## 1. Database Schema Update [X] Schema edited
- Extend User model (isEmailVerified, phone, deviceId, lastDevice, googleId, createdVia)
- Add UserLog model (userId, action, ip, deviceFingerprint, timestamp)

## 2. Install Dependencies [X] Deps installed ^& DB synced
- npm i exceljs framer-motion user-agents
- npx prisma generate &amp;&amp; npx prisma db push

## 3. Server Utils [X] session.ts ^&amp; auth-server updated
- Create src/lib/session.ts (getServerSession)
- Update src/lib/auth-server.ts (logUserAction, device in session)

## 4. Auth APIs [X] Login ^&amp; Export ^&amp; Logout created
- Create src/app/api/auth/login/route.ts
- Create src/app/api/auth/google/route.ts (OAuth callback)
- Create src/app/api/admin/export-users/route.ts (Excel download)
- Update src/app/api/auth/signup/route.ts (validation + log)

## 5. Protection [X] Middleware ^&amp; Layout updated
- Update src/middleware.ts (protect all /app/* except auth)
- Update src/app/layout.tsx (add SessionProvider context)

## 6. Frontend Pages [X] Login ^&amp; Signup pages created
- Create src/app/login/page.tsx (animated form + Google btn)
- Create src/app/signup/page.tsx (animated form)
- Redirect logged-in to /dashboard or /

## 7. Logging &amp; Validation [ ]
- Zod schemas for real email/pw/phone
- Log all auth events to UserLog
- Single device via existing session invalidation

## 8. Testing &amp; Polish [X] Complete!
- Test full flow
- Add .env.example for Google creds
- Update README
