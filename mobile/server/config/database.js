const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'iota_db',
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Helper functions for common queries
const db = {
  query: (text, params) => pool.query(text, params),
  
  // User queries
  getUserById: (id) => 
    pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    ),
  
  getUserByEmail: (email) =>
    pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    ),

  createUser: (email, displayName, passwordHash, age, gender) =>
    pool.query(
      `INSERT INTO users (email, display_name, password_hash, age, gender, auth_method)
       VALUES ($1, $2, $3, $4, $5, 'email')
       RETURNING id, email, display_name, age, gender, created_at`,
      [email, displayName, passwordHash, age, gender]
    ),

  createGoogleUser: (email, displayName, googleId, avatarUrl) =>
    pool.query(
      `INSERT INTO users (email, display_name, google_id, avatar_url, auth_method)
       VALUES ($1, $2, $3, $4, 'google')
       ON CONFLICT (google_id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, display_name, google_id, avatar_url, created_at`,
      [email, displayName, googleId, avatarUrl]
    ),

  updateUser: (id, updates) => {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    
    return pool.query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL
       RETURNING *`,
      [...values, id]
    );
  },

  // Mood queries
  createMood: (userId, mood, intensity, tags, notes) =>
    pool.query(
      `INSERT INTO moods (user_id, mood, mood_intensity, tags, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, mood, intensity, tags, notes]
    ),

  getMoodsForUser: (userId, limit = 100) =>
    pool.query(
      `SELECT * FROM moods WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    ),

  getTodayMood: (userId) =>
    pool.query(
      `SELECT * FROM moods WHERE user_id = $1
       AND DATE(created_at) = CURRENT_DATE
       LIMIT 1`,
      [userId]
    ),

  // Emotion history
  createEmotionEvent: (userId, storyId, emotion, confidence) =>
    pool.query(
      `INSERT INTO emotion_history (user_id, story_id, emotion, confidence)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, storyId, emotion, confidence]
    ),

  getEmotionHistory: (userId, storyId) =>
    pool.query(
      `SELECT * FROM emotion_history 
       WHERE user_id = $1 AND story_id = $2
       ORDER BY timestamp DESC`,
      [userId, storyId]
    ),

  // Story queries
  getStories: (limit = 20, offset = 0) =>
    pool.query(
      `SELECT * FROM stories ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),

  getStoryById: (id) =>
    pool.query('SELECT * FROM stories WHERE id = $1', [id]),

  // Journal queries
  createJournalEntry: (userId, title, content) =>
    pool.query(
      `INSERT INTO journal_entries (user_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, content]
    ),

  getJournalEntries: (userId) =>
    pool.query(
      `SELECT * FROM journal_entries WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ),

  // Comment queries
  createComment: (userId, storyId, content) =>
    pool.query(
      `INSERT INTO comments (user_id, story_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, storyId, content]
    ),

  // Like queries
  addLike: (userId, storyId) =>
    pool.query(
      `INSERT INTO likes (user_id, story_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, storyId]
    ),

  removeLike: (userId, storyId) =>
    pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND story_id = $2`,
      [userId, storyId]
    ),
};

module.exports = db;
