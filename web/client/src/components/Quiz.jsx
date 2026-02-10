import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Lightbulb, ChevronLeft, ChevronRight, Check, Trophy, Award, BarChart3, BookOpen } from "lucide-react";

const Quiz = () => {
  const { storyId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [storyMeta, setStoryMeta] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);

  useEffect(() => {
    const fetchMongoUser = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/clerk/${user.id}`
        );
        const data = await res.json();
        setMongoUser(data);
      } catch (err) {
        console.error("Failed to fetch Mongo user:", err);
      }
    };
    fetchMongoUser();
  }, [user?.id]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/quiz/story/${storyId}`
        );
        const data = await response.json();
        setQuizList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };

    const fetchStoryMeta = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stories/${storyId}`);
        const data = await res.json();
        setStoryMeta(data);
      } catch (err) {
        console.error("Error fetching story meta:", err);
      }
    };

    fetchQuiz();
    fetchStoryMeta();
  }, [storyId]);

  const handleSelect = (quizId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [quizId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const correctAnswers = quizList.filter(
      (quiz) => answers[quiz._id] === quiz.correctAnswer
    );
    const calculatedScore = correctAnswers.length;
    setScore(calculatedScore);

    if (!storyMeta || !mongoUser?._id) {
      console.error("Missing storyMeta or mongoUser");
      return;
    }

    try {
      const progressPayload = {
        userId: mongoUser._id,
        story: storyId,
        score: calculatedScore,
        totalQuestions: quizList.length,
        topic: storyMeta.topic?._id,
        level: storyMeta.level?._id,
        answers: quizList.map((quiz) => ({
          quizId: quiz._id,
          selectedAnswer: answers[quiz._id] || null,
          isCorrect: answers[quiz._id] === quiz.correctAnswer,
        })),
      };

      const progressRes = await fetch(
        "http://localhost:5000/api/quiz-progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(progressPayload),
        }
      );

      if (!progressRes.ok) throw new Error("Failed to save quiz progress");

      console.log("✅ Quiz progress saved successfully!");
    } catch (err) {
      console.error("Error saving quiz progress:", err);
    }
  };

  const currentQuiz = quizList[currentIndex];
  const total = quizList.length;
  const progress = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Time</h1>
            <p className="text-gray-500 text-sm">{storyMeta?.title || 'Test your knowledge'}</p>
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
                    {currentQuiz.question}
                  </p>
                  <div className="space-y-3">
                    {currentQuiz.options.map((option, idx) => {
                      const isSelected = answers[currentQuiz._id] === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(currentQuiz._id, option)}
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
                      disabled={submitted}
                      className="btn bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Finish Quiz
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
        {submitted && (
          <div className="text-center py-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score / total >= 0.8 
                ? 'bg-amber-100 text-amber-600' 
                : score / total >= 0.5 
                  ? 'bg-sky-100 text-sky-600'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {score / total >= 0.8 ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <Award className="w-10 h-10" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {score} / {total}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {score / total >= 0.8
                ? "Amazing job! You're a superstar!"
                : score / total >= 0.5
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
