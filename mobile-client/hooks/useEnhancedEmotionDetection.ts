import { useEffect, useRef, useState, useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Map emotions to mood
const emotionMap = {
  neutral: 'calm',
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  fearful: 'scared',
  surprised: 'excited',
};

interface EmotionEntry {
  time: string;
  emotion: string;
  rawEmotion: string;
  confidence: number;
  allExpressions?: Record<string, number>;
}

const useEnhancedEmotionDetection = () => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionEntry[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [allExpressions, setAllExpressions] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Request camera permission
  const requestCamera = useCallback(async () => {
    if (!permission) {
      const { granted } = await requestPermission();
      return granted;
    }
    return permission.granted;
  }, [permission, requestPermission]);

  // Simulate emotion detection (in production, use TensorFlow or similar)
  const detectEmotion = useCallback(() => {
    // Simulated emotion detection - in production would use actual camera processing
    const emotions = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'surprised'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomConfidence = Math.floor(Math.random() * 40) + 60; // 60-100%

    setDetectedEmotion(randomEmotion);
    setDetectedMood(emotionMap[randomEmotion as keyof typeof emotionMap] || randomEmotion);
    setConfidence(randomConfidence);
    setFaceDetected(true);

    // Add to timeline
    setEmotionTimeline((prev) => [
      ...prev,
      {
        time: new Date().toISOString(),
        emotion: emotionMap[randomEmotion as keyof typeof emotionMap] || randomEmotion,
        rawEmotion: randomEmotion,
        confidence: randomConfidence,
      },
    ]);
  }, []);

  const startDetection = useCallback(() => {
    setIsDetecting(true);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(detectEmotion, 1000);
    }
  }, [detectEmotion]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getTopThreeEmotions = useCallback(() => {
    if (!allExpressions) {
      // Simulate top emotions based on timeline
      const emotionCounts: Record<string, number> = {};
      emotionTimeline.forEach((entry) => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      });

      return Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emotion, count]) => ({
          emotion,
          rawEmotion: emotion,
          confidence: Math.round((count / emotionTimeline.length) * 100),
        }));
    }

    return Object.entries(allExpressions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion, value]) => ({
        emotion: emotionMap[emotion as keyof typeof emotionMap] || emotion,
        rawEmotion: emotion,
        confidence: Math.round(value * 100),
      }));
  }, [allExpressions, emotionTimeline]);

  return {
    cameraRef,
    detectedEmotion,
    detectedMood,
    confidence,
    emotionTimeline,
    loading,
    isDetecting,
    faceDetected,
    allExpressions,
    permission,
    requestCamera,
    startDetection,
    stopDetection,
    getTopThreeEmotions,
  };
};

export default useEnhancedEmotionDetection;
