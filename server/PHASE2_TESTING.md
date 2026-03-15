# Phase 2: Auth Consolidation Testing Guide

## Summary

Phase 2 is complete. Implemented:

✅ **User Model** (`models/User.js`)
- Consolidated mobile + web schema
- Fields: id, email, passwordHash, firstName, lastName, age, gender, userType, oauthProvider, googleId, avatarUrl, currentStars, isVerified, verifiedAt
- Indexes on email, googleId for fast lookups
- Soft deletes (paranoid: true)

✅ **RefreshToken Model** (`models/RefreshToken.js`)
- Token family pattern for rotation security
- Fields: id, userId, tokenFamily, expiresAt, revokedAt, ipAddress, userAgent
- Associations with User model

✅ **Auth Controller** (`controllers/auth.js`)
- signup(email, password, firstName, lastName, age, gender)
- signin(email, password)
- refresh(refreshToken)
- logout(userId)
- getGoogleAuthUrlWeb()
- getGoogleAuthUrlMobile()
- handleGoogleCallback(code, platform)

✅ **Auth Routes** (`routes/auth.js`)
- POST /api/auth/signup
- POST /api/auth/signin
- POST /api/auth/refresh
- GET /api/auth/google/web
- GET /api/auth/google/mobile
- POST /api/auth/google/callback
- POST /api/auth/logout (protected)

✅ **Server Integration** (`server.js`)
- Auth routes mounted at /api/auth
- Models imported and connected

---

## Prerequisites

1. **PostgreSQL running** (local or Docker)
2. **Environment variables set** (see .env.example)
3. **Dependencies installed**

```bash
cd unified-server
npm install
cp .env.example .env
```

3. **Configure .env:**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iota_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

---

## Test Steps

### 1. Start Server

```bash
npm run dev
```

Expected output:
```
✅ Database connection successful
✅ Database models synchronized
🚀 Server running on port 3000
Routes registered: /api/auth (Phase 2)
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-14T10:00:00.000Z",
  "uptime": 5.234
}
```

### 3. Test Signup

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "age": 15,
    "gender": "male"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "age": 15,
    "userType": "teenager"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Test Signin

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Signin successful",
  "user": { ... },
  "tokens": { ... }
}
```

### 5. Test Refresh Token

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Test Google Auth URL (Web)

**Request:**
```bash
curl http://localhost:3000/api/auth/google/web
```

**Expected Response (200):**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=...&response_type=code&scope=openid+profile+email&access_type=offline"
}
```

### 7. Test Google Auth URL (Mobile)

**Request:**
```bash
curl http://localhost:3000/api/auth/google/mobile
```

**Expected Response (200):**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=myapp%3A%2F%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email&access_type=offline"
}
```

### 8. Test Logout (Protected)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Error Cases

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "age": 15
  }'
```

Response (400):
```json
{
  "error": "Invalid email address"
}
```

### Weak Password
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "firstName": "John",
    "lastName": "Doe",
    "age": 15
  }'
```

Response (400):
```json
{
  "error": "Password must be at least 6 characters with 1 uppercase letter and 1 number"
}
```

### Duplicate Email
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",  // Already registered
    "password": "Password123",
    "firstName": "Jane",
    "lastName": "Doe",
    "age": 14
  }'
```

Response (409):
```json
{
  "error": "Email already registered"
}
```

### Invalid Credentials on Signin
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123"
  }'
```

Response (401):
```json
{
  "error": "Invalid email or password"
}
```

### Missing Auth Header on Protected Route
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

Response (401):
```json
{
  "error": "Unauthorized: Missing or invalid authorization header"
}
```

---

## Database Inspection

### Login to PostgreSQL
```bash
psql -U postgres -d iota_db
```

### Check Users Table
```sql
SELECT id, email, "firstName", "lastName", age, "userType", "oauthProvider", "isVerified" FROM "Users";
```

### Check RefreshTokens Table
```sql
SELECT id, "userId", "tokenFamily", "expiresAt", "revokedAt" FROM "RefreshTokens";
```

### Test Token Revocation After Logout
```sql
-- Before logout
SELECT COUNT(*) FROM "RefreshTokens" WHERE "revokedAt" IS NULL;

-- After logout (should see revoked tokens)
SELECT COUNT(*) FROM "RefreshTokens" WHERE "revokedAt" IS NOT NULL;
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Models synchronized
- [ ] POST /api/auth/signup creates user
- [ ] Password is hashed (not plain text in DB)
- [ ] POST /api/auth/signin works with correct password
- [ ] POST /api/auth/signin fails with wrong password
- [ ] Tokens are valid JWT format
- [ ] POST /api/auth/refresh generates new access token
- [ ] POST /api/auth/logout revokes refresh tokens
- [ ] GET /api/auth/google/* returns OAuth URLs
- [ ] Duplicate email signup returns 409
- [ ] Invalid email format returns 400
- [ ] Weak password returns 400
- [ ] Protected endpoints require Authorization header
- [ ] Invalid JWT returns 401

---

## Database Debugging

### See all users created in testing
```bash
npm run db:migrate:undo:all  # Reset database
npm run db:migrate          # Re-create tables
npm run dev                 # Start fresh server
```

### Check for connection issues
```bash
psql -U postgres -h localhost -d iota_db -c "SELECT 1"
```

---

## Next: Phase 3 - User Routes

When ready to continue, implement:
- GET /api/users - List users
- GET /api/users/me - Current user profile
- GET /api/users/:userId - User profile
- PATCH /api/users/:userId - Update profile
- DELETE /api/users/:userId - Delete account

See `BACKEND_CONSOLIDATION_PLAN.md` Section 3.1 for detailed endpoint specs.
