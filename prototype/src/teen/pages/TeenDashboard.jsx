import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  MessageCircle, 
  Users, 
  LifeBuoy,
  ChevronRight,
  Plus,
  Clock,
  Hash,
  Flame,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRightIcon,
  ArrowUp
} from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import { useState } from 'react';

const TeenDashboard = () => {
  const { 
    expressions,
    allCommunities,
    joinedCommunities,
    getSuggestedCommunities,
    joinCommunity,
    getJoinedCommunityDetails,
    addExpression,
  } = useTeen();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState(null);
  const [upvotes, setUpvotes] = useState({});
  const [showExpressionForm, setShowExpressionForm] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [content, setContent] = useState('');

  const joinedCommunityDetails = getJoinedCommunityDetails();
  const suggestedCommunities = getSuggestedCommunities();

  const allExploreCommunities = [...joinedCommunityDetails, ...suggestedCommunities];

  const handleScroll = (e) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  const scrollCommunities = (direction) => {
    const container = document.getElementById('communities-scroll');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

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

  const handleSubmitExpression = (e) => {
    e.preventDefault();
    
    if (!feeling || !content.trim()) {
      return;
    }

    addExpression({
      content,
      feeling,
      isOwn: true,
    });

    setContent('');
    setFeeling('');
    setShowExpressionForm(false);
  };

  const feelingColors = {
    anxious: 'bg-slate-100 text-slate-700 border-slate-200',
    stressed: 'bg-slate-100 text-slate-700 border-slate-200',
    lonely: 'bg-slate-100 text-slate-700 border-slate-200',
    overwhelmed: 'bg-slate-100 text-slate-700 border-slate-200',
    confused: 'bg-slate-100 text-slate-700 border-slate-200',
    hopeful: 'bg-slate-100 text-slate-700 border-slate-200',
    grateful: 'bg-slate-100 text-slate-700 border-slate-200',
    frustrated: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  // Filter expressions based on selected community
  const filteredExpressions = selectedCommunityFilter
    ? expressions.filter(exp => {
        const community = allCommunities.find(c => c.id === selectedCommunityFilter);
        return exp.suggestedCommunity === community?.name;
      })
    : expressions;

  const displayedExpressions = filteredExpressions.slice(0, 10);

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Sticky Header with CTA */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
            <p className="text-sm text-gray-500">Connect with your community</p>
          </div>
          <button
            onClick={() => setShowExpressionForm(true)}
            className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center shadow-lg hover:bg-sky-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Communities Section */}
        <div className="px-4 lg:px-6 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Communities</h2>
            <Link 
              to="/teen/community"
              className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal Communities Scroll */}
          <div className="relative group">
            {scrollPosition > 0 && (
              <button
                onClick={() => scrollCommunities('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div
              id="communities-scroll"
              onScroll={handleScroll}
              className="overflow-x-auto scrollbar-hide flex gap-3 pb-2"
            >
              {allExploreCommunities.map((community) => {
                const isSuggested = suggestedCommunities.find(c => c.id === community.id);
                const isJoined = joinedCommunities.includes(community.id);
                const isSelected = selectedCommunityFilter === community.id;

                return (
                  <button
                    key={community.id}
                    onClick={() => setSelectedCommunityFilter(isSelected ? null : community.id)}
                    className={`flex-shrink-0 px-4 py-3 rounded-full font-medium text-sm transition-all border-2 flex items-center gap-2 ${
                      isSelected
                        ? `${community.color} border-current`
                        : isSuggested
                        ? 'bg-white text-gray-600 border-sky-200 hover:border-sky-400'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-sky-400'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span>{community.name}</span>
                    {isSuggested && <Flame className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollCommunities('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expressions Feed */}
        <div className="pb-20 lg:pb-6">
          {displayedExpressions.length > 0 ? (
            <div className="space-y-0">
              {displayedExpressions.map((expression, index) => {
                const feeling = Object.keys(feelingColors).find(f => f === expression.feeling);
                const community = allCommunities.find(c => c.name === expression.suggestedCommunity);

                return (
                  <div
                    key={expression.id}
                    className={`px-4 lg:px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      expression.isOwn ? 'bg-sky-50/50' : ''
                    }`}
                  >
                    {/* Community Tag and Time */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${community?.color || 'bg-gray-100 text-gray-600'}`}>
                        <Hash className="w-3 h-3" />
                        {expression.suggestedCommunity || 'General'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(expression.date)}
                      </span>
                      {expression.isOwn && (
                        <span className="ml-auto text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-full">
                          Your Expression
                        </span>
                      )}
                    </div>

                    {/* Expression Content */}
                    <div className="mb-3">
                      <p className="text-gray-800 text-base leading-relaxed">
                        {expression.content}
                      </p>
                    </div>

                    {/* Feeling Tag and Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${feelingColors[feeling] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {feeling || 'feeling'}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <button 
                          onClick={() => handleUpvote(expression.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            upvotes[expression.id]?.hasUpvoted
                              ? 'text-sky-600'
                              : 'hover:text-sky-600'
                          }`}
                        >
                          <ArrowUp className={`w-4 h-4 ${upvotes[expression.id]?.hasUpvoted ? 'fill-current' : ''}`} />
                          <span>{(upvotes[expression.id]?.count || 0) + 12}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>3</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No expressions yet</h3>
              <p className="text-gray-500 mt-2">Be the first to share in this community</p>
              <Link
                to="/teen/express"
                className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                Express yourself
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Expression Form Modal */}
      {showExpressionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center lg:justify-center p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up lg:animate-fade-in">
            <div className="p-6 sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Share Your Feeling</h2>
              <button
                onClick={() => setShowExpressionForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpression} className="p-6 space-y-4">
              {/* Feeling Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">How are you feeling?</label>
                <div className="grid grid-cols-2 gap-2">
                  {feelings.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFeeling(f.id)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        feeling === f.id
                          ? `${f.color} border-slate-400`
                          : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expression Text */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">What's on your mind?</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, feelings, or experiences..."
                  maxLength={500}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-2">{content.length}/500 characters</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!feeling || !content.trim()}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  feeling && content.trim()
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Share Expression
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowExpressionForm(false)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeenDashboard;
