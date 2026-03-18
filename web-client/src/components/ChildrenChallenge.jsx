import React from 'react';
import ChildrenChallengeCard from './ChildrenChallengeCard';

const ChildrenChallenge = ({ options, selectedOptionId, status, onSelect }) => {
  return (
    <div className="options-grid">
      {options.map((option, idx) => (
        <ChildrenChallengeCard
          key={option.id}
          option={option}
          index={idx}
          selected={selectedOptionId === option.id}
          status={status}
          disabled={status !== 'none'}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
};

export default ChildrenChallenge;
