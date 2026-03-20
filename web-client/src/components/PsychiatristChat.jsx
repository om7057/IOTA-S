import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Info, AlertCircle } from 'lucide-react';
import '../styles/PsychiatristChat.css';

const PsychiatristChat = ({ psychiatrist, userId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (psychiatrist) {
      initializeConversation();
    }
  }, [psychiatrist]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Session expired. Please sign in again.');
      }
      
      const response = await fetch(
        `http://localhost:3000/api/psychiatrists/${userId}/chat/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            psychiatristId: psychiatrist.id,
            initialMessage: 'Hi, I would like to talk with you.',
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to start conversation');
      const data = await response.json();
      
      setConversationId(data.data.conversationId);
      setMessages([data.data]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error starting conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !conversationId) return;

    const newMessage = {
      id: Date.now(),
      message,
      sender: 'teen',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Session expired. Please sign in again.');
      }
      const response = await fetch(
        `http://localhost:3000/api/psychiatrists/${userId}/chat/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            psychiatristId: psychiatrist.id,
            message: newMessage.message,
            sender: 'teen',
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="psychiatrist-chat-container">
      <div className="chat-header">
        <div className="doctor-info">
          <img
            src={psychiatrist.avatarUrl}
            alt={psychiatrist.firstName}
            className="doctor-avatar"
          />
          <div>
            <h3>Dr. {psychiatrist.firstName} {psychiatrist.lastName}</h3>
            <p className="specialization">
              {psychiatrist.specialization}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="chat-messages">
        <div className="welcome-message">
          <Info size={20} />
          <div>
            <h4>Welcome to private session with Dr. {psychiatrist.firstName}</h4>
            <p>
              This is a confidential and safe space to discuss your thoughts and feelings.
              Remember, there are no judgments here - only support and understanding.
            </p>
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id || msg.createdAt}
            className={`message ${msg.sender === 'teen' ? 'user-message' : 'doctor-message'}`}
          >
            <div className="message-content">
              <p>{msg.message}</p>
              <span className="timestamp">
                {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message... (Your responses are private and secure)"
          className="chat-input"
          disabled={loading || !conversationId}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={loading || !message.trim() || !conversationId}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default PsychiatristChat;
