import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeenJournal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [mood, setMood] = useState('happy');
  const [emotion, setEmotion] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [filterMood, setFilterMood] = useState(null);

  const moodOptions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'confused', 'neutral'];
  const emotionOptions = ['joy', 'sadness', 'fear', 'anger', 'surprise', 'disgust', 'trust', 'anticipation'];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [filterMood]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterMood
        ? `/api/teen/journal/filter/${filterMood}`
        : '/api/teen/journal';
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teen/journal/stats/mood', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
      
      await axios.post(
        '/api/teen/journal',
        {
          title: newTitle,
          content: newContent,
          mood,
          emotion,
          tags: tagsArray
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewTitle('');
      setNewContent('');
      setMood('happy');
      setEmotion('');
      setTags('');
      setShowCreateForm(false);
      fetchEntries();
      fetchStats();
    } catch (error) {
      console.error('Error creating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/teen/journal/${entryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedEntry(null);
      fetchEntries();
      fetchStats();
    } catch (error) {
      console.error('Error deleting entry:', error);
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
      neutral: '😐'
    };
    return emojiMap[moodType] || '😐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Journal</h1>

        {/* Statistics */}
        {stats && (
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Entry Form */}
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
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How are you feeling?</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      {moodOptions.map(m => (
                        <option key={m} value={m}>{getMoodEmoji(m)} {m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emotion (optional)</label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select emotion...</option>
                      {emotionOptions.map(e => (
                        <option key={e} value={e}>{e}</option>
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
                    placeholder="What's in your mind today?"
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

          {/* Entries List */}
          <div className="lg:col-span-2">
            {!selectedEntry ? (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setFilterMood(null)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      filterMood === null
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {moodOptions.map(m => (
                    <button
                      key={m}
                      onClick={() => setFilterMood(m)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        filterMood === m
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {getMoodEmoji(m)} {m}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                      </div>
                      <p className="text-gray-600 line-clamp-3">{entry.content}</p>
                      {entry.tags && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {JSON.parse(entry.tags).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {entries.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                      <p className="text-gray-600 text-lg">No entries yet. Start writing!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="mb-6 px-4 py-2 text-purple-600 hover:text-purple-800 font-semibold"
                >
                  ← Back to entries
                </button>

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedEntry.title}</h2>
                    <p className="text-gray-600 mt-2">
                      {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-5xl">{getMoodEmoji(selectedEntry.mood)}</span>
                </div>

                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mood: <span className="font-semibold text-purple-600">{selectedEntry.mood}</span></p>
                  {selectedEntry.emotion && (
                    <p className="text-sm text-gray-600">Emotion: <span className="font-semibold text-purple-600">{selectedEntry.emotion}</span></p>
                  )}
                  {selectedEntry.moodScore && (
                    <p className={`text-sm mt-1 font-semibold ${getMoodColor(selectedEntry.moodScore)}`}>
                      Mood Score: {selectedEntry.moodScore > 0 ? '+' : ''}{selectedEntry.moodScore.toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedEntry.content}
                </p>

                {selectedEntry.tags && JSON.parse(selectedEntry.tags).length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedEntry.tags).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.aiSuggestions && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Suggestions for you</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {JSON.parse(selectedEntry.aiSuggestions).map((suggestion, idx) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : '🗑️ Delete Entry'}
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
