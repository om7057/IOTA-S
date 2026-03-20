import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lightbulb, BookOpen, Play, Search, Loader2, Info } from "lucide-react";

const QuizLandingPage = () => {
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get('storyId');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const endpoint = storyId
          ? `${apiUrl}/quizzes/story/${storyId}`
          : `${apiUrl}/quizzes`;

        const res = await fetch(endpoint);
        const payload = await res.json();

        if (storyId) {
          setQuizzes(payload?.data ? [payload.data] : []);
        } else {
          setQuizzes(payload?.data || []);
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [storyId]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Adventure</h1>
          <p className="text-gray-500">
            {storyId
              ? "Your story quiz is ready"
              : "Pick a story and test what you've learned"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
          <Lightbulb className="w-6 h-6" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-gray-500">
            {storyId
              ? "This story quiz could not be loaded right now."
              : "Check back later for new quizzes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card p-6 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky-600 transition-colors truncate">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {quiz.description || "Test your knowledge!"}
                  </p>
                </div>
              </div>
              <Link 
                to={`/quiz/${quiz.id}`}
                className="btn btn-primary w-full justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-gray-700 font-medium">Complete quizzes to earn special badges and climb the leaderboard!</p>
        </div>
      </div>
    </div>
  );
};

export default QuizLandingPage;