import React from 'react';

const ChildrenGameHeader = ({ hearts, percentage, onClose, loading }) => {
  return (
    <div className="quiz-game-header">
      <button className="close-btn" onClick={onClose} aria-label="Exit lesson">
        ✕
      </button>
      <div className="quiz-progress-inline">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
      <div className="hearts-pill">❤️ {loading ? '...' : hearts}</div>
    </div>
  );
};

export default ChildrenGameHeader;
