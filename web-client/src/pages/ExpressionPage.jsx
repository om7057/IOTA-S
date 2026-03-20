import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpressionPage = () => {
  const { user, token, age, userType } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Only show for teenagers
  if (userType !== 'teenager' && age < 13) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600">This feature is for teenagers only</p>
        </div>
      </div>
    );
  }

  const getDisplayName = (u) => {
    if (!u) return 'Unknown';
    return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';
  };

  const getPostCategoriesForTopic = (topic) => {
    if (!topic?.category) return [];
    switch (topic.category) {
      case 'news':
        return ['news'];
      case 'learning':
        return ['resource', 'question', 'advice'];
      case 'wellbeing':
        return ['story', 'advice', 'question'];
      case 'safety':
        return ['advice', 'news', 'resource'];
      case 'emotions':
        return ['story', 'question'];
      case 'general':
      default:
        return [];
    }
  };

  // Fetch topics and social posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/topics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/social/feed/${user?.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (topicsRes.ok) {
          const topicsJson = await topicsRes.json();
          const topicsData = Array.isArray(topicsJson) ? topicsJson : (topicsJson?.data || []);
          setTopics(Array.isArray(topicsData) ? topicsData : []);
          if (Array.isArray(topicsData) && topicsData.length > 0) {
            setSelectedTopic(topicsData[0].id);
          }
        } else {
          setTopics([]);
        }

        if (postsRes.ok) {
          const postsJson = await postsRes.json();
          const postsData = Array.isArray(postsJson) ? postsJson : (postsJson?.data || []);
          const safePosts = Array.isArray(postsData) ? postsData : [];
          setPosts(safePosts);
          setFilteredPosts(safePosts);
        } else {
          setPosts([]);
          setFilteredPosts([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.id) {
      fetchData();
    }
  }, [token, user?.id]);

  // Filter posts by topic category mapping
  useEffect(() => {
    if (selectedTopic) {
      const topic = topics.find((t) => t.id === selectedTopic);
      const allowedCategories = getPostCategoriesForTopic(topic);
      if (allowedCategories.length === 0) {
        setFilteredPosts(posts);
      } else {
        setFilteredPosts(posts.filter((post) => allowedCategories.includes(post.category)));
      }
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedTopic, posts, topics]);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const selectedTopicObj = topics.find((t) => t.id === selectedTopic);
      const topicCategories = getPostCategoriesForTopic(selectedTopicObj);
      const mappedCategory = topicCategories[0] || 'other';

      const response = await fetch(`${API_URL}/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          userId: user.id,
          category: mappedCategory,
          isAnonymous: false,
        })
      });

      if (response.ok) {
        const createdJson = await response.json();
        const createdPost = createdJson?.data || createdJson;
        setPosts([createdPost, ...posts]);
        setNewPost({ title: '', content: '' });
        setShowModal(false);
        toast.success('Post created successfully!');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('An error occurred');
    }
  };

  // Handle like
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/social/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update posts with like
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, likes: (post.likes || 0) + 1, userLiked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expression</h1>
          <p className="text-gray-600">Share your thoughts and connect with others</p>
        </div>

        {/* Topic Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {(Array.isArray(topics) ? topics : []).map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedTopic === topic.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create a Post
        </button>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 border border-gray-100">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">{post.isAnonymous ? (post.anonymousName || 'Anonymous') : getDisplayName(post.creator)} • {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4">{post.content}</p>

                {/* Engagement Stats */}
                <div className="flex gap-6 text-sm text-gray-600 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 hover:text-red-600 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-red-600 text-red-600' : ''}`} />
                    {post.likes || 0}
                  </button>
                  <button className="flex items-center gap-2 hover:text-sky-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments?.length || 0}
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600">No posts yet in this topic</p>
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create a Post</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's on your mind?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="flex-1 px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpressionPage;
