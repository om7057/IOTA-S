import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

// Map face-api expressions to mood options
const emotionMap = {
  neutral: 'calm',
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  fearful: 'scared',
  disgusted: 'angry',
  surprised: 'excited',
};

const useEnhancedEmotionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [allExpressions, setAllExpressions] = useState(null);
  const intervalRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("✅ FaceAPI models loaded");
        setLoading(false);
      } catch (err) {
        console.error("❌ Error loading models:", err);
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Request camera access
  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return true;
    } catch (error) {
      console.error("Camera access denied:", error);
      return false;
    }
  }, []);

  // Detect emotion and draw canvas
  const detectEmotion = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      return;
    }

    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (result?.expressions) {
        setFaceDetected(true);
        setAllExpressions(result.expressions);

        // Find dominant emotion
        const entries = Object.entries(result.expressions);
        const [emotion, value] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
        const mappedMood = emotionMap[emotion] || emotion;
        const confidenceScore = Math.round(value * 100);

        setDetectedEmotion(emotion);
        setDetectedMood(mappedMood);
        setConfidence(confidenceScore);

        // Add to timeline
        setEmotionTimeline((prev) => [
          ...prev,
          {
            time: new Date().toISOString(),
            emotion: mappedMood,
            rawEmotion: emotion,
            confidence: confidenceScore,
            allExpressions: result.expressions,
          },
        ]);

        // Draw canvas overlay if available
        if (canvasRef.current && videoRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        }
      } else {
        setFaceDetected(false);
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
      setFaceDetected(false);
    }
  }, []);

  const startDetection = useCallback(() => {
    if (loading) return;
    setIsDetecting(true);

    if (!intervalRef.current) {
      intervalRef.current = setInterval(detectEmotion, 1000);
    }
  }, [detectEmotion, loading]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopDetection();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  }, [stopDetection]);

  const getTopThreeEmotions = useCallback(() => {
    if (!allExpressions) return [];
    return Object.entries(allExpressions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion, value]) => ({
        emotion: emotionMap[emotion] || emotion,
        rawEmotion: emotion,
        confidence: Math.round(value * 100),
      }));
  }, [allExpressions]);

  return {
    videoRef,
    canvasRef,
    detectedEmotion,
    detectedMood,
    confidence,
    emotionTimeline,
    loading,
    isDetecting,
    faceDetected,
    allExpressions,
    requestCamera,
    startDetection,
    stopDetection,
    stopCamera,
    getTopThreeEmotions,
  };
};

export default useEnhancedEmotionDetection;
