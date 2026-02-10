import { API_CONFIG } from '../config/api';

export const fetchTopics = async () => {
  const res = await fetch(API_CONFIG.TOPICS);
  return res.json();
};

export const fetchLevelsByTopic = async (topicId) => {
  const res = await fetch(API_CONFIG.LEVELS(topicId));
  return res.json();
};

export const fetchStoriesByLevel = async (levelId) => {
  const res = await fetch(API_CONFIG.STORIES_BY_LEVEL(levelId));
  return res.json();
};

export const completeLevel = async (clerkId, levelId, starsEarned) => {
  const res = await fetch(API_CONFIG.PROGRESS_COMPLETE_LEVEL(clerkId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ levelId, starsEarned }),
  });
  return res.json();
};
