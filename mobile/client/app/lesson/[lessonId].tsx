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

type Challenge = {
  id: string;
  question: string;
  type: 'SELECT' | 'ASSIST';
  order: number;
  ChallengeOptions?: ChallengeOption[];
};

type ChallengeOption = {
  id: string;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
};

type Lesson = {
  id: string;
  title: string;
  description?: string;
  Challenges: Challenge[];
};

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams();
  const { session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [emotionTimeline, setEmotionTimeline] = useState<any[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const emotionSamplingRef = useRef<any>(null);

  useEffect(() => {
    if (session?.token && lessonId) {
      fetchLesson();
      requestCameraPermission();
    }
  }, [session?.token, lessonId]);

  useEffect(() => {
    if (lesson && !lessonCompleted) {
      startEmotionSampling();
    }

    return () => {
      if (emotionSamplingRef.current) {
        clearInterval(emotionSamplingRef.current);
      }
    };
  }, [lesson, lessonCompleted]);

  const requestCameraPermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'We need camera access to track your emotions.');
      }
    }
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }

      const data = await response.json();
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startEmotionSampling = () => {
    emotionSamplingRef.current = setInterval(() => {
      const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      setCurrentEmotion(randomEmotion);
      setEmotionTimeline((prev) => [
        ...prev,
        {
          emotion: randomEmotion,
          timestamp: new Date(),
          challengeIndex: currentChallengeIndex,
        },
      ]);
    }, 2000);
  };

  const handleSubmitChallenge = async () => {
    if (!selectedOption) {
      Alert.alert('Please select an option');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/challenges/${lesson?.Challenges[currentChallengeIndex].id}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session?.user?.id,
            selectedOptionId: selectedOption,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      setFeedbackType(result.isCorrect ? 'correct' : 'incorrect');
      setFeedbackMessage(
        result.isCorrect ? '🎉 Correct!' : 'Almost there! Try again.'
      );
    } catch (error) {
      console.error('Error submitting challenge:', error);
      Alert.alert('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextChallenge = () => {
    if (!lesson) return;

    if (currentChallengeIndex < lesson.Challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setSelectedOption(null);
      setFeedbackMessage('');
      setFeedbackType('');
    } else {
      setLessonCompleted(true);
      setCameraVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  if (!lesson || lesson.Challenges.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No challenges found in this lesson.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (lessonCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completionCard}>
          <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          <Text style={styles.completionTitle}>Lesson Complete!</Text>
          <Text style={styles.completionText}>
            You've successfully completed all challenges in this lesson.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to Lessons</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentChallenge = lesson.Challenges[currentChallengeIndex];
  const progress = ((currentChallengeIndex + 1) / lesson.Challenges.length) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#4b7bec" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>
            Challenge {currentChallengeIndex + 1} of {lesson.Challenges.length}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>Progress</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* Emotion Tracker */}
      {cameraVisible && (
        <View style={styles.emotionContainer}>
          <CameraView style={styles.camera} facing="front" />
          {currentEmotion && (
            <View style={styles.emotionBadge}>
              <Text style={styles.emotionEmoji}>
                {EMOTION_EMOJIS[currentEmotion] || '😐'}
              </Text>
              <Text style={styles.emotionText}>{currentEmotion}</Text>
            </View>
          )}
        </View>
      )}

      {/* Challenge Content */}
      <View style={styles.challengeContainer}>
        <Text style={styles.questionTitle}>{currentChallenge.question}</Text>

        {/* Challenge Options */}
        <View style={styles.optionsContainer}>
          {currentChallenge.ChallengeOptions?.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => !feedbackMessage && setSelectedOption(option.id)}
              disabled={submitting || !!feedbackMessage}
            >
              <View
                style={[
                  styles.optionRadio,
                  selectedOption === option.id && styles.optionRadioSelected,
                ]}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option.id && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Message */}
        {feedbackMessage && (
          <View
            style={[
              styles.feedbackContainer,
              feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedbackType === 'correct' ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect,
              ]}
            >
              {feedbackMessage}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!feedbackMessage ? (
            <TouchableOpacity
              style={[styles.button, !selectedOption && styles.buttonDisabled]}
              onPress={handleSubmitChallenge}
              disabled={!selectedOption || submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleNextChallenge}
            >
              <Text style={styles.buttonText}>
                {currentChallengeIndex === lesson.Challenges.length - 1
                  ? 'Complete Lesson'
                  : 'Next Challenge'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b7bec',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4b7bec',
  },
  emotionContainer: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  emotionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emotionEmoji: {
    fontSize: 24,
  },
  emotionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  challengeContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  optionButtonSelected: {
    borderColor: '#4b7bec',
    backgroundColor: '#eff6ff',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: '#4b7bec',
    backgroundColor: '#4b7bec',
  },
  optionText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  feedbackContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackCorrect: {
    backgroundColor: '#d1fae5',
  },
  feedbackIncorrect: {
    backgroundColor: '#fef3c7',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#065f46',
  },
  feedbackTextIncorrect: {
    color: '#92400e',
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    backgroundColor: '#4b7bec',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
});
