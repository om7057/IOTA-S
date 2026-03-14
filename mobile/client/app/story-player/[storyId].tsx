import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

const EMOTIONS = ['happy', 'sad', 'excited', 'calm', 'confused', 'scared', 'angry'];
const EMOTION_EMOJIS: { [key: string]: string } = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  calm: '😌',
  confused: '🤔',
  scared: '😨',
  angry: '😠',
};

export default function StoryPlayerScreen() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams();
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [emotionTimeline, setEmotionTimeline] = useState<any[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const emotionSamplingRef = useRef<any>(null);

  useEffect(() => {
    if (session?.token && storyId) {
      fetchStory();
      requestCameraPermission();
    }
  }, [session?.token, storyId]);

  useEffect(() => {
    // Start emotion sampling when story loads
    if (story && !storyCompleted) {
      startEmotionSampling();
    }

    return () => {
      if (emotionSamplingRef.current) {
        clearInterval(emotionSamplingRef.current);
      }
    };
  }, [story, storyCompleted]);

  const requestCameraPermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'We need camera access to track your emotions during the story.');
      }
    }
  };

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories/${storyId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }

      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      Alert.alert('Error', 'Failed to load story');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startEmotionSampling = () => {
    emotionSamplingRef.current = setInterval(() => {
      // Simulate emotion detection by randomly sampling emotions
      // In a real app, this would come from actual facial recognition
      const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      setCurrentEmotion(randomEmotion);
      setEmotionTimeline((prev) => [
        ...prev,
        {
          emotion: randomEmotion,
          timestamp: new Date(),
          sceneIndex: currentSceneIndex,
        },
      ]);
    }, 2000); // Sample emotion every 2 seconds
  };

  const handleNextScene = () => {
    if (currentSceneIndex < (story?.content?.length || 0) - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    } else {
      // Story completed
      setStoryCompleted(true);
      setCameraVisible(false);
    }
  };

  const handlePreviousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
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
      counts: emotionCounts,
      total: emotionTimeline.length,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
        <Text style={styles.loadingText}>Loading your story...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Story not found</Text>
      </View>
    );
  }

  const currentScene = story.content ? story.content[currentSceneIndex] : null;
  const emotionSummary = getEmotionSummary();
  const progressPercentage = ((currentSceneIndex + 1) / (story.content?.length || 1)) * 100;

  return (
    <View style={styles.container}>
      {/* Camera View (Top Half) */}
      {cameraVisible && permission?.granted && (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="front">
            {currentEmotion && (
              <View style={styles.emotionIndicator}>
                <Text style={styles.emotionEmoji}>{EMOTION_EMOJIS[currentEmotion]}</Text>
                <Text style={styles.emotionLabel}>{currentEmotion}</Text>
              </View>
            )}
          </CameraView>
        </View>
      )}

      {/* Story Content (Bottom Half) */}
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentContainerInner}>
        {storyCompleted ? (
          // Completion Screen
          <View style={styles.completionContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.completionTitle}>Story Completed! 🎉</Text>
            <Text style={styles.completionSubtitle}>Great job reading the entire story!</Text>

            {emotionSummary && (
              <View style={styles.emotionSummary}>
                <Text style={styles.summaryTitle}>Your Emotional Journey</Text>
                <View style={styles.dominantEmotionBox}>
                  <Text style={styles.dominantEmotionEmoji}>
                    {EMOTION_EMOJIS[emotionSummary.dominantEmotion]}
                  </Text>
                  <View>
                    <Text style={styles.dominantLabel}>Dominant Emotion</Text>
                    <Text style={styles.dominantEmotion}>{emotionSummary.dominantEmotion}</Text>
                  </View>
                </View>

                <View style={styles.emotionStats}>
                  {Object.entries(emotionSummary.counts).map(([emotion, count]) => (
                    <View key={emotion} style={styles.emotionStatItem}>
                      <Text style={styles.emotionStatEmoji}>{EMOTION_EMOJIS[emotion]}</Text>
                      <Text style={styles.emotionStatCount}>{count as number}x</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.finishButtonText}>Back to Stories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Story Content
          <>
            {/* Title */}
            <View style={styles.headerSection}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Scene {currentSceneIndex + 1} of {story.content?.length || 1}
              </Text>
            </View>

            {/* Scene Content */}
            {currentScene && (
              <View style={styles.sceneContainer}>
                <Text style={styles.sceneTitle}>{currentScene.title || `Scene ${currentSceneIndex + 1}`}</Text>
                <Text style={styles.sceneContent}>{currentScene.content || currentScene}</Text>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentSceneIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={handlePreviousScene}
                disabled={currentSceneIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={currentSceneIndex === 0 ? '#ccc' : '#4b7bec'}
                />
                <Text
                  style={[
                    styles.navButtonText,
                    currentSceneIndex === 0 && styles.navButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNextScene}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    currentSceneIndex === (story.content?.length || 1) - 1 &&
                      styles.navButtonFinish,
                  ]}
                >
                  {currentSceneIndex === (story.content?.length || 1) - 1 ? 'Finish' : 'Next'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={currentSceneIndex === (story.content?.length || 1) - 1 ? '#4CAF50' : '#4b7bec'}
                />
              </TouchableOpacity>
            </View>

            {/* Emotion Timeline */}
            {emotionTimeline.length > 0 && (
              <View style={styles.emotionTimelineContainer}>
                <Text style={styles.timelineTitle}>Your Emotions So Far</Text>
                <View style={styles.emotionTimeline}>
                  {emotionTimeline.slice(-5).map((item, index) => (
                    <View key={index} style={styles.timelineEmoji}>
                      <Text>{EMOTION_EMOJIS[item.emotion]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginTop: 12,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 10,
    marginTop: 10,
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  emotionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainerInner: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerSection: {
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4b7bec',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  sceneContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sceneContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4b7bec',
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b7bec',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  navButtonFinish: {
    color: '#4CAF50',
  },
  emotionTimelineContainer: {
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emotionTimeline: {
    flexDirection: 'row',
    gap: 8,
  },
  timelineEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  emotionSummary: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dominantEmotionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  dominantEmotionEmoji: {
    fontSize: 40,
  },
  dominantLabel: {
    fontSize: 12,
    color: '#999',
  },
  dominantEmotion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  emotionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionStatItem: {
    flex: 0.31,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  emotionStatEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionStatCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  finishButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4b7bec',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
