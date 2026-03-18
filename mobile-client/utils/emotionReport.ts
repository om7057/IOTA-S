export interface EmotionEntry {
  time?: string;
  timestamp?: string | Date;
  emotion: string;
  rawEmotion?: string;
  confidence?: number;
}

export interface EmotionDistributionItem {
  emotion: string;
  count: number;
  percentage: number;
}

export interface EmotionReport {
  dominantEmotion: string;
  totalDetections: number;
  emotionTransitions: number;
  engagementLevel: 'Low' | 'Moderate' | 'High';
  distribution: EmotionDistributionItem[];
  insights: string[];
  generatedAt: string;
}

export const EMOTION_EMOJIS: Record<string, string> = {
  happy: '😄',
  sad: '😢',
  angry: '😠',
  scared: '😨',
  fearful: '😨',
  surprised: '😲',
  disgusted: '🤢',
  neutral: '😐',
  calm: '😌',
  excited: '🤩',
  confused: '🤔',
};

export const generateEmotionReport = (emotionTimeline: EmotionEntry[] = []): EmotionReport | null => {
  if (!emotionTimeline.length) {
    return null;
  }

  const emotionCounts: Record<string, number> = {};
  const emotionSequence: string[] = [];

  for (const entry of emotionTimeline) {
    const emotion = (entry.emotion || entry.rawEmotion || 'neutral').toLowerCase();
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

    if (emotionSequence.length === 0 || emotionSequence[emotionSequence.length - 1] !== emotion) {
      emotionSequence.push(emotion);
    }
  }

  const distribution = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / emotionTimeline.length) * 100),
    }));

  const dominantEmotion = distribution[0]?.emotion || 'neutral';
  const emotionTransitions = Math.max(0, emotionSequence.length - 1);
  const engagementLevel: 'Low' | 'Moderate' | 'High' =
    emotionSequence.length <= 2 ? 'Low' : emotionSequence.length <= 5 ? 'Moderate' : 'High';

  const insights: string[] = [];
  const dominant = distribution[0];

  if (dominant && dominant.percentage >= 60) {
    insights.push(`Dominant emotion was ${dominant.emotion} (${dominant.percentage}%).`);
  }

  if (emotionTransitions === 0) {
    insights.push('Emotion stayed stable during the assessment.');
  } else if (emotionTransitions > 5) {
    insights.push('Multiple emotion shifts suggest high engagement.');
  }

  const happy = distribution.find((item) => item.emotion === 'happy');
  if (happy) {
    insights.push(`Happy emotion appeared ${happy.percentage}% of the time.`);
  }

  if (!insights.length) {
    insights.push('Assessment completed with emotion tracking enabled.');
  }

  return {
    dominantEmotion,
    totalDetections: emotionTimeline.length,
    emotionTransitions,
    engagementLevel,
    distribution,
    insights,
    generatedAt: new Date().toISOString(),
  };
};