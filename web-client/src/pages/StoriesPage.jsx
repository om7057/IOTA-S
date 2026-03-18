import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoryCard from '../components/StoryCard';

const StoriesPage = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/topics`);
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`);
        }
        const result = await response.json();
        const topicsArray = result.data ? (Array.isArray(result.data) ? result.data : []) : (Array.isArray(result) ? result : []);
        setTopics(topicsArray);
        
        // Fetch news stories (all initially)
        fetchStories(null);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setError('Failed to load topics');
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Fetch news stories
  const fetchStories = async (topicId) => {
    try {
      setLoading(true);
      let url = `${API_URL}/news-stories`;
      if (topicId) {
        url = `${API_URL}/news-stories/topic/${topicId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }
      const result = await response.json();
      
      // Handle both data: [] and direct array responses
      const storiesArray = result.data 
        ? (Array.isArray(result.data) ? result.data : []) 
        : (Array.isArray(result) ? result : []);
      setStories(storiesArray);
      setError(null);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topicId) => {
    setSelectedTopic(topicId);
    fetchStories(topicId);
  };

  const handleClearFilter = () => {
    setSelectedTopic(null);
    fetchStories(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📖 Safety Stories & News</h1>
        <p className="text-gray-600">Learn important lessons through engaging stories and educational news</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Topic Filter */}
      {topics.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-4">
            <button
              onClick={handleClearFilter}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedTopic === null
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Stories
            </button>
            
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedTopic === topic.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{topic.icon || '📚'}</span>
                {topic.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      ) : stories.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No stories available yet.</p>
          <p className="text-gray-400 mt-2">Check back soon for new educational stories and news!</p>
        </div>
      ) : (
        // Stories Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesPage;
