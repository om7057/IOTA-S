import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Forums.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Forums = () => {
  const { user, token: authToken } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newThreadInput, setNewThreadInput] = useState('');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [category, setCategory] = useState('all');
  const [groupId, setGroupId] = useState(localStorage.getItem('groupId') || '');

  const token = authToken || localStorage.getItem('token');
  const userId = user?.id || localStorage.getItem('userId');

  const getDisplayName = (u) => {
    if (!u) return 'Unknown';
    return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';
  };

  // Load threads on mount or when groupId changes
  useEffect(() => {
    if (groupId) {
      loadThreads();
    }
  }, [groupId, category]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/forums/group/${groupId}`, {
        params: { category: category !== 'all' ? category : undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads(response.data.data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (threadId) => {
    try {
      const response = await axios.get(`${API_URL}/forums/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedThread(response.data.data);
      setThreadReplies(response.data.data.replies || []);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadInput.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/forums`,
        {
          groupId,
          creatorId: userId,
          title: newThreadTitle,
          content: newThreadInput,
          category: 'discussion',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreads((prev) => [response.data.data, ...prev]);
      setNewThreadTitle('');
      setNewThreadInput('');
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleReplyToThread = async (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/forums/${selectedThread.id}/reply`,
        {
          threadId: selectedThread.id,
          userId,
          content: replyInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreadReplies((prev) => [...prev, response.data.data]);
      setReplyInput('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      await axios.post(`${API_URL}/forums/reply/${replyId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadThread(selectedThread.id); // Refresh replies
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  return (
    <div className="forums-container">
      <div className="forums-header">
        <h1>💬 Discussion Forums</h1>
        <p>Share ideas and help each other</p>
      </div>

      <div className="forums-content">
        <div className="forums-list">
          <div className="list-header">
            <h2>Threads</h2>
            <div className="category-filter">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                <option value="all">All Topics</option>
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
                <option value="announcement">Announcement</option>
                <option value="resource">Resource</option>
              </select>
            </div>
          </div>

          <div className="create-thread">
            <form onSubmit={handleCreateThread}>
              <input
                type="text"
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="thread-title-input"
              />
              <textarea
                placeholder="What would you like to discuss?"
                value={newThreadInput}
                onChange={(e) => setNewThreadInput(e.target.value)}
                className="thread-content-input"
                rows="3"
              />
              <button type="submit" className="btn-create-thread">
                ✨ Start Thread
              </button>
            </form>
          </div>

          <div className="threads-list">
            {loading ? (
              <div className="loading">Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className="no-threads">No threads yet. Start one!</div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`thread-item ${selectedThread?.id === thread.id ? 'active' : ''}`}
                  onClick={() => loadThread(thread.id)}
                >
                  {thread.isPinned && <span className="pin-badge">📌</span>}
                  <h3>{thread.title}</h3>
                  <p>{thread.content.substring(0, 80)}...</p>
                  <div className="thread-meta">
                    <span className="author">by {getDisplayName(thread.creator)}</span>
                    <span className="replies">💬 {thread.replyCount}</span>
                    <span className="category">{thread.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="thread-detail">
          {!selectedThread ? (
            <div className="no-selection">
              <h2>👈 Select a thread to start</h2>
              <p>Click on any thread to view and participate in discussions</p>
            </div>
          ) : (
            <>
              <div className="thread-header">
                <h2>{selectedThread.title}</h2>
                <div className="thread-actions">
                  {selectedThread.isPinned && <span className="badge pinned">📌 Pinned</span>}
                  {selectedThread.isResolved && <span className="badge resolved">✓ Resolved</span>}
                </div>
              </div>

              <div className="thread-owner">
                <span className="owner-avatar">👤</span>
                <div>
                  <strong>{getDisplayName(selectedThread.creator)}</strong>
                  <small>
                    {new Date(selectedThread.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>

              <div className="thread-content">
                <p>{selectedThread.content}</p>
              </div>

              <div className="thread-stats">
                <span>👁️ {selectedThread.viewCount} views</span>
                <span>❤️ {selectedThread.likeCount} likes</span>
                <span>💬 {selectedThread.replyCount} replies</span>
              </div>

              <div className="thread-replies">
                <h3>Replies ({threadReplies.length})</h3>

                {threadReplies.length === 0 ? (
                  <div className="no-replies">Be the first to reply!</div>
                ) : (
                  <div className="replies-list">
                    {threadReplies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <div className="reply-avatar">
                          {reply.isAnonymous ? '🔒' : '👤'}
                        </div>
                        <div className="reply-content">
                          <div className="reply-header">
                            <strong>
                              {reply.isAnonymous
                                ? reply.anonymousName
                                : getDisplayName(reply.creator)}
                            </strong>
                            <small>
                              {new Date(reply.createdAt).toLocaleString()}
                            </small>
                          </div>
                          <p>{reply.content}</p>
                          <div className="reply-actions">
                            <button
                              className="btn-like"
                              onClick={() => handleLikeReply(reply.id)}
                            >
                              ❤️ {reply.likeCount}
                            </button>
                            {reply.isMarked && (
                              <span className="best-answer">✓ Best Answer</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form className="reply-form" onSubmit={handleReplyToThread}>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    rows="3"
                  />
                  <button type="submit" className="btn-reply" disabled={!replyInput.trim()}>
                    Reply
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forums;
