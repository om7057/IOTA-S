# IOTA-S Codebase Context Document

**Last Updated:** March 20, 2026  
**Status:** Phase 9 - Psychiatrist Mental Health Support (Active Development)

---

## 📋 Executive Summary

**IOTA-S** is a comprehensive, age-appropriate digital safety and well-being platform for children (5-11) and teens (13+). The platform educates users about personal safety, emotional well-being, and digital literacy through interactive stories, quizzes, peer support, and professional mental health resources.

**Current Focus:** Implementation of psychiatrist/mental health support feature for teen users with chat functionality.

---

## 🏗️ Architecture Overview

### Project Structure
```
IOTA-S/
├── server/                          # Node.js/Express backend
│   ├── config/                      # Database & external service configs
│   ├── controllers/                 # Business logic for routes
│   ├── middleware/                  # Auth, validation, error handling
│   ├── models/                      # Sequelize ORM models (39+ models)
│   ├── routes/                      # API endpoint definitions (23 route files)
│   ├── services/                    # External service integrations
│   ├── scripts/                     # Database seeding & utility scripts
│   ├── migrations/                  # Database migration files
│   ├── server.js                    # Main Express app entry point
│   └── package.json                 # Backend dependencies
│
├── web-client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── pages/                   # Page components (Home, Auth, Resources, etc.)
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # React Context (AuthContext for JWT)
│   │   ├── styles/                  # CSS files
│   │   └── main.jsx                 # Entry point
│   └── package.json                 # Frontend dependencies
│
├── mobile-client/                   # React Native (Expo) - Secondary
├── newsfetcher-service/             # News fetching microservice
├── prototype/                       # Vite prototype/testing environment
│
├── docker-compose.yml               # PostgreSQL + Redis orchestration
├── init-db.sql                      # Database schema (complete DDL)
├── DEVELOPMENT.md                   # Setup & installation guide
├── ARCHITECTURE.md                  # Detailed architecture documentation
└── CODEBASE_CONTEXT.md              # This file
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v22.18.0
- **Framework:** Express 5.0.0
- **ORM:** Sequelize 6.37.8
- **Database:** PostgreSQL 16 (primary)
- **Caching:** Redis 4.6.12
- **Auth:** JWT (jsonwebtoken 9.0.0)
- **Validation:** express-validator 7.0.0
- **AI Integration:** Google Generative AI (@google/generative-ai 0.3.0)
- **Email:** Nodemailer 6.9.7
- **File Upload:** Multer 1.4.5

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Styling:** Tailwind CSS 3.4.1
- **Routing:** React Router DOM 6.30.0
- **Icons:** Lucide React 0.563.0
- **Charts:** Chart.js 4.5.1 + react-chartjs-2 5.3.1
- **Auth:** @react-oauth/google 0.13.4
- **HTTP:** Axios 1.13.6
- **Notifications:** react-hot-toast 2.6.0
- **JWT Decode:** jwt-decode 4.0.0

### Database
- **Primary:** PostgreSQL 16.13
- **ORM:** Sequelize (39+ models)
- **Migrations:** Sequelize CLI
- **Redis:** For caching & real-time features

---

## 📊 Database Schema (39+ Models)

### Phase 2-3: Core Platform
- `User` - Main user account (email, password, OAuth)
- `RefreshToken` - JWT token management
- `AuthToken` - Session tokens

### Phase 4: Story-Based Learning
- `Story` - Educational narratives
- `Topic` - Learning categories
- `Unit` - Story organization
- `Lesson` - Lesson structures
- `Challenge` - Quiz-like challenges
- `Quiz` - Assessment tool
- `QuizQuestion` - Question definition
- `QuizProgress` - User quiz tracking
- `StoryAttempt` - User story interaction
- `UserStoryProgress` - Progress tracking

### Phase 5: Gamification & Community
- `Leaderboard` - User rankings
- `Badge` - Achievement badges
- `UserAchievement` - Badge tracking
- **`Journal`** - User journaling tool for self-reflection and emotional expression
  - Fields: id, userId, title, content, emotion (enum), tags (array), prompt, isPrivate, attachments, entryDate
  - Emotions: happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed
  - Relationships: belongsTo User
  - **STATUS:** 12 seed entries with authentic teen self-reflections (overthinking, stress, loneliness, growth, etc.)
- `NewsStory` - Real-time news updates

### Phase 6: Peer Support & Messaging
- `Group` - Community groups
- `GroupMember` - Group membership
- `Discussion` - Group discussions
- `DiscussionReply` - Discussion comments
- `Conversation` - Direct messaging channels
- `DirectMessage` - Private messages
- `GroupChat` - Group chat messages
- `Like` - Post/comment reactions

### Phase 8: Child Mode & Forums
- `ChildrenCourse` - Learning content (children)
- `ChildrenUnit` - Course units
- `ChildrenLesson` - Course lessons
- `ChildrenChallenge` - Interactive challenges
- `ChildrenChallengeOption` - Challenge options
- `ChildrenProgress` - Progress tracking
- `ChildrenChallengeProgress` - Challenge completion
- `ParentalAccount` - Parent/guardian management
- `ChatMessage` - Chatbot interactions
- **`Post`** - User posts in social feed
  - Fields: id, userId, title, content, isAnonymous, anonymousName, media, category (enum), sentiment, likeCount, commentCount, shareCount
  - Categories: advice, story, question, achievement, resource, news, other
  - Relationships: belongsTo User, hasMany Comments
  - **STATUS:** 12 seed posts with authentic teen topics (mental health, academics, relationships, etc.)
- `Thread` - Discussion threads
- `ThreadReply` - Thread comments
- `Comment` - Post comments

### Phase 9: Mental Health Support (CURRENT)
- **`Psychiatrist`** - Mental health professional profiles
  - Fields: id, firstName, lastName, email, specialization, bio, avatarUrl, rating, isAvailable, responseTimeAvg, totalConsultations
  - Relationships: hasMany PsychiatristChat
  
- **`PsychiatristChat`** - Chat conversations between teens and psychiatrists
  - Fields: id, conversationId (groups messages), userId, psychiatristId, message, sender (enum: 'teen'/'psychiatrist'), sentiment, isRead, createdAt, updatedAt
  - Relationships: belongsTo User, belongsTo Psychiatrist
  - **STATUS:** Fixed with paranoid: false to disable soft deletes, added missing isRead column

---

## 🔌 API Routes (23 Endpoint Groups)

### Authentication & Users
- `GET /api/auth/` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - OAuth login
- `POST /api/auth/refresh` - JWT refresh
- `GET /api/users/:id` - User profile
- `PUT /api/users/:id` - Update profile

### Stories & Content
- `GET /api/stories` - List all stories
- `GET /api/stories/:id` - Story details
- `POST /api/stories` - Create story (admin)
- `GET /api/topics` - Topic list
- `GET /api/quizzes` - Quiz list

### Learning & Progress
- `POST /api/progress` - Track progress
- `GET /api/progress/:userId` - Get user progress
- `POST /api/story-attempts` - Record story attempt
- `GET /api/leaderboards` - Leaderboard data

### Community & Messaging
- `GET /api/groups` - Group list
- `POST /api/groups` - Create group
- `GET /api/discussions/:groupId` - Group discussions
- `GET /api/messages/:conversationId` - Direct messages
- `POST /api/chats` - Send group chat

### Mental Health Support (Phase 9)
- **`GET /api/psychiatrists`** - List all psychiatrists
- **`GET /api/psychiatrists/:id`** - Psychiatrist profile
- **`POST /api/psychiatrists/:userId/chat/start`** - Initiate chat session
  - Request body: { psychiatristId, initialMessage }
  - Response: { success, data: { conversationId, chat details } }
- **`POST /api/psychiatrists/:userId/chat/send`** - Send message in chat
- **`GET /api/psychiatrists/:userId/chat/history/:conversationId`** - Chat history
- **`GET /api/psychiatrists/:userId/conversations`** - User's all conversations

### Admin & Moderation
- `GET /api/admin/users` - User management (admin only)
- `POST /api/admin/ban-user` - Ban user (admin only)
- `DELETE /api/admin/content/:id` - Remove content (admin only)

### Additional Services
- `GET /api/news-stories` - Latest news
- `GET /api/chatbot` - AI buddy interactions
- `GET /api/resources` - Safety resources directory
- `GET /api/parental` - Parental controls
- **`GET /api/journals`** - List user's journal entries (NEW)
- **`POST /api/journals`** - Create new journal entry (NEW)
- **`GET /api/journals/:id`** - Journal entry details (NEW)
- **`PUT /api/journals/:id`** - Update journal entry (NEW)
- **`DELETE /api/journals/:id`** - Delete journal entry (NEW)
- **`GET /api/social/posts`** - Social feed posts list
- **`POST /api/social/posts`** - Create new post
- **`GET /api/social/posts/:id`** - Post details
- **`PUT /api/social/posts/:id`** - Update post
- **`DELETE /api/social/posts/:id`** - Delete post
- `GET /api/forums` - Forum discussions
- `GET /api/achievements` - Achievements & badges

---

## 🔐 Authentication & Authorization

### Flow
1. **Google OAuth** or **Email/Password** registration
2. **JWT Token** issued (stored in localStorage as 'authToken')
3. **Refresh Token** stored in DB with expiration
4. **Middleware** verifies Authorization: Bearer {token}
5. **User ID** extracted from token claims

### Protected Routes
- All routes except `/api/auth/register`, `/api/auth/login`, `/api/auth/google`
- Middleware: `verifyToken` checks Authorization header
- Returns 401 Unauthorized if token missing/invalid

### File: [server/middleware/auth.js](./server/middleware/auth.js)
```javascript
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🧠 Key Business Logic

### User Onboarding
1. User signs up via Google OAuth or email
2. User selects age group (Child 5-11 or Teen 13+)
3. User mode determines accessible features
4. Profile setup with avatar & preferences

### Story Progression (Child Mode)
1. User selects story from available list
2. Story divided into scenes/lessons
3. Real-time emotion detection (face-api.js)
4. Branching narratives based on user choices
5. Quiz at story end to verify learning
6. Progress tracked in `UserStoryProgress`
7. Leaderboard updated based on performance

### Chat with Psychiatrist (NEW - Phase 9)
1. User views available psychiatrists (`GET /api/psychiatrists`)
2. User clicks "Chat Now" on psychiatrist profile
3. System creates `PsychiatristChat` session with unique `conversationId`
4. Initial message: "Hi, I would like to talk with you."
5. Messages sent/received via `POST /api/psychiatrists/:userId/chat/send`
6. Chat history retrieved via `GET /api/psychiatrists/:userId/chat/history/:conversationId`
7. Sentiment detection on each message
8. Messages marked as read when viewed

### AI Buddy Support (Chatbot)
1. User initiates chat with AI buddy
2. Google Generative AI processes messages
3. Responses generated based on user mood/context
4. Conversation history stored in `ChatMessage`

---

## 📱 Frontend Components & Pages

### Key Pages
- **HomePage** - Landing page with feature overview
- **AuthPage** - Login/registration with Google OAuth
- **FeedPage** - User dashboard with stories/updates
- **StoryPlayPage** - Interactive story with branching narratives
- **QuizPage** - Post-story assessment
- **PsychiatristPage** - List of mental health professionals (NEW)
- **PsychiatristChat** - Chat interface with psychiatrists (NEW)
- **CommunityPage** - Peer support groups & discussions
- **ResourcesPage** - Safety resources & crisis hotlines
- **ProfilePage** - User profile management
- **LeaderboardPage** - Rankings & achievements

### Key Components
- `PsychiatristList.jsx` - Psychiatrist card grid
- `PsychiatristChat.jsx` - Chat UI with message flow (NEW)
- `StoryViewer.jsx` - Story playback with emotion detection
- `QuizComponent.jsx` - Quiz question display
- `GroupChat.jsx` - Group messaging
- `DirectMessages.jsx` - Private messaging
- `DiscussionFeed.jsx` - Discussion thread view

### Styling
- Tailwind CSS for utility-first styling
- Custom CSS modules for component-specific styles
- Responsive design (mobile-first)
- Color scheme: Purple, blue, pink accents

---

## 🗄️ Database Setup & Seeding

### Schema Location
- **File:** [init-db.sql](./init-db.sql)
- **Tables:** 39+ relational tables with constraints
- **Enum Types:** sentiment, sender, challenges, topics, etc.

### Seeding Process
```bash
npm run seed  # Runs: node scripts/seed-database.js
```

### Recent Seed Updates (Phase 9)
1. **Psychiatrist Data** (4 professionals):
   - Dr. Nilima Sharma - Adolescent Psychology & Anxiety
   - Dr. Rajesh Patel - Stress & Academic Pressure
   - Dr. Priya Verma - Family & Relationship Dynamics
   - Dr. Arjun Singh - Digital Wellness & Online Safety

2. **Avatar Generation:**
   - UI Avatar API with gender-appropriate colors
   - Professional emoji-style circular avatars
   - Each psychiatrist has unique color scheme

3. **Social Feed Posts** (12 authentic teenager topics):
   - Mental health & overwhelm (5 posts)
   - Academic pressure & exam anxiety (1 post)
   - Relationships & friendship (3 posts)
   - Loneliness & isolation (1 post)
   - Social media & digital wellness (1 post)
   - Family communication (1 post)
   - Breakups & emotional pain (1 post)
   - Burnout & exhaustion (1 post)
   - Overthinking & anxiety (1 post)
   - Seeking help & support (1 post)
   - Positive achievements (1 post)
   - Anonymous confessions (1 post)
   - All posts marked as anonymous for privacy and safety
   - Categories: advice, question, story, achievement

4. **Journal Entries** (12 authentic teen self-reflections):
   - Overthinking & racing thoughts (1 entry)
   - Study stress & focus issues (1 entry)
   - Friendship doubts & feeling invisible (2 entries)
   - Low energy & fatigue (1 entry)
   - Emotional hurt from comments (1 entry)
   - Social media impact on self-image (1 entry)
   - Difficulty expressing feelings (1 entry)
   - Realizing need for help (1 entry)
   - Small wins & accomplishments (1 entry)
   - Self-reflection & identity exploration (1 entry)
   - Anxiety spikes (1 entry)
   - Emotions: anxious (4), stressed (1), sad (3), calm (4), confused (1)
   - Tags: worried, school, friends, learning, family, homework
   - All entries marked as private for safety

---

## 🔧 Controllers & Services

### Main Controllers (server/controllers/)
- **auth.js** - Authentication logic
- **user.js** - User management
- **story.js** - Story logic
- **quiz.js** - Quiz generation & grading
- **progress.js** - Progress tracking
- **psychiatrist.js** - Psychiatrist profiles (NEW)
- **psychiatrist-chat.js** - Chat logic (NEW)
- **group-chats.js** - Group messaging
- **discussions.js** - Discussion threads
- **leaderboards.js** - Ranking logic
- **achievements.js** - Badge & reward logic
- **chatbot.js** - AI buddy integration
- **admin.js** - Admin utilities

### Key Services (server/services/)
- **Google Generative AI** - LLM for chatbot responses
- **PostgreSQL** - Primary data store
- **Redis** - Caching & session management
- **Nodemailer** - Email notifications

---

## 📝 Important Notes & Gotchas

### Database Schema Issues (Fixed)
- ✅ **Issue:** `deletedAt` column missing on `psychiatrist_chats`
  - **Cause:** Model had `paranoid: true` but table created without column
  - **Fix:** Added `paranoid: false` to PsychiatristChat model
  - **File Modified:** [server/models/PsychiatristChat.js](./server/models/PsychiatristChat.js)

- ✅ **Issue:** `isRead` column missing on `psychiatrist_chats`
  - **Cause:** Model defined the field but table schema omitted it
  - **Fix:** Added column to database + updated init-db.sql
  - **SQL:** `ALTER TABLE psychiatrist_chats ADD COLUMN "isRead" BOOLEAN DEFAULT false;`

### Authentication
- **Token Storage:** localStorage key is `authToken` (not `accessToken`)
- **Token Format:** Bearer {JWT}
- **Frontend File:** [web-client/src/contexts/AuthContext.jsx](./web-client/src/contexts/AuthContext.jsx)
- **Backend Verification:** [server/middleware/auth.js](./server/middleware/auth.js)

### Sensitive Topic Framing (Phase 9)
- All references updated to educational, empowering language:
  - "Sexual Abuse" → "Body Safety & Boundaries"
  - "Online Exploitation" → "Online Safety & Digital Protection"
  - Questions reframed to empower rather than frighten

---

## 🚀 Development Workflow

### Setup
```bash
# Clone & install
git clone <repo>
cd IOTA-S
npm install

# Start services
docker-compose up -d

# Backend
cd server && npm start

# Frontend
cd web-client && npm run dev
```

### Testing Chat Feature
1. Start backend: `npm start` (port 3000)
2. Start frontend: `npm run dev` (port 5173)
3. Register user via Google OAuth or email
4. Navigate to Psychiatrist section
5. Click "Chat Now" on any psychiatrist
6. Send message: "Hi, I would like to talk with you."
7. View conversation history

### Database Commands
```bash
# Seed database
npm run seed

# Sequelize migrations
npm run db:migrate
npm run db:migrate:undo

# Reset database
npm run db:reset

# PostgreSQL direct access
psql -h 127.0.0.1 -U postgres -d iota_db
```

---

## 📊 Data Models Example: Psychiatrist Chat

### User creates conversation
```javascript
POST /api/psychiatrists/614a7874-3c61-447b-8557-953391564885/chat/start
Body: {
  psychiatristId: "59b458ad-da5f-45cb-b033-b49fba45c09a",
  initialMessage: "Hi, I would like to talk with you."
}

Response: {
  success: true,
  data: {
    id: "fc208cc0-0429-461e-8f0e-1114466d906b",
    conversationId: "87bb0089-280b-4c24-b633-c3339464a17e",
    userId: "614a7874-3c61-447b-8557-953391564885",
    psychiatristId: "59b458ad-da5f-45cb-b033-b49fba45c09a",
    message: "Hi, I would like to talk with you.",
    sender: "teen",
    sentiment: "neutral",
    isRead: false,
    createdAt: "2026-03-20T17:42:25.880Z",
    updatedAt: "2026-03-20T17:42:25.881Z"
  }
}
```

### Database Records
```sql
-- psychiatrist_chats table
id | conversationId | userId | psychiatristId | message | sender | sentiment | isRead | createdAt | updatedAt
---+----------------+--------+----------------+---------+--------+-----------+--------+-----------+----------
fc208cc0... | 87bb0089... | 614a7874... | 59b458a... | "Hi..." | teen | neutral | false | 2026-03-20 | 2026-03-20
```

---

## 🎯 Current Development Status

### Completed (✅)
- Core platform setup (Express + React + PostgreSQL)
- User authentication (OAuth + JWT)
- Story-based learning system
- Quiz & assessment logic
- Community features (groups, discussions)
- Leaderboard & gamification
- Child mode with parental controls
- AI buddy chatbot
- News integration
- Psychiatrist support module (backend)
- Psychiatrist card UI (frontend)
- Chat functionality with message persistence
- Avatar display with gender-appropriate styling

### In Progress / Recently Fixed
- ✅ Psychiatrist chat database schema
- ✅ Chat message persistence
- ✅ Frontend-backend integration for chat
- ✅ UI/UX improvements for psychiatrist cards
- ✅ Topic language review (compassionate framing)
- ✅ Social feed posts seeding (12 authentic teen topics)
- ✅ Journal entries seeding (12 authentic teen reflections)

### Remaining Tasks
- Real-time chat updates (WebSocket support)
- Psychiatrist availability status
- Chat notifications
- Rating/review system for psychiatrists
- Chat analytics & sentiment tracking
- Mobile app synchronization
- Admin dashboard for psychiatrist management

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| [server.js](./server/server.js) | Express app initialization |
| [init-db.sql](./init-db.sql) | Database schema DDL |
| [server/models/index.js](./server/models/index.js) | Model definitions & relationships |
| [server/routes/index.js](./server/routes/index.js) | Route registration |
| [server/middleware/auth.js](./server/middleware/auth.js) | JWT verification |
| [web-client/src/main.jsx](./web-client/src/main.jsx) | React entry point |
| [web-client/src/contexts/AuthContext.jsx](./web-client/src/contexts/AuthContext.jsx) | Auth state management |
| [scripts/seed-database.js](./scripts/seed-database.js) | Database seeding orchestrator |
| [server/seeds/posts.js](./server/seeds/posts.js) | Social feed posts seeding (12 teen topics) |
| [server/seeds/journals.js](./server/seeds/journals.js) | Journal entries seeding (12 teen reflections) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup & deployment guide |

---

## 🤝 Contribution Guidelines

1. **Pull Database Latest:** `npm run seed`
2. **Never Modify:** init-db.sql directly without migration
3. **Use Sequelize Models:** Don't write raw SQL
4. **Test on Local:** Before pushing changes
5. **Document Changes:** Update this file if adding features

---

## 📞 Support & Contact

For questions about codebase structure or specific modules:
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for setup issues
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design details
- Check individual controller files for business logic

---

**End of Context Document**
