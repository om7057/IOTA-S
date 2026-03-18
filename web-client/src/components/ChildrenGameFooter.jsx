import React, { useEffect } from 'react';

const ChildrenGameFooter = ({
  status,
  selectedOptionId,
  currentIndex,
  total,
  onCheck,
  completedChallengeIds = [],
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Enter') {
        onCheck();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCheck]);

  return (
    <div className={`quiz-footer ${status}`}>
      <div className="footer-status-text">
        {status === 'correct' && 'Nicely done!'}
        {status === 'wrong' && 'Try again.'}
      </div>
      <div className="question-indicators">
        {Array.from({ length: total }).map((_, idx) => (
          <div
            key={`indicator-${idx}`}
            className={`indicator ${idx === currentIndex ? 'active' : ''} ${
              idx < currentIndex || completedChallengeIds.length > idx ? 'answered' : ''
            }`}
          ></div>
        ))}
      </div>
      <button className="nav-btn footer-check-btn" onClick={onCheck} disabled={!selectedOptionId}>
        {status === 'none' && 'Check'}
        {status === 'correct' && (currentIndex === total - 1 ? 'Finish' : 'Next')}
        {status === 'wrong' && 'Retry'}
      </button>
    </div>
  );
};

export default ChildrenGameFooter;
