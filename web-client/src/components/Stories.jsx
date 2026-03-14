import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Shield, Scale, BookOpen, ChevronRight } from "lucide-react";

const Stories = () => {
  const { levelId } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/stories")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((story) => story.level?._id === levelId);
        setStories(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stories", err);
        setLoading(false);
      });
  }, [levelId]);

  // Story icon based on topic
  const getStoryIcon = (topicName) => {
    const name = topicName?.toLowerCase() || "";
    if (name.includes("abuse")) return <Shield className="w-6 h-6" />;
    if (name.includes("exploitation")) return <Scale className="w-6 h-6" />;
    return <BookOpen className="w-6 h-6" />;
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
          Back to Levels
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Story</h1>
        <p className="text-gray-500">Select a story to begin your learning adventure</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <button
              key={story._id}
              className="card card-hover p-6 text-left group"
              onClick={() => navigate(`/story-play/${story._id}`)}
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                {getStoryIcon(story.topic?.name)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors line-clamp-1">
                {story.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {story.description || "An interactive story to help you learn"}
              </p>
              <div className="flex items-center justify-between">
                <span className="badge badge-primary">
                  {story.topic?.name || "General"}
                </span>
                <span className="text-sky-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Read
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories available</h3>
          <p className="text-gray-500 mb-6">There are no stories for this level yet.</p>
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Stories;