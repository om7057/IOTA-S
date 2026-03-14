const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const queryRoutes = require('./routes/queries');
const groupRoutes = require('./routes/groups');
const topicRoutes = require('./routes/topics');
const postsRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const analysisRoutes = require('./routes/analysis');
const journalRoutes = require('./routes/journal');
const directMessagesRoutes = require('./routes/direct-messages');
const moodsRoutes = require('./routes/moods');
const quizzesRoutes = require('./routes/quizzes');
const leaderboardsRoutes = require('./routes/leaderboards');
const storiesRoutes = require('./routes/stories');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify database configuration
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Error: Database configuration must be defined in .env');
  console.error('Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
  process.exit(1);
}

// Test database connection on startup
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('✗ Database connection failed:', err.message);
    console.error('Make sure PostgreSQL is running: docker-compose up -d');
    process.exit(1);
  } else {
    console.log('✓ Database connected successfully');
  }
});

app.use(cors());
app.use(express.json());  

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/journal-inputs', journalRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/leaderboards', leaderboardsRoutes);
app.use('/api/stories', storiesRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ API available at http://0.0.0.0:${PORT}/api`);
  console.log(`✓ Available at http://localhost:${PORT}/api (host)`);
  console.log(`✓ Available at http://10.0.2.2:${PORT}/api (Android emulator)`);
});
