import { useEffect, useState } from 'react';
import { X, Video, Check, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useEnhancedEmotionDetection from '../hooks/useEnhancedEmotionDetection';

const FacialEmotionDetector = ({ isOpen, onClose, onEmotionSelected, moodOptions }) => {
  const {
    videoRef,
    canvasRef,
    detectedMood,
    confidence,
    faceDetected,
    isDetecting,
    loading,
    requestCamera,
    startDetection,
    stopDetection,
    stopCamera,
    getTopThreeEmotions,
  } = useEnhancedEmotionDetection();

  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [step, setStep] = useState('intro'); // 'intro' | 'scanning' | 'result'

  // Initialize camera
  useEffect(() => {
    if (isOpen && !isDetecting) {
      initializeCamera();
    }

    return () => {
      if (isDetecting) {
        stopDetection();
      }
    };
  }, [isOpen]);

  const initializeCamera = async () => {
    const hasAccess = await requestCamera();
    if (hasAccess) {
      setCameraReady(true);
      setPermissionDenied(false);
      setStep('scanning');
      setTimeout(() => startDetection(), 500);
    } else {
      setPermissionDenied(true);
      toast.error('Please allow camera access to use facial emotion detection');
    }
  };

  const handleConfirmEmotion = () => {
    if (detectedMood) {
      onEmotionSelected(detectedMood, confidence);
      handleClose();
      toast.success(`Emotion detected: ${detectedMood}! 🎉`);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCameraReady(false);
    setStep('intro');
    onClose();
  };

  if (!isOpen) return null;

  const emotionEmoji = moodOptions?.find(m => m.name === detectedMood)?.emoji || '😊';
  const topEmotions = getTopThreeEmotions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6 flex justify-between items-center sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">Face Recognition</h2>
            <p className="text-sky-100 text-sm">Let me read your emotions! 👀</p>
          </div>
          <button
            onClick={handleClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-gray-700 font-semibold">
                I can detect your emotions by looking at your face!
              </p>
              <p className="text-gray-600 text-sm">
                Make sure you're in good lighting and your face is clearly visible in the camera.
              </p>
              <button
                onClick={initializeCamera}
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                {loading ? 'Loading AI...' : 'Start Camera'}
              </button>
            </div>
          )}

          {/* Scanning Step */}
          {step === 'scanning' && (
            <div className="space-y-4">
              {/* Camera Feed */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={() => setCameraReady(true)}
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Face Detection Indicator */}
                <div className="absolute top-4 left-4">
                  <div
                    className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${
                      faceDetected
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        faceDetected ? 'animate-pulse bg-white' : 'bg-yellow-200'
                      }`}
                    />
                    {faceDetected ? 'Face detected' : 'Show your face'}
                  </div>
                </div>

                {/* Confidence Badge */}
                {faceDetected && detectedMood && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-xl">
                    <p className="text-2xl text-center mb-2">{emotionEmoji}</p>
                    <p className="font-bold text-center">{detectedMood}</p>
                    <p className="text-xs text-center text-gray-300">
                      {confidence}% confident
                    </p>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {!faceDetected && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 font-semibold text-sm">
                    Position your face in the camera frame to get started
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-sky-50 border-2 border-sky-300 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <p className="text-sky-800 text-sm">
                  <strong>Tip:</strong> Try different expressions - smile, frown, look surprised!
                </p>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  stopDetection();
                  setStep('intro');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Result Step (when emotion detected with high confidence) */}
          {faceDetected && detectedMood && confidence >= 60 && (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="text-7xl animate-bounce">{emotionEmoji}</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 capitalize">
                  {detectedMood}
                </h3>
                <p className="text-lg font-semibold text-sky-600">
                  {confidence}% confident
                </p>
              </div>

              {/* Top Emotions */}
              {topEmotions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600">Other possibilities:</p>
                  <div className="space-y-1">
                    {topEmotions.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="capitalize font-medium text-gray-700">
                          {item.emotion}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-300 rounded-full h-2">
                            <div
                              className="bg-sky-600 h-2 rounded-full"
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="text-gray-600 font-semibold text-xs w-8 text-right">
                            {item.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleConfirmEmotion}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Yes, that's me!
                </button>
                <button
                  onClick={() => setStep('scanning')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Permission Denied */}
          {permissionDenied && (
            <div className="space-y-4">
              <div className="text-5xl text-center">🚫</div>
              <p className="text-gray-700 font-semibold text-center">
                Camera access is required to use facial emotion detection.
              </p>
              <p className="text-gray-600 text-sm text-center">
                Please enable camera permissions in your browser settings.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FacialEmotionDetector;
