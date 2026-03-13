import { useState } from 'react';
import { Users, MessageSquare, ArrowLeft, Hash, ArrowUp } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const CommunityCircles = () => {
  const { 
    allCommunities,
    joinedCommunities,
    expressions,
    joinCommunity,
    leaveCommunity
  } = useTeen();

  const [selectedCircle, setSelectedCircle] = useState(null);
  const [upvotes, setUpvotes] = useState({});

  const handleJoinCommunity = (communityId) => {
    joinCommunity(communityId);
    toast.success('Joined community!');
  };

  const handleLeaveCommunity = (communityId) => {
    leaveCommunity(communityId);
    toast.success('Left community');
  };

  const handleUpvote = (expressionId) => {
    setUpvotes(prev => ({
      ...prev,
      [expressionId]: {
        count: (prev[expressionId]?.count || 0) + (prev[expressionId]?.hasUpvoted ? -1 : 1),
        hasUpvoted: !prev[expressionId]?.hasUpvoted
      }
    }));
  };

  // Get expressions for selected community
  const communityExpressions = selectedCircle
    ? expressions.filter(exp => exp.suggestedCommunity === selectedCircle.name)
    : [];

  const currentCircle = selectedCircle;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCircle && (
            <button
              onClick={() => setSelectedCircle(null)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCircle ? currentCircle?.name : 'Communities'}
            </h1>
            <p className="text-gray-500 mt-1">
              {selectedCircle 
                ? currentCircle?.description 
                : 'Connect with peers who understand'
              }
            </p>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentCircle?.color || 'bg-slate-100 text-slate-700'}`}>
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Community Guidelines */}
      {!selectedCircle && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-700 font-medium">Community Guidelines</p>
          <p className="text-sm text-slate-600 mt-1">
            Be kind, supportive, and respectful. This is a judgment-free zone.
          </p>
        </div>
      )}

      {!selectedCircle ? (
        /* Communities Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allCommunities.map((community) => {
            const isJoined = joinedCommunities.includes(community.id);
            const communityExpressionCount = expressions.filter(
              exp => exp.suggestedCommunity === community.name
            ).length;

            return (
              <div
                key={community.id}
                className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${community.color} flex items-center justify-center`}>
                    <Hash className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isJoined
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isJoined ? 'Joined' : 'Join'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{community.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{communityExpressionCount} expressions</span>
                  <button
                    onClick={() => {
                      if (isJoined) {
                        handleLeaveCommunity(community.id);
                      } else {
                        handleJoinCommunity(community.id);
                        setSelectedCircle(community);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isJoined
                        ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {isJoined ? 'Leave' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Community Detail */
        <div className="space-y-6">
          {/* Community Info Card */}
          <div className={`${currentCircle.color} rounded-2xl p-8`}>
            <h2 className="text-2xl font-bold mb-2">{currentCircle.name}</h2>
            <p className="text-base opacity-90 mb-4">{currentCircle.description}</p>
            <button
              onClick={() => handleLeaveCommunity(currentCircle.id)}
              className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition-all"
            >
              Leave Community
            </button>
          </div>

          {/* Community Expressions Feed */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expressions from this community</h3>
            
            {communityExpressions.length > 0 ? (
              <div className="space-y-4">
                {communityExpressions.map((expression) => (
                  <div 
                    key={expression.id} 
                    className="bg-white rounded-xl p-5 shadow-card border border-gray-100 hover:shadow-elevated transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs font-bold">A</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Anonymous</p>
                          <p className="text-xs text-gray-400">
                            {new Date(expression.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                        {expression.feeling}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{expression.content}</p>
                    <div className="mt-4 flex items-center gap-4 text-gray-400 text-sm">
                      <button 
                        onClick={() => handleUpvote(expression.id)}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          upvotes[expression.id]?.hasUpvoted 
                            ? 'text-sky-600' 
                            : 'hover:text-sky-600'
                        }`}
                      >
                        <ArrowUp className={`w-4 h-4 ${
                          upvotes[expression.id]?.hasUpvoted ? 'fill-sky-600' : ''
                        }`} />
                        {(upvotes[expression.id]?.count || 0) + 12}
                      </button>
                      <button className="hover:text-sky-600 transition-colors flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">No expressions yet</h3>
                <p className="text-gray-500 mt-1">Be the first to express in this community</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityCircles;
