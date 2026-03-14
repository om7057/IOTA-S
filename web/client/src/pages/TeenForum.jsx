import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeenForum = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teen/discussions/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (topicId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/discussions/topics/${topicId}/discussions`);
      setDiscussions(response.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/discussions/discussions/${discussionId}`);
      setSelectedDiscussion(response.data);
      setComments(response.data.TeenComments || []);
    } catch (error) {
      console.error('Error fetching discussion details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    setSelectedDiscussion(null);
    fetchDiscussions(topicId);
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/teen/discussions/discussions',
        {
          topicId: selectedTopic,
          title: newTitle,
          content: newContent,
          isAnonymous
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewContent('');
      setIsAnonymous(false);
      setShowCreateForm(false);
      fetchDiscussions(selectedTopic);
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/discussions/discussions/${selectedDiscussion.id}/comments`,
        {
          content: newComment,
          isAnonymous
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchDiscussionDetails(selectedDiscussion.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/discussions/discussions/${discussionId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedDiscussion?.id === discussionId) {
        fetchDiscussionDetails(discussionId);
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/discussions/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedDiscussion) {
        fetchDiscussionDetails(selectedDiscussion.id);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Teen Forum</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Topics</h2>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedTopic === topic.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{topic.name}</div>
                    <div className="text-sm opacity-75">
                      {topic.TeenDiscussions?.length || 0} discussions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedTopic ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">Select a topic to view discussions</p>
              </div>
            ) : !selectedDiscussion ? (
              <>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="mb-6 px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                >
                  {showCreateForm ? 'Cancel' : 'Start New Discussion'}
                </button>

                {showCreateForm && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={handleCreateDiscussion} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Discussion Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <textarea
                        placeholder="What's on your mind?"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-32"
                        required
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-4 h-4 text-indigo-500"
                        />
                        <span className="text-gray-700">Post anonymously</span>
                      </label>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Posting...' : 'Post Discussion'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      onClick={() => fetchDiscussionDetails(discussion.id)}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{discussion.title}</h3>
                        <span className="text-sm text-gray-500">
                          {discussion.isAnonymous ? 'Anonymous' : discussion.User?.name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-3">{discussion.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{discussion.commentCount || 0} replies</span>
                        <span>👍 {discussion.likes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="mb-6 px-4 py-2 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  ← Back to discussions
                </button>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedDiscussion.title}</h2>
                    <button
                      onClick={() => handleLikeDiscussion(selectedDiscussion.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      👍 {selectedDiscussion.likes || 0}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {selectedDiscussion.isAnonymous
                      ? 'Anonymous'
                      : selectedDiscussion.User?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Comment</h3>
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-24"
                      required
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-indigo-500"
                      />
                      <span className="text-gray-700">Reply anonymously</span>
                    </label>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Comments ({comments.length})</h3>
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-600 font-semibold">
                          {comment.isAnonymous ? 'Anonymous' : comment.User?.name || 'Unknown'}
                        </span>
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          👍 {comment.likes || 0}
                        </button>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeenForum;
