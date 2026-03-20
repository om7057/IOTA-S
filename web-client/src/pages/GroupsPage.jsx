import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, MessageSquare, Lock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestedGroups, setSuggestedGroups] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchGroups();
  }, [token, user?.id]);

  const getAuthToken = () => token || localStorage.getItem('token') || localStorage.getItem('authToken');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const groupsData = Array.isArray(data) ? data : data?.data || [];
      const normalized = groupsData.map((group) => ({
        ...group,
        isMember: Array.isArray(group.members)
          ? group.members.some((member) => member.userId === user?.id)
          : false,
      }));
      setGroups(Array.isArray(normalized) ? normalized : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name: newGroupName, type: 'public' }),
      });

      if (response.ok) {
        setNewGroupName('');
        setShowModal(false);
        toast.success('Group created');
        fetchGroups();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        toast.success('Joined group');
        setSuggestedGroups((prev) => prev.filter((g) => g.id !== groupId));
        fetchGroups();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.error || 'Unable to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Unable to join group');
    }
  };

  const handleSuggestGroups = async () => {
    try {
      setIsSuggesting(true);
      const response = await fetch(`${API_URL}/groups/suggestions`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = Array.isArray(data?.data) ? data.data : [];
      setSuggestedGroups(suggestions);
      setShowSuggestionsModal(true);
    } catch (error) {
      console.error('Error suggesting groups:', error);
      toast.error('Could not fetch suggestions right now');
    } finally {
      setIsSuggesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 Groups & Communities</h1>
        <p className="text-gray-600">Choose a group to open its dedicated chat page</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
        <button
          onClick={handleSuggestGroups}
          disabled={isSuggesting}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-5 h-5 ${isSuggesting ? 'animate-pulse' : ''}`} />
          {isSuggesting ? 'Analyzing your profile...' : 'Suggest Groups'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuggestionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Suggested Groups</h2>
                <p className="text-sm text-gray-600">Based on your profile and activity (dummy AI suggestions for now).</p>
              </div>
              <button
                onClick={() => setShowSuggestionsModal(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {suggestedGroups.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No new suggestions right now. Join a few groups and try again.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{group.description || 'No description yet'}</p>
                        <p className="text-xs text-emerald-700 mt-2 font-medium">Why this suggestion: {group.reason || 'Good fit based on your profile.'}</p>
                        <p className="text-xs text-gray-500 mt-1">Confidence: {group.confidence || 70}%</p>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                        >
                          Join
                        </button>
                        <button
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="bg-white border border-sky-600 text-sky-700 px-4 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No groups yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
                {group.type === 'private' && <Lock className="w-5 h-5 text-amber-600" />}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description || 'No description yet'}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.memberCount || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!group.isMember) handleJoinGroup(group.id);
                  }}
                  className="bg-sky-600 text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                >
                  {group.isMember ? 'Joined' : 'Join'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/groups/${group.id}`);
                  }}
                  className="bg-white border border-sky-600 text-sky-700 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors"
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
