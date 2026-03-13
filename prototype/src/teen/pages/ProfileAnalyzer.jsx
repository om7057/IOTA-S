import { useState, useMemo } from 'react';
import { Plus, TrendingUp, Calendar, Zap, BarChart3, Clock } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const ProfileAnalyzer = () => {
  const { expressions, addExpression } = useTeen();
  const [showForm, setShowForm] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [content, setContent] = useState('');

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

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last7 = expressions.filter(e => new Date(e.date) > last7Days);
    const last30 = expressions.filter(e => new Date(e.date) > last30Days);

    // Count feelings
    const feelingCounts = {};
    expressions.forEach(expr => {
      feelingCounts[expr.feeling] = (feelingCounts[expr.feeling] || 0) + 1;
    });

    // Get most common feeling
    const mostCommon = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0];

    // Streak calculation
    let streak = 0;
    const sortedByDate = [...expressions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedByDate.length > 0) {
      let currentDate = new Date(sortedByDate[0].date);
      currentDate.setHours(0, 0, 0, 0);
      
      for (const expr of sortedByDate) {
        const exprDate = new Date(expr.date);
        exprDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((currentDate - exprDate) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          streak++;
          currentDate = exprDate;
        } else {
          break;
        }
      }
    }

    return {
      totalExpressions: expressions.length,
      last7Days: last7.length,
      last30Days: last30.length,
      feelingCounts,
      mostCommon: mostCommon ? mostCommon[0] : null,
      streak,
    };
  }, [expressions]);

  // Get last 7 days data for mini chart
  const last7DaysData = useMemo(() => {
    const now = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const count = expressions.filter(e => {
        const exprDate = new Date(e.date);
        exprDate.setHours(0, 0, 0, 0);
        return exprDate.getTime() === date.getTime();
      }).length;
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        count
      });
    }
    
    return days;
  }, [expressions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!feeling || !content.trim()) {
      toast.error('Please select a feeling and write something');
      return;
    }

    addExpression({
      content,
      feeling,
      isOwn: true,
    });

    toast.success('Expression shared!');
    setContent('');
    setFeeling('');
    setShowForm(false);
  };

  const getMostCommonLabel = () => {
    const label = feelings.find(f => f.id === analytics.mostCommon)?.label;
    return label || 'None yet';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-500 mt-1">Insights into your wellness journey</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Expressions */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalExpressions}</p>
          <p className="text-xs text-gray-500 mt-1">Expressions shared</p>
        </div>

        {/* Last 7 Days */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400">This week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.last7Days}</p>
          <p className="text-xs text-gray-500 mt-1">In 7 days</p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400">Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.streak}</p>
          <p className="text-xs text-gray-500 mt-1">Days consecutive</p>
        </div>

        {/* Most Common */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold text-gray-400">Common</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{getMostCommonLabel()}</p>
          <p className="text-xs text-gray-500 mt-1">Your most shared</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-6">Activity Last 7 Days</h2>
        <div className="flex items-end justify-between gap-2">
          {last7DaysData.map((day, i) => {
            const maxCount = Math.max(...last7DaysData.map(d => d.count), 3);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-lg transition-all duration-300 bg-sky-400"
                  style={{ height: `${Math.max((day.count / maxCount) * 100, 20)}px` }}
                />
                <span className="text-xs text-gray-400 font-medium">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feeling Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Feeling Distribution</h2>
        <div className="space-y-3">
          {Object.entries(analytics.feelingCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([feeling, count]) => {
              const maxCount = Math.max(...Object.values(analytics.feelingCounts), 1);
              const percentage = (count / maxCount) * 100;
              const feelingLabel = feelings.find(f => f.id === feeling)?.label || feeling;
              
              return (
                <div key={feeling} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{feelingLabel}</span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-600 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Share Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Share How You're Feeling
        </button>
      )}

      {/* Expression Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center lg:justify-center p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up lg:animate-fade-in">
            <div className="p-6 sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Share Your Feeling</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                onClick={() => setShowForm(false)}
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

export default ProfileAnalyzer;
