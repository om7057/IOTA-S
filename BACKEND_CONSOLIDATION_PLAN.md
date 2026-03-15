# Backend Consolidation Analysis & Plan

**Objective**: Merge mobile/server & web/server into a single unified backend

---

## 1. CURRENT STATE COMPARISON

| Aspect | Mobile Server | Web Server |
|--------|---------------|-----------|
| **Module System** | CommonJS (require) | ES6 (import) |
| **Port** | 3000 | 5000 |
| **ORM** | None (raw SQL) | Sequelize |
| **Routes** | 15 files | 22 files |
| **Models** | Implicit (SQL) | 26 explicit models |
| **Database** | Raw pg pool | Sequelize ORM |
| **Auth** | Email + Google OAuth | OAuth only |
| **Middleware** | `verifyToken` only | `verifyToken` + `tokenOptional` |

---

## 2. ROUTE MAPPING & CONFLICTS

### 2.1 Core Duplicates (Both Have)

| Resource | Mobile Path | Web Path | **Conflict Type** |
|----------|-------------|----------|-------------------|
| Auth | `/api/auth/*` | `/api/auth/*` | Different endpoints - **CRITICAL** |
| Users | `/api/users/*` | `/api/users/*` | Different structures |
| Moods | `/api/moods/*` | `/api/moods/*` | Different field names |
| Journals | `/api/journal-inputs` | `/api/journals` | Path differs, different schema |
| Stories | `/api/stories/*` | `/api/stories/*` | + `/api/lessons`, `/api/challenges` (web only) |
| Topics | `/api/topics/*` | `/api/topics/*` | Different endpoints |
| Queries | `/api/queries/*` | `/api/queries/*` | Identical paths, same logic |
| Quizzes | `/api/quizzes/*` | `/api/quiz*` | Path naming inconsistency |
| Leaderboards | `/api/leaderboards/*` | `/api/leaderboard/*` | Path naming inconsistency |
| Direct Messages | `/api/direct-messages/*` | `/api/teen/messages/*` | Mobile: generic, Web: teen-only |

### 2.2 Web-Only Routes (No Mobile Equivalent)
- `/api/levels/*` - Learning progression
- `/api/units/*` - Curriculum units
- `/api/lessons/*` - Lesson content
- `/api/challenges/*` - Challenge exercises
- `/api/challenge-options/*` - Challenge options
- `/api/news-stories/*` - News/alerts
- `/api/quiz-progress/*` - Progress tracking
- `/api/seed/*` - Data seeding
- `/api/teen/discussions/*` - Teen discussions
- `/api/teen/journal/*` - Teen-specific journaling
- `/api/teen/groups/*` - Teen community groups
- `/api/teen/verification/*` - Teen verification/badges

### 2.3 Mobile-Only Routes (No Web Equivalent)
- `/api/comments/*` - Story comments
- `/api/likes/*` - Story likes
- `/api/posts/*` - Forum posts
- `/api/groups/*` - General groups
- `/api/analysis/*` - Query analysis

---

## 3. DATA MODEL CONFLICTS

### 3.1 User Model
**Mobile (from init-db.sql):**
```sql
- id (UUID)
- email, display_name, password_hash
- age, gender, auth_method, google_id, avatar_url
- is_verified, verified_at
- created_at, updated_at, deleted_at
```

**Web (Sequelize User.js):**
```javascript
- id (UUID)
- userId (STRING, unique) // DUPLICATE ID!
- email, firstName, lastName, imageUrl, passwordHash
- age, userType (enum: child/teenager)
- oauthProvider (enum: google/local)
- currentStars
- timestamps: true
```

**Conflicts:**
- Web has both `id` and `userId` (redundant)
- Mobile: `display_name`, Web: `firstName` + `lastName`
- User type handling differs
- Web has `currentStars` (not in mobile schema)
- Mobile auth_method vs Web oauthProvider naming

### 3.2 Moods Table
**Mobile (SQL):**
```sql
id, user_id, mood, mood_intensity, tags (array), notes, created_at
```

**Web (MoodLog model):**
```javascript
userId, date, mood, moodIntensity, tags[], notes, timestamps
```

**Conflicts:**
- Different field names: `mood_intensity` vs `moodIntensity`
- Mobile uses timestamp, Web uses separate `date` field
- Different indexing strategies

### 3.3 Journal Entries
**Mobile:**
```sql
id, user_id, entry_id, title, content, created_at
```

**Web (Journal model):**
```javascript
userId, title, content, mood, moodIntensity, isAnonymous, tags[], timestamps
```

**Conflicts:**
- Web has more fields (mood tracking, anonymity)
- Mobile path: `/api/journal-inputs`, Web path: `/api/journals`
- Web has separate `/api/teen/journal` route with different structure

### 3.4 Stories
**Mobile:**
```sql
id, user_id, title, description, content, topic_id, level, image_url
```

**Web (Story model):**
```javascript
- Story, StoryLevel (separate), Unit, Lesson, Challenge, ChallengeOption
- More granular structure for educational content
- Progress tracking via ChallengeProgress, QuizProgress
```

**Conflicts:**
- Web has multi-level hierarchy: Unit → Lesson → Challenge
- Mobile flat structure vs Web nested structure
- Different curriculum models

---

## 4. AUTHENTICATION DIFFERENCES

### 4.1 Endpoints
**Mobile (`/api/auth`):**
- `POST /signup` - email/password signup
- `POST /signin` - email/password login
- `POST /signout` - logout
- `GET /google/web` - OAuth URL (web)
- `GET /google/mobile` - OAuth URL (mobile)
- `POST /google/callback` - OAuth code exchange + user creation

**Web (`/api/auth`):**
- `POST /oauth/google` - Direct Google credential payload
- `POST /refresh` - Refresh token rotation
- `POST /logout` - Logout

**Conflicts:**
- Mobile supports email auth, Web OAuth-only
- Mobile has auth code flow (secure), Web has credential flow (client-validated)
- Web doesn't support `/signin` endpoint
- Mobile doesn't have token refresh
- Web auth returns `refreshToken`; mobile only returns `token`

### 4.2 JWT Structure
**Mobile:**
```javascript
{ id, email, displayName }  // expiresIn: '7d'
```

**Web:**
```javascript
{ id: userId }  // expiresIn: '7d' for access, '30d' for refresh
```

**Conflicts:**
- Different payload structure
- Web has refresh token mechanism
- Mobile lacks refresh capability

---

## 5. DATABASE LAYER DIFFERENCES

### 5.1 Mobile (Raw PG Queries)
**Files:** `mobile/server/config/database.js`
**Approach:** Function helpers returning promises

```javascript
db.getUserByEmail(email)
db.createUser(email, displayName, passwordHash, ...)
db.updateUser(id, updates)
```

**Pros:** Lightweight, no abstraction overhead
**Cons:** Raw SQL scattered, harder to maintain, duplicate queries

### 5.2 Web (Sequelize ORM)
**Files:** `web/server/utils/database.js` + 26 model files
**Approach:** ORM with automatic migrations

```javascript
User.findOne({ where: { email } })
User.create({ email, ... })
```

**Pros:** Type-safe, automatic migrations, relationships built-in
**Cons:** Heavier, network round-trips, abstraction complexity

---

## 6. CHANGES REQUIRED

### Phase 1: Foundation (Weeks 1-2)

#### 1.1 Unified Backend Structure
```
unified-server/
├── config/
│   ├── environment.js      (centralized env vars)
│   └── database.js         (Sequelize + migrations)
├── models/                 (merge all Sequelize models)
│   ├── User.js
│   ├── Story.js
│   ├── Mood.js
│   ├── Journal.js
│   ├── Teen*.js            (teen-specific)
│   ├── Unit.js, Lesson.js  (educational)
│   └── index.js            (exports all)
├── middleware/
│   ├── auth.js             (merge verifyToken + tokenOptional)
│   └── errorHandler.js     (new)
├── routes/
│   ├── auth.js             (merge both auth flows)
│   ├── users.js            (merge user routes)
│   ├── moods.js            (merge mood routes)
│   ├── journals.js         (merge + consolidate paths)
│   ├── stories.js          (include lessons, challenges)
│   ├── teen/               (organize teen routes)
│   ├── educational/        (units, lessons, challenges)
│   └── ...                 (other routes)
├── controllers/            (new - extract inline logic)
├── utils/                  (helpers, validators)
├── seeds/                  (data seeding)
├── migrations/             (Sequelize migrations)
├── server.js               (single entry point, ES6)
├── package.json
├── .env.example
└── README.md
```

#### 1.2 Migrate to ES6 Modules
- **Change:** Mobile server from CommonJS → ES6
- **Why:** consistency, tree-shaking, modern tooling
- **Impact:** Update all requires to imports

#### 1.3 Consolidate Configuration
**Unified .env:**
```env
# Database (single database for all apps)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iota_db
DB_USER=postgres
DB_PASSWORD=***

# Server
NODE_ENV=development
PORT=3000                  # Use 3000 as unified port
API_URL=http://localhost:3000

# Auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
REFRESH_TOKEN_EXPIRY=30d
ACCESS_TOKEN_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
WEB_CALLBACK_URL=http://localhost:5173/auth/callback
MOBILE_CALLBACK_URL=myapp://auth/callback

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# External Services
REDIS_URL=redis://localhost:6379        (for sessions, optional)
NEWSFETCHER_URL=http://localhost:8000   (if using AI service)
```

---

### Phase 2: Auth Unification (Weeks 2-3)

#### 2.1 Merge Auth Endpoints

**Unified `/api/auth` Routes:**
```javascript
POST /signup              // Mobile-style: email + password
  Body: { email, password, displayName, age, gender }
  Returns: { user: {...}, token, refreshToken }

POST /signin              // Mobile-style: email + password
  Body: { email, password }
  Returns: { user: {...}, token, refreshToken }

POST /google/web          // OAuth URL for web
  Returns: { authUrl: '...' }

POST /google/mobile       // OAuth URL for mobile
  Returns: { authUrl: '...' }

POST /callback            // Unified OAuth callback (code exchange)
  Body: { code, platform: 'web'|'mobile' }
  Returns: { user: {...}, token, refreshToken }

POST /refresh             // Refresh access token
  Body: { refreshToken }
  Returns: { token, refreshToken }

POST /logout              // Logout (clear refresh token)
  Headers: Authorization: Bearer {token}
  Returns: { success: true }
```

#### 2.2 Unified User Model
```javascript
// Final User schema (Sequelize)
{
  id: UUID (primary)
  email: STRING (unique)
  passwordHash: STRING (nullable for OAuth)
  firstName: STRING
  lastName: STRING
  displayName: STRING (computed from firstName + lastName)
  age: INTEGER (5-19)
  gender: ENUM('male', 'female', 'other', 'prefer-not')
  userType: ENUM('child', 'teenager')  // Derived from age
  oauthProvider: ENUM('google', 'local', null)
  googleId: STRING (unique, nullable)
  avatarUrl: TEXT
  currentStars: INTEGER (default 0)
  isVerified: BOOLEAN (default false)
  verifiedAt: TIMESTAMP (nullable)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
  deletedAt: TIMESTAMP (soft delete)
}
```

#### 2.3 JWT Token Strategy
```javascript
// Access Token (7 days)
{
  id: user.id,
  email: user.email,
  userType: user.userType,
  iat: timestamp,
  exp: timestamp + 7d
}

// Refresh Token (30 days) - stored in DB
{
  id: user.id,
  tokenFamily: uuid,  // For token rotation security
  iat: timestamp,
  exp: timestamp + 30d
}
```

#### 2.4 Auth Middleware
```javascript
// middleware/auth.js
export const verifyToken = (req, res, next) => {
  // Verify JWT access token
  // Set req.user = decoded payload
}

export const verifyRefreshToken = (req, res, next) => {
  // Verify refresh token from body
  // Check DB for token family rotation
}

export const tokenOptional = (req, res, next) => {
  // Try to verify token, continue if invalid
  // Set req.user if valid, undefined if not
}

export const requireUserType = (userType) => {
  return (req, res, next) => {
    if (req.user?.userType !== userType) {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  }
}
```

---

### Phase 3: Routes & Controllers (Weeks 3-4)

#### 3.1 Users Route (Merged)
```javascript
/**
 * Unified User Routes
 * Path: /api/users
 */

// Public endpoints (no auth required)
GET    /                   // Get all users (paginated, no sensitive data)
GET    /:userId           // Get user profile (public view)

// Protected endpoints (verifyToken required)
GET    /me                // Get current user (self)
PATCH  /:userId           // Update user profile
PUT    /:userId/age       // Set/update user age
DELETE /:userId           // Delete account (soft delete)
GET    /progress/:userId  // Get user progress/stats

// Teen-specific (teen users only)
GET    /verification-status              // Check if verified
POST   /verify-eligibility               // Check verification eligibility
POST   /verify                           // Request verification
```

#### 3.2 Moods Route (Merged)
```javascript
/**
 * Unified Mood Routes
 * Path: /api/moods
 */

// Schema:
// {
//   id, userId, mood, moodIntensity, tags[], notes,
//   date, createdAt, updatedAt
// }

GET    /user/:userId           // All moods for user
GET    /user/:userId/today     // Today's mood
GET    /user/:userId/range     // Date range moods
POST   /                       // Create new mood
PUT    /:moodId               // Update mood
DELETE /:moodId               // Delete mood
GET    /user/:userId/stats     // Mood statistics/analytics
```

#### 3.3 Journals Route (Consolidated)
```javascript
/**
 * Consolidated Journal Routes
 * Path: /api/journals (not /journal-inputs)
 * 
 * Combines:
 * - Mobile: journal-inputs
 * - Web: journals + teen/journal
 */

GET    /user/:userId              // All journals for user
GET    /user/:userId/:journalId   // Single journal
POST   /                          // Create new
PUT    /:journalId               // Update
DELETE /:journalId               // Delete
GET    /user/:userId/stats        // Stats (mood patterns)
GET    /user/:userId/filter/:mood // Filter by mood tag

// Teen-specific
GET    /teen/my-submissions       // Verified teen journals only
POST   /teen/submit-for-review    // Submit for verification
```

#### 3.4 Stories Route (Extended)
```javascript
/**
 * Unified Story Routes
 * Path: /api/stories
 * 
 * Consolidates:
 * - Mobile: stories
 * - Web: stories + lessons + units + challenges
 */

// Story CRUD
GET    /                        // List stories (with pagination)
GET    /:storyId               // Get story details
POST   /                       // Create story (admin only)
PUT    /:storyId              // Update story (admin only)
DELETE /:storyId              // Delete story (admin only)

// Story metadata
GET    /topic/:topicId         // Stories by topic
GET    /:storyId/levels        // Story levels/progression
GET    /:storyId/lessons       // Associated lessons

// Progress
GET    /:storyId/progress      // User's progress on story
POST   /:storyId/progress      // Track emotion/progress
GET    /:storyId/comments      // Story comments
POST   /:storyId/comments      // Add comment
GET    /:storyId/likes         // Like count
POST   /:storyId/likes         // Like/unlike

// Units & Lessons (hierarchical)
GET    /units                  // All units
GET    /units/:unitId          // Unit details + lessons
GET    /units/:unitId/lessons  // Lessons in unit
GET    /lessons/:lessonId      // Single lesson details
GET    /lessons/:lessonId/challenges  // Challenges in lesson

// Challenges
GET    /challenges/:challengeId         // Single challenge
POST   /challenges/:challengeId/submit  // Submit solution
GET    /challenges/:challengeId/progress // User progress
```

#### 3.5 Teen-Specific Routes
```javascript
/**
 * Consolidated Teen Routes
 * Path: /api/teen/*
 */

// Teen Communities
GET    /communities                    // List communities
GET    /communities/:communityId       // Community details
POST   /communities                    // Create community (admin)
POST   /communities/:communityId/join  // Join community
POST   /communities/:communityId/leave // Leave community
GET    /communities/:communityId/members  // Members list
POST   /communities/:communityId/invite   // Invite member

// Teen Discussions
GET    /discussions                       // All discussions
GET    /discussions/:discussionId        // Single discussion
POST   /discussions                      // Create discussion
PUT    /discussions/:discussionId       // Edit discussion
DELETE /discussions/:discussionId       // Delete discussion
POST   /discussions/:discussionId/comments    // Add comment
GET    /discussions/:discussionId/comments    // Get comments
POST   /discussions/:discussionId/like        // Like discussion

// Teen Journal (separate from regular journal)
GET    /journal                    // All teen journals
GET    /journal/:entryId          // Single entry
POST   /journal                   // Create entry
PUT    /journal/:entryId          // Update entry
DELETE /journal/:entryId          // Delete entry

// Direct Messages
GET    /messages/conversations          // Conversation list
GET    /messages/conversations/:userId  // Conversation with user
POST   /messages                        // Send message
DELETE /messages/:messageId             // Delete message
PATCH  /messages/:messageId/read        // Mark as read

// Verification/Badges
GET    /verification/me                    // My verification status
POST   /verification/request               // Request verification
GET    /verification/pending               // Pending verifications (counselor)
POST   /verification/:verificationId/approve  // Approve (counselor)
POST   /verification/:verificationId/reject   // Reject (counselor)
```

#### 3.6 Educational Routes
```javascript
/**
 * Educational Content Routes
 * Path: /api/educational/*
 */

// Units (curriculum organization)
GET    /units                  // All units
POST   /units                 // Create unit (admin)
GET    /units/:unitId         // Unit details
PUT    /units/:unitId        // Update unit (admin)
DELETE /units/:unitId        // Delete unit (admin)

// Levels (progression within unit/story)
GET    /units/:unitId/levels        // All levels in unit
POST   /units/:unitId/levels       // Add level
GET    /levels/:levelId             // Level details

// Quizzes & Progress
GET    /quizzes                     // All quizzes
GET    /quizzes/:quizId            // Quiz details
POST   /quizzes/:quizId/submit      // Submit quiz
GET    /progress/:userId            // User's overall progress
GET    /progress/:userId/quiz/:quizId  // Progress on specific quiz

// Leaderboards
GET    /leaderboards               // Global leaderboard
GET    /leaderboards/topic/:topicId  // Topic-specific leaderboard
GET    /leaderboards/user/:userId    // User's rank
PUT    /leaderboards/user/:userId/score  // Update score
```

#### 3.7 News & Resources
```javascript
/**
 * News & Safety Resources
 * Path: /api/news/*
 */

GET    /stories                     // News stories
POST   /stories                    // Create (admin)
PUT    /stories/:newsStoryId       // Update (admin)
DELETE /stories/:newsStoryId       // Delete (admin)

GET    /resources                  // Safety resources
GET    /resources/:resourceId      // Single resource

// Queries (Questions & Answers)
GET    /queries                    // All queries
POST   /queries                   // Submit query
GET    /queries/:queryId          // Single query
GET    /queries/category/:category // By category
POST   /queries/:queryId/analyze   // AI analysis
```

---

### Phase 4: Data Model Consolidation (Week 4)

#### 4.1 Create Sequelize Models (if needed)

```javascript
// models/User.js
export const User = sequelize.define('User', {
  id: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4,
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  displayName: {
    type: DataTypes.VIRTUAL,
    get() { return `${this.firstName} ${this.lastName}` }
  },
  age: { type: DataTypes.INTEGER, validate: { min: 5, max: 19 } },
  gender: DataTypes.ENUM('male', 'female', 'other', 'prefer-not'),
  userType: { 
    type: DataTypes.ENUM('child', 'teenager'),
    get() { return this.age < 13 ? 'child' : 'teenager' }
  },
  oauthProvider: DataTypes.ENUM('google', 'local'),
  googleId: { type: DataTypes.STRING, unique: true },
  avatarUrl: DataTypes.TEXT,
  currentStars: { type: DataTypes.INTEGER, defaultValue: 0 },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verifiedAt: DataTypes.DATE,
  createdAt: { type: DataTypes.DATE, defaultValue: NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: NOW },
  deletedAt: DataTypes.DATE
}, { paranoid: true })
```

#### 4.2 Migration Strategy
- Use Sequelize CLI: `npx sequelize-cli init`
- Create migrations folder
- Write migration to backfill mobile/web data
- Use `migrate:up` to apply sequentially

---

### Phase 5: Client Updates (Weeks 5)

#### 5.1 Mobile Client Changes
**File:** `mobile/client/constants.ts`
```typescript
// Before
export const API_URL = 'http://10.236.168.104:3000/api';

// After (same, no change if using port 3000)
export const API_URL = 'http://10.236.168.104:3000/api';
```

**File:** `mobile/client/contexts/AuthContext.tsx`
```typescript
// Add refresh token support
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Session {
  user: User;
  token: string;
  refreshToken: string;  // NEW
}

// Modify methods to save/use refreshToken
const handleTokenRefresh = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
  // Save new tokens
}
```

#### 5.2 Web Client Changes
**File:** `web/client/src/contexts/AuthContext.jsx`
```javascript
// Update API_URL to unified backend
const API_URL = 'http://localhost:3000/api';

// Paths remain same (e.g., /auth/oauth/google works as /auth/callback)
// Update field mappings if needed
```

#### 5.3 Route Updates
- `POST /api/auth/signin` replaces web's direct OAuth
- `/api/journals` instead of multiple journal endpoints
- `/api/moods` remains unchanged
- `/api/teen/*` paths fully consolidated
- `/api/stories/*` + `/api/lessons/*` unified under `/api/stories/*`

---

## 7. BREAKING CHANGES & MIGRATION TASKS

### 7.1 Client Breakages
| Item | Mobile | Web | Action |
|------|--------|-----|--------|
| Auth endpoints | WORKS | UPDATE `/signin` | Update web to use new unified endpoints |
| Token storage | AsyncStorage | localStorage | Update token refresh in both |
| API base URL | 3000 → 3000 | 5000 → 3000 | Update web constants |
| Journal path | `/journal-inputs` | `/journals` | Update mobile to `/journals` |
| Mood fields | `mood_intensity` | `moodIntensity` | Normalize payload |
| Quizzes path | `/quizzes` | `/quiz` | Use `/quizzes` (plural) |

### 7.2 Database Migrations
1. **Backup existing databases:**
   ```bash
   docker exec postgres_container pg_dump -U postgres iota_db > backup.sql
   ```

2. **Create migration files:**
   ```bash
   npx sequelize-cli migration:generate --name merge-mobile-web-schema
   ```

3. **Migration steps:**
   - Map mobile users table to Sequelize User model
   - Backfill missing columns (firstName/lastName from displayName)
   - Merge mood tables (handle field name changes)
   - Merge journal tables (consolidate schemas)
   - Create relationships in Sequelize

4. **Run migrations:**
   ```bash
   npx sequelize-cli db:migrate
   ```

### 7.3 Data Transformation
```javascript
// Migration example: Merge mobile users into web user schema
export async function up(migration, DataTypes) {
  // 1. Add mobile-style columns to web users
  await migration.addColumn('Users', 'googleId', DataTypes.STRING);
  await migration.addColumn('Users', 'passwordHash', DataTypes.STRING);
  
  // 2. Backfill data from mobile
  await migration.sequelize.query(`
    UPDATE Users 
    SET passwordHash = mobile_schema.password_hash
    WHERE mobile_schema.email = Users.email
  `);
  
  // 3. Rename columns (if needed)
  await migration.renameColumn('Users', 'mood_intensity', 'moodIntensity');
}

export async function down(migration, DataTypes) {
  // Reverse changes
}
```

---

## 8. ROLLOUT PLAN

### Phase Timeline
- **Week 1-2:** Setup, ES6 migration, unified structure
- **Week 2-3:** Auth consolidation, merge endpoints
- **Week 3-4:** Route consolidation, controller extraction
- **Week 4:** Data models, migrations, testing
- **Week 5:** Client updates, integration testing
- **Week 6:** Staging deploy, production validation

### Testing Checklist
- [ ] All auth flows work (signup, signin, OAuth, refresh)
- [ ] Mobile app connects to unified backend
- [ ] Web app connects to unified backend
- [ ] Mood endpoints work with new schema
- [ ] Journal endpoints consolidated
- [ ] Teen features work correctly
- [ ] Story hierarchy (Unit→Lesson→Challenge) works
- [ ] Database migrations successful
- [ ] Performance benchmarks acceptable
- [ ] Error handling consistent

---

## 9. SUMMARY OF CHANGES

### New Backend Structure
```
unified-server/
├── Single port (3000)
├── ES6 modules throughout
├── Sequelize ORM everywhere
├── Consolidated auth (/api/auth/*)
├── Unified user model
├── Merged routes (moods, journals, stories, etc.)
├── Teen-specific routes properly organized
├── Educational content hierarchy
└── Database migrations for data consolidation
```

### APIs Consolidated
- **22 + 15 = 37 route files** → **~12 unified route files**
- **Duplicate endpoints** eliminated
- **Naming consistency** enforced
- **Schema normalization** applied
- **Relationship modeling** centralized

### Benefits
1. **Single source of truth** for auth, users, data
2. **No endpoint duplication** or conflicts
3. **Easier maintenance** (one codebase)
4. **Consistent error handling** & validation
5. **Better performance** (reduced API calls)
6. **Scalability** (single service to scale)

---

## 10. DETAILED ENDPOINT MIGRATION TABLE

| Feature | Mobile Old | Web Old | Unified New | Notes |
|---------|-----------|---------|-------------|-------|
| Email signin | POST /signin | ❌ | POST /auth/signin | Email+password flow |
| OAuth | POST /google/callback | POST /oauth/google | POST /auth/callback | Unified code exchange |
| Users list | ❌ | GET /users | GET /api/users | Public endpoint |
| Get profile | GET /users/me | ❌ | GET /api/users/me | Protected |
| Update user | PUT /users/:id | PATCH /users/:userId | PATCH /api/users/:userId | Standardize to PATCH |
| Moods list | GET /moods | GET /moods/user/:userId | GET /api/moods | Implied current user from token |
| Create mood | POST /moods | POST /moods | POST /api/moods | Same path |
| Journal list | GET /journal-inputs | GET /journals | GET /api/journals | Path consolidated |
| Stories list | GET /stories | GET /stories | GET /api/stories | Same |
| Lessons | ❌ | GET /lessons | GET /api/stories/lessons | Under stories umbrella |
| Units | ❌ | GET /units | GET /api/stories/units | Hierarchal |
| Challenges | ❌ | GET /challenges | GET /api/stories/challenges | Hierarchal |
| Quizzes | GET /quizzes | GET /quiz | GET /api/quizzes | Standardize to plural |
| Leaderboards | GET /leaderboards | GET /leaderboard | GET /api/leaderboards | Standardize to plural |
| Teen communities | ❌ | GET /teen/groups | GET /api/teen/communities | Rename for clarity |
| Teen messages | GET /direct-messages | GET /teen/messages | GET /api/teen/messages | Organize under /teen |
| Teen journal | ❌ | GET /teen/journal | GET /api/teen/journal | Separate from general journal |
| News stories | ❌ | GET /news-stories | GET /api/news/stories | Organize under /news |
| Queries | GET /queries | GET /queries | GET /api/queries | Same |

---

**End of Consolidation Plan**
