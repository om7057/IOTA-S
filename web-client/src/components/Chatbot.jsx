import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  const userId = localStorage.getItem('userId') || 'demo-user';
  const token = localStorage.getItem('token');

  // Scroll to bottom when new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chatbot/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`/api/chatbot/${userId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to UI immediately
    const userMsg = {
      id: Date.now(),
      message: inputValue,
      sender: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/chatbot/send',
        { userId, message: inputValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { userMessage, botMessage } = response.data.data;
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now(),
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure? This will delete all chat history.')) {
      try {
        await axios.delete(`/api/chatbot/${userId}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  const toggleStats = async () => {
    if (!showStats) {
      await loadStats();
    }
    setShowStats(!showStats);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>🤖 Your AI Friend</h1>
          <p>I'm here to listen and support you</p>
        </div>
        <div className="header-actions">
          <button className="btn-stats" onClick={toggleStats}>
            📊 Stats
          </button>
          <button className="btn-clear" onClick={handleClearHistory}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {showStats && stats && (
        <div className="stats-panel">
          <h3>Chat Statistics</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{stats.totalMessages}</div>
              <div className="stat-label">Total Messages</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.userMessages}</div>
              <div className="stat-label">Your Messages</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.botInteractions}</div>
              <div className="stat-label">Bot Responses</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.sentimentBreakdown.positive}</div>
              <div className="stat-label">Positive 😊</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.sentimentBreakdown.neutral}</div>
              <div className="stat-label">Neutral 😐</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.sentimentBreakdown.negative}</div>
              <div className="stat-label">Negative 😔</div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && !showStats && (
          <div className="chat-empty">
            <div className="chat-welcome">
              <h2>👋 Welcome!</h2>
              <p>Hi there! I'm your AI friend, here to listen and support you.</p>
              <p>You can talk to me about anything - your feelings, challenges, wins, or just chat!</p>
              <p className="chat-hint">💡 Try saying: "Hey, I'm feeling stressed" or "I had an amazing day!"</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-bubble">{msg.message || msg.botResponse}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Tell me what's on your mind..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="chat-send" disabled={loading || !inputValue.trim()}>
          {loading ? '...' : '📤'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
