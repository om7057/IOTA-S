// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL || 'http://localhost:8000/api';

export const API_CONFIG = {
  // Main API
  TOPICS: `${API_URL}/topics`,
  LEVELS: (topicId) => `${API_URL}/levels/topic/${topicId}`,
  STORIES: `${API_URL}/stories`,
  STORIES_BY_LEVEL: (levelId) => `${API_URL}/stories/level/${levelId}`,
  STORY: (storyId) => `${API_URL}/stories/${storyId}`,
  USERS: `${API_URL}/users`,
  USER: (clerkId) => `${API_URL}/users/${clerkId}`,
  LEADERBOARD: `${API_URL}/leaderboard`,
  LEADERBOARD_BY_STORY: (storyId) => `${API_URL}/leaderboard/story/${storyId}`,
  QUIZ_PROGRESS: (userId) => `${API_URL}/quiz-progress/user/${userId}`,
  QUIZ_BY_STORY: (storyId) => `${API_URL}/quiz/story/${storyId}`,
  PROGRESS_COMPLETE_LEVEL: (clerkId) => `${API_URL}/progress/${clerkId}/complete-level`,
  
  // News API
  NEWS: `${NEWS_API_URL}/news`,
  NEWS_STORIES: `${NEWS_API_URL}/news-stories`,
  GENERATE_STORY: (index) => `${NEWS_API_URL}/generate-story?article_index=${index}`,
};
