import { useState } from 'react';
import { Sparkles, Send, Hash, ArrowUp } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const Express = () => {
  const { addExpression, expressions } = useTeen();
  const [content, setContent] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotes, setUpvotes] = useState({});

  const feelings = [
    { id: 'anxious', label: 'Anxious', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'stressed', label: 'Stressed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'lonely', label: 'Lonely', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'confused', label: 'Confused', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'hopeful', label: 'Hopeful', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'grateful', label: 'Grateful', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'frustrated', label: 'Frustrated', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  const handleSubmit = async () => {
    if (!content.trim() || content.length < 10 || !selectedFeeling) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addExpression(content.trim(), selectedFeeling);
    
    setIsSubmitting(false);
    setContent('');
    setSelectedFeeling(null);
    
    toast.success('Expression shared anonymously');
  };

  const handleUpvote = (expressionId) => {
    setUpvotes(prev => {
      const current = prev[expressionId] || { count: 0, hasUpvoted: false };
      return {
        ...prev,
        [expressionId]: {
          count: current.hasUpvoted ? current.count - 1 : current.count + 1,
          hasUpvoted: !current.hasUpvoted
        }
      };
    });
  };

  const myExpressions = expressions.filter(e => e.isOwn);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Express</h1>
          <p className="text-gray-500 mt-1">Share how you're feeling anonymously</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-sm text-slate-700">
          Your expressions are shared anonymously. Based on what you share, we'll suggest communities that might help.
        </p>
      </div>

      {/* Expression Form */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">What's on your mind?</h2>
        
        {/* Feeling Selection */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {feelings.map((feeling) => (
              <button
                key={feeling.id}
                onClick={() => setSelectedFeeling(feeling.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  selectedFeeling === feeling.id
                    ? `${feeling.color} border-current`
                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                }`}
              >
                {feeling.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Express yourself... What's going on? How does it make you feel?"
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
          rows={4}
        />

        {/* Submit */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400">
            {content.length < 10 
              ? `${10 - content.length} more characters needed` 
              : `${content.length} characters`
            }
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length < 10 || !selectedFeeling || isSubmitting}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
              content.length >= 10 && selectedFeeling && !isSubmitting
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Share Anonymously
              </>
            )}
          </button>
        </div>
      </div>

      {/* My Expressions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Expressions</h2>
        {myExpressions.length > 0 ? (
          <div className="space-y-4">
            {myExpressions.map((expression) => {
              const feeling = feelings.find(f => f.id === expression.feeling);
              return (
                <div 
                  key={expression.id} 
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${feeling?.color || 'bg-gray-100 text-gray-600'}`}>
                      {feeling?.label || expression.feeling}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(expression.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{expression.content}</p>
                  
                  {/* Upvote Button */}
                  <div className="mt-3 flex items-center gap-2">
                    <button 
                      onClick={() => handleUpvote(expression.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        upvotes[expression.id]?.hasUpvoted
                          ? 'text-sky-600'
                          : 'text-gray-400 hover:text-sky-600'
                      }`}
                    >
                      <ArrowUp className={`w-4 h-4 ${upvotes[expression.id]?.hasUpvoted ? 'fill-current' : ''}`} />
                      <span>{(upvotes[expression.id]?.count || 0) + 0}</span>
                    </button>
                  </div>
                  
                  {/* Community Suggestion */}
                  {expression.suggestedCommunity && (
                    <div className="mt-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-700">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm font-medium">Suggested: {expression.suggestedCommunity}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No expressions yet</h3>
            <p className="text-gray-500 mt-1">Share how you're feeling to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Express;
