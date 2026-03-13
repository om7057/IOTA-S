# IOTA-S Development & Setup Guide

Complete installation, configuration, and development guide for IOTA-S with PostgreSQL, React web, React Native mobile, and Node.js backend.

**Last Updated:** 2024 | **Status:** PostgreSQL ✅ | OAuth ✅ | Production Ready

## 📋 Quick Links
- [Prerequisites](#prerequisites)
- [Quick Start (5 min)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Database Setup](#database-setup)
- [OAuth Configuration](#oauth-configuration)
- [Architecture](#architecture)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Common Commands](#common-commands)

---

## Prerequisites

### Required
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git**

### Optional
- **Google OAuth credentials** for sign-in with Google
- **Expo CLI** for mobile: `npm install -g expo-cli`

### System Requirements
- 4GB+ RAM
- 1GB+ free disk space
- Linux/macOS/Windows

---

## Quick Start (5 minutes)

### 1. Verify Setup
```bash
cd /path/to/IOTA-S
bash verify-setup.sh
# Checks: Node, Docker, files, dependencies
```

### 2. Start PostgreSQL + Redis (Docker)
```bash
docker-compose up -d
# Wait for health check: docker ps shows both running
```

### 3. Install Dependencies
```bash
# Backend
cd mobile/server
npm install --legacy-peer-deps

# Web
cd ../../web/client
npm install

# Mobile  
cd ../../mobile/client
npm install --legacy-peer-deps
```

### 4. Start Services (3 terminals)

**Terminal 1: Backend**
```bash
cd mobile/server
npm start
# Expected: ✓ Database connected | ✓ Server running on port 3000
```

**Terminal 2: Web**
```bash
cd web/client
npm run dev
# Visit: http://localhost:5173
```

**Terminal 3: Mobile**
```bash
cd mobile/client
npm start
# Press 'a' for Android, 'i' for iOS, 'w' for web
```

### 5. Test Authentication
- **Web**: Visit http://localhost:5173 → Sign Up
- **Mobile**: Press 'a' in Terminal 3 → Sign Up screen

---

## Detailed Setup

### Project Structure
```
IOTA-S/
├── docker-compose.yml          # PostgreSQL + Redis services
├── init-db.sql                 # Database schema (17 tables)
├── verify-setup.sh             # Verification script
├── DEVELOPMENT.md              # This file
│
├── mobile/
│   ├── client/                 # React Native (Expo)
│   │   ├── components/         # UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # OAuth + JWT
│   │   └── hooks/
│   │       └── useEnhancedEmotionDetection.ts
│   │
│   └── server/                 # Node.js backend
│       ├── config/
│       │   └── database.js     # PostgreSQL pool + helpers
│       ├── routes/
│       │   └── auth.js         # Auth + OAuth endpoints
│       ├── .env                # Configuration
│       └── package.json
│
└── web/
    ├── client/                 # React (Vite)
    │   └── src/
    │       ├── contexts/
    │       │   └── AuthContext.jsx # OAuth + JWT
    │       └── pages/
    │           ├── Login_OAuth.jsx
    │           └── SignUp.jsx
    │
    └── server/                 # Optional backend
```

---

## Database Setup

### PostgreSQL in Docker

Start services:
```bash
docker-compose up -d
```

Schema includes 17 tables:
- **Users**: Email/password + OAuth accounts
- **Moods**: Daily mood tracking
- **Emotion**: Real-time events during stories
- **Journal**: Entry tracking
- **Stories**: Content + levels
- **Groups**: Community features
- **Quizzes**: Assessment
- **News**: News feed
- **Leaderboards**: Rankings

Verify connection:
```bash
docker exec -it iota-postgres psql -U postgres -d iota_db -c "\dt"
# Should list 17 tables
```

Inspect data:
```bash
docker exec -it iota-postgres psql -U postgres -d iota_db
# SELECT * FROM users;
# \q to exit
```

Reset database:
```bash
# ⚠️ WARNING: Deletes all data
docker-compose down
docker volume rm iota-s_postgres_data
docker-compose up -d
```

### Environment Configuration

**/.env** (Backend)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=iota_db

# Server
PORT=3000

# JWT
JWT_SECRET=change-this-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
WEB_CALLBACK_URL=http://localhost:5173/auth/callback
MOBILE_CALLBACK_URL=myapp://auth/callback
```

---

## OAuth Configuration

### Get Google Credentials

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:5173/auth/callback
     myapp://auth/callback
     https://yourdomain.com/auth/callback (production)
     ```
5. Copy Client ID and Secret

### Environment Setup

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret-here
```

### API Endpoints

**Web OAuth Flow:**
```
1. GET /api/auth/google/web
   → Returns OAuth URL
   
2. User clicks Google button
   → Browser redirects to Google
   → User authorizes
   → Browser redirects to http://localhost:5173/auth/callback?code=...
   
3. Frontend sends code to backend
   POST /api/auth/google/callback
   → Returns JWT token
```

**Mobile OAuth Flow:**
```
1. GET /api/auth/google/mobile
   → Returns OAuth URL
   
2. User taps Google button
   → expo-auth-session opens browser
   → User authorizes
   → Browser redirects to myapp://auth/callback?code=...
   
3. App captures code and sends to backend
   POST /api/auth/google/callback
   → Returns JWT token
```

---

## Authentication Architecture

### Technologies
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Password Hashing**: bcryptjs
- **Token**: JWT (7-day expiration)
- **Web Storage**: localStorage
- **Mobile Storage**: AsyncStorage

### Endpoints

```
POST   /api/auth/signup          # Email/password registration
POST   /api/auth/signin          # Email/password login
POST   /api/auth/signout         # Logout
GET    /api/auth/google/web      # OAuth URL (web)
GET    /api/auth/google/mobile   # OAuth URL (mobile)
POST   /api/auth/google/callback # Handle OAuth (both)
```

### Password Security
- Hashed with bcryptjs (salt rounds: 10)
- Minimum 8 characters required
- Never stored in plaintext

### JWT Tokens
- Signed with JWT_SECRET
- 7-day expiration
- Stored in localStorage (web) or AsyncStorage (mobile)
- Sent in Authorization header for API requests

---

## Verification

### Check Services
```bash
# Docker
docker ps
# Should show: iota-postgres, iota-redis (RUNNING, HEALTHY)

# Backend health
curl http://localhost:3000/api/health
# Response: {"status":"ok","database":"connected",...}

# Web
Open http://localhost:5173 in browser

# Mobile  
Check Expo CLI terminal for "Running on..."
```

### Test Authentication

**Email/Password:**
1. Web: Sign up with email, password, name, age, gender
2. Mobile: Same steps
3. Backend logs: Should show "Signup successful"

**Google OAuth (if credentials configured):**
1. Web: Click "Sign in with Google"
2. Mobile: Tap "Sign in with Google"
3. Should redirect back with JWT token

### Database Health
```bash
docker exec -it iota-postgres psql -U postgres -d iota_db -c "SELECT COUNT(*) FROM users;"
# Should return count of users
```

---

## Troubleshooting

### Docker Issues

**PostgreSQL won't start:**
```bash
docker logs iota-postgres
# Check for port conflicts or volume issues
```

**Port already in use:**
```bash
# PostgreSQL (5432)
lsof -i :5432
kill -9 <PID>

# Backend (3000)
lsof -i :3000
kill -9 <PID>

# Web (5173)
lsof -i :5173
kill -9 <PID>
```

### Backend Issues

**"Cannot connect to database":**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check .env variables
cat mobile/server/.env

# Restart both
docker-compose restart postgres
cd mobile/server && npm start
```

**Port 3000 already in use:**
```bash
lsof -i :3000 | grep node
kill -9 <PID>
npm start
```

**Module errors:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### Frontend Issues

**Mobile can't reach backend:**
- Android emulator: Change API_URL to `http://10.0.2.2:3000`
- iOS simulator: Change API_URL to `http://localhost:3000`
- Physical device: Change to your computer's IP (e.g., `http://192.168.1.100:3000`)

**npm install fails:**
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

**Expo won't start:**
```bash
npm install -g expo-cli  # Update
npm start -- --reset-cache  # Clear cache
```

### Database Issues

**"relations 'users' does not exist":**
```bash
# Reinitialize schema
docker exec -i iota-postgres psql -U postgres -d iota_db < init-db.sql
```

**Lost connection:**
```bash
docker-compose restart postgres
cd mobile/server && npm start
```

---

## Architecture

### System Flow
```
┌─────────────────────────────────────────────┐
│          User Devices                       │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Web (React)  │  │ Mobile (React Native)│ │
│  │ :5173        │  │ Expo                 │ │
│  └───────┬──────┘  └──────────┬───────────┘ │
└──────────┼──────────────────────┼────────────┘
           │                      │
           └──────────────┬───────┘
                          ↓
                  ┌──────────────────┐
                  │  Backend (Node)  │
                  │  :3000           │
                  │  /api/auth/*     │
                  │  /api/moods/*    │
                  │  /api/journal/*  │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │  PostgreSQL      │
                  │  :5432 (Docker)  │
                  │  17 Tables       │
                  └──────────────────┘
```

### Technology Stack

**Frontend (Web)**
- React 18 + Vite
- TailwindCSS
- JWT in localStorage
- Exported as SPA

**Frontend (Mobile)**
- React Native + Expo SDK 54
- TypeScript
- AsyncStorage for JWT
- expo-camera for emotion detection
- expo-auth-session for OAuth

**Backend**
- Node.js + Express
- PostgreSQL with pg driver
- bcryptjs for passwords
- JWT for authentication
- axios for HTTP (Google OAuth)

**Infrastructure**
- Docker Compose
- PostgreSQL 16 (pg_ossp for UUIDs)
- Redis 7 (optional caching)

---

## Common Commands

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker ps                         # List running containers
docker logs iota-postgres         # View PostgreSQL logs
docker exec -it iota-postgres psql -U postgres  # Connect to PostgreSQL
```

### Database
```bash
# Connect
docker exec -it iota-postgres psql -U postgres -d iota_db

# View tables
\dt

# Query users
SELECT * FROM users;

# View logs
docker logs iota-postgres

# Backup
docker exec iota-postgres pg_dump -U postgres iota_db > backup.sql

# Restore
docker exec -i iota-postgres psql -U postgres iota_db < backup.sql
```

### Backend
```bash
cd mobile/server

npm install --legacy-peer-deps    # Install dependencies
npm start                         # Start server (port 3000)
npm audit                         # Check vulnerabilities
npm audit fix                     # Fix vulnerabilities
```

### Web Frontend
```bash
cd web/client

npm install                       # Install dependencies
npm run dev                       # Start dev server (port 5173)
npm run build                     # Build for production
npm run preview                   # Preview production build
```

### Mobile Frontend
```bash
cd mobile/client

npm install --legacy-peer-deps    # Install dependencies
npm start                         # Start Expo
# Press: a (Android), i (iOS), w (web), q (quit)
npm start -- --reset-cache        # Reset Expo cache
```

---

## Environment Checklist

- [ ] Docker running: `docker ps`
- [ ] PostgreSQL healthy: `docker ps shows HEALTHY`
- [ ] Backend database connected: Check server logs
- [ ] Web frontend runs: http://localhost:5173
- [ ] Mobile frontend runs: Expo shows menu options
- [ ] Can sign up (web): Create test account
- [ ] Can sign up (mobile): Create test account
- [ ] Accounts persist: Restart app, login with same credentials
- [ ] (Optional) Google OAuth: Credentials in .env

---

## Production Deployment

### Before Deploying

1. Update `.env` for production:
   ```env
   DB_HOST=prod-db.example.com
   JWT_SECRET=<cryptographically-secure-random>
   NODE_ENV=production
   WEB_CALLBACK_URL=https://yourdomain.com/auth/callback
   MOBILE_CALLBACK_URL=yourapp://auth/callback
   ```

2. Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.) instead of Docker

3. Add HTTPS/SSL certificates

4. Configure CORS for specific domains

5. Enable database backups

### Deployment Platforms

**Backend:**
- Heroku, Railway, Render, DigitalOcean App Platform

**Web:**
- Vercel, Netlify, AWS S3 + CloudFront

**Mobile:**
- EAS Build for Expo: `eas build`

---

## Next Steps

1. ✅ Complete Quick Start above
2. ✅ Verify all services running
3. ✅ Test signup/signin on both platforms
4. ⏳ (Optional) Setup Google OAuth credentials
5. ⏳ Build features (moods, journal, stories, etc.)
6. ⏳ Deploy to production

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Check Docker logs: `docker logs <container>`
3. Check backend logs: Terminal 1 output
4. Verify .env configuration
5. Verify all prerequisites installed

---

**Ready to develop! 🚀**

Start with Quick Start section above, or see detailed setup for step-by-step instructions.
