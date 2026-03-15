import { useEffect, useState } from 'react';

const StoryEmotionMonitor = ({ videoRef, emotionTimeline }) => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionCount, setEmotionCount] = useState(0);

  useEffect(() => {
    if (emotionTimeline.length > 0) {
      const latestEmotion = emotionTimeline[emotionTimeline.length - 1];
      setCurrentEmotion(latestEmotion.rawEmotion || latestEmotion.emotion);
      setEmotionCount(emotionTimeline.length);
    }
  }, [emotionTimeline]);

  // Map emotions to emojis
  const emotionEmojis = {
    happy: '😄',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    surprised: '😲',
    disgusted: '🤢',
    neutral: '😐',
  };

  // Map colors
  const emotionColors = {
    happy: 'bg-yellow-500',
    sad: 'bg-blue-500',
    angry: 'bg-red-500',
    fearful: 'bg-purple-500',
    surprised: 'bg-orange-500',
    disgusted: 'bg-green-500',
    neutral: 'bg-gray-500',
  };

  return (
    <div className="absolute top-6 right-6 w-48 rounded-2xl overflow-hidden shadow-xl border-3 border-white bg-white">
      {/* Video Feed */}
      <div className="relative bg-black h-32 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Live Indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          LIVE
        </div>

        {/* Current Emotion Badge */}
        {currentEmotion && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-2xl px-3 py-1 rounded-full shadow-lg">
            {emotionEmojis[currentEmotion] || '😊'}
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className={`${emotionColors[currentEmotion] || 'bg-gray-500'} text-white p-3 space-y-2`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-90">EMOTION TRACKED</p>
            <p className="text-lg font-bold capitalize">{currentEmotion || 'detecting...'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Detections</p>
            <p className="text-2xl font-bold">{emotionCount}</p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min((emotionCount / 30) * 100, 100)}%` }}
            />
          </div>
          <span className="opacity-90">{emotionCount} scans</span>
        </div>
      </div>
    </div>
  );
};

export default StoryEmotionMonitor;
