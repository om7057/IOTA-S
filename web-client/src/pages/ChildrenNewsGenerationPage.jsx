import React, { useState, useEffect } from 'react';
import '../components/ChildrenQuiz.css';

const ChildrenNewsGenerationPage = () => {
  const [articles, setArticles] = useState([]);
  const [generatedStories, setGeneratedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const NEWSFETCHER_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchNewsArticles();
    fetchGeneratedStories();
  }, []);

  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${NEWSFETCHER_URL}/news`);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Could not fetch news articles. Make sure newsfetcher service is running.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedStories = async () => {
    try {
      const response = await fetch(`${API_URL}/news-stories`);
      const result = await response.json();
      // Filter stories that have proper storyJson with scenes
      const validStories = (result.data || []).filter(s => 
        s.isPublished && s.storyJson && s.storyJson.scenes && s.storyJson.scenes.length > 0
      );
      setGeneratedStories(validStories);
    } catch (error) {
      console.error('Error fetching generated stories:', error);
    }
  };

  const generateStoryFromArticle = async (articleIndex) => {
    try {
      setGenerating(articleIndex);
      
      // Call newsfetcher to generate story
      const genResponse = await fetch(
        `${NEWSFETCHER_URL}/generate-story?article_index=${articleIndex}`,
        { method: 'POST' }
      );
      
      if (!genResponse.ok) throw new Error('Failed to generate story');
      const story = await genResponse.json();

      // Save to database
      const saveResponse = await fetch(`${API_URL}/news-stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: story.title,
          description: `Generated from news article at ${new Date().toLocaleDateString()}`,
          category: 'safety',
          storyJson: story,
          imageUrl: '/learn.svg',
          isPublished: true,
          sourceArticleTitle: articles[articleIndex]?.title,
        }),
      });

      if (!saveResponse.ok) throw new Error('Failed to save story');
      
      // Refresh stories list
      await fetchGeneratedStories();
      alert('✅ Story generated successfully!');
    } catch (error) {
      console.error('Error generating story:', error);
      alert('❌ Failed to generate story. Ensure newsfetcher service is running.');
    } finally {
      setGenerating(null);
    }
  };

  const playStory = (story) => {
    // Store in session and navigate
    console.log('🎬 Playing story:', story);
    console.log('📦 Story structure check:', {
      hasId: !!story.id,
      hasTitle: !!story.title,
      hasStoryJson: !!story.storyJson,
      hasScenes: !!story.storyJson?.scenes,
      scenesCount: story.storyJson?.scenes?.length || 0
    });
    sessionStorage.setItem('newsStory', JSON.stringify(story));
    console.log('✅ Stored in sessionStorage, navigating...');
    window.location.href = `/children/news-story/${story.id}`;
  };

  return (
    <div className="children-news-generation">
      <div className="children-header">
        <h1>📰 Generate Stories from News</h1>
        <p>Select a news article to generate an interactive child safety story</p>
      </div>

      {error && (
        <div className="error-box">
          <p>⚠️ {error}</p>
          <button onClick={fetchNewsArticles} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="generation-container">
        {/* Left: News Articles */}
        <div className="news-articles-section">
          <h2>📢 Available News Articles</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-box">
              <p>No news articles available. Start the newsfetcher service.</p>
            </div>
          ) : (
            <div className="articles-list">
              {articles.map((article, idx) => (
                <div key={idx} className="article-card">
                  <div className="article-content">
                    <h3>{article.title}</h3>
                    <p className="article-desc">{article.description?.substring(0, 100)}...</p>
                    <p className="article-source">📌 {article.source?.name}</p>
                  </div>
                  <button
                    className={`generate-btn ${generating === idx ? 'generating' : ''}`}
                    onClick={() => generateStoryFromArticle(idx)}
                    disabled={generating !== null}
                  >
                    {generating === idx ? (
                      <>
                        <span className="spinner-mini"></span> Generating...
                      </>
                    ) : (
                      '✨ Generate Story'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Generated Stories */}
        <div className="generated-stories-section">
          <h2>🎬 Generated Stories ({generatedStories.length})</h2>
          
          {generatedStories.length === 0 ? (
            <div className="empty-box">
              <p>No generated stories yet. Select an article to generate one!</p>
            </div>
          ) : (
            <div className="stories-list">
              {generatedStories.map((story) => (
                <div key={story.id} className="story-list-item">
                  <div className="story-info">
                    <h4>{story.title}</h4>
                    <p className="story-category">{story.category}</p>
                    {story.sourceArticleTitle && (
                      <p className="story-source">From: {story.sourceArticleTitle}</p>
                    )}
                  </div>
                  <button
                    className="play-btn"
                    onClick={() => playStory(story)}
                  >
                    ▶️ Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildrenNewsGenerationPage;
