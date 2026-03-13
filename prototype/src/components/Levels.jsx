import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, BookOpen, Lightbulb, Zap, Star, Sparkles, BadgeCheck, AlertCircle, Search, ChevronRight } from "lucide-react";
import { API_CONFIG } from "../config/api";

const Levels = () => {
  const { topicId } = useParams();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicName, setTopicName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch(API_CONFIG.TOPICS);
        // Get topic name from the topics list
        const topicsData = await response.json();
        const currentTopic = topicsData.find(t => t._id === topicId);
        setTopicName(currentTopic?.name || "Topic");
      } catch (err) {
        console.error("Error fetching topic details", err);
      }
    };

    const fetchLevels = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_CONFIG.LEVELS(topicId));
        const data = await response.json();
        setLevels(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching levels", err);
        setError("Couldn't load levels. Let's try again!");
        setLoading(false);
      }
    };

    fetchTopic();
    fetchLevels();
  }, [topicId]);

  // Level colors - solid colors instead of gradients
  const levelColors = [
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];

  // Level icons using Lucide
  const levelIcons = [
    <BookOpen key="1" className="w-6 h-6" />,
    <Lightbulb key="2" className="w-6 h-6" />,
    <Zap key="3" className="w-6 h-6" />,
    <Star key="4" className="w-6 h-6" />,
    <Sparkles key="5" className="w-6 h-6" />,
    <BadgeCheck key="6" className="w-6 h-6" />,
  ];

  const getLevelIcon = (levelNum) => {
    return levelIcons[(levelNum - 1) % levelIcons.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Topics
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{topicName}</h1>
        <p className="text-gray-500">Choose a level to start your learning journey</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="card p-8 text-center border-red-100 bg-red-50">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Levels grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.length > 0 ? (
            levels.map((level, index) => (
              <button
                key={level._id}
                className="card card-hover p-6 text-left group"
                onClick={() => navigate(`/stories/${level._id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${levelColors[index % levelColors.length]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {getLevelIcon(level.levelNumber)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                        Level {level.levelNumber}
                      </h3>
                      <span className="badge badge-primary">
                        {level.storyCount || "Multiple"} stories
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {level.description || "Learn through interactive stories and activities!"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-24">
                          <div className="progress-fill" style={{ width: '0%' }}></div>
                        </div>
                        <span className="text-xs text-gray-400">0%</span>
                      </div>
                      <span className="text-sky-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center">
                        Start
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 card p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No levels found</h3>
              <p className="text-gray-500">Check back soon for new content!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Levels;