import React, { useState, useEffect, useMemo } from 'react';
import useEmotionDetection from './useEmotionDetection';
import EmotionSummary from './EmotionSummary';
import './ChildrenQuiz.css';

const ChildrenInteractiveStory = ({ lesson, onBack, onComplete }) => {
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [feedbackText, setFeedbackText] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [storyCompleted, setStoryCompleted] = useState(false);
  const challenges = lesson?.challenges || [];

  const {
    videoRef,
    emotionTimeline,
    startDetection,
    stopDetection,
  } = useEmotionDetection();

  // Pick a stable start node: first story node by order, otherwise first challenge.
  useEffect(() => {
    if (challenges.length > 0) {
      const sorted = [...challenges].sort((a, b) => (a.order || 0) - (b.order || 0));
      const startNode = sorted.find((c) => c.isStoryNode) || sorted[0];
      if (startNode) {
        setCurrentNodeId(startNode.id);
      }
    }
  }, [challenges]);

  useEffect(() => {
    let localStream;

    if (!currentNodeId) return;

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
              setCameraError('Camera preview blocked. Allow camera permission in browser.');
            });
          } else {
            requestAnimationFrame(attachStream);
          }
        };

        attachStream();
        startDetection();
      })
      .catch(() => {
        setCameraError('Camera permission denied or camera unavailable.');
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
  }, [currentNodeId, startDetection, stopDetection, videoRef]);

  // Get the current story node
  const currentNode = useMemo(() => {
    return challenges.find((c) => c.id === currentNodeId);
  }, [currentNodeId, challenges]);

  const handleOptionSelect = (optionId) => {
    if (showingFeedback) return; // Prevent clicking while feedback is showing
    setSelectedOptionId(optionId);

    const selected = currentNode.options.find((opt) => opt.id === optionId);
    if (!selected) return;

    setFeedbackText(selected.feedback);
    setShowingFeedback(true);

    // Move forward only on correct choice. Wrong choices force retry on the same node.
    if (selected.correct && selected.nextChallengeId) {
      setTimeout(() => {
        setCurrentNodeId(selected.nextChallengeId);
        setSelectedOptionId(null);
        setFeedbackText(null);
        setShowingFeedback(false);
      }, 2500);
    }
    // If correct but no next node, mark as complete
    else if (selected.correct && !selected.nextChallengeId) {
      setTimeout(() => {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        stopDetection();
        setStoryCompleted(true);
        setShowingFeedback(false);
      }, 2500);
    }
    // If wrong, let them retry (stay on same node after feedback)
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setFeedbackText(null);
    setShowingFeedback(false);
  };

  if (!currentNode) {
    return (
      <div className="story-flow">
        <div className="story-card">
          <h2>Story is loading...</h2>
          <button className="story-primary-btn" onClick={onBack}>
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = currentNode.options?.find((opt) => opt.id === selectedOptionId);
  const isCorrect = selectedOption?.correct;

  if (storyCompleted) {
    return (
      <div className="story-flow">
        <div className="story-card">
          <div className="story-header-row">
            <h2>Story Complete! 🎉</h2>
            <button className="story-secondary-btn" onClick={onBack}>
              Back to Lesson
            </button>
          </div>

          <EmotionSummary
            emotionTimeline={emotionTimeline}
            storyTitle={lesson?.title || 'Interactive Story'}
          />

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button className="story-primary-btn" onClick={onComplete}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="story-flow">
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

        <div className="story-header-row">
          <h2>Interactive Story</h2>
          <button className="story-secondary-btn" onClick={onBack}>
            Back to Lesson
          </button>
        </div>

        {/* Story context image */}
        {currentNode.storyContextImage && (
          <img 
            src={currentNode.storyContextImage} 
            alt={currentNode.question} 
            className="story-main-image"
          />
        )}

        {/* Story choice question */}
        <h3 className="story-question">{currentNode.question}</h3>

        {/* Story choice options */}
        {!showingFeedback && (
          <div className="story-choices">
            {currentNode.options?.map((option) => (
              <button
                key={option.id}
                className={`story-option-btn ${selectedOptionId === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showingFeedback}
              >
                {option.imageSrc && (
                  <img src={option.imageSrc} alt={option.text} className="option-icon" />
                )}
                <span>{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Feedback display */}
        {showingFeedback && feedbackText && (
          <div className={`story-feedback-box ${isCorrect ? 'correct' : 'wrong'}`}>
            <strong>{isCorrect ? '✅ Correct!' : '❌ Try Again'}</strong>
            <p>{feedbackText}</p>
            {!isCorrect && (
              <button className="story-primary-btn" onClick={handleRetry}>
                Try Another Choice
              </button>
            )}
            {isCorrect && !currentNode.options?.find(
              (opt) => opt.id === selectedOptionId
            )?.nextChallengeId && (
              <div style={{ marginTop: '10px', fontWeight: 600 }}>
                Story complete. Preparing emotional analysis report...
              </div>
            )}
          </div>
        )}

        {showingFeedback && isCorrect && currentNode.options?.find(
          (opt) => opt.id === selectedOptionId
        )?.nextChallengeId && (
          <div className="story-feedback-box correct">
            <p>Moving to next story scene...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenInteractiveStory;
