import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TeenJournal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [emotion, setEmotion] = useState('happy');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterEmotion, setFilterEmotion] = useState(null);

  const emotionOptions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'confused', 'neutral', 'motivated', 'stressed'];

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchEntries();
  }, [filterEmotion]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (filterEmotion) params.append('emotion', filterEmotion);

      const response = await axios.get(`${API_URL}/journals?${params.toString()}`, {
        headers: authHeaders(),
      });
      setEntries(response.data?.journals || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!entries.length) {
      return {
        totalEntries: 0,
        averageMoodScore: 0,
        moodDistribution: {},
      };
    }

    const moodScores = {
      happy: 1,
      excited: 1,
      motivated: 0.8,
      calm: 0.4,
      neutral: 0,
      confused: -0.2,
      anxious: -0.6,
      sad: -0.8,
      stressed: -0.8,
      angry: -1,
    };

    const distribution = entries.reduce((acc, entry) => {
      const key = entry.emotion || 'neutral';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const averageMoodScore =
      entries.reduce((sum, entry) => sum + (moodScores[entry.emotion] ?? 0), 0) / entries.length;

    return {
      totalEntries: entries.length,
      averageMoodScore,
      moodDistribution: distribution,
    };
  }, [entries]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setLoading(true);
      const tagsArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

      await axios.post(
        `${API_URL}/journals`,
        {
          title: newTitle || null,
          content: newContent,
          emotion,
          tags: tagsArray,
          isPrivate: true,
        },
        { headers: authHeaders() }
      );

      setNewTitle('');
      setNewContent('');
      setEmotion('happy');
      setTags('');
      setShowCreateForm(false);
      fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
      alert(error.response?.data?.error || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/journals/${entryId}`, {
        headers: authHeaders(),
      });
      setSelectedEntry(null);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(error.response?.data?.error || 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (moodValue) => {
    if (moodValue > 0.5) return 'text-green-600';
    if (moodValue > 0) return 'text-blue-600';
    if (moodValue < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getMoodEmoji = (moodType) => {
    const emojiMap = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      calm: '😌',
      excited: '🤩',
      confused: '😕',
      neutral: '😐',
      motivated: '💪',
      stressed: '😵',
    };
    return emojiMap[moodType] || '😐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Journal</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Total Entries</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalEntries}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Average Mood Score</p>
            <p className={`text-4xl font-bold mt-2 ${getMoodColor(stats.averageMoodScore)}`}>
              {stats.averageMoodScore.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Top Mood</p>
            <div className="mt-2">
              {Object.entries(stats.moodDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 1)
                .map(([moodType, count]) => (
                  <div key={moodType} className="text-2xl">
                    {getMoodEmoji(moodType)} {moodType} ({count})
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full mb-6 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              {showCreateForm ? 'Cancel' : '✏️ Write New Entry'}
            </button>

            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Entry Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How are you feeling?</label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      {emotionOptions.map((e) => (
                        <option key={e} value={e}>{getMoodEmoji(e)} {e}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="school, friends, family"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <textarea
                    placeholder="What's on your mind today?"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 h-32"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Entry'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!selectedEntry ? (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setFilterEmotion(null)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      filterEmotion === null ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {emotionOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterEmotion(m)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        filterEmotion === m ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {getMoodEmoji(m)} {m}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {entries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                      <p className="text-gray-600 text-lg mb-2">No journal entries found</p>
                      <p className="text-gray-500">Start writing your thoughts!</p>
                    </div>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {entry.title || 'Untitled Entry'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{new Date(entry.entryDate || entry.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-3xl">{getMoodEmoji(entry.emotion)}</span>
                        </div>
                        <p className="text-gray-600 line-clamp-3">{entry.content}</p>
                        {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                          <div className="flex gap-2 mt-4 flex-wrap">
                            {entry.tags.map((tag, idx) => (
                              <span key={`${entry.id}-tag-${idx}`} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8">
                <button onClick={() => setSelectedEntry(null)} className="mb-6 text-purple-600 hover:text-purple-800 font-semibold">
                  ← Back to entries
                </button>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedEntry.title || 'Untitled Entry'}</h2>
                    <p className="text-gray-500 mt-2">{new Date(selectedEntry.entryDate || selectedEntry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-4xl">{getMoodEmoji(selectedEntry.emotion)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed mb-8">{selectedEntry.content}</p>

                {Array.isArray(selectedEntry.tags) && selectedEntry.tags.length > 0 && (
                  <div className="flex gap-2 mb-8 flex-wrap">
                    {selectedEntry.tags.map((tag, idx) => (
                      <span key={`${selectedEntry.id}-selected-tag-${idx}`} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeenJournal;
