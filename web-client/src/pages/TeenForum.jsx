import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const TeenForum = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/groups`);
      setTopics(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching groups/topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/discussions/group/${groupId}`);
      setDiscussions(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/discussions/${discussionId}`);
      const discussion = response.data?.data;
      setSelectedDiscussion(discussion || null);
      setComments(discussion?.replies || []);
    } catch (error) {
      console.error('Error fetching discussion details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    setSelectedDiscussion(null);
    setComments([]);
    fetchDiscussions(topicId);
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !selectedTopic) return;

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/discussions`,
        {
          groupId: selectedTopic,
          title: newTitle,
          content: newContent,
          tags: [],
        },
        { headers: authHeaders() }
      );

      setNewTitle('');
      setNewContent('');
      setShowCreateForm(false);
      fetchDiscussions(selectedTopic);
    } catch (error) {
      console.error('Error creating discussion:', error);
      const message = error.response?.data?.error || 'Failed to create discussion. Join the group first.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedDiscussion) return;

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/discussions/${selectedDiscussion.id}/replies`,
        { content: newComment },
        { headers: authHeaders() }
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
      await axios.post(
        `${API_URL}/discussions/${discussionId}/like`,
        {},
        { headers: authHeaders() }
      );
      if (selectedDiscussion?.id === discussionId) {
        fetchDiscussionDetails(discussionId);
      }
      if (selectedTopic) {
        fetchDiscussions(selectedTopic);
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `${API_URL}/discussions/replies/${commentId}/like`,
        {},
        { headers: authHeaders() }
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Groups</h2>
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
                    <div className="text-sm opacity-75">{topic.memberCount || 0} members</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {!selectedTopic ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">Select a group to view discussions</p>
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
                        <span className="text-sm text-gray-500">{discussion.creator?.username || 'Unknown'}</span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-3">{discussion.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{discussion.replyCount || 0} replies</span>
                        <span>👍 {discussion.likeCount || 0}</span>
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
                      👍 {selectedDiscussion.likeCount || 0}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{selectedDiscussion.creator?.username || 'Unknown'}</p>
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
                          {comment.creator?.username || 'Unknown'}
                        </span>
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          👍 {comment.likeCount || 0}
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
