import React, { useState, useEffect, useMemo } from 'react';
import './ChildrenQuiz.css';

const ChildrenInteractiveStory = ({ lesson, onBack, onComplete }) => {
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [feedbackText, setFeedbackText] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const challenges = lesson?.challenges || [];

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
        onComplete();
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

  return (
    <div className="story-flow">
      <div className="story-card">
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
              <button className="story-primary-btn" onClick={() => {
                onComplete();
              }}>
                Story Complete! Continue
              </button>
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
