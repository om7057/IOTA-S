import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const useEmotionDetection = () => {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const [emotionTimeline, setEmotionTimeline] = useState<any[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<any>(null);
  const detectionIntervalRef = useRef<any>(null);
  const modelRef = useRef<any>(null);

  // Initialize TensorFlow and load face detection model
  const initializeModel = async () => {
    try {
      await tf.ready();
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      );
      modelRef.current = model;
      console.log('Emotion detection model loaded');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  // Detect emotion from video frame
  const detectEmotion = async () => {
    if (!videoRef.current || !modelRef.current) return;

    try {
      const predictions = await modelRef.current.estimateFaces({
        input: videoRef.current,
        returnTensors: false,
        flipHorizontal: false,
      });

      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        const emotion = analyzeEmotionFromLandmarks(landmarks);
        
        setCurrentEmotion(emotion);
        setEmotionTimeline((prev) => [
          ...prev,
          {
            emotion,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    }
  };

  // Analyze emotion based on facial landmarks
  const analyzeEmotionFromLandmarks = (landmarks: any) => {
    // Simplified emotion analysis based on facial landmarks
    // This is a basic implementation - real implementation would be more sophisticated
    
    try {
      // Eye landmarks
      const leftEye = landmarks.slice(33, 42);
      const rightEye = landmarks.slice(42, 48);
      const mouth = landmarks.slice(48, 68);
      const eyebrows = landmarks.slice(17, 27);
      
      // Calculate eye openness
      const leftEyeOpenness = Math.abs(leftEye[1][1] - leftEye[4][1]);
      const rightEyeOpenness = Math.abs(rightEye[1][1] - rightEye[4][1]);
      const avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;
      
      // Calculate mouth openness
      const mouthOpenness = Math.abs(mouth[13][1] - mouth[19][1]);
      
      // Calculate eyebrow height
      const leftEyebrowHeight = eyebrows[1][1] - eyebrows[2][1];
      const rightEyebrowHeight = eyebrows[3][1] - eyebrows[4][1];
      
      // Determine emotion based on metrics
      let emotion = 'neutral';
      
      if (mouthOpenness > 30 && avgEyeOpenness > 15) {
        emotion = 'happy';
      } else if (leftEyebrowHeight < -5 && rightEyebrowHeight < -5 && mouthOpenness < 10) {
        emotion = 'angry';
      } else if (avgEyeOpenness < 8 && mouthOpenness < 10) {
        emotion = 'sad';
      } else if (leftEyebrowHeight > 5 || rightEyebrowHeight > 5) {
        emotion = 'surprised';
      } else if (mouthOpenness > 25 && avgEyeOpenness < 10) {
        emotion = 'scared';
      }
      
      return emotion;
    } catch (error) {
      return 'neutral';
    }
  };

  const startDetection = async () => {
    await initializeModel();

    detectionIntervalRef.current = setInterval(() => {
      detectEmotion();
    }, 500); // Run detection every 500ms
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const getEmotionSummary = () => {
    if (emotionTimeline.length === 0) return null;

    const emotionCounts = emotionTimeline.reduce((acc: any, item: any) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.keys(emotionCounts).reduce((a: string, b: string) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    return {
      dominantEmotion,
      timeline: emotionTimeline,
      summary: emotionCounts,
    };
  };

  return {
    videoRef,
    canvasRef,
    emotionTimeline,
    currentEmotion,
    startDetection,
    stopDetection,
    getEmotionSummary,
  };
};

export default useEmotionDetection;
