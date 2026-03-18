import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ChildrenQuiz.css';
import ChildrenGameHeader from './ChildrenGameHeader';
import ChildrenGameFooter from './ChildrenGameFooter';
import ChildrenChallenge from './ChildrenChallenge';
import ChildrenResultCard from './ChildrenResultCard';
import ChildrenQuestionBubble from './ChildrenQuestionBubble';

const ChildrenQuiz = ({ lesson, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [status, setStatus] = useState('none');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const challenges = lesson.challenges || [];
  const current = challenges[currentIndex];
  const token = localStorage.getItem('token');
  const correctAudioRef = useRef(null);
  const incorrectAudioRef = useRef(null);
  const finishAudioRef = useRef(null);

  useEffect(() => {
    correctAudioRef.current = new Audio('/correct.wav');
    incorrectAudioRef.current = new Audio('/incorrect.wav');
    finishAudioRef.current = new Audio('/finish.mp3');
  }, []);

  const percentage = useMemo(() => {
    if (!challenges.length) return 0;
    const base = (currentIndex / challenges.length) * 100;
    return Math.min(100, base + (status === 'correct' ? 100 / challenges.length : 0));
  }, [challenges.length, currentIndex, status]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!token || !lesson?.id) {
        setLoadingProgress(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/children-courses/progress/lesson/${lesson.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setHearts(result?.data?.hearts ?? 5);
          setCompletedChallengeIds(result?.data?.completedChallengeIds || []);
          setCurrentIndex(result?.data?.resumeIndex || 0);
          if (result?.data?.allCompleted) {
            setShowPracticeModal(true);
          }
        }
      } catch (error) {
        console.warn('Could not fetch children progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [API_URL, lesson?.id, token]);

  const handleSelect = (optionId) => {
    if (status !== 'none') return;
    setSelectedOptionId(optionId);
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setStatus('none');
      return;
    }

    setCompleted(true);
    finishAudioRef.current?.play().catch(() => {});
  };

  const adjustHearts = async (amount) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/children-courses/progress/hearts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
    } catch (error) {
      console.warn('Could not update hearts:', error);
    }
  };

  const addPoints = async (points) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/children-courses/progress/points`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
      });
    } catch (error) {
      console.warn('Could not update points:', error);
    }
  };

  const submitAnswer = async (optionId) => {
    try {
      if (token) {
        const response = await fetch(`${API_URL}/children-courses/challenge/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ challengeId: current.id, selectedOptionId: optionId }),
        });

        if (response.ok) {
          const result = await response.json();
          return !!result?.data?.correct;
        }
      }
    } catch (error) {
      console.warn('Backend submit failed, using local validation:', error);
    }

    const selected = current.options.find((opt) => opt.id === optionId);
    return !!selected?.correct;
  };

  const handleCheck = async () => {
    if (!selectedOptionId) return;

    if (status === 'wrong') {
      setStatus('none');
      setSelectedOptionId(null);
      return;
    }

    if (status === 'correct') {
      handleNext();
      return;
    }

    const isCorrect = await submitAnswer(selectedOptionId);

    if (isCorrect) {
      setStatus('correct');
      setScore((prev) => prev + 10);
      setCompletedChallengeIds((prev) => (current && !prev.includes(current.id) ? [...prev, current.id] : prev));
      correctAudioRef.current?.play().catch(() => {});
      await addPoints(10);
    } else {
      setStatus('wrong');
      setHearts((prev) => {
        const nextHearts = Math.max(prev - 1, 0);
        if (nextHearts === 0) {
          setShowHeartsModal(true);
        }
        return nextHearts;
      });
      incorrectAudioRef.current?.play().catch(() => {});
      await adjustHearts(-1);
    }
  };

  const handlePracticeStart = () => {
    setShowPracticeModal(false);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setStatus('none');
    setCompleted(false);
    setScore(0);
  };

  if (completed) {
    return (
      <div className="quiz-completion">
        <div className="completion-card">
          <div className="confetti">🎉</div>
          <h2>Great Job! 🌟</h2>
          <p className="completed-lessons">You completed the lesson quiz.</p>
          <div className="result-cards-row">
            <ChildrenResultCard variant="points" value={score} />
            <ChildrenResultCard variant="hearts" value={hearts} />
          </div>
          <button className="exit-btn" onClick={onBack}>
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const selectedOption = current.options.find((opt) => opt.id === selectedOptionId);
  const isCorrect = status === 'correct';

  return (
    <div className="children-quiz">
      {showPracticeModal && (
        <div className="overlay-modal">
          <div className="overlay-card">
            <h3>Practice Mode</h3>
            <p>You already completed this quiz. Do you want to practice again?</p>
            <div className="overlay-actions">
              <button className="nav-btn" onClick={onBack}>Back</button>
              <button className="nav-btn" onClick={handlePracticeStart}>Start Practice</button>
            </div>
          </div>
        </div>
      )}

      {showHeartsModal && (
        <div className="overlay-modal">
          <div className="overlay-card danger">
            <h3>Out of Hearts</h3>
            <p>You ran out of hearts. Take a break and come back later.</p>
            <div className="overlay-actions">
              <button className="nav-btn" onClick={() => setShowHeartsModal(false)}>Okay</button>
              <button className="nav-btn" onClick={onBack}>Exit Lesson</button>
            </div>
          </div>
        </div>
      )}

      <ChildrenGameHeader
        hearts={hearts}
        percentage={percentage}
        onClose={onBack}
        loading={loadingProgress}
      />

      <div className="quiz-progress">
        <p className="progress-text">
          Question {currentIndex + 1} of {challenges.length}
        </p>
      </div>

      {/* Quiz Content */}
      <div className="quiz-content">
        {current.imageSrc && (
          <img src={current.imageSrc} alt="Question" className="question-image" />
        )}

        <h2 className="question-text">{current.question}</h2>

        {current.type === 'ASSIST' && <ChildrenQuestionBubble question={current.question} />}

        {current.hint && status === 'none' && (
          <div className="hint-box">
            💡 <strong>Hint:</strong> {current.hint}
          </div>
        )}

        <ChildrenChallenge
          options={current.options}
          selectedOptionId={selectedOptionId}
          status={status}
          onSelect={handleSelect}
        />

        {/* Feedback */}
        {status !== 'none' && selectedOption && (
          <div className={`feedback ${status === 'correct' ? 'correct' : 'incorrect'}`}>
            <strong>{status === 'correct' ? '✓ Correct!' : '✗ Try again'}</strong>
            <p>{selectedOption.feedback}</p>
          </div>
        )}
      </div>

      <ChildrenGameFooter
        status={status}
        selectedOptionId={selectedOptionId}
        currentIndex={currentIndex}
        total={challenges.length}
        onCheck={handleCheck}
        completedChallengeIds={completedChallengeIds}
      />
    </div>
  );
};

export default ChildrenQuiz;
