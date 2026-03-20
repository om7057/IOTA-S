import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TeenMessages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCounselorList, setShowCounselorList] = useState(false);

  const authHeaders = () => {
    const accessToken = token || localStorage.getItem('token');
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
    fetchVerifiedCounselors();
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversation?.conversationId) {
      fetchMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation?.conversationId]);

  const getDisplayName = (u) => {
    if (!u) return 'Unknown';
    return u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages`, {
        headers: authHeaders(),
      });

      const rows = response.data?.data || [];
      const mapped = rows.map((conv) => {
        const isUser1 = conv.user1Id === user?.id;
        const other = isUser1 ? conv.user2 : conv.user1;
        return {
          conversationId: conv.id,
          userId: other?.id,
          otherUser: {
            ...other,
            name: getDisplayName(other),
          },
          lastMessage: 'Open to view latest messages',
          unreadCount: 0,
        };
      });

      setConversations(mapped);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/${conversationId}/messages`, {
        headers: authHeaders(),
      });
      setMessages(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedCounselors = async () => {
    try {
      const response = await axios.get(`${API_URL}/users?limit=200`);
      const allUsers = response.data?.users || [];
      const counselorUsers = allUsers.filter((u) => u.userType === 'counselor');
      setCounselors(counselorUsers);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setCounselors([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation?.conversationId) return;

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/messages/${selectedConversation.conversationId}/send`,
        { content: messageContent },
        { headers: authHeaders() }
      );
      setMessageContent('');
      fetchMessages(selectedConversation.conversationId);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (counselor) => {
    try {
      const response = await axios.get(`${API_URL}/messages/user/${counselor.id}`, {
        headers: authHeaders(),
      });

      const payload = response.data?.data;
      const conversation = payload?.conversation;

      if (!conversation) return;

      const selected = {
        conversationId: conversation.id,
        userId: counselor.id,
        otherUser: {
          ...counselor,
          name: getDisplayName(counselor),
        },
      };

      setShowCounselorList(false);
      setSelectedConversation(selected);
      setMessages(payload?.messages || []);
      fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert(error.response?.data?.error || 'Failed to start conversation');
    }
  };

  const isOwnMessage = (message) => {
    return message.senderId === user?.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowCounselorList(!showCounselorList)}
              className="w-full mb-6 px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors"
            >
              {showCounselorList ? 'Cancel' : '💬 New Message'}
            </button>

            {showCounselorList && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Counselors</h3>
                <div className="space-y-3">
                  {counselors.length === 0 ? (
                    <p className="text-gray-600 text-sm">No counselors available</p>
                  ) : (
                    counselors.map((counselor) => (
                      <button
                        key={counselor.id}
                        onClick={() => handleStartConversation(counselor)}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <div className="font-semibold text-gray-800">{getDisplayName(counselor)}</div>
                        <div className="text-xs text-teal-600 mt-1">✓ counselor</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversations</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-gray-600 text-sm">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.conversationId}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedConversation?.conversationId === conv.conversationId
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{conv.otherUser?.name || 'Unknown'}</div>
                          <div className="text-xs opacity-75 line-clamp-1 mt-1">{conv.lastMessage}</div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{conv.unreadCount}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedConversation ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center h-full flex items-center justify-center">
                <div>
                  <p className="text-gray-600 text-lg mb-2">No conversation selected</p>
                  <p className="text-gray-500">Click on a conversation or start a new message to get started</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full max-h-96 lg:max-h-[600px]">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedConversation.otherUser?.name || 'Unknown'}</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = isOwnMessage(message);
                      return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs rounded-lg p-4 ${isOwn ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <p className="break-words">{message.content}</p>
                            <span className={`text-xs mt-2 block ${isOwn ? 'text-teal-100' : 'text-gray-500'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <textarea
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSendMessage(e);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 resize-none"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={loading || !messageContent.trim()}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 self-end"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Press Ctrl+Enter to send</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeenMessages;
