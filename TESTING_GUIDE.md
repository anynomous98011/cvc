# Quick Reference - Testing the Auth System

## 🎯 Test URLs

### Application Home
- **URL**: http://localhost:9002
- **Status**: Should show header with "Login" and "Sign Up" buttons

### Authentication Pages
- **Sign Up**: http://localhost:9002/signup
- **Login**: http://localhost:9002/login
- **Profile**: http://localhost:9002/profile

## ✅ Testing Steps

### 1. Test Signup
1. Go to http://localhost:9002/signup
2. Fill in the form:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Sign Up"
4. Should redirect to `/profile` and show your details
5. Data is now stored in MongoDB

### 2. Test Profile Page
1. At `/profile`, you should see:
   - Your email (read-only)
   - Name, Bio, Location, Website, Phone fields
   - Save Changes button
2. Try editing your bio or location
3. Click "Save Changes"
4. Toast notification should appear
5. Changes persist in MongoDB

### 3. Test Logout
1. Click the "Logout" button at top-right in profile page
   - (Desktop: Click user avatar → Logout)
   - (Mobile: Click menu → Logout)
2. Should redirect to home page
3. Header should now show "Login" and "Sign Up"
4. Try accessing `/profile` directly - should redirect to `/login`

### 4. Test Login
1. Go to http://localhost:9002/login
2. Enter your credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"
4. Should redirect to `/profile`
5. Header should show user dropdown with your name

### 5. Test Invalid Credentials
1. Go to `/login`
2. Try invalid email or password
3. Should see error message: "Invalid email or password"
4. Try weak password on signup (< 6 chars)
5. Should see: "Password must be at least 6 characters"
6. Try duplicate email on signup
7. Should see: "Email already in use"

### 6. Test Protected Routes
1. While logged out, try accessing `/profile` directly
2. Should automatically redirect to `/login`
3. Similarly for any protected API routes

## 🗄️ MongoDB Collections

Your data is being stored in MongoDB with these collections:

### `users` Collection
```json
{
  "_id": ObjectId,
  "email": "test@example.com",
  "name": "Test User",
  "passwordHash": "bcrypt_hash...",
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "activeSessionId": ObjectId,
  "activeSessionIdId": null
}
```

### `profiles` Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "bio": "Your bio here",
  "location": "Your location",
  "website": "https://example.com",
  "phone": "+1234567890",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### `sessions` Collection
```json
{
  "_id": ObjectId,
  "token": "random_token_string",
  "userId": ObjectId,
  "createdAt": ISODate,
  "expiresAt": ISODate (7 days)
}
```

## 🔍 Verify MongoDB Data

Use MongoDB Compass or CLI:

```bash
# List all users
db.user.find()

# List all profiles
db.profile.find()

# Check user with email
db.user.findOne({ email: "test@example.com" })
```

## 🐛 Troubleshooting

### Login not working
- Verify `.env` has `DATABASE_URL` pointing to MongoDB
- Check MongoDB is running and accessible
- Verify user exists in database

### Profile not saving
- Check browser console for network errors
- Verify session cookie is set (Dev Tools → Application → Cookies)
- Check MongoDB connection in terminal

### Header not updating
- Hard refresh (Ctrl+Shift+R)
- Check browser console for fetch errors
- Verify `/api/auth/me` endpoint is responding

### Data not persisting
- Verify MongoDB Atlas or local MongoDB is running
- Check `DATABASE_URL` in `.env` is correct
- Run `npx prisma generate` to update Prisma client

## 📝 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/signup` | POST | No | Create new account |
| `/api/auth/login` | POST | No | Login with credentials |
| `/api/auth/me` | GET | No | Check if authenticated |
| `/api/auth/me` | POST | Yes | Logout user |
| `/api/user/profile` | GET | Yes | Get user profile |
| `/api/user/profile` | PUT | Yes | Update user profile |

## 🎨 UI Features

✅ Dark/Light theme toggle (top-right)
✅ Responsive mobile navigation
✅ Loading spinners during API calls
✅ Real-time form validation
✅ Toast notifications
✅ Error alerts
✅ Gradient styling with neon theme
✅ Smooth transitions and animations

## 🔐 Security Checklist

✅ Passwords hashed with bcryptjs
✅ Sessions stored in database
✅ HttpOnly cookies (can't be accessed by JS)
✅ Secure cookies in production
✅ SameSite=Lax to prevent CSRF
✅ Email validation
✅ Password length validation (6+ chars)
✅ Protected API routes
✅ Session expiration (7 days)
