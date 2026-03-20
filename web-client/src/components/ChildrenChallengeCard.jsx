import React from 'react';

const normalizeOptionText = (text = '') =>
  String(text)
    .replace(/^[\s\uFE0F\u200D\p{Extended_Pictographic}✓✔✗✕☑☒]+/gu, '')
    .replace(/^[-:.)\]]+\s*/, '')
    .trim();

const ChildrenChallengeCard = ({
  option,
  index,
  selected,
  status,
  disabled,
  onSelect,
}) => {
  return (
    <button
      className={`option-btn ${
        selected && status === 'correct' ? 'correct' : ''
      } ${selected && status === 'wrong' ? 'incorrect' : ''} ${
        disabled ? 'disabled' : ''
      }`}
      onClick={onSelect}
      disabled={disabled}
    >
      {option.imageSrc && (
        <img src={option.imageSrc} alt={option.text} className="option-image" />
      )}
      <div className="option-content">
        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
        <span className="option-text">{normalizeOptionText(option.text)}</span>
      </div>
      {selected && status !== 'none' && (
        <span className="result-icon">{status === 'correct' ? '✓' : '✗'}</span>
      )}
    </button>
  );
};

export default ChildrenChallengeCard;
