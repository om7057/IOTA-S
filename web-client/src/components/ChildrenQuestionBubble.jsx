import React from 'react';

const ChildrenQuestionBubble = ({ question }) => {
  return (
    <div className="question-bubble-wrap">
      <img src="/mascot_bad.svg" alt="Mascot" className="question-bubble-mascot" />
      <div className="question-bubble">{question}</div>
    </div>
  );
};

export default ChildrenQuestionBubble;
