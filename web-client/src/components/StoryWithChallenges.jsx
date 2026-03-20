import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useEmotionDetection from "./useEmotionDetection";
import StoryEmotionMonitor from "./StoryEmotionMonitor";
import EmotionSummary from "./EmotionSummary";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const normalizeOptionText = (text = '') =>
  String(text)
    .replace(/^[\s\uFE0F\u200D\p{Extended_Pictographic}✓✔✗✕☑☒]+/gu, '')
    .replace(/^[-:.)\]]+\s*/, '')
    .trim();

const StoryWithChallenges = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // 'correct' or 'incorrect'
  const [submitting, setSubmitting] = useState(false);

  const {
    videoRef,
    emotionTimeline,
    startDetection,
    stopDetection,
  } = useEmotionDetection();

  // Fetch lesson with challenges
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/lessons/${lessonId}`);
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        setLesson(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Setup emotion detection
  useEffect(() => {
    let localStream;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        localStream = stream;

        const waitForVideoRef = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
            requestAnimationFrame(waitForVideoRef);
          }
        };
        waitForVideoRef();

        startDetection();
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      stopDetection();
    };
  }, [videoRef, startDetection, stopDetection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card p-8 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Error Loading Lesson</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !lesson.Challenges || lesson.Challenges.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card p-8 text-center">
          <p className="text-gray-600">No challenges found in this lesson.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentChallenge = lesson.Challenges[currentChallengeIndex];
  const progress = ((currentChallengeIndex + 1) / lesson.Challenges.length) * 100;
  const isLastChallenge = currentChallengeIndex === lesson.Challenges.length - 1;

  const handleOptionSelect = (optionId) => {
    if (feedbackMessage) return; // Prevent changing selection after feedback
    setSelectedOption(optionId);
  };

  const handleSubmitChallenge = async () => {
    if (!selectedOption) {
      setFeedbackMessage("Please select an option");
      setFeedbackType("error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/challenges/${currentChallenge.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            selectedOptionId: selectedOption,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit answer");
      
      const result = await res.json();
      
      if (result.isCorrect) {
        setFeedbackType("correct");
        setFeedbackMessage("🎉 Correct! Great job!");
      } else {
        setFeedbackType("incorrect");
        setFeedbackMessage("Almost there! Try to think about it again.");
      }
    } catch (err) {
      setFeedbackMessage("Error submitting answer");
      setFeedbackType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextChallenge = () => {
    if (isLastChallenge) {
      setLessonCompleted(true);
      stopDetection();
    } else {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setSelectedOption(null);
      setFeedbackMessage("");
      setFeedbackType("");
    }
  };

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(currentChallengeIndex - 1);
      setSelectedOption(null);
      setFeedbackMessage("");
      setFeedbackType("");
    }
  };

  if (lessonCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <EmotionSummary emotionTimeline={emotionTimeline} />
        <div className="card p-8 text-center mt-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete! 🎉</h2>
          <p className="text-gray-600 mb-6">
            You've successfully completed all challenges in this lesson.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-500 mt-1">
              Challenge {currentChallengeIndex + 1} of {lesson.Challenges.length}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Emotion Monitor */}
      <StoryEmotionMonitor videoRef={videoRef} emotionTimeline={emotionTimeline} />

      {/* Challenge */}
      <div className="card p-8 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentChallenge.question}
        </h2>

        {/* Challenge Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentChallenge.ChallengeOptions?.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={submitting || !!feedbackMessage}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedOption === option.id
                  ? "border-sky-600 bg-sky-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              } ${submitting || feedbackMessage ? "opacity-75 cursor-not-allowed" : ""} ${
                feedbackMessage && option.correct ? "border-emerald-600 bg-emerald-50" : ""
              } ${
                feedbackMessage && !option.correct && selectedOption === option.id
                  ? "border-red-600 bg-red-50"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option.id
                      ? "border-sky-600 bg-sky-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-gray-900">{normalizeOptionText(option.text)}</span>
                {feedbackMessage && option.correct && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />
                )}
                {feedbackMessage && !option.correct && selectedOption === option.id && (
                  <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              feedbackType === "correct"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : feedbackType === "incorrect"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePreviousChallenge}
            disabled={currentChallengeIndex === 0 || submitting}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {!feedbackMessage ? (
            <button
              onClick={handleSubmitChallenge}
              disabled={!selectedOption || submitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Answer"}
            </button>
          ) : (
            <button
              onClick={handleNextChallenge}
              className="btn btn-primary"
            >
              {isLastChallenge ? "Complete Lesson" : "Next Challenge"}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryWithChallenges;
