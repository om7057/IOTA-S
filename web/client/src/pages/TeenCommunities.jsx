import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeenCommunities = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('general');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  const categories = ['general', 'mental-health', 'peer-support', 'safety', 'relationships', 'school'];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teen/groups/groups');
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/groups/groups/${groupId}/messages`);
      setGroupMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/teen/groups/groups',
        {
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCategory,
          isPrivate: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateForm(false);
      setSelectedGroup(response.data);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/groups/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGroups();
      const group = groups.find(g => g.id === groupId);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error joining group:', error);
      if (error.response?.status !== 400) {
        alert('Failed to join group');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/groups/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teen/groups/groups/${selectedGroup.id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageContent('');
      fetchGroupMessages(selectedGroup.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/teen/groups/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGroupMessages(selectedGroup.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general': 'bg-blue-100 text-blue-800',
      'mental-health': 'bg-purple-100 text-purple-800',
      'peer-support': 'bg-green-100 text-green-800',
      'safety': 'bg-red-100 text-red-800',
      'relationships': 'bg-pink-100 text-pink-800',
      'school': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || colors['general'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Teen Communities</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups Sidebar */}
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              {showCreateForm ? 'Cancel' : '+ Create Group'}
            </button>

            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-20"
                  />
                  <select
                    value={newGroupCategory}
                    onChange={(e) => setNewGroupCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Groups</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{group.name}</div>
                    <div className="text-xs opacity-75">
                      {group.memberCount || 0} members
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedGroup ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">Select a group to view</p>
                <p className="text-gray-500">
                  Join a community to connect with peers and get support!
                </p>
              </div>
            ) : (
              <>
                {/* Group Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{selectedGroup.name}</h2>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(selectedGroup.category)}`}>
                        {selectedGroup.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Leave Group
                    </button>
                  </div>
                  {selectedGroup.description && (
                    <p className="text-gray-600 mt-4">{selectedGroup.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    👥 {selectedGroup.memberCount || 0} member{selectedGroup.memberCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Messages Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Chat</h3>
                  
                  {/* Messages */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 h-96 overflow-y-auto space-y-4 border border-gray-200">
                    {groupMessages.length === 0 ? (
                      <div className="text-center text-gray-500 h-full flex items-center justify-center">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      groupMessages.map((message) => (
                        <div
                          key={message.id}
                          className="bg-white rounded-lg p-4 border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-800">
                              {message.User?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.content}</p>
                          {/* Delete button would go here with auth check */}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                      placeholder="Share your thoughts with the group..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-20"
                    />
                    <button
                      type="submit"
                      disabled={loading || !messageContent.trim()}
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeenCommunities;
