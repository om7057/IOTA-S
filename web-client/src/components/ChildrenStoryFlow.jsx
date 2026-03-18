import React, { useMemo, useState } from 'react';
import './ChildrenQuiz.css';

const ChildrenStoryFlow = ({ lesson, onBack, onComplete }) => {
  const challenges = lesson?.challenges || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentStep = challenges[currentIndex];

  const teachingText = useMemo(() => {
    if (!currentStep) return null;
    const correctOption = currentStep.options?.find((option) => option.correct);
    return correctOption?.feedback || currentStep.hint || lesson?.description || '';
  }, [currentStep, lesson?.description]);

  const displayImage = useMemo(() => {
    if (!currentStep) return lesson?.imageSrc || null;
    return (
      currentStep.imageSrc ||
      currentStep.options?.find((option) => option.imageSrc)?.imageSrc ||
      lesson?.imageSrc ||
      null
    );
  }, [currentStep, lesson?.imageSrc]);

  const handleNext = () => {
    if (!currentStep) return;

    if (currentIndex >= challenges.length - 1) {
      onComplete();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  if (!currentStep) {
    return (
      <div className="story-flow">
        <div className="story-card">
          <h2>Story is not available yet</h2>
          <button className="story-primary-btn" onClick={onBack}>
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-flow">
      <div className="story-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Story Step {currentIndex + 1} of {challenges.length}
        </p>
      </div>

      <div className="story-card">
        <div className="story-header-row">
          <h2>Story-Based Learning</h2>
          <button className="story-secondary-btn" onClick={onBack}>
            Back to Lesson
          </button>
        </div>

        {displayImage && (
          <img src={displayImage} alt={currentStep.question} className="story-main-image" />
        )}

        <h3 className="story-question">{currentStep.question}</h3>

        <div className="story-feedback-box">
          <strong>Story Insight:</strong>
          <p>{teachingText}</p>
        </div>

        <div className="story-navigation">
          <button
            className="nav-btn prev-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <div className="question-indicators">
            {challenges.map((challenge, index) => (
              <div
                key={challenge.id}
                className={`indicator ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'answered' : ''}`}
              ></div>
            ))}
          </div>

          <button className="nav-btn next-btn" onClick={handleNext}>
            {currentIndex === challenges.length - 1 ? 'Start Quiz →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildrenStoryFlow;
