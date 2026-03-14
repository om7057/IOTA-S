import { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoriesPage = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_URL}/topics`);
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`);
        }
        const data = await response.json();
        const topicsArray = Array.isArray(data) ? data : [];
        setTopics(topicsArray);
        if (topicsArray.length > 0) {
          setSelectedTopic(topicsArray[0]);
          fetchStories(topicsArray[0].id || topicsArray[0].topic_id);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Fetch stories for selected topic
  const fetchStories = async (topicId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/topics/${topicId}/stories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }
      const data = await response.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    fetchStories(topic.id || topic.topic_id);
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📖 Safety Stories</h1>
        <p className="text-gray-600">Learn important lessons through engaging stories</p>
      </div>

      {/* Topic Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {topics.map((topic) => (
            <button
              key={topic.id || topic.topic_id}
              onClick={() => handleSelectTopic(topic)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedTopic?.id === topic.id || selectedTopic?.topic_id === topic.topic_id
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic.name || topic.topic_name}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No stories available yet.</p>
          </div>
        ) : (
          stories.map((story) => (
            <div
              key={story.id}
              onClick={() => navigate(`/story-play/${story.id}`)}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105 hover:border-sky-300"
            >
              {/* Story Icon */}
              <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>

              {/* Story Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{story.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description || 'An engaging safety story'}</p>

              {/* Story Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {story.content && typeof story.content === 'string' 
                    ? Math.ceil(story.content.length / 100) 
                    : Array.isArray(story.content) ? story.content.length : 1} sections
                </span>
                <button className="px-3 py-1 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
                  Read Story
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
