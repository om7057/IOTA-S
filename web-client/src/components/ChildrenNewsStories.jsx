import React, { useState, useEffect } from 'react';
import './ChildrenQuiz.css';

const ChildrenNewsStories = ({ onSelectStory }) => {
  const [newsStories, setNewsStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    console.log('🔧 API_URL:', API_URL);
    fetchLatestNewsStories();
  }, []);

  const fetchLatestNewsStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📰 Fetching news stories from:', `${API_URL}/news-stories`);
      
      const response = await fetch(`${API_URL}/news-stories`);
      
      console.log('📰 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📰 Fetched data:', result);
      
      // Get latest 6 published stories
      const stories = (result.data || [])
        .filter(story => story.isPublished)
        .slice(0, 6);
        
      console.log('📰 Filtered stories:', stories.length);
      setNewsStories(stories);
    } catch (error) {
      console.error('❌ Error fetching news stories:', error);
      setError(error.message);
      setNewsStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayStory = (story) => {
    // Transform news story format to match challenge format
    const transformedStory = {
      id: story.id,
      title: story.title,
      description: story.description,
      challenges: [
        {
          id: story.id,
          order: 1,
          title: story.title,
          description: story.description,
          type: 'story',
          isStoryNode: true,
          storyContextImage: story.imageUrl,
          text: story.description,
          // Use storyJson if available, otherwise create basic structure
          challenges: story.storyJson?.scenes || [
            {
              id: 1,
              text: story.description || story.content,
              imagePrompt: story.imageUrl,
              options: [
                { text: 'Continue', nextScene: 2 }
              ]
            }
          ]
        }
      ]
    };

    if (onSelectStory) {
      onSelectStory(transformedStory);
    }
  };

  if (loading) {
    return (
      <div className="news-stories-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading latest stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-stories-section">
        <div className="error-message">
          <p>⚠️ Unable to load latest stories: {error}</p>
          <button onClick={fetchLatestNewsStories} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (newsStories.length === 0) {
    return (
      <div className="news-stories-section">
        <div className="empty-state">
          <p>📰 No latest stories available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-stories-section">
      <div className="news-header">
        <h2>📰 Latest Safety Stories from News</h2>
        <p>Interactive stories generated from real news events about child safety</p>
      </div>
      
      <div className="news-stories-grid">
        {newsStories.map((story) => (
          <div key={story.id} className="news-story-card">
            {story.imageUrl && (
              <div className="story-image">
                <img 
                  src={story.imageUrl} 
                  alt={story.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="story-content">
              <div className="story-category">
                {story.category === 'health' && '❤️'}
                {story.category === 'safety' && '🛡️'}
                {story.category === 'education' && '📚'}
                {story.category === 'discovery' && '🔍'}
                {!['health', 'safety', 'education', 'discovery'].includes(story.category) && '📰'}
                {' '} {story.category}
              </div>
              
              <h3 className="story-title">{story.title}</h3>
              
              <p className="story-description">
                {story.description?.substring(0, 100)}
                {story.description && story.description.length > 100 ? '...' : ''}
              </p>
              
              <div className="story-meta">
                <span className="view-count">👁️ {story.viewCount || 0} views</span>
                {story.sourceArticleTitle && (
                  <span className="source">Source: {story.sourceArticleTitle}</span>
                )}
              </div>
              
              <button
                className="play-story-btn"
                onClick={() => handlePlayStory(story)}
              >
                ▶️ Play Story
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenNewsStories;
