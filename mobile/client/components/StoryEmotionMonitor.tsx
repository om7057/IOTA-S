import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

interface EmotionEntry {
  time: string;
  emotion: string;
  rawEmotion?: string;
  confidence?: number;
}

interface StoryEmotionMonitorProps {
  emotionTimeline: EmotionEntry[];
}

const StoryEmotionMonitor = ({ emotionTimeline }: StoryEmotionMonitorProps) => {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [emotionCount, setEmotionCount] = useState(0);

  const emotionEmojis: Record<string, string> = {
    happy: '😄',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    surprised: '😲',
    disgusted: '🤢',
    neutral: '😐',
  };

  const emotionColors: Record<string, string> = {
    happy: 'bg-yellow-500',
    sad: 'bg-blue-500',
    angry: 'bg-red-500',
    fearful: 'bg-purple-500',
    surprised: 'bg-orange-500',
    disgusted: 'bg-green-500',
    neutral: 'bg-gray-500',
  };

  useEffect(() => {
    if (emotionTimeline.length > 0) {
      const latestEmotion = emotionTimeline[emotionTimeline.length - 1];
      setCurrentEmotion(latestEmotion.rawEmotion || latestEmotion.emotion);
      setEmotionCount(emotionTimeline.length);
    }
  }, [emotionTimeline]);

  return (
    <View className="absolute top-6 right-6 w-48 rounded-2xl overflow-hidden shadow-xl border-3 border-white bg-white">
      {/* Video Feed Placeholder */}
      <View className="bg-black h-32 relative items-center justify-center">
        <Text className="text-5xl">{emotionEmojis[currentEmotion || 'neutral']}</Text>

        {/* Live Indicator */}
        <View className="absolute top-2 left-2 flex-row items-center gap-1 bg-red-500 px-2 py-1 rounded-full">
          <View className="w-2 h-2 rounded-full bg-white" />
          <Text className="text-white text-xs font-bold">LIVE</Text>
        </View>

        {/* Confidence Badge */}
        {currentEmotion && (
          <View className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
            <Text className="text-xs font-semibold text-white text-center">{currentEmotion}</Text>
          </View>
        )}
      </View>

      {/* Info Bar */}
      <View className={`${emotionColors[currentEmotion || 'neutral'] || 'bg-gray-500'} p-3`}>
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-xs font-semibold opacity-90 text-white">EMOTION TRACKED</Text>
            <Text className="text-lg font-bold text-white capitalize">{currentEmotion || 'detecting...'}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs opacity-90 text-white">Detections</Text>
            <Text className="text-2xl font-bold text-white">{emotionCount}</Text>
          </View>
        </View>

        {/* Trend indicator */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${Math.min((emotionCount / 30) * 100, 100)}%` }}
            />
          </View>
          <Text className="text-xs opacity-90 text-white">{emotionCount}</Text>
        </View>
      </View>
    </View>
  );
};

export default StoryEmotionMonitor;
