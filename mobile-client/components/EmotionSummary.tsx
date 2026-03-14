import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmotionEntry {
  time: string;
  emotion: string;
  rawEmotion?: string;
  confidence?: number;
}

interface EmotionSummaryProps {
  emotionTimeline: EmotionEntry[];
  storyTitle?: string;
}

const EmotionSummary = ({ emotionTimeline = [], storyTitle = 'Story' }: EmotionSummaryProps) => {
  const emotionConfig: Record<string, any> = {
    happy: { emoji: '😄', color: 'bg-yellow-100' },
    sad: { emoji: '😢', color: 'bg-blue-100' },
    angry: { emoji: '😠', color: 'bg-red-100' },
    scared: { emoji: '😨', color: 'bg-purple-100' },
    neutral: { emoji: '😐', color: 'bg-gray-100' },
    surprised: { emoji: '😲', color: 'bg-orange-100' },
    disgusted: { emoji: '🤢', color: 'bg-green-100' },
    calm: { emoji: '😌', color: 'bg-teal-100' },
    excited: { emoji: '🤩', color: 'bg-pink-100' },
  };

  // Calculate emotion statistics
  const emotionCounts: Record<string, number> = {};
  const emotionSequence: string[] = [];

  emotionTimeline.forEach((entry) => {
    const emotion = entry.emotion || entry.rawEmotion || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

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
  const emotionTransitions = emotionSequence.length - 1;
  const engagementLevel = emotionSequence.length <= 2 ? 'Low' : emotionSequence.length <= 5 ? 'Moderate' : 'High';

  // Generate insights
  const generateInsights = () => {
    const insights: string[] = [];

    if (dominantEmotion?.percentage >= 60) {
      insights.push(`Your child was predominantly ${dominantEmotion.emotion} throughout (${dominantEmotion.percentage}%)`);
    }

    if (emotionTransitions === 0) {
      insights.push('The story kept your child in a consistent emotional state - good stability');
    } else if (emotionTransitions > 5) {
      insights.push('Your child experienced many emotional shifts - the story was very engaging!');
    }

    if (sortedEmotions.some((e) => e.emotion === 'happy')) {
      const happyEmotions = sortedEmotions.find((e) => e.emotion === 'happy');
      if (happyEmotions) {
        insights.push(`Your child felt happy ${happyEmotions.percentage}% of the time - they enjoyed the story!`);
      }
    }

    return insights.length > 0 ? insights : ['Your child completed the story! Great job! 🎉'];
  };

  const insights = generateInsights();

  if (emotionTimeline.length === 0) {
    return (
      <View className="bg-sky-50 rounded-3xl p-6 border-2 border-sky-200">
        <View className="items-center">
          <Text className="text-5xl mb-4">📊</Text>
          <Text className="text-lg text-gray-600 font-medium">No emotion data collected</Text>
          <Text className="text-sm text-gray-500 mt-2">Make sure your camera was working during the story</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-6">
        {/* Header Card */}
        <View className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-6 mb-6 flex-row items-start justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Emotion Summary</Text>
            <Text className="text-sky-100">Your journey through "{storyTitle}"</Text>
          </View>
          <Text className="text-5xl">{emotionConfig[dominantEmotion?.emotion]?.emoji || '😊'}</Text>
        </View>

        {/* Key Stats */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <View className="bg-white rounded-2xl p-4 border-2 border-gray-200">
            <Text className="text-sm text-gray-600 font-semibold mb-1">Total Detections</Text>
            <Text className="text-3xl font-bold text-sky-600">{totalDetections}</Text>
            <Text className="text-xs text-gray-500 mt-1">facial scans</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border-2 border-gray-200">
            <Text className="text-sm text-gray-600 font-semibold mb-1">Dominant Emotion</Text>
            <Text className="text-2xl text-center mt-2">{emotionConfig[dominantEmotion?.emotion]?.emoji}</Text>
            <Text className="text-xs text-gray-600 font-medium text-center capitalize mt-1">
              {dominantEmotion?.emotion}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border-2 border-gray-200">
            <Text className="text-sm text-gray-600 font-semibold mb-1">Emotion Shifts</Text>
            <Text className="text-3xl font-bold text-purple-600">{emotionTransitions}</Text>
            <Text className="text-xs text-gray-500 mt-1">changes</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border-2 border-gray-200">
            <Text className="text-sm text-gray-600 font-semibold mb-1">Engagement</Text>
            <Text
              className={`text-2xl font-bold ${
                engagementLevel === 'High'
                  ? 'text-green-600'
                  : engagementLevel === 'Moderate'
                    ? 'text-yellow-600'
                    : 'text-orange-600'
              }`}
            >
              {engagementLevel}
            </Text>
          </View>
        </View>

        {/* Emotion Distribution */}
        <View className="bg-white rounded-3xl p-6 border-2 border-gray-200 mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <Ionicons name="stats-chart" size={24} color="#0284c7" />
            <Text className="text-xl font-bold text-gray-900">Emotion Distribution</Text>
          </View>

          {sortedEmotions.map(({ emotion, count, percentage }) => (
            <View key={emotion} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">{emotionConfig[emotion]?.emoji || '😐'}</Text>
                  <Text className="font-semibold text-gray-700 capitalize">{emotion}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-gray-900">{percentage}%</Text>
                  <Text className="text-xs text-gray-500">({count}x)</Text>
                </View>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <View
                  className="bg-sky-600 h-3 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 mb-6">
          <View className="flex-row items-start gap-3 mb-4">
            <Ionicons name="flash" size={24} color="#b45309" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-3">Insights & Observations</Text>
              {insights.map((insight, idx) => (
                <View key={idx} className="flex-row items-start gap-3 mb-2">
                  <Text className="text-amber-600 font-bold">✓</Text>
                  <Text className="text-sm text-gray-700 flex-1">{insight}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recommendation */}
        <View className="bg-green-50 rounded-3xl p-6 border-2 border-green-200">
          <View className="flex-row items-start gap-3">
            <Ionicons name="heart" size={24} color="#059669" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-2">Parent Tip</Text>
              <Text className="text-sm text-gray-700">
                Great job completing the story! Consider discussing the story with your child, especially the moments where
                they showed strong emotions.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EmotionSummary;
