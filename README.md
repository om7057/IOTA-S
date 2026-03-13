# 🛡️ IOTA-S - Child & Teen Safety Learning Platform

A comprehensive, age-appropriate digital safety platform designed to educate children (ages 5-11) and teenagers (ages 13+) about personal safety, digital literacy, and emotional well-being through interactive stories, quizzes, and peer support.

---

## 🚡 Quick Start

👉 **[See DEVELOPMENT.md for complete setup, installation, and configuration guide](./DEVELOPMENT.md)**

**TL;DR:**
```bash
docker-compose up -d              # Start PostgreSQL + Redis
cd mobile/server && npm start     # Backend (port 3000)
cd web/client && npm run dev      # Web (port 5173)
cd mobile/client && npm start     # Mobile (Expo)
```

---

## 🎯 Project Vision

IOTA-S empowers young people to develop critical safety awareness and resilience through:
- 📖 **Interactive Story-Based Learning** - Engaging narratives that model safe choices
- 🧠 **Emotional Intelligence** - Real-time emotion detection during story playback
- 👥 **Peer Support Communities** - Safe spaces for teens to share experiences
- 📚 **Age-Appropriate Content** - Separate modes for children and teens
- 🤖 **AI Buddy Support** - Personal mental health companion for teens

---

## 🌟 Key Features

### **For Children (Ages 5-11)**
✅ Interactive safety stories with emotion detection  
✅ Topic-based learning (Internet Safety, School, Health, Outdoor)  
✅ Story levels with progressive difficulty  
✅ Quiz-based assessment after stories  
✅ Leaderboard for gamification  
✅ Parent/Guardian controls via family dashboard  
✅ Real-time emotion tracking with emotion chart visualization  

### **For Teens (Ages 13+)**
✅ Personal AI Buddy for mental health support  
✅ Emotion expression & journaling  
✅ Community circles for peer support  
✅ Anonymous question answering  
✅ Support resources directory  
✅ Progress analytics  
✅ Profile insights & mood tracking  

### **Content Features**
✅ Live news updates on safety topics  
✅ AI-generated stories from news  
✅ Multi-scene branching narratives  
✅ Emotion-responsive feedback  
✅ Educational quizzes with immediate feedback  

---

## 🏗️ Project Architecture

```
IOTA-S/
├── 📄 DEVELOPMENT.md              # ← Start here! Setup & installation
├── docker-compose.yml             # PostgreSQL + Redis services
├── init-db.sql                    # Database schema
│
├── mobile/
│   ├── client/                    # React Native (Expo SDK 54)
│   │   ├── components/            # UI components
│   │   ├── hooks/                 # Custom hooks
│   │   ├── contexts/              # State management
│   │   │   └── AuthContext.tsx    # OAuth + JWT
│   │   └── package.json
│   │
│   └── server/                    # Node.js/Express backend
│       ├── routes/                # API endpoints
│       ├── config/                
│       │   └── database.js        # PostgreSQL pool
│       ├── .env                   # Configuration
│       └── package.json
│
├── web/
│   ├── client/                    # React (Vite)
│   │   ├── src/
│   │   │   ├── pages/             # Page components
│   │   │   ├── components/        # Reusable components
│   │   │   ├── contexts/
│   │   │   │   └── AuthContext.jsx # OAuth + JWT
│   │   │   └── main.jsx
│   │   └── package.json
│   │
│   └── server/                    # Optional backend
│
└── verify-setup.sh                # Setup verification script
```

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Web Frontend** | React 18 + Vite + TailwindCSS | Latest |
| **Mobile Frontend** | React Native + Expo | SDK 54.x |
| **Backend** | Node.js + Express | 18+ LTS |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 (optional) |
| **Auth** | JWT + bcryptjs | - |
| **Hashing** | bcryptjs | 2.4.3 |

---

## 🔐 Authentication

**Supports:**
- ✅ Email/password signup & login
- ✅ Google OAuth 2.0 (web + mobile)
- ✅ JWT tokens (7-day expiration)
- ✅ Secure password hashing (bcryptjs)
- ✅ AsyncStorage (mobile) & localStorage (web)

**Cross-platform:** Single JWT-based API, works on web and mobile

---

## 🗄️ Database

**PostgreSQL 16** in Docker with 17 tables:

| Table | Purpose |
|-------|---------|
| **users** | User accounts (email/OAuth) |
| **moods** | Daily mood tracking |
| **emotion_history** | Real-time emotion events |
| **journal_entries** | Personal journal |
| **stories** | Story content |
| **story_levels** | Story progression |
| **groups** | User communities |
| **topics** | Content categories |
| **comments** | Story feedback |
| **likes** | Favorites |
| **queries** | User questions |
| **quizzes** | Assessment content |
| **quiz_progress** | User progress |
| **news_stories** | News feed |
| **leaderboards** | Rankings |
| **group_members** | Community membership |
| Plus indexes for performance |

**Features:**
- UUID primary keys
- Automatic timestamps (created_at, updated_at)
- Soft deletes (deleted_at)
- Foreign key constraints
- 11 indexes for query optimization

---

## 📱 Features by Platform

### **Both Web & Mobile**
- User authentication (email/password + Google OAuth)
- Mood tracking with intensity and tags
- Journal/diary entries
- Emotion detection during stories
- Story browsing and progress
- Quiz participation

### **Differences**
- **Mobile:** Facial emotion detection using camera
- **Web:** Standard login interface
- **Both:** Same backend API, different UI frameworks

---

## 🚀 Getting Started

**👉 For complete setup instructions, see [DEVELOPMENT.md](./DEVELOPMENT.md)**

Quick summary:
```bash
# 1. Start database
docker-compose up -d

# 2. Install & run backend
cd mobile/server
npm install --legacy-peer-deps
npm start

# 3. Install & run web
cd ../../../web/client
npm install
npm run dev

# 4. Install & run mobile
cd ../../mobile/client
npm install --legacy-peer-deps
npm start
```

Visit:
- Web: http://localhost:5173
- Backend: http://localhost:3000/api/health
- Mobile: Expo (press 'a' for Android)

---

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Complete setup, configuration, troubleshooting
- **[README.md](./README.md)** - This file (project overview)

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/signup          # Email/password signup
POST   /api/auth/signin          # Email/password login
POST   /api/auth/signout         # Logout
GET    /api/auth/google/web      # Get OAuth URL (web)
GET    /api/auth/google/mobile   # Get OAuth URL (mobile)
POST   /api/auth/google/callback # OAuth callback handler
```

### Moods
```
POST   /api/moods                # Create mood entry
GET    /api/moods/user/:id       # Get user's moods
GET    /api/moods/user/:id/today # Get today's mood
```

### Stories & Learning
```
GET    /api/stories              # List stories
GET    /api/stories/:id          # Get story details
GET    /api/topics               # List topics
GET    /api/quizzes              # List quizzes
```

### Community Features
```
GET    /api/groups               # List groups
GET    /api/comments/:storyId    # Get story comments
POST   /api/comments             # Add comment
POST   /api/likes                # Like a story
GET    /api/journal              # Get journal entries
POST   /api/journal              # Create journal entry
```

---

## 🧪 Testing the App

### Quick Test
1. **Signup on Web:** http://localhost:5173 → Sign Up
2. **Login on Mobile:** Expo → Sign Up screen
3. **Test Mood Tracking:** Add mood with intensity and tags
4. **Test Emotion Detection:** Mobile → Scan Your Face (if camera available)
5. **Verify Data Persists:** Refresh page, data still there

### Test OAuth (Optional)
1. Add Google OAuth credentials to `.env`
2. Restart backend
3. Web/Mobile: See "Sign in with Google" button
4. Click it and complete OAuth flow

---

## 📊 Features Status

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Email/Password Auth | ✅ | ✅ | Complete |
| Google OAuth | ✅ | ✅ | Complete |
| Mood Tracking | ✅ | ✅ | Complete |
| Emotion Detection | ❌ | ✅ | Mobile only |
| Journal | Planned | Planned | In Progress |
| Stories | Planned | Planned | In Progress |
| Quizzes | Planned | Planned | In Progress |
| Community | Planned | Planned | To Do |

---

## 🐛 Troubleshooting

**Common issues?** See [DEVELOPMENT.md - Troubleshooting](./DEVELOPMENT.md#troubleshooting)

Quick fixes:
- Backend won't start → Check Docker: `docker ps`
- Can't sign up → Check backend logs in Terminal 1
- Mobile can't reach backend → Change API_URL for your device
- OAuth not working → Add credentials to `.env`

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test on both web and mobile
4. Submit pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Built for the IOTA Innovation Award & Imagine Cup 2024

---

**Happy coding! 🚀** 

Start with [DEVELOPMENT.md](./DEVELOPMENT.md) for complete setup instructions.

