# Phase 1 & 2 Implementation: Foundation + Auth Consolidation ✅

## Summary

Phase 1 and Phase 2 are complete. The unified backend is now ready for user management.

**Phase 1 Status:** ✅ Foundation (directory structure, config, middleware, utilities)
**Phase 2 Status:** ✅ Auth Consolidation (User model, RefreshToken model, auth controller, auth routes)

---

## Implementation Progress

### ✅ Phase 1: Foundation (COMPLETE)
- Created unified-server directory structure
- Setup config files (environment.js, database.js, .sequelizerc)
- Created middleware (auth.js, errorHandler.js)
- Created utilities (logger, validators, jwt, password)
- Created server.js entry point (ES6)
- Setup package.json with all dependencies
- Created comprehensive README and IMPLEMENTATION_GUIDE

### ✅ Phase 2: Auth Consolidation (COMPLETE)
- [x] Create User model (Sequelize) - `models/User.js`
- [x] Create RefreshToken model - `models/RefreshToken.js`
- [x] Create auth controller - `controllers/auth.js`
- [x] Create consolidated auth routes - `routes/auth.js`
- [x] Register routes in server.js
- [x] Token refresh mechanism with token family pattern
- [x] OAuth integration with Google

**What Works:**
- Signup with email/password
- Signin with email/password
- Token refresh with token family rotation
- Google OAuth URL generation (web & mobile)
- Google OAuth callback (code exchange)
- Logout with token revocation
- Role-based access control (child/teenager derived from age)
- User verification status tracking

**Testing:** See `PHASE2_TESTING.md` for complete testing guide with curl examples

### 🟡 Phase 3: User Routes (NEXT)
- [ ] Create user controller - merge mobile/web logic
- [ ] Create user routes:
  - GET /api/users - List users (paginated)
  - GET /api/users/me - Current user profile (protected)
  - GET /api/users/:userId - User profile
  - PATCH /api/users/:userId - Update profile (protected)
  - DELETE /api/users/:userId - Delete account (protected)
  - GET /api/users/:userId/progress - User progress stats

### ⏳ Phase 4: Mood, Journal, Story Routes (PENDING)
- [ ] Create Mood model & routes
- [ ] Create Journal model & routes
- [ ] Create Story model & routes (with Units, Lessons, Challenges)
- [ ] Create Teen routes & models
- [ ] Create Quiz & Leaderboard routes
- [ ] Create News & Queries routes

### ⏳ Phase 5: Data Migrations (PENDING)
- [ ] Create database migrations
- [ ] Backfill data from mobile/web databases
- [ ] Establish model relationships

### ⏳ Phase 6: Client Updates (PENDING)
- [ ] Update mobile client API URLs
- [ ] Update web client API URLs
- [ ] Add token refresh support
- [ ] Update route paths

---

## Current Directory Structure

```
unified-server/
├── config/
│   ├── environment.js             ✅ Phase 1
│   └── database.js                ✅ Phase 1
├── models/
│   ├── User.js                    ✅ Phase 2
│   ├── RefreshToken.js            ✅ Phase 2
│   └── index.js                   ✅ Phase 2
├── middleware/
│   ├── auth.js                    ✅ Phase 1
│   └── errorHandler.js            ✅ Phase 1
├── routes/
│   ├── auth.js                    ✅ Phase 2
│   └── index.js                   ✅ Phase 1 (skeleton)
├── controllers/
│   ├── auth.js                    ✅ Phase 2
│   └── index.js                   ✅ Phase 1 (skeleton)
├── utils/
│   ├── logger.js                  ✅ Phase 1
│   ├── validators.js              ✅ Phase 1
│   ├── jwt.js                     ✅ Phase 1
│   └── password.js                ✅ Phase 1
├── migrations/                      (to be used in Phase 5)
├── seeders/                         (to be used in Phase 5)
├── server.js                      ✅ Phase 2 (updated with auth routes)
├── package.json                   ✅ Phase 1
├── .env.example                   ✅ Phase 1
├── .sequelizerc                   ✅ Phase 1
├── .gitignore                     ✅ Phase 1
├── README.md                      ✅ Phase 1
├── IMPLEMENTATION_GUIDE.md        ✅ Phase 1-2 (this file)
├── PHASE2_TESTING.md              ✅ Phase 2 (curl examples & testing)
└── BACKEND_CONSOLIDATION_PLAN.md  ✅ Phase 1 (full consolidation plan)
```

---

## Files Summary

| File | Purpose | Phase | Status |
|------|---------|-------|--------|
| `server.js` | Main entry point | Phase 2 | ✅ Complete (auth routes mounted) |
| `config/environment.js` | Centralized config | Phase 1 | ✅ Complete |
| `config/database.js` | Sequelize config | Phase 1 | ✅ Complete |
| `middleware/auth.js` | JWT verification | Phase 1 | ✅ Complete |
| `middleware/errorHandler.js` | Error handling | Phase 1 | ✅ Complete |
| `utils/logger.js` | Logging utility | Phase 1 | ✅ Complete |
| `utils/validators.js` | Input validators | Phase 1 | ✅ Complete |
| `utils/jwt.js` | Token generation | Phase 1-2 | ✅ Complete |
| `utils/password.js` | Password hashing | Phase 1-2 | ✅ Complete |
| `models/User.js` | User model (Sequelize) | Phase 2 | ✅ Complete |
| `models/RefreshToken.js` | Refresh token model | Phase 2 | ✅ Complete |
| `models/index.js` | Model exports & DB connection | Phase 2 | ✅ Complete |
| `controllers/auth.js` | Auth business logic | Phase 2 | ✅ Complete |
| `routes/auth.js` | Auth endpoints (7 endpoints) | Phase 2 | ✅ Complete |
| `.sequelizerc` | Sequelize CLI config | Phase 1 | ✅ Complete |
| `package.json` | Dependencies | Phase 1 | ✅ Complete |
| `.env.example` | Environment template | Phase 1 | ✅ Complete |
| `.gitignore` | Git ignore rules | Phase 1 | ✅ Complete |
| `README.md` | Documentation | Phase 1 | ✅ Complete |
| `IMPLEMENTATION_GUIDE.md` | This file | Phase 1-2 | ✅ Complete |
| `PHASE2_TESTING.md` | Auth testing guide | Phase 2 | ✅ Complete |

---

## How to Start

### 1. Install Dependencies

```bash
cd unified-server
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
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

### 3. Start Server

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

### 4. Test Auth Endpoints

See [PHASE2_TESTING.md](./PHASE2_TESTING.md) for complete curl examples.

Quick test:
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Password123",
    "firstName":"John",
    "lastName":"Doe",
    "age":15
  }'

# Signin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Password123"
  }'
```

---

## Effort Estimate

| Phase | Tasks | Effort | Status |
|-------|-------|--------|--------|
| Phase 1 | Foundation & setup | 2 hours | ✅ Complete |
| Phase 2 | Auth consolidation | 4-5 hours | ✅ Complete |
| Phase 3 | User routes | 3-4 hours | 🟡 Next |
| Phase 4 | Other models & routes | 12-15 hours | ⏳ Pending |
| Phase 5 | Data migrations | 6-8 hours | ⏳ Pending |
| Phase 6 | Client updates | 6-8 hours | ⏳ Pending |
| **Total** | **Full consolidation** | **33-42 hours** | |

---

## Auth Endpoints Implemented

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Email/password registration |
| POST | `/api/auth/signin` | Email/password login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google/web` | Get Google OAuth URL (web) |
| GET | `/api/auth/google/mobile` | Get Google OAuth URL (mobile) |
| POST | `/api/auth/google/callback` | OAuth code exchange |

### Protected Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/logout` | Logout & revoke tokens |

---

## User Model Schema

```javascript
{
  id:               UUID (primary key)
  email:            STRING (unique)
  passwordHash:     STRING (nullable - for OAuth users)
  firstName:        STRING
  lastName:         STRING
  displayName:      VIRTUAL (computed from firstName + lastName)
  age:              INTEGER (5-19)
  gender:           ENUM ('male', 'female', 'other', 'prefer-not')
  userType:         ENUM ('child', 'teenager') // Derived from age
  oauthProvider:    ENUM ('google', 'local', null)
  googleId:         STRING (unique, nullable)
  avatarUrl:        TEXT
  currentStars:     INTEGER (default: 0)
  isVerified:       BOOLEAN (default: false)
  verifiedAt:       TIMESTAMP (nullable)
  createdAt:        TIMESTAMP (auto)
  updatedAt:        TIMESTAMP (auto)
  deletedAt:        TIMESTAMP (nullable - soft delete)
}
```

---

## Token Storage (RefreshToken Model)

```javascript
{
  id:              UUID (primary key)
  userId:          UUID (foreign key to User)
  tokenFamily:     UUID (groups tokens from same login)
  expiresAt:       TIMESTAMP
  revokedAt:       TIMESTAMP (nullable - when logged out)
  ipAddress:       STRING (optional)
  userAgent:       STRING (optional)
  createdAt:       TIMESTAMP (auto)
  updatedAt:       TIMESTAMP (auto)
}
```

---

## Testing Checklist - Phase 2

- [x] Server starts without errors
- [x] Database connection successful
- [x] Models synchronized
- [x] POST /api/auth/signup creates user
- [x] Password is hashed (not plain text in DB)
- [x] POST /api/auth/signin works with correct password
- [x] Tokens are valid JWT format
- [x] POST /api/auth/refresh generates new access token
- [x] Token family maintained during refresh
- [x] POST /api/auth/logout revokes refresh tokens
- [x] GET /api/auth/google/* returns OAuth URLs
- [x] Duplicate email signup returns 409
- [x] Invalid email format returns 400
- [x] Weak password returns 400
- [x] Protected endpoints require Authorization header
- [x] Invalid JWT returns 401

---

## What's Next: Phase 3

### User Routes to Implement

1. **GET /api/users** - List all users (paginated)
   - Query params: page, limit, sort
   - Returns: paginated user list with public fields

2. **GET /api/users/me** - Current user profile (protected)
   - Returns: full user profile

3. **GET /api/users/:userId** - User profile
   - Returns: public user profile (age, userType, stars, etc.)

4. **PATCH /api/users/:userId** - Update profile (protected)
   - Allow: firstName, lastName, age, gender, avatarUrl
   - Returns: updated user

5. **DELETE /api/users/:userId** - Delete account (protected)
   - Soft delete (sets deletedAt)
   - Returns: success message

6. **GET /api/users/:userId/progress** - User progress stats
   - Returns: moods logged, journals written, stories completed, stars earned

### Files to Create

- `controllers/users.js` - User business logic
- `routes/users.js` - User route handlers
- Update `server.js` to mount user routes

See `BACKEND_CONSOLIDATION_PLAN.md` Section 3.1 for detailed specs.

---

## Next Steps

### To Continue to Phase 3:

```bash
# Files to create:
# 1. controllers/users.js (user business logic)
# 2. routes/users.js (6 user endpoints)
# 3. Update server.js to import and mount user routes

# Then test:
npm run dev
curl http://localhost:3000/api/users
```

---

## Database Commands Reference

```bash
# Connect to database
psql -U postgres -d iota_db

# See users table
SELECT * FROM "Users";

# See refresh tokens
SELECT * FROM "RefreshTokens";

# Reset database (deletes all data!)
npm run db:reset

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo
```

---

## Deployment Notes

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=prod-db.example.com
DB_USER=postgres
DB_PASSWORD=strong-password-here
JWT_SECRET=very-long-random-secret-key
JWT_REFRESH_SECRET=very-long-random-refresh-key
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
CORS_ORIGIN=https://yourdomain.com,https://mobile.yourdomain.com
```

### Database Backup Before Migration

```bash
# Backup current database
pg_dump -U postgres iota_db > backup-$(date +%Y%m%d).sql

# Restore if needed
psql -U postgres iota_db < backup-20260314.sql
```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
1. Start PostgreSQL: brew services start postgresql
2. Check connection: psql -U postgres -h localhost
3. Verify .env DB settings
```

### Port 3000 Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### Models Not Syncing
```
Clear migrations and start fresh:
npx rm -rf migrations/*
npm run db:migrate
```

---

## Related Documentation

- [BACKEND_CONSOLIDATION_PLAN.md](../BACKEND_CONSOLIDATION_PLAN.md) - Full consolidation strategy
- [PHASE2_TESTING.md](./PHASE2_TESTING.md) - Auth testing guide with curl examples
- [README.md](./README.md) - Server documentation
- [.env.example](./.env.example) - Environment variables template

---

**Ready to continue to Phase 3? See section above "Next Steps: Phase 3"**
