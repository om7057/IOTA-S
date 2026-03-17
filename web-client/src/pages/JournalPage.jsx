import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Trash2, ArrowLeft, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const JournalPage = () => {
  const { user, token } = useAuth();
  const [journals, setJournals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [],
    isAnonymous: false
  });

  const moodOptions = ['happy', 'sad', 'angry', 'scared', 'confused', 'excited', 'calm', 'tired'];
  const journalTags = ['school', 'friends', 'family', 'homework', 'fun', 'worried', 'excited', 'learning'];

  useEffect(() => {
    if (user?.id) {
      fetchJournals();
    }
  }, [user]);

  const fetchJournals = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/journals/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJournals(data);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
      toast.error('Failed to load journals');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('Please write something!');
      return;
    }

    setLoading(true);
    try {
      const url = editingId 
        ? `${apiUrl}/journals/${editingId}`
        : `${apiUrl}/journals`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title || 'Untitled',
          content: formData.content,
          mood: formData.mood || null,
          tags: formData.tags,
          isAnonymous: formData.isAnonymous
        })
      });

      if (response.ok) {
        toast.success(editingId ? 'Journal updated!' : 'Entry saved! 📝');
        fetchJournals();
        resetForm();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving journal:', error);
      toast.error('Failed to save journal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (journalId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`${apiUrl}/journals/${journalId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          toast.success('Entry deleted');
          fetchJournals();
          setSelectedJournal(null);
        }
      } catch (error) {
        console.error('Error deleting journal:', error);
        toast.error('Failed to delete entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: '',
      tags: [],
      isAnonymous: false
    });
    setShowForm(false);
  };

  const startEdit = (journal) => {
    setFormData({
      title: journal.title,
      content: journal.content,
      mood: journal.mood || '',
      tags: journal.tags || [],
      isAnonymous: journal.isAnonymous || false
    });
    setEditingId(journal._id);
    setShowForm(true);
    setSelectedJournal(null);
  };

  // View selected journal
  if (selectedJournal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedJournal(null)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Entries
        </button>

        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedJournal.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedJournal.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => startEdit(selectedJournal)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit entry"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {selectedJournal.mood && (
            <div className="mb-4">
              <span className="inline-block bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-semibold">
                Mood: {selectedJournal.mood}
              </span>
            </div>
          )}

          {selectedJournal.tags && selectedJournal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedJournal.tags.map(tag => (
                <span key={tag} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
              {selectedJournal.content}
            </p>
          </div>

          <button
            onClick={() => handleDelete(selectedJournal._id)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Delete Entry
          </button>
        </div>
      </div>
    );
  }

  // Show form
  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? '✏️ Edit Your Entry' : '📝 Write a New Journal Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entry Title (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your entry a title..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your thoughts and feelings here... Don't worry, this is just for you!"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-600 resize-none font-medium"
                rows="8"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.content.length} characters</p>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How are you feeling? (optional)
              </label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-600"
              >
                <option value="">Select a mood...</option>
                {moodOptions.map(mood => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What's this about? (choose any)
              </label>
              <div className="flex flex-wrap gap-2">
                {journalTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="w-4 h-4 accent-sky-600 cursor-pointer"
              />
              <label htmlFor="anonymous" className="text-sm font-semibold text-gray-700">
                Keep this entry private from insights and tracking
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-sky-600" />
          My Journal
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
        >
          + New Entry
        </button>
      </div>

      {journals.length === 0 ? (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-sky-200">
          <BookOpen className="w-16 h-16 text-sky-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No entries yet</h3>
          <p className="text-gray-600 mb-6">Start writing your first journal entry today!</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
          >
            Write First Entry
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {journals.map(journal => (
            <div
              key={journal._id}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedJournal(journal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{journal.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(journal.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {journal.mood && (
                  <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {journal.mood}
                  </span>
                )}
              </div>

              <p className="text-gray-700 line-clamp-2 mb-3">{journal.content}</p>

              {journal.tags && journal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {journal.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {journal.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">+{journal.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalPage;
