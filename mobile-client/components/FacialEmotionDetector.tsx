import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import useEnhancedEmotionDetection from '../hooks/useEnhancedEmotionDetection';

interface FacialEmotionDetectorProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotionSelected: (emotion: string, confidence: number) => void;
  moodOptions?: Array<{ name: string; emoji: string; label: string }>;
}

const FacialEmotionDetector = ({ isOpen, onClose, onEmotionSelected, moodOptions = [] }: FacialEmotionDetectorProps) => {
  const {
    cameraRef,
    detectedMood,
    confidence,
    faceDetected,
    isDetecting,
    permission,
    requestCamera,
    startDetection,
    stopDetection,
    getTopThreeEmotions,
  } = useEnhancedEmotionDetection();

  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [step, setStep] = useState<'intro' | 'scanning' | 'result'>('intro');

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
      Alert.alert('Camera Access Required', 'Please allow camera access to use facial emotion detection');
    }
  };

  const handleConfirmEmotion = () => {
    if (detectedMood) {
      onEmotionSelected(detectedMood, confidence);
      handleClose();
      Alert.alert('Emotion Detected', `Great! You're feeling ${detectedMood}! 🎉`);
    }
  };

  const handleClose = () => {
    stopDetection();
    setCameraReady(false);
    setStep('intro');
    onClose();
  };

  if (!isOpen) return null;

  const emotionEmoji = moodOptions.find((m) => m.name === detectedMood)?.emoji || '😊';
  const topEmotions = getTopThreeEmotions();

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      {/* Header */}
      <View className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white">Face Recognition</Text>
          <Text className="text-sky-100 text-sm">Let me read your emotions! 👀</Text>
        </View>
        <TouchableOpacity onPress={handleClose} className="bg-white bg-opacity-20 p-2 rounded-full">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-white">
        {/* Intro Step */}
        {step === 'intro' && (
          <View className="flex-1 px-6 py-12 items-center justify-center">
            <Text className="text-6xl mb-6">📸</Text>
            <Text className="text-xl font-semibold text-gray-900 text-center mb-4">
              I can detect your emotions by looking at your face!
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Make sure you're in good lighting and your face is clearly visible in the camera.
            </Text>
            <TouchableOpacity
              onPress={initializeCamera}
              disabled={!permission?.granted}
              className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl px-8 py-4 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text className="text-white font-bold text-lg">Start Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanning Step */}
        {step === 'scanning' && cameraReady && (
          <View className="flex-1">
            {/* Camera Feed */}
            <View className="bg-black aspect-video overflow-hidden rounded-2xl mx-4 mt-4 relative">
              <CameraView ref={cameraRef} style={{ flex: 1 }} />

              {/* Live Indicator */}
              <View className="absolute top-4 left-4 bg-red-500 px-3 py-2 rounded-full flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-white" />
                <Text className="text-white text-xs font-bold">LIVE</Text>
              </View>

              {/* Current Emotion Badge */}
              {faceDetected && detectedMood && (
                <View className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full">
                  <Text className="text-3xl text-center mb-1">{emotionEmoji}</Text>
                  <Text className="text-gray-900 font-bold text-center">{detectedMood}</Text>
                  <Text className="text-xs text-gray-500 text-center">{confidence}% confident</Text>
                </View>
              )}
            </View>

            {/* Status Message */}
            {!faceDetected && (
              <View className="mx-4 mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 flex-row gap-3">
                <Ionicons name="alert-circle" size={20} color="#ca8a04" />
                <Text className="text-yellow-800 font-semibold text-sm flex-1">
                  Position your face in the camera frame
                </Text>
              </View>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => {
                stopDetection();
                setStep('intro');
              }}
              className="mx-4 mt-4 bg-gray-200 rounded-xl py-3 items-center mb-4"
            >
              <Text className="text-gray-800 font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result Step */}
        {faceDetected && detectedMood && confidence >= 60 && (
          <View className="flex-1 px-6 py-8 items-center justify-center">
            <Text className="text-7xl mb-6">{emotionEmoji}</Text>
            <Text className="text-3xl font-bold text-gray-900 capitalize text-center mb-2">
              {detectedMood}
            </Text>
            <Text className="text-xl font-semibold text-sky-600 mb-8">{confidence}% confident</Text>

            {/* Top Emotions */}
            {topEmotions.length > 0 && (
              <View className="w-full mb-8">
                <Text className="text-gray-700 font-semibold mb-3">Other possibilities:</Text>
                {topEmotions.map((item, idx) => (
                  <View
                    key={idx}
                    className="bg-gray-50 rounded-lg px-4 py-3 mb-2 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-700 font-medium capitalize">{item.emotion}</Text>
                    <View className="flex-row items-center gap-2 flex-1 ml-4">
                      <View className="flex-1 bg-gray-300 rounded-full h-2">
                        <View
                          className="bg-sky-600 h-2 rounded-full"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </View>
                      <Text className="text-gray-600 font-semibold text-xs w-10 text-right">
                        {item.confidence}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handleConfirmEmotion}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl py-4 flex-row items-center justify-center gap-2 mb-3"
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold text-lg">Yes, that's me!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep('scanning')}
              className="w-full bg-gray-200 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-800 font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Permission Denied */}
        {permissionDenied && (
          <View className="flex-1 px-6 py-12 items-center justify-center">
            <Text className="text-6xl mb-6">🚫</Text>
            <Text className="text-xl font-semibold text-gray-900 text-center mb-4">
              Camera access is required
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Please enable camera permissions in your device settings.
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="bg-gray-200 rounded-xl px-8 py-4 w-full items-center"
            >
              <Text className="text-gray-800 font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

export default FacialEmotionDetector;
