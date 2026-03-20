import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [group, setGroup] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const endRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getAuthToken = () => token || localStorage.getItem('token') || localStorage.getItem('authToken');

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMessages();
    }
  }, [groupId, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroup = async () => {
    try {
      setLoadingGroup(true);
      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const groupData = data?.data;
      setGroup(groupData || null);

      const member = Array.isArray(groupData?.members)
        ? groupData.members.some((m) => m.userId === user?.id)
        : false;
      setIsMember(member);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group details');
      navigate('/groups');
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`${API_URL}/chats/${groupId}/history?limit=120`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching group chat:', error);
      setMessages([]);
      toast.error('Could not load chat history');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        toast.success('Joined group');
        setIsMember(true);
        fetchGroup();
        fetchMessages();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.error || 'Unable to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Unable to join group');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isMember) return;

    try {
      setSending(true);
      const response = await fetch(`${API_URL}/chats/${groupId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ content: newMessage.trim(), type: 'text' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loadingGroup) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const getSenderLabel = (msg) => {
    const senderKey = msg?.sender?.id || msg?.senderId || user?.id;
    if (!senderKey) return 'Teen#0000';

    // Deterministic short anonymous ID (similar style to anonymous posts).
    const compact = String(senderKey).replace(/-/g, '').slice(0, 4).toUpperCase();
    return `Teen#${compact}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 h-[calc(100vh-8.5rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </button>

        {!isMember && (
          <button
            onClick={handleJoinGroup}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700"
          >
            Join Group
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-slate-50">
          <h1 className="text-xl font-bold text-gray-900">{group?.name || 'Group Chat'}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {group?.memberCount || 0} members
          </p>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p>No messages yet. Start the conversation.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const mine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                        mine
                          ? 'bg-sky-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${mine ? 'text-sky-100' : 'text-sky-700'}`}>
                        {getSenderLabel(msg)}
                      </p>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[11px] mt-1 ${mine ? 'text-sky-100' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isEdited ? ' • edited' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isMember ? 'Type a message...' : 'Join this group to chat'}
              disabled={sending || !isMember}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-600 disabled:bg-gray-100 disabled:text-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim() || !isMember}
              className="p-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPage;
