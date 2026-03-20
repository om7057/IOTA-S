# IOTAS Unified Backend

Consolidated backend server for both **mobile (React Native)** and **web (React)** clients.

## 📋 Project Structure

```
unified-server/
├── config/              # Configuration files
│   ├── environment.js   # Centralized environment variables
│   └── database.js      # Sequelize configuration
├── models/              # Sequelize ORM models (Phase 4)
│   └── index.js         # Model exports & DB connection
├── migrations/          # Database migrations (Phase 4)
├── seeders/             # Data seeders (Phase 4)
├── middleware/          # Express middleware
│   ├── auth.js          # JWT verification, role checks
│   └── errorHandler.js  # Error handling
├── routes/              # API route handlers (Phase 2-3)
├── controllers/         # Business logic (Phase 3)
├── utils/               # Helper functions
│   ├── logger.js        # Logging utility
│   ├── validators.js    # Validation functions
│   ├── jwt.js           # JWT token generation
│   └── password.js      # Password hashing
├── server.js            # Main entry point
├── package.json         # Dependencies
├── .env.example         # Environment variables template
└── .sequelizerc          # Sequelize CLI config
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd unified-server
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local settings:
```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iota_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secrets (change in production!)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3. Verify Database Connection

```bash
npm run db:migrate
```

Should see: `✅ Database connection successful`

### 4. Start Development Server

```bash
npm run dev
```

Should see:
```
✅ Database connection successful
✅ Database models synchronized
🚀 Server running on port 3000
```

### 5. Test Server

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-03-14T10:00:00.000Z",
  "uptime": 5.234
}
```

## 📦 Implementation Phases

### Phase 1: Foundation ✅ (CURRENT)
- [x] Directory structure created
- [x] Configuration centralized
- [x] Environment variables setup
- [x] Middleware (auth, error handling)
- [x] Utilities (logger, validators, JWT, password)
- [x] Server skeleton
- [ ] Database connection verified

### Phase 2: Auth Consolidation (Next)
- [ ] User model (Sequelize)
- [ ] Auth endpoints:
  - [x] Skeleton: `POST /api/auth/signup`
  - [x] Skeleton: `POST /api/auth/signin`
  - [x] Skeleton: `POST /api/auth/refresh`
  - [x] Skeleton: `POST /api/auth/google/callback`
  - [x] Skeleton: `POST /api/auth/logout`
- [ ] Auth controllers
- [ ] Token refresh mechanism
- [ ] OAuth integration

### Phase 3: Routes & Controllers (Follows Phase 2)
- [ ] User routes & controller
- [ ] Mood routes & controller
- [ ] Journal routes & controller
- [ ] Story routes & controller (includes lessons, units, challenges)
- [ ] Teen routes & controllers
- [ ] Quiz & leaderboard routes
- [ ] News & queries routes

### Phase 4: Data Models (Parallel with Phase 3)
- [ ] Merge mobile/web Sequelize models (26 total)
- [ ] Create database migrations
- [ ] Backfill existing data from mobile/web databases
- [ ] Test relationships & query performance

### Phase 5: Client Updates (Final)
- [ ] Update mobile client:
  - [ ] API base URL: 3000 (no change)
  - [ ] Add token refresh support
  - [ ] Update journal path: `/journals`
- [ ] Update web client:
  - [ ] API base URL: 5000 → 3000
  - [ ] Remove OAuth endpoint differences
  - [ ] Update route paths

## 🔑 Key Features

### Authentication
- **Email/Password** signup & signin (mobile + web)
- **Google OAuth** integration (both platforms)
- **JWT tokens** with refresh rotation
- **Token rotation** for security
- **Role-based access control** (child, teenager, counselor, parent)

### Database
- **Sequelize ORM** for type safety
- **Migrations** for version control
- **Soft deletes** (paranoid: true)
- **Timestamps** (createdAt, updatedAt, deletedAt)
- **Relationships** between all models

### API
- **Unified routes** (no duplication)
- **Consistent error handling**
- **Request logging**
- **CORS enabled**
- **Pagination support**

### Security
- **Password hashing** (bcryptjs)
- **JWT verification** on all protected routes
- **Token family rotation** for refresh tokens
- **Environment-based secrets**
- **SQL injection prevention** (Sequelize ORM)

## 📚 API Endpoints (to be implemented)

### Authentication
```
POST   /api/auth/signup              # Email/password signup
POST   /api/auth/signin              # Email/password login
POST   /api/auth/refresh             # Refresh access token
POST   /api/auth/logout              # Logout
POST   /api/auth/google/web          # Get OAuth URL (web)
POST   /api/auth/google/mobile       # Get OAuth URL (mobile)
POST   /api/auth/google/callback     # OAuth code exchange
```

### Users
```
GET    /api/users                    # List users (paginated)
GET    /api/users/me                 # Current user profile
GET    /api/users/:userId            # User profile
PATCH  /api/users/:userId            # Update profile
DELETE /api/users/:userId            # Delete account
```

### Moods
```
GET    /api/moods/user/:userId       # All moods
GET    /api/moods/user/:userId/today # Today's mood
POST   /api/moods                    # Create mood
PUT    /api/moods/:moodId            # Update mood
DELETE /api/moods/:moodId            # Delete mood
```

### Journals
```
GET    /api/journals/user/:userId    # All journals
POST   /api/journals                 # Create entry
PUT    /api/journals/:entryId        # Update entry
DELETE /api/journals/:entryId        # Delete entry
```

### Stories
```
GET    /api/stories                  # List stories
GET    /api/stories/:storyId         # Story details
GET    /api/stories/:storyId/progress # User progress
POST   /api/stories/:storyId/progress # Track progress
```

### Teen Features
```
GET    /api/teen/communities         # Communities
GET    /api/teen/messages            # Messages
GET    /api/teen/journal             # Teen journal
POST   /api/teen/verification/request # Request verification
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch
```

## 🗄️ Database Commands

```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Create seeder
npx sequelize-cli seed:generate --name seed-name

# Run seeders
npm run db:seed:all

# Reset database (⚠️ warning: deletes all data)
npm run db:reset

# Migrate all PostgreSQL tables to MongoDB Atlas
npm run migrate:postgres-to-mongo

# Re-run migration and replace existing Mongo data
npm run migrate:postgres-to-mongo -- --drop
```

### Docker Persistence Note

- `docker compose down` keeps your PostgreSQL volume data.
- `docker compose down -v` deletes named volumes (`postgres_data`, `redis_data`) and permanently removes local DB data.
- If you want local Postgres persistence, avoid using `-v`.
- If you want cloud persistence, run Mongo migration and store data in Atlas.

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment (development/test/production) |
| `PORT` | No | `3000` | Server port |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `iota_db` | Database name |
| `DB_USER` | Yes | `postgres` | Database user |
| `DB_PASSWORD` | Yes | `` | Database password |
| `MONGODB_URI` | No | `` | MongoDB Atlas connection URI for migration |
| `MONGODB_DB_NAME` | No | `iota_db` | Target MongoDB database name |
| `JWT_SECRET` | Yes | (fallback) | JWT secret key |
| `JWT_REFRESH_SECRET` | Yes | (fallback) | Refresh token secret |
| `GOOGLE_CLIENT_ID` | No | `` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | `` | Google OAuth client secret |
| `CORS_ORIGIN` | No | `http://localhost:5173,...` | Allowed CORS origins |

## 🔗 Integration with Clients

### Mobile Client (`mobile/client/`)
- Update `constants.ts` to use unified backend port
- Add refresh token support to `AuthContext.tsx`
- Update journal endpoints: `/journal-inputs` → `/journals`

### Web Client (`web/client/`)
- Update API base URL: `5000` → `3000`
- Update auth endpoints to use unified routes
- Consolidate quiz endpoints: `/quiz` → `/quizzes`

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
1. Ensure PostgreSQL is running
2. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
3. Verify database exists: psql -U postgres -l | grep iota_db
```

### JWT Secret Not Set
```
Warning: JWT_SECRET using fallback value

Solution: Add JWT_SECRET to .env file
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000

Solution:
1. Change PORT in .env
2. Or kill process: lsof -i :3000 | kill -9 <PID>
```

## 📞 Support

See [BACKEND_CONSOLIDATION_PLAN.md](../BACKEND_CONSOLIDATION_PLAN.md) for detailed consolidation strategy.

## 📄 License

MIT
