import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Adjust the path if needed
import { BookOpen, Shield, FlaskConical, Calculator, BookText, PenLine, Heart, Leaf, Laptop, Palette, Music, CircleDot, Search, Loader2 } from "lucide-react";

const TopicList = ({ onSelect }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching topics:", error.message);
      } else {
        setTopics(data);
      }

      setLoading(false);
    };

    fetchTopics();
  }, []);

  const topicIcons = {
    default: <BookOpen className="w-7 h-7" />,
    safety: <Shield className="w-7 h-7" />,
    science: <FlaskConical className="w-7 h-7" />,
    math: <Calculator className="w-7 h-7" />,
    reading: <BookText className="w-7 h-7" />,
    writing: <PenLine className="w-7 h-7" />,
    health: <Heart className="w-7 h-7" />,
    environment: <Leaf className="w-7 h-7" />,
    technology: <Laptop className="w-7 h-7" />,
    art: <Palette className="w-7 h-7" />,
    music: <Music className="w-7 h-7" />,
    sports: <CircleDot className="w-7 h-7" />,
  };

  const getTopicIcon = (topic) => {
    const category = topic.category?.toLowerCase() || "";
    return topicIcons[category] || topicIcons.default;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading topics...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Adventure</h2>
        <p className="text-gray-500">Select a topic to start learning</p>
      </div>
      
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className="card p-6 text-center hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                {getTopicIcon(topic)}
              </div>
              <span className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                {topic.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics available</h3>
          <p className="text-gray-500">Check back soon for new content!</p>
        </div>
      )}
    </div>
  );
};

export default TopicList;