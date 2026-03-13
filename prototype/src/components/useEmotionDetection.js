import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

const useEmotionDetection = () => {
  const videoRef = useRef(null);
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

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
      }
    };

    loadModels();
  }, []);

  const detectEmotion = async () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === 4
    ) {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (result?.expressions) {
        const dominantEmotion = Object.entries(result.expressions).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];

        console.log("😶 Detected emotion:", dominantEmotion);
        setEmotionTimeline((prev) => [
          ...prev,
          { time: new Date().toISOString(), emotion: dominantEmotion },
        ]);
      }
    }
  };

  const startDetection = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(detectEmotion, 3000);
    }
  }, []);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { videoRef, emotionTimeline, loading, startDetection, stopDetection };
};

export default useEmotionDetection;
