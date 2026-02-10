# 🛡️ Safe Space - Child & Teen Safety Learning Platform

A comprehensive, age-appropriate digital safety platform designed to educate children (ages 5-11) and teenagers (ages 13+) about personal safety, digital literacy, and emotional well-being through interactive stories, quizzes, and peer support.

**Live Demo:** [Safe Space](https://safe-space-app.vercel.app)

---

## 🎯 Project Vision

Safe Space empowers young people to develop critical safety awareness and resilience through:
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

## 🏗️ Project Structure

```
safe-space/
├── prototype/              # Main React + Vite application
│   ├── src/
│   │   ├── pages/         # Home, Login, Profile, Quiz Landing
│   │   ├── components/    # Reusable components (Live, Sidebar, etc.)
│   │   ├── teen/          # Teen-specific features
│   │   │   ├── pages/     # Dashboard, Express, Journal, Ask, Community, Support
│   │   │   ├── contexts/  # TeenContext for state management
│   │   │   └── components/ # Layout, AgeGate, AgeSelection
│   │   ├── services/      # API integration (auth, api, quiz)
│   │   ├── config/        # API configuration
│   │   ├── hooks/         # Custom hooks (useColorScheme, useThemeColor)
│   │   ├── contexts/      # App-wide contexts (AuthContext, ThemeContext)
│   │   ├── App.jsx        # Main routing
│   │   └── main.jsx       # React entry point
│   ├── .env.local         # Local environment variables
│   ├── .env.example       # Environment template
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── web/
│   ├── server/            # Node.js/Express backend
│   │   ├── config/        # Database & external config
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, error handling
│   │   ├── seeds/         # Demo data & seeding
│   │   └── server.js      # Express app
│   │
│   ├── client/            # Alternative React frontend (web version)
│   │
│   └── newsfetcher-service/ # FastAPI news aggregation service
│       ├── app/           # News fetching & categorization
│       └── requirements.txt
│
└── mobile/
    ├── client/            # React Native app (Expo)
    └── server/            # Mobile-specific backend
```

---

## 🚀 Tech Stack

### **Frontend**
- ⚛️ **React 18** - UI library
- ⚡ **Vite** - Fast build tool
- 🎨 **Tailwind CSS** - Utility-first styling
- 🔐 **Clerk** - Authentication & user management
- 🧭 **React Router** - Client-side routing
- 📊 **Chart.js** - Data visualization
- 🕵️ **face-api.js** + **TensorFlow.js** - Emotion detection
- 🍞 **react-hot-toast** - Notifications

### **Backend**
- 🟢 **Node.js** + **Express.js** - REST API
- 🍃 **MongoDB** + **Mongoose** - Database
- 🐍 **FastAPI** + **Python** - News API service
- 🔄 **Uvicorn** - ASGI server

### **DevOps & Deployment**
- 🚀 **Vercel** - Frontend deployment
- ☁️ **MongoDB Atlas** - Cloud database
- 📱 **Expo** - React Native deployment

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 16+
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Clerk account
- NewsAPI key

### **1. Clone the Repository**
```bash
git clone https://github.com/om7057/IOTA-S.git
cd IOTA-S
```

### **2. Setup Prototype (Main Frontend)**

```bash
cd prototype

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your values:
VITE_API_URL=http://localhost:5000/api
VITE_NEWS_API_URL=http://localhost:8000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

### **3. Setup Backend**

```bash
cd web/server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update with your configuration:
# - MONGODB_URI
# - NODE_ENV=development
# - PORT=5000
# - CLERK_SECRET_KEY

# Seed demo data
npm run seed

# Start server
npm run dev
```

### **4. Setup News API Service**

```bash
cd web/newsfetcher-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update API key in app/news_fetcher.py

# Start service
uvicorn app.main:app --reload --port 8000
```

### **5. Start Prototype Frontend**

```bash
cd prototype

npm run dev
# Opens at http://localhost:5173
```

---

## 📋 Environment Variables

### **Prototype (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_NEWS_API_URL=http://localhost:8000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### **Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
CLERK_SECRET_KEY=sk_test_xxxxx
CLIENT_URL=http://localhost:5173
```

### **News Service**
```env
NEWS_API_KEY=xxxxx
```

---

## 🎮 Usage & Features

### **Login & Age Selection**
1. Sign in with email/social login via Clerk
2. Select age group (Child: 5-11 or Teen: 13+)
3. Redirects to appropriate dashboard

### **Child Mode (Pre-teen)**
- Browse safety stories by topic
- Select levels and play interactive stories
- Real-time emotion detection during playback
- Answer follow-up quizzes
- Check leaderboard rankings
- View profile progress

### **Teen Mode**
- Dashboard with mood overview
- Express feelings in community
- Write journal entries
- Chat with AI Buddy
- Join community circles
- Access support resources

### **Admin/Content Management**
- Seed quizzes via API endpoints:
  ```bash
  curl -X POST http://localhost:5000/api/seed/seed-child-safety-quizzes
  ```
- Manage topics, levels, and stories in MongoDB

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/users` - Register/create user
- `GET /api/users/:clerkId` - Get user details

### **Stories & Learning**
- `GET /api/topics` - Get all topics
- `GET /api/levels/topic/:topicId` - Get levels by topic
- `GET /api/stories` - Get all stories
- `GET /api/stories/:storyId` - Get story details
- `GET /api/stories/level/:levelId` - Get stories by level

### **Quizzes**
- `GET /api/quiz/story/:storyId` - Get quiz for story
- `POST /api/quiz-progress` - Save quiz progress
- `GET /api/quiz-progress/user/:userId` - Get user quiz progress

### **Leaderboard**
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/story/:storyId` - Get leaderboard for specific story

### **News & Stories**
- `GET /api/news` - Fetch latest news articles
- `POST /api/generate-story?article_index=0` - Generate story from news
- `POST /api/news-stories` - Save generated story
- `GET /api/news-stories` - Get all saved stories

### **Teen Features**
- Personal buddy conversation endpoints (in TeenContext)
- Community circle management
- Journal entry storage
- Support resource directory

---

## 🧪 Testing

### **Test Child Mode**
1. Login and select "Child (5-11)"
2. Browse topics: Internet, Outdoor, Health, School
3. Click a story, watch emotion detection
4. Complete quiz and view score

### **Test Teen Mode**
1. Login and select "Teen (13+)"
2. Express a feeling in dashboard
3. Write a journal entry
4. Chat with "Talk to Buddy"
5. Browse community circles

### **Seed Test Data**
```bash
# Seed demo stories
curl -X POST http://localhost:5000/api/seed/seed-stories

# Seed child safety quizzes
curl -X POST http://localhost:5000/api/seed/seed-child-safety-quizzes

# Fetch news
curl http://localhost:8000/api/news
```

---

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
cd prototype
npm run build
vercel deploy
```

### **Backend (Any Node host)**
```bash
npm run build
# Deploy to Heroku, Railway, or cloud provider
```

### **Environment Variables on Production**
Set in deployment platform:
- `VITE_API_URL` → Production API URL
- `VITE_NEWS_API_URL` → Production news service URL
- `MONGODB_URI` → Production database
- `CLERK_SECRET_KEY` → Production Clerk key

---

## 📚 Documentation

- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Detailed feature breakdown & architecture
- **[Quiz Seeding Guide](./QUIZ_SEEDING_GUIDE.md)** - How to add quizzes
- **[Environment Setup](./prototype/ENV_SETUP.md)** - Configuration guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- Use functional components with hooks
- Follow ESLint configuration
- Write comments for complex logic
- Test before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Clerk** - Authentication infrastructure
- **NewsAPI** - News data source
- **TensorFlow.js** - Emotion detection
- **Tailwind CSS** - Styling framework
- **MongoDB** - Database service

---

## 📞 Support & Contact

- 📧 Email: support@safespace.edu
- 🐛 Issues: [GitHub Issues](https://github.com/om7057/IOTA-S/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/om7057/IOTA-S/discussions)

---

## 🗺️ Roadmap

- [ ] **Mobile App** - React Native version (iOS/Android)
- [ ] **Parental Dashboard** - Real-time monitoring for parents
- [ ] **AI Story Generation** - GPT-powered story creation
- [ ] **Multilingual Support** - Spanish, French, German
- [ ] **Offline Mode** - Use app without internet
- [ ] **Teacher Portal** - Classroom management tools
- [ ] **Badge System** - Achievements & rewards
- [ ] **Video Stories** - Animated safety scenarios

---

**Made with ❤️ for child & teen safety education**

