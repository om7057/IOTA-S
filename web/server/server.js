import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './utils/database.js';
// Import models BEFORE connecting to database
import * as models from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import newsStoryRoutes from './routes/newsStoryRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import journalRoutes from './routes/journalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().catch(console.error);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// Request logging only for errors and important info (optional)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Authentication routes (no token required for OAuth callbacks)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/news-stories', newsStoryRoutes);
app.use('/api/quiz-progress', progressRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journals', journalRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
