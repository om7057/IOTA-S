import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, BookOpen, Play, Search, Loader2, Info } from "lucide-react";

const QuizLandingPage = () => {
  const [storiesWithQuiz, setStoriesWithQuiz] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/stories");
        const allStories = await res.json();

        const filtered = [];

        for (const story of allStories) {
          const quizRes = await fetch(`http://localhost:5000/api/quiz/story/${story._id}`);
          const quizData = await quizRes.json();
          if (Array.isArray(quizData) && quizData.length > 0) {
            filtered.push(story);
          }
        }

        setStoriesWithQuiz(filtered);
      } catch (err) {
        console.error("Error fetching stories with quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Adventure</h1>
          <p className="text-gray-500">Pick a story and test what you've learned</p>
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
      ) : storiesWithQuiz.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-gray-500">Check back after reading more stories!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storiesWithQuiz.map((story) => (
            <div key={story._id} className="card p-6 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky-600 transition-colors truncate">
                    {story.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {story.description || "Test your knowledge about this story!"}
                  </p>
                </div>
              </div>
              <Link 
                to={`/quiz/${story._id}`}
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