import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lightbulb, ChevronLeft, ChevronRight, Check, Trophy, Award, BarChart3, BookOpen } from "lucide-react";

const Quiz = () => {
  const { quizId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(
          `${apiUrl}/quizzes/${quizId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        const payload = await response.json();
        setQuiz(payload?.data || null);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const questions = useMemo(() => {
    const source = quiz?.questions || [];
    return [...source].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [quiz]);

  const handleSelect = (questionId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!token || !quizId) {
      return;
    }

    if (questions.length && Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const progressRes = await fetch(
        `${apiUrl}/quizzes/${quizId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
          }),
        }
      );

      if (!progressRes.ok) throw new Error("Failed to save quiz progress");

      const payload = await progressRes.json();
      const data = payload?.data || {};
      const correctCount = Object.values(data?.progress?.answers || {}).filter((item) => item?.correct).length;

      setResult({
        ...data,
        correctCount,
        totalQuestions: questions.length,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error saving quiz progress:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuiz = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto card p-8 text-center">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Time</h1>
            <p className="text-gray-500 text-sm">{quiz?.title || 'Test your knowledge'}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

        {total > 0 && (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Question {currentIndex + 1} of {total}</span>
                <span className="text-sm font-medium text-sky-600">{progress}%</span>
              </div>
              <div className="progress-bar h-2">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {!submitted && currentQuiz && (
              <>
                {/* Question Card */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <p className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQuiz.prompt || currentQuiz.question}
                  </p>
                  <div className="space-y-3">
                    {(Array.isArray(currentQuiz.options) ? currentQuiz.options : []).map((option, idx) => {
                      const questionId = currentQuiz.id;
                      const isSelected = answers[questionId] === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(questionId, option)}
                          className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 ${
                            isSelected
                              ? "bg-white border-2 border-sky-500 shadow-sm"
                              : "bg-white/60 border-2 border-transparent hover:bg-white hover:border-gray-200"
                          }`}
                          disabled={submitted}
                        >
                          <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-semibold transition-colors ${
                            isSelected 
                              ? "bg-sky-600 text-white" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {option}
                          </span>
                          {isSelected && (
                            <Check className="w-5 h-5 text-sky-600 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </button>
                  
                  {currentIndex === total - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={submitted || submitting}
                      className="btn bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Finish Quiz'}
                      <Check className="w-5 h-5 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
                      className="btn btn-primary"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {total === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz available</h3>
            <p className="text-gray-500">Please check back later!</p>
          </div>
        )}

        {/* Results */}
        {submitted && result && (
          <div className="text-center py-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              result.scorePercentage / 100 >= 0.8 
                ? 'bg-amber-100 text-amber-600' 
                : result.scorePercentage / 100 >= 0.5 
                  ? 'bg-sky-100 text-sky-600'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {result.scorePercentage / 100 >= 0.8 ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <Award className="w-10 h-10" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {result.correctCount} / {result.totalQuestions}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {result.scorePercentage / 100 >= 0.8
                ? "Amazing job! You're a superstar!"
                : result.scorePercentage / 100 >= 0.5
                  ? "Good work! Keep learning!"
                  : "Nice try! Let's learn more!"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/leaderboard")}
                className="btn btn-primary"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                See Leaderboard
              </button>
              <button
                onClick={() => navigate("/story-learning")}
                className="btn btn-secondary"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
