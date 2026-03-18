import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEmotionDetection from '../components/useEmotionDetection';
import EmotionSummary from '../components/EmotionSummary';
import './ChildrenLesson.css';

const ChildrenNewsStoryPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sceneTransition, setSceneTransition] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [storyCompleted, setStoryCompleted] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const {
    videoRef,
    emotionTimeline,
    startDetection,
    stopDetection,
  } = useEmotionDetection();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        
        // Try session storage first
        const sessionStory = sessionStorage.getItem('newsStory');
        if (sessionStory) {
          try {
            const parsed = JSON.parse(sessionStory);
            console.log('📖 Session story parsed:', parsed);
            
            // Handle both formats: direct scenes or nested in storyJson
            const scenes = parsed.scenes || parsed.storyJson?.scenes || [];
            
            if (scenes.length > 0) {
              const transformedStory = {
                id: parsed.id,
                title: parsed.title,
                description: parsed.description,
                scenes: scenes.map(scene => ({
                  id: scene.id !== undefined ? scene.id : 0,
                  title: scene.title || `Scene ${scene.id}`,
                  text: scene.text || '',
                  image: scene.image || '',
                  options: scene.options || []
                }))
              };
              
              console.log('✅ Story loaded from session:', transformedStory);
              setStory(transformedStory);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('❌ Session story parse error:', e);
          }
        }

        // Fetch from API
        console.log('🔍 Fetching story from API:', storyId);
        const response = await fetch(`${API_URL}/news-stories/${storyId}`);
        if (!response.ok) throw new Error('Story not found');
        
        const result = await response.json();
        console.log('📦 API response:', result);
        
        const storyData = result.data || result;

        // Extract scenes from storyJson
        const scenes = storyData.storyJson?.scenes || [];
        console.log('🎬 Extracted scenes:', scenes);
        
        if (scenes.length === 0) {
          throw new Error('Story has no scenes');
        }

        // Ensure scenes have required fields
        const validatedStory = {
          id: storyData.id,
          title: storyData.title,
          description: storyData.description,
          scenes: scenes.map(scene => ({
            id: scene.id !== undefined ? scene.id : 0,
            title: scene.title || `Scene ${scene.id}`,
            text: scene.text || '',
            image: scene.image || '',
            options: scene.options || []
          }))
        };

        console.log('✅ Story loaded from API:', validatedStory);
        setStory(validatedStory);
      } catch (err) {
        console.error('❌ Error fetching story:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  useEffect(() => {
    let localStream;

    if (loading || !story) {
      return;
    }

    if (!window.isSecureContext) {
      setCameraError('Camera requires localhost/HTTPS secure context.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        localStream = stream;
        setCameraError('');

        const attachStream = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {
              setCameraError('Camera preview blocked. Click page and allow camera.');
            });
          } else {
            requestAnimationFrame(attachStream);
          }
        };

        attachStream();
        startDetection();
      })
      .catch(() => {
        setCameraError('Camera permission denied or no camera found.');
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      stopDetection();
    };
  }, [loading, story, startDetection, stopDetection, videoRef]);

  const handleOptionClick = (nextIndex) => {
    if (nextIndex === -1) {
      // Story end
      stopDetection();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setStoryCompleted(true);
      return;
    }

    if (nextIndex < 0 || nextIndex >= story.scenes.length) {
      console.error('Invalid scene index:', nextIndex);
      return;
    }

    setSceneTransition(true);
    setTimeout(() => {
      setCurrentSceneIndex(nextIndex);
      setSceneTransition(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-page">
        <div className="error-box">
          <p>❌ {error}</p>
          <button onClick={() => navigate('/children/news')} className="back-btn">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!story || story.scenes.length === 0) {
    return (
      <div className="lesson-page">
        <div className="error-box">
          <p>Story not found</p>
          <button onClick={() => navigate('/children/news')} className="back-btn">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  const currentScene = story?.scenes?.[currentSceneIndex];
  const progress = story?.scenes ? ((currentSceneIndex + 1) / story.scenes.length) * 100 : 0;

  if (!story || !story.scenes || story.scenes.length === 0) {
    return (
      <div className="lesson-page">
        <div className="error-box">
          <p>❌ Story data incomplete</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Debug info: story={story ? 'exists' : 'null'}, scenes={story?.scenes ? `${story.scenes.length} scenes` : 'undefined'}
          </p>
          <button onClick={() => navigate('/children/news')} className="back-btn">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="lesson-page">
        <div className="error-box">
          <p>❌ Scene not found</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Current scene index: {currentSceneIndex}, Total scenes: {story?.scenes?.length}
          </p>
          <button onClick={() => navigate('/children/news')} className="back-btn">
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-story-player">
      <div className="story-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <div style={{ width: '220px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', background: '#000' }}>
            <div style={{ position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '999px',
                }}
              >
                LIVE
              </span>
            </div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', fontSize: '12px', color: '#334155' }}>
              Emotion samples: {emotionTimeline.length}
            </div>
          </div>
        </div>

        {cameraError && (
          <div style={{ marginBottom: '12px', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', color: '#92400e', fontSize: '13px' }}>
            {cameraError}
          </div>
        )}

        {/* Header */}
        <div className="story-header">
          <h1>{story.title}</h1>
          <p>{story.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Scene {currentSceneIndex + 1} of {story.scenes.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Scene Content */}
        {!storyCompleted ? (
          <div className={`scene-content ${sceneTransition ? 'fade-out' : 'fade-in'}`}>
            <h2 className="scene-title">{currentScene?.title}</h2>

            {currentScene?.image && (
              <img 
                src={currentScene.image} 
                alt={currentScene.title}
                className="scene-image"
              />
            )}

            <p className="scene-text">{currentScene?.text}</p>

            {/* Options */}
            <div className="scene-options">
              {currentScene?.options && currentScene.options.length > 0 ? (
                currentScene.options.map((option, idx) => (
                  <button
                    key={idx}
                    className="option-btn"
                    onClick={() => handleOptionClick(option.to)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="option-text">{option.text}</span>
                  </button>
                ))
              ) : (
                <div className="story-complete">
                  <p className="complete-emoji">✨</p>
                  <h3>Story Complete!</h3>
                  <p>Great job making safe choices!</p>
                  <button
                    className="back-btn"
                    onClick={() => {
                      stopDetection();
                      if (videoRef.current && videoRef.current.srcObject) {
                        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
                        videoRef.current.srcObject = null;
                      }
                      setStoryCompleted(true);
                    }}
                  >
                    Show Emotion Report
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <EmotionSummary emotionTimeline={emotionTimeline} storyTitle={story.title} />
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                className="back-btn"
                onClick={() => navigate('/children/news')}
              >
                ← Back to News
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenNewsStoryPage;
