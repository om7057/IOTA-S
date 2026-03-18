import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import useEnhancedEmotionDetection from '../../hooks/useEnhancedEmotionDetection';
import {
  EMOTION_EMOJIS,
  generateEmotionReport,
  type EmotionReport,
} from '../../utils/emotionReport';

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
};

type Quiz = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};

export default function QuizScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams();
  const { session } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emotionReport, setEmotionReport] = useState<EmotionReport | null>(null);
  const [cameraCollapsed, setCameraCollapsed] = useState(false);

  const {
    cameraRef,
    detectedMood,
    confidence,
    emotionTimeline,
    isDetecting,
    faceDetected,
    requestCamera,
    startDetection,
    stopDetection,
  } = useEnhancedEmotionDetection();

  useEffect(() => {
    if (session?.token && quizId) {
      fetchQuiz();
    }
  }, [session?.token, quizId]);

  useEffect(() => {
    const startEmotionTracking = async () => {
      if (!session?.token || !quizId || submitted) return;

      const hasAccess = await requestCamera();
      if (hasAccess && !isDetecting) {
        startDetection();
      }
    };

    startEmotionTracking();

    return () => {
      stopDetection();
    };
  }, [session?.token, quizId, submitted, requestCamera, startDetection, stopDetection, isDetecting]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: answer,
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredCount = (quiz?.questions.length || 0) - Object.keys(answers).length;
    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unansweredCount} unanswered question(s). Please answer all questions.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmitting(true);
    try {
      const generatedReport = generateEmotionReport(emotionTimeline);
      setEmotionReport(generatedReport);

      const response = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          emotionReport: generatedReport,
          emotionTimeline,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      const payload = data?.data || data;
      const scoredAnswers = payload?.progress?.answers || {};
      const correctCount = Object.values(scoredAnswers).filter((item: any) => item?.correct).length;
      const totalQuestions = quiz?.questions?.length || Object.keys(answers).length || 0;
      const scorePercentage =
        typeof payload?.scorePercentage === 'number'
          ? payload.scorePercentage
          : totalQuestions > 0
            ? Math.round((correctCount / totalQuestions) * 100)
            : 0;

      setResult({
        ...payload,
        correctCount,
        totalQuestions,
        scorePercentage,
        passed: typeof payload?.passed === 'boolean' ? payload.passed : scorePercentage >= 60,
        emotionReport: generatedReport,
      });
      setSubmitted(true);
      stopDetection();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Quiz not found</Text>
      </View>
    );
  }

  if (submitted && result) {
    // Results Screen
    const percentage = result.scorePercentage || 0;
    const isPassing = result.passed;
    const reportToShow = result.emotionReport || emotionReport;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultsContainer}>
        <View style={styles.resultcard}>
          <Ionicons
            name={isPassing ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color={isPassing ? '#4CAF50' : '#FFC107'}
          />
          <Text style={styles.resultTitle}>
            {isPassing ? 'Great Job! 🎉' : 'Good Effort! 💪'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {isPassing ? 'You passed the quiz!' : 'Keep practicing!'}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scorePercentage}>{Math.round(percentage)}%</Text>
          </View>
          <View style={styles.answersSection}>
            <Text style={styles.answersLabel}>Correct Answers</Text>
            <Text style={styles.answersCount}>
              {result.correctCount}/{result.totalQuestions}
            </Text>
          </View>
        </View>

        {reportToShow && (
          <View style={styles.emotionReportCard}>
            <Text style={styles.emotionReportTitle}>Emotion Report</Text>

            <View style={styles.emotionReportHeader}>
              <Text style={styles.emotionReportEmoji}>
                {EMOTION_EMOJIS[reportToShow.dominantEmotion] || '😊'}
              </Text>
              <View>
                <Text style={styles.emotionReportLabel}>Dominant Emotion</Text>
                <Text style={styles.emotionReportValue}>{reportToShow.dominantEmotion}</Text>
              </View>
            </View>

            <View style={styles.emotionMetricRow}>
              <View style={styles.emotionMetricBox}>
                <Text style={styles.emotionMetricNumber}>{reportToShow.totalDetections}</Text>
                <Text style={styles.emotionMetricText}>Detections</Text>
              </View>
              <View style={styles.emotionMetricBox}>
                <Text style={styles.emotionMetricNumber}>{reportToShow.emotionTransitions}</Text>
                <Text style={styles.emotionMetricText}>Shifts</Text>
              </View>
              <View style={styles.emotionMetricBox}>
                <Text style={styles.emotionMetricNumber}>{reportToShow.engagementLevel}</Text>
                <Text style={styles.emotionMetricText}>Engagement</Text>
              </View>
            </View>

            {reportToShow.distribution.slice(0, 3).map((item: any) => (
              <View key={item.emotion} style={styles.distributionRow}>
                <View style={styles.distributionLabelWrap}>
                  <Text style={styles.distributionEmoji}>{EMOTION_EMOJIS[item.emotion] || '😐'}</Text>
                  <Text style={styles.distributionLabel}>{item.emotion}</Text>
                </View>
                <Text style={styles.distributionValue}>{item.percentage}%</Text>
              </View>
            ))}

            {reportToShow.insights?.length > 0 && (
              <View style={styles.insightsBlock}>
                <Text style={styles.insightsTitle}>Insights</Text>
                {reportToShow.insights.slice(0, 2).map((insight: string, idx: number) => (
                  <Text key={idx} style={styles.insightText}>• {insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Quiz Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quiz Title</Text>
            <Text style={styles.detailValue}>{quiz.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Questions</Text>
            <Text style={styles.detailValue}>{result.totalQuestions}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Passing Score</Text>
            <Text style={styles.detailValue}>60%</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.finishButtonText}>Back to Quizzes</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Quiz Questions Screen
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id || ''];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.quizContent} contentContainerStyle={styles.quizContentInner}>
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Text style={styles.trackerTitle}>Facial Emotion Tracking</Text>
            <TouchableOpacity onPress={() => setCameraCollapsed((prev) => !prev)}>
              <Ionicons name={cameraCollapsed ? 'chevron-down' : 'chevron-up'} size={20} color="#4b7bec" />
            </TouchableOpacity>
          </View>

          {!cameraCollapsed && (
            <>
              <View style={styles.cameraPreviewWrap}>
                <CameraView ref={cameraRef} style={styles.cameraPreview} facing="front" />
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.trackerFooter}>
                <Text style={styles.currentEmotionText}>
                  {faceDetected ? `${EMOTION_EMOJIS[detectedMood || 'neutral'] || '😐'} ${detectedMood}` : 'Scanning face...'}
                </Text>
                <Text style={styles.confidenceText}>
                  {faceDetected ? `${confidence}%` : '--'}
                </Text>
              </View>
              <Text style={styles.samplesText}>Samples captured: {emotionTimeline.length}</Text>
            </>
          )}
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>

        {/* Question */}
        {currentQuestion && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options &&
                currentQuestion.options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      currentAnswer === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                  >
                    <View style={styles.optionIndicator}>
                      {currentAnswer === option && (
                        <View style={styles.optionIndicatorInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        currentAnswer === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentQuestionIndex === 0 ? '#ccc' : '#4b7bec'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Quiz</Text>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color="#4b7bec" />
          </TouchableOpacity>
        )}
      </View>
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
  quizContent: {
    flex: 1,
  },
  quizContentInner: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerSection: {
    marginBottom: 20,
  },
  trackerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  cameraPreviewWrap: {
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 10,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  trackerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentEmotionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  samplesText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  quizTitle: {
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
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: '#4b7bec',
    backgroundColor: '#e0e7ff',
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4b7bec',
  },
  optionText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  optionTextSelected: {
    color: '#4b7bec',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  submitButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  resultcard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  scoreCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  scoreSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4b7bec',
  },
  answersSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  answersLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  answersCount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  finishButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4b7bec',
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emotionReportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  emotionReportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  emotionReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emotionReportEmoji: {
    fontSize: 36,
  },
  emotionReportLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  emotionReportValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  emotionMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  emotionMetricBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  emotionMetricNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  emotionMetricText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  distributionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionEmoji: {
    fontSize: 18,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  distributionValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  insightsBlock: {
    marginTop: 8,
    backgroundColor: '#fefce8',
    borderRadius: 8,
    padding: 10,
  },
  insightsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#854d0e',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
});
