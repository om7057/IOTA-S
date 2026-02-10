import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useEmotionDetection } from "./useEmotionDetection";

const EmotionTracker = ({ userId, storyId, quizActive, onEmotionDataUpdate }) => {
  const { videoRef, emotionTimeline, loading } = useEmotionDetection(quizActive);

  useEffect(() => {
    let localStream;

    if (quizActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          localStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
        });
    }

    // Cleanup: Stop webcam when component unmounts or quiz ends
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [quizActive, videoRef]);

  // Send emotion data to parent component when it updates
  useEffect(() => {
    if (onEmotionDataUpdate) {
      onEmotionDataUpdate(emotionTimeline);
    }
  }, [emotionTimeline, onEmotionDataUpdate]);

  return (
    // <div style={{ display: "none" }}>
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="300"
        height="200"
      />
    </div>
  );
};

EmotionTracker.propTypes = {
  userId: PropTypes.string,
  storyId: PropTypes.string,
  quizActive: PropTypes.bool,
  onEmotionDataUpdate: PropTypes.func,
};

export default EmotionTracker;
