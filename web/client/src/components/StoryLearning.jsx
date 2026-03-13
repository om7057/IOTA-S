import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Scale, Briefcase, Hand, Lock, BookOpen, Frown, ChevronRight } from "lucide-react";

const StoryLearning = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching topics", err);
        setLoading(false);
      });
  }, []);

  // Topic icons mapping
  const getTopicIcon = (topicName) => {
    const name = topicName?.toLowerCase() || "";
    if (name.includes("abuse")) return <Shield className="w-8 h-8" />;
    if (name.includes("exploitation")) return <Scale className="w-8 h-8" />;
    if (name.includes("labour") || name.includes("labor")) return <Briefcase className="w-8 h-8" />;
    if (name.includes("rights")) return <Hand className="w-8 h-8" />;
    if (name.includes("safety") || name.includes("online")) return <Lock className="w-8 h-8" />;
    return <BookOpen className="w-8 h-8" />;
  };

  // Topic colors mapping - using solid colors instead of gradients
  const getTopicColor = (index) => {
    const colors = [
      "bg-sky-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-rose-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Topics</h1>
        <p className="text-gray-500">
          Choose a topic to explore through interactive stories and activities
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <button
              key={topic._id}
              className="card card-hover p-6 text-left group"
              onClick={() => navigate(`/levels/${topic._id}`)}
            >
              <div className={`w-14 h-14 rounded-xl ${getTopicColor(index)} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {getTopicIcon(topic.name)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                {topic.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {topic.description || "Learn about this important topic through interactive stories"}
              </p>
              <div className="flex items-center justify-between">
                <span className="badge badge-primary">
                  {topic.levelCount || 'Multiple'} levels
                </span>
                <span className="text-sky-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Explore
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Frown className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics available</h3>
          <p className="text-gray-500">Check back later for new learning content!</p>
        </div>
      )}
    </div>
  );
};

export default StoryLearning;