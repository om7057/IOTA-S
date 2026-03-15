import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SocialFeed.css';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const userId = localStorage.getItem('userId') || 'demo-user';
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/social/feed/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 },
      });
      setPosts(response.data.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const response = await axios.post(
        '/api/social',
        {
          userId,
          title: postTitle || null,
          content: newPostContent,
          category: postCategory,
          isAnonymous,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) => [response.data.data, ...prev]);
      setNewPostContent('');
      setPostTitle('');
      setPostCategory('other');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await axios.post(`/api/social/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content?.trim()) return;

    try {
      await axios.post(
        `/api/social/${postId}/comment`,
        { postId, userId, content, isAnonymous: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewComments((prev) => ({ ...prev, [postId]: '' }));
      loadFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      advice: '#FFD700',
      story: '#FF69B4',
      question: '#87CEEB',
      achievement: '#90EE90',
      resource: '#DDA0DD',
      news: '#FFB6C1',
      other: '#D3D3D3',
    };
    return colors[category] || '#D3D3D3';
  };

  return (
    <div className="social-feed-container">
      <div className="feed-header">
        <h1>🌍 Social Feed</h1>
        <p>Share your journey with the community</p>
      </div>

      <div className="feed-content">
        <div className="create-post-card">
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Give your post a title (optional)"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="post-title-input"
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Share your thoughts, achievements, or questions with the community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="post-content-input"
                rows="4"
              />
            </div>

            <div className="form-controls">
              <div className="left-controls">
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="category-select-post"
                >
                  <option value="advice">💡 Advice</option>
                  <option value="story">📖 Story</option>
                  <option value="question">❓ Question</option>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="resource">📚 Resource</option>
                  <option value="news">📰 News</option>
                  <option value="other">Other</option>
                </select>

                <label className="anonymous-toggle">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>🔒 Post Anonymously</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-post"
                disabled={!newPostContent.trim()}
              >
                ✨ Post
              </button>
            </div>
          </form>
        </div>

        <div className="posts-list">
          {loading ? (
            <div className="loading">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">No posts yet. Be the first to share! 🌟</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-avatar">
                    {post.isAnonymous ? '🔒' : '👤'}
                  </div>
                  <div className="post-info">
                    <h3>
                      {post.creator?.name || post.anonymousName || 'Anonymous'}
                    </h3>
                    <small>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="post-category">
                    <span
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(post.category) }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>

                {post.title && <h2 className="post-title">{post.title}</h2>}

                <div className="post-content">
                  <p>{post.content}</p>
                </div>

                <div className="post-engagement">
                  <button
                    className="engagement-btn"
                    onClick={() => handleLikePost(post.id)}
                  >
                    ❤️ {post.likeCount || 0}
                  </button>
                  <button
                    className="engagement-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    💬 {post.commentCount || 0}
                  </button>
                  <button className="engagement-btn">
                    🔄 {post.shareCount || 0}
                  </button>
                </div>

                {expandedComments[post.id] && (
                  <div className="comments-section">
                    {post.comments && post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                              {comment.isAnonymous ? '🔒' : '👤'}
                            </div>
                            <div className="comment-content">
                              <strong>
                                {comment.isAnonymous
                                  ? comment.anonymousName
                                  : comment.creator?.name}
                              </strong>
                              <p>{comment.content}</p>
                              <small>
                                {new Date(
                                  comment.createdAt
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComments[post.id] || ''}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="comment-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="btn-comment"
                        disabled={!newComments[post.id]?.trim()}
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
