import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Info, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <img
            src={psychiatrist.avatarUrl || `https://ui-avatars.com/api/?name=${psychiatrist.firstName}+${psychiatrist.lastName}&background=random`}
            alt={psychiatrist.firstName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">
              Dr. {psychiatrist.firstName} {psychiatrist.lastName}
            </h3>
            <p className="text-sm text-sky-600 font-medium">
              {psychiatrist.specialization}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 m-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        <div className="flex items-start gap-3 bg-sky-50 text-sky-900 p-4 rounded-xl border border-sky-100/50">
          <div className="p-1 bg-sky-100 rounded-full shrink-0">
            <Info size={18} className="text-sky-600" />
          </div>
          <div>
            <h4 className="font-bold mb-1">Welcome to private session with Dr. {psychiatrist.firstName}</h4>
            <p className="text-sm text-sky-800 leading-relaxed">
              This is a confidential and safe space to discuss your thoughts and feelings.
              Remember, there are no judgments here - only support and understanding.
            </p>
          </div>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'teen';
          return (
            <div
              key={msg.id || msg.createdAt}
              className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`px-4 py-2.5 rounded-2xl ${
                  isUser 
                    ? 'bg-sky-500 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed">{msg.message}</p>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 px-1 font-medium">
                {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message... (Private and secure)"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
            disabled={loading || !conversationId}
          />
          <button
            type="submit"
            className="p-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 text-white rounded-xl transition-colors shadow-sm"
            disabled={loading || !message.trim() || !conversationId}
          >
            <Send size={18} className={message.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PsychiatristChat;
