import { createContext, useContext, useState, useEffect } from 'react';

const TeenContext = createContext(null);

// Community definitions
const allCommunities = [
  { id: 'anxiety', name: 'Anxiety Support', description: 'A safe space for anxiety experiences', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'stress', name: 'Stress Relief', description: 'Managing daily stress together', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'loneliness', name: 'Feeling Lonely', description: 'Connect with others who understand', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'family-pressure', name: 'Family Pressure', description: 'Discuss family expectations', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'school-life', name: 'School Life', description: 'Academic and social challenges', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'self-discovery', name: 'Self Discovery', description: 'Finding yourself and your path', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'relationships', name: 'Relationships', description: 'Friendships and dating support', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
  { id: 'positivity', name: 'Positivity Corner', description: 'Share good vibes and gratitude', color: 'bg-slate-100 text-slate-700', icon: 'slate' },
];

// Feeling to community mapping
const feelingToCommunity = {
  anxious: 'anxiety',
  stressed: 'stress',
  lonely: 'loneliness',
  overwhelmed: 'stress',
  confused: 'self-discovery',
  hopeful: 'positivity',
  grateful: 'positivity',
  frustrated: 'family-pressure',
};

// Demo expressions (feed data)
const initialExpressions = [
  {
    id: 1,
    content: "Sometimes I feel like everyone around me has their life figured out except me. It's exhausting pretending to be okay.",
    feeling: 'overwhelmed',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Stress Relief',
  },
  {
    id: 2,
    content: "Had a really good conversation with my mom today. We finally talked about the pressure I've been feeling about college.",
    feeling: 'hopeful',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Positivity Corner',
  },
  {
    id: 3,
    content: "Why is it so hard to make real friends? Everyone seems to have their groups and I'm just... here.",
    feeling: 'lonely',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Feeling Lonely',
  },
  {
    id: 4,
    content: "Exam season is killing me. I can't sleep properly and I'm constantly worried about my grades.",
    feeling: 'anxious',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Anxiety Support',
  },
  {
    id: 5,
    content: "I don't know what I want to do after high school. Everyone keeps asking and I have no answer.",
    feeling: 'confused',
    date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Self Discovery',
  },
  {
    id: 6,
    content: "Finally stood up for myself today when someone made a rude comment. Small win but it felt huge.",
    feeling: 'grateful',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isOwn: false,
    suggestedCommunity: 'Positivity Corner',
  },
];

// Journal entries
const initialJournalEntries = [
  {
    id: 1,
    content: "Today was challenging. I've been thinking a lot about the future and what I want to do after graduation.",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    content: "Had a really good conversation with my best friend today. It's comforting to know I'm not alone.",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Anonymous questions
const initialAnonymousQuestions = [
  {
    id: 1,
    question: "How do I deal with feeling like I don't fit in at school?",
    response: "Feeling like you don't fit in is something almost everyone experiences at some point, and it's more common than you might think. Here's what I want you to know: fitting in and being yourself are often two different things. Instead of trying to fit in everywhere, focus on finding even one or two genuine connections with people who get you. Those real friendships are so much more valuable than being part of a big group where you don't feel like yourself. What's one thing about you that makes you unique?",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const supportResources = [
  {
    id: 1,
    type: 'counselor',
    name: 'School Counseling Services',
    description: 'Professional guidance counselors available during school hours',
    contact: 'Visit Room 105 or email counselor@school.edu',
  },
  {
    id: 2,
    type: 'helpline',
    name: 'Teen Support Helpline',
    description: '24/7 confidential support for teens',
    contact: '1-800-XXX-XXXX',
  },
  {
    id: 3,
    type: 'emergency',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 for free, 24/7 crisis support',
    contact: 'Text HOME to 741741',
  },
];

export const TeenProvider = ({ children }) => {
  // Expressions state
  const [expressions, setExpressions] = useState(() => {
    const saved = localStorage.getItem('teen_expressions');
    return saved ? JSON.parse(saved) : initialExpressions;
  });

  // Joined communities state
  const [joinedCommunities, setJoinedCommunities] = useState(() => {
    const saved = localStorage.getItem('teen_joined_communities');
    return saved ? JSON.parse(saved) : ['positivity', 'self-discovery'];
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('teen_journal_entries');
    return saved ? JSON.parse(saved) : initialJournalEntries;
  });

  const [anonymousQuestions, setAnonymousQuestions] = useState(() => {
    const saved = localStorage.getItem('teen_anonymous_questions');
    return saved ? JSON.parse(saved) : initialAnonymousQuestions;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('teen_expressions', JSON.stringify(expressions));
  }, [expressions]);

  useEffect(() => {
    localStorage.setItem('teen_joined_communities', JSON.stringify(joinedCommunities));
  }, [joinedCommunities]);

  useEffect(() => {
    localStorage.setItem('teen_journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('teen_anonymous_questions', JSON.stringify(anonymousQuestions));
  }, [anonymousQuestions]);

  // Add expression
  const addExpression = (content, feeling) => {
    const suggestedCommunityId = feelingToCommunity[feeling] || 'self-discovery';
    const suggestedCommunity = allCommunities.find(c => c.id === suggestedCommunityId);
    
    const newExpression = {
      id: Date.now(),
      content,
      feeling,
      date: new Date().toISOString(),
      isOwn: true,
      suggestedCommunity: suggestedCommunity?.name || 'Self Discovery',
    };
    setExpressions(prev => [newExpression, ...prev]);
    return suggestedCommunity;
  };

  // Get suggested communities based on user's expressions
  const getSuggestedCommunities = () => {
    const userFeelings = expressions.filter(e => e.isOwn).map(e => e.feeling);
    const suggestedIds = new Set(userFeelings.map(f => feelingToCommunity[f]).filter(Boolean));
    
    // Add some variety
    const notJoined = allCommunities.filter(c => !joinedCommunities.includes(c.id));
    const suggested = notJoined.filter(c => suggestedIds.has(c.id));
    
    // If no suggestions based on feelings, suggest random ones
    if (suggested.length < 2) {
      return notJoined.slice(0, 3);
    }
    return suggested.slice(0, 3);
  };

  // Get joined community details
  const getJoinedCommunityDetails = () => {
    return allCommunities.filter(c => joinedCommunities.includes(c.id));
  };

  // Join a community
  const joinCommunity = (communityId) => {
    if (!joinedCommunities.includes(communityId)) {
      setJoinedCommunities(prev => [...prev, communityId]);
    }
  };

  // Leave a community
  const leaveCommunity = (communityId) => {
    setJoinedCommunities(prev => prev.filter(id => id !== communityId));
  };

  // Add journal entry
  const addJournalEntry = (content) => {
    const newEntry = {
      id: Date.now(),
      content,
      date: new Date().toISOString(),
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  // Add anonymous question
  const addAnonymousQuestion = (question) => {
    const responses = [
      "I hear you, and what you're feeling is completely valid. It's okay to struggle sometimes. The fact that you're reaching out shows real strength. Would it help to talk about what specifically is making you feel this way?",
      "Thank you for trusting me with this. You're not alone in feeling this way – many people go through similar experiences. Let's break this down together. What's one small step you could take today that might help?",
      "That's a really important thing to talk about. I can sense you're dealing with a lot right now. Remember, it's okay to not be okay sometimes. What matters is that you're here, you're reflecting, and you're looking for support. That takes courage.",
      "I really appreciate you sharing this with me. It takes vulnerability to open up, and I want you to know your feelings matter. Whatever you're going through, remember that challenging times are temporary. You have more resilience than you realize.",
      "What you're describing sounds tough, and I'm glad you're talking about it. One thing I've learned is that we all have the capacity to handle more than we think. Have you considered talking to someone you trust about this, like a friend or family member?",
      "You're being really brave by acknowledging these feelings. Sometimes just saying things out loud (or typing them out) helps us understand ourselves better. What would make you feel even a little bit better right now?",
    ];
    
    const newQuestion = {
      id: Date.now(),
      question,
      response: responses[Math.floor(Math.random() * responses.length)],
      date: new Date().toISOString(),
    };
    setAnonymousQuestions(prev => [newQuestion, ...prev]);
  };

  // Calculate stress patterns for support banner
  const negativeExpressions = expressions.filter(e => 
    e.isOwn && ['anxious', 'stressed', 'lonely', 'overwhelmed'].includes(e.feeling)
  ).length;
  const showSupportBanner = negativeExpressions >= 2;

  const value = {
    expressions,
    allCommunities,
    joinedCommunities,
    journalEntries,
    anonymousQuestions,
    supportResources,
    showSupportBanner,
    addExpression,
    getSuggestedCommunities,
    getJoinedCommunityDetails,
    joinCommunity,
    leaveCommunity,
    addJournalEntry,
    addAnonymousQuestion,
  };

  return (
    <TeenContext.Provider value={value}>
      {children}
    </TeenContext.Provider>
  );
};

export const useTeen = () => {
  const context = useContext(TeenContext);
  if (!context) {
    throw new Error('useTeen must be used within a TeenProvider');
  }
  return context;
};

export default TeenContext;
