import React from 'react';

const ChildrenResultCard = ({ value, variant }) => {
  const isHearts = variant === 'hearts';
  const imageSrc = isHearts ? '/heart.svg' : '/points.svg';

  return (
    <div className={`result-card-shell ${isHearts ? 'hearts' : 'points'}`}>
      <div className="result-card-title">{isHearts ? 'Hearts Left' : 'Total XP'}</div>
      <div className="result-card-value">
        <img src={imageSrc} alt={variant} width={28} height={28} />
        <span>{value}</span>
      </div>
    </div>
  );
};

export default ChildrenResultCard;
