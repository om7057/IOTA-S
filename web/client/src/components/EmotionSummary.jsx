import { BarChart3, TrendingUp, Zap, Award, Heart } from 'lucide-react';

const EmotionSummary = ({ emotionTimeline = [], storyTitle }) => {
  // Map emotions to emoji and colors
  const emotionConfig = {
    happy: { emoji: '😄', color: 'bg-yellow-100', textColor: 'text-yellow-700', bar: 'bg-yellow-500' },
    sad: { emoji: '😢', color: 'bg-blue-100', textColor: 'text-blue-700', bar: 'bg-blue-500' },
    angry: { emoji: '😠', color: 'bg-red-100', textColor: 'text-red-700', bar: 'bg-red-500' },
    scared: { emoji: '😨', color: 'bg-purple-100', textColor: 'text-purple-700', bar: 'bg-purple-500' },
    neutral: { emoji: '😐', color: 'bg-gray-100', textColor: 'text-gray-700', bar: 'bg-gray-500' },
    surprised: { emoji: '😲', color: 'bg-orange-100', textColor: 'text-orange-700', bar: 'bg-orange-500' },
    disgusted: { emoji: '🤢', color: 'bg-green-100', textColor: 'text-green-700', bar: 'bg-green-500' },
    calm: { emoji: '😌', color: 'bg-teal-100', textColor: 'text-teal-700', bar: 'bg-teal-500' },
    excited: { emoji: '🤩', color: 'bg-pink-100', textColor: 'text-pink-700', bar: 'bg-pink-500' },
  };

  // Calculate emotion statistics
  const emotionCounts = {};
  const emotionSequence = [];
  
  emotionTimeline.forEach((entry) => {
    const emotion = entry.emotion || entry.rawEmotion || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    
    // Only add if different from last emotion (avoid duplicates)
    if (emotionSequence.length === 0 || emotionSequence[emotionSequence.length - 1] !== emotion) {
      emotionSequence.push(emotion);
    }
  });

  // Get sorted emotions by frequency
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / emotionTimeline.length) * 100),
    }));

  const dominantEmotion = sortedEmotions[0];
  const totalDetections = emotionTimeline.length;

  // Get emotion transitions (how many times emotion changed)
  const emotionTransitions = emotionSequence.length - 1;

  // Get engagement level based on emotion variety
  const engagementLevel = emotionSequence.length <= 2 ? 'Low' : 
                         emotionSequence.length <= 5 ? 'Moderate' : 'High';

  // Generate insights based on emotions
  const generateInsights = () => {
    const insights = [];

    if (dominantEmotion?.percentage >= 60) {
      insights.push(`Your child was predominantly ${dominantEmotion.emotion} throughout the story (${dominantEmotion.percentage}%)`);
    }

    if (emotionTransitions === 0) {
      insights.push('The story kept your child in a consistent emotional state - good stability');
    } else if (emotionTransitions > 5) {
      insights.push('Your child experienced many emotional shifts - the story was very engaging!');
    }

    if (sortedEmotions.some(e => e.emotion === 'happy')) {
      const happyEmotions = sortedEmotions.find(e => e.emotion === 'happy');
      insights.push(`Your child felt happy ${happyEmotions.percentage}% of the time - they enjoyed the story!`);
    }

    if (sortedEmotions.some(e => e.emotion === 'scared')) {
      const scaredEmotions = sortedEmotions.find(e => e.emotion === 'scared');
      if (scaredEmotions.percentage > 20) {
        insights.push(`The story had some scary moments (${scaredEmotions.percentage}%) - consider their comfort level for similar stories`);
      }
    }

    if (sortedEmotions.some(e => e.emotion === 'sad')) {
      const sadEmotions = sortedEmotions.find(e => e.emotion === 'sad');
      if (sadEmotions.percentage > 15) {
        insights.push(`Your child felt sad during parts of the story - talk to them about it if they seemed upset`);
      }
    }

    return insights.length > 0 ? insights : ['Your child completed the story! Great job! 🎉'];
  };

  const insights = generateInsights();

  if (emotionTimeline.length === 0) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-8 border-2 border-sky-200">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg text-gray-600 font-medium">No emotion data collected</p>
          <p className="text-sm text-gray-500 mt-2">Make sure your camera was working during the story</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Emotion Summary</h2>
            <p className="text-sky-100">Your emotional journey through "{storyTitle}"</p>
          </div>
          <div className="text-7xl">{dominantEmotion ? emotionConfig[dominantEmotion.emotion]?.emoji : '😊'}</div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-semibold mb-1">Total Detections</p>
          <p className="text-3xl font-bold text-sky-600">{totalDetections}</p>
          <p className="text-xs text-gray-500 mt-1">facial scans</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-semibold mb-1">Dominant Emotion</p>
          <p className="text-2xl font-bold text-center mt-2">{emotionConfig[dominantEmotion?.emotion]?.emoji}</p>
          <p className="text-xs text-gray-600 font-medium text-center capitalize mt-1">{dominantEmotion?.emotion}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-semibold mb-1">Emotion Shifts</p>
          <p className="text-3xl font-bold text-purple-600">{emotionTransitions}</p>
          <p className="text-xs text-gray-500 mt-1">emotional changes</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-semibold mb-1">Engagement</p>
          <p className={`text-2xl font-bold ${engagementLevel === 'High' ? 'text-green-600' : engagementLevel === 'Moderate' ? 'text-yellow-600' : 'text-orange-600'}`}>
            {engagementLevel}
          </p>
          <p className="text-xs text-gray-500 mt-1">activity level</p>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-sky-600" />
          <h3 className="text-xl font-bold text-gray-900">Emotion Distribution</h3>
        </div>

        <div className="space-y-4">
          {sortedEmotions.map(({ emotion, count, percentage }) => (
            <div key={emotion} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emotionConfig[emotion]?.emoji || '😐'}</span>
                  <span className="font-semibold text-gray-700 capitalize">{emotion}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{percentage}%</span>
                  <span className="text-xs text-gray-500 ml-2">({count} times)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${emotionConfig[emotion]?.bar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Journey Timeline */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Emotional Journey</h3>
        </div>

        <div className="flex items-end justify-between gap-2 h-40 bg-gray-50 rounded-2xl p-4">
          {emotionSequence.map((emotion, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 flex-1"
              title={`${idx + 1}. ${emotion}`}
            >
              <div className={`w-full ${emotionConfig[emotion]?.bar} rounded-lg transition-all hover:shadow-lg cursor-pointer`}
                   style={{ height: `${(idx + 1) / emotionSequence.length * 100}%` }} />
              <span className="text-xl">{emotionConfig[emotion]?.emoji}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Your child's emotions went through <span className="font-bold">{emotionSequence.length}</span> distinct states during the story.</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <Zap className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Insights & Observations</h3>
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-600 font-bold mt-0.5">✓</span>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-sm">
        <div className="flex items-start gap-3">
          <Heart className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Parent Tip</h3>
            <p className="text-gray-700 text-sm">
              Great job completing the story! Consider discussing the story with your child, especially the moments where they showed strong emotions. This helps them process the experience and build emotional intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionSummary;
