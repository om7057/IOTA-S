const API_URL = "http://localhost:5000/api"; // Update if backend is hosted

export const fetchTopics = async () => {
  const res = await fetch(`${API_URL}/topics`);
  return res.json();
};

export const fetchLevelsByTopic = async (topicId) => {
  const res = await fetch(`${API_URL}/levels/topic/${topicId}`);
  return res.json();
};

export const fetchStoriesByLevel = async (levelId) => {
  const res = await fetch(`${API_URL}/stories/level/${levelId}`);
  return res.json();
};

export const completeLevel = async (clerkId, levelId, starsEarned) => {
  const res = await fetch(`${API_URL}/progress/${clerkId}/complete-level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ levelId, starsEarned }),
  });
  return res.json();
};
