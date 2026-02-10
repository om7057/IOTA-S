import { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const AnonymousQuestions = () => {
  const { anonymousQuestions, addAnonymousQuestion } = useTeen();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim() || question.length < 10) return;
    
    setIsSubmitting(true);
    setShowSkeleton(true);
    
    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addAnonymousQuestion(question.trim());
    
    setIsSubmitting(false);
    setQuestion('');
    
    // Keep skeleton briefly to show transition
    await new Promise(resolve => setTimeout(resolve, 300));
    setShowSkeleton(false);
    
    toast.success('Message sent');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Talk to Buddy</h1>
      </div>

      {/* Chat Input */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
          rows={4}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400">
            {question.length < 10 
              ? `${10 - question.length} more characters` 
              : `${question.length} characters`
            }
          </span>
          <button
            onClick={handleSubmit}
            disabled={question.length < 10 || isSubmitting}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
              question.length >= 10 && !isSubmitting
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {showSkeleton && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 animate-pulse">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div>
        {anonymousQuestions.length > 0 ? (
          <div className="space-y-4">
            {anonymousQuestions.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
              >
                {/* Your Message */}
                <div className="p-6 bg-gray-50">
                  <p className="text-gray-800">{item.question}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Buddy Response */}
                <div className="p-6 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{item.response}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
            <h3 className="font-semibold text-gray-900">Start a conversation</h3>
            <p className="text-gray-500 mt-1">Share what's on your mind</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousQuestions;
