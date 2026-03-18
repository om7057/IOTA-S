# IOTA-S Project Structure

## Overview
IOTA-S is a unified platform for child safety learning, divided into multiple components:
- **Web Client** - React-based interactive learning platform for children (ages 4-13)
- **Backend Server** - Node.js/Express API for data management
- **News Fetcher Service** - Python FastAPI service for generating AI-powered stories from news
- **Mobile Client** - React Native app for iOS/Android

## Directory Structure

```
IOTA-S/
├── web-client/              # React web application
│   ├── src/
│   │   ├── pages/          # Page components (courses, news, stories, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app routing
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                  # Node.js/Express backend
│   ├── controllers/        # Request handlers
│   ├── routes/             # API routes
│   ├── models/             # Database models (Sequelize)
│   ├── middleware/         # Auth, error handling
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Database seeders
│   ├── scripts/            # Utility scripts
│   ├── server.js           # Server entry point
│   └── package.json
│
├── newsfetcher-service/    # Python FastAPI service
│   ├── app/
│   │   ├── main.py        # API endpoints
│   │   └── story_generator.py  # Gemini AI integration
│   ├── requirements.txt
│   └── .env
│
├── mobile-client/          # React Native app
│   ├── client/            # Expo app code
│   └── server/            # Mobile-specific server
│
├── docs/                   # Documentation
│   ├── SETUP.md           # Development setup guide
│   ├── API.md             # API documentation
│   └── TESTING.md         # Testing guide
│
├── README.md              # Main project README
├── DEVELOPMENT.md         # Development guide
├── TESTING_GUIDE.md       # Testing procedures
└── docker-compose.yml     # Docker configuration
```

## Key Features

### 1. Children's Learning Platform
- **Interactive Stories** - Branching narratives for child safety education
- **Courses & Lessons** - Structured learning paths
- **Quizzes** - Knowledge assessment
- **Progress Tracking** - Track child learning progress
- **News-Generated Stories** - AI-powered stories from news articles

### 2. News Story Generation
- Fetches child safety news from NewsAPI
- Generates interactive stories using Gemini AI
- Stories follow branching narrative format
- No local assets - text-driven with optional generated images

### 3. Backend API
- RESTful API for all platform features
- Authentication & authorization
- Data persistence (PostgreSQL)
- User progress tracking

### 4. Mobile Support
- React Native app with Expo
- Real-time notifications
- Offline support

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL |
| AI/ML | Google Gemini 2.0 Flash API |
| News API | NewsAPI |
| Mobile | React Native, Expo |
| DevOps | Docker, Docker Compose |

## Getting Started

See [SETUP.md](./docs/SETUP.md) for detailed development environment setup.

### Quick Start
```bash
# Backend
cd server && npm install && npm run seed && npm start

# Frontend
cd web-client && npm install && npm run dev

# News Fetcher Service
cd newsfetcher-service && pip install -r requirements.txt && python -m uvicorn app.main:app --reload
```

## File Organization Guidelines

### Web Client Pages
- Group by feature (children, teens, admin)
- Keep styles colocated with components
- Use PascalCase for components

### Backend Controllers
- One controller per resource
- Keep business logic separate from routes
- Use middleware for cross-cutting concerns

### Documentation
- Keep docs folder updated with new features
- Use Markdown for all documentation
- Link to relevant code files

## Important Notes
- Database migrations should be versioned
- Environment variables go in `.env` files
- Never commit `.env` to git
- All API changes should be documented
- Seeds should be idempotent

## Cleanup History
- Removed: Outdated phase documentation (PHASE*/*.md)
- Removed: Old implementation guides
- Removed: Backup/debug files (App_old.jsx, DebugNewsStories.jsx)
- Removed: Duplicate auth files (Login_OAuth.jsx)
- Kept: README.md, DEVELOPMENT.md, TESTING_GUIDE.md
