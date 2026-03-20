import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Achievements.css';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({ total: 0, completed: 0, totalPoints: 0 });

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
    fetchBadges();
  }, [user?.id]);

  const fetchAchievements = async () => {
    if (!user?.id) {
      setAchievements([]);
      setStats({ total: 0, completed: 0, totalPoints: 0 });
      return;
    }

    try {
      const response = await axios.get(`/api/achievements/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      const payload = response?.data?.data || {};
      setAchievements(Array.isArray(payload.achievements) ? payload.achievements : []);
      setStats(payload.stats || { total: 0, completed: 0, totalPoints: 0 });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
      setStats({ total: 0, completed: 0, totalPoints: 0 });
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/achievements/badges');
      setBadges(Array.isArray(response?.data?.data) ? response.data.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setBadges([]);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#888888',
      rare: '#4169E1',
      epic: '#9932CC',
      legendary: '#FFD700',
    };
    return colors[rarity] || '#888888';
  };

  const getUnlockedBadges = () => {
    return achievements.filter(a => a.isCompleted);
  };

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(b => b.category === selectedCategory);

  const unlockedIds = new Set(getUnlockedBadges().map(a => a.badgeId));

  if (loading) {
    return <div className="achievements-loading">Loading achievements...</div>;
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h1>🏆 Achievements & Badges</h1>
        <p>Complete challenges and unlock badges to earn points!</p>
      </div>

      <div className="achievements-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Badges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Unlocked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPoints}</div>
          <div className="stat-label">Points Earned</div>
        </div>
      </div>

      <div className="achievements-filter">
        <button
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${selectedCategory === 'challenge' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('challenge')}
        >
          Challenges
        </button>
        <button
          className={`filter-btn ${selectedCategory === 'quiz' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('quiz')}
        >
          Quizzes
        </button>
        <button
          className={`filter-btn ${selectedCategory === 'mood' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('mood')}
        >
          Mood
        </button>
        <button
          className={`filter-btn ${selectedCategory === 'streak' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('streak')}
        >
          Streaks
        </button>
      </div>

      <div className="achievements-grid">
        {filteredBadges.map(badge => {
          const isUnlocked = unlockedIds.has(badge.id);
          const achievement = achievements.find(a => a.badgeId === badge.id);

          return (
            <div
              key={badge.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div
                className="badge-icon"
                style={{
                  borderColor: getRarityColor(badge.rarity),
                  opacity: isUnlocked ? 1 : 0.3,
                }}
              >
                {badge.icon ? (
                  <img src={badge.icon} alt={badge.name} />
                ) : (
                  <span className="badge-emoji">🏅</span>
                )}
              </div>

              <div className="card-content">
                <h3>{badge.name}</h3>
                <p className="badge-description">{badge.description}</p>

                <div className="badge-meta">
                  <span className={`rarity rarity-${badge.rarity}`}>
                    {badge.rarity}
                  </span>
                  <span className="points">+{badge.points} pts</span>
                </div>

                {isUnlocked ? (
                  <div className="unlocked-info">
                    <p>✓ Unlocked {achievement?.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'recently'}</p>
                  </div>
                ) : (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${achievement?.progress || 0}%` }}>
                    </div>
                    <span className="progress-text">{achievement?.progress || 0}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="achievements-footer">
        <p>Keep completing challenges and quizzes to unlock more badges!</p>
      </div>
    </div>
  );
};

export default Achievements;
