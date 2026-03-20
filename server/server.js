import express from 'express';
import cors from 'cors';
import environment from './config/environment.js';
import { logger } from './utils/logger.js';
import { connectDB } from './models/index.js';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import journalRoutes from './routes/journals.js';
import topicsRoutes from './routes/topics.js';
import storyRoutes from './routes/stories.js';
import newsStoriesRoutes from './routes/news-stories.js';
import quizRoutes from './routes/quizzes.js';
import childrenCoursesRoutes from './routes/children-courses.js';
import leaderboardRoutes from './routes/leaderboards.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import groupRoutes from './routes/groups.js';
import discussionRoutes from './routes/discussions.js';
import directMessageRoutes from './routes/direct-messages.js';
import groupChatRoutes from './routes/group-chats.js';
import achievementRoutes from './routes/achievements.js';
import parentalRoutes from './routes/parental.js';
import chatbotRoutes from './routes/chatbot.js';
import forumsRoutes from './routes/forums.js';
import socialRoutes from './routes/social.js';
import storyAttemptsRoutes from './routes/story-attempts.js';

const app = express();

// Request logging
app.use(requestLogger);

// CORS
app.use(
  cors({
    origin: environment.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== Routes ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API status
app.get('/api', (req, res) => {
  res.json({
    message: 'IOTAS Unified Backend API',
    version: '1.0.0',
    environment: environment.NODE_ENV,
  });
});

// ==================== Phase 2: Auth Routes ====================
app.use('/api/auth', authRoutes);

// ==================== Phase 3: User Routes ====================
app.use('/api/users', userRoutes);

// ==================== Phase 4: Journal, Story Routes ====================
app.use('/api/journals', journalRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/news-stories', newsStoriesRoutes);

// ==================== Phase 5: Quiz, Leaderboard, Progress Routes ====================
app.use('/api/quizzes', quizRoutes);
app.use('/api/children-courses', childrenCoursesRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/story-attempts', storyAttemptsRoutes);

// ==================== Admin Routes ====================
app.use('/api/admin', adminRoutes);

// ==================== Phase 6: Teen Features - Groups, Discussions, Messaging ====================
app.use('/api/groups', groupRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/messages', directMessageRoutes);
app.use('/api/chats', groupChatRoutes);

// ==================== Phase 8: Child Mode - Achievements & Parental Controls ====================
app.use('/api/achievements', achievementRoutes);
app.use('/api/parental', parentalRoutes);

// ==================== Phase 8B: Teen Mode - AI Chatbot, Forums, Anonymous Posts, Social Feed ====================
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/forums', forumsRoutes);
app.use('/api/social', socialRoutes);

logger.info('Routes registered: /api/auth (Phase 2), /api/users (Phase 3), /api/journals (Phase 4), /api/topics (Phase 4), /api/stories (Phase 4), /api/quizzes (Phase 5), /api/leaderboards (Phase 5), /api/progress (Phase 5), /api/story-attempts (Phase 5), /api/admin (Admin), /api/groups (Phase 6), /api/discussions (Phase 6), /api/messages (Phase 6), /api/chats (Phase 6), /api/achievements (Phase 8), /api/parental (Phase 8), /api/chatbot (Phase 8B), /api/forums (Phase 8B), /api/social (Phase 8B)');

// ==================== Error Handling ====================

// 404 handler (must be before errorHandler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ==================== Server Startup ====================

const startServer = async () => {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDB();

    // Start plain HTTP API server (websocket disabled)
    app.listen(environment.PORT, () => {
      logger.info(`🚀 Server running on port ${environment.PORT}`, {
        environment: environment.NODE_ENV,
        apiUrl: environment.API_URL,
        socketio: 'disabled',
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
