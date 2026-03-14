import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Eye, MessageCircle } from 'lucide-react';

const QueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'school', label: 'School & Learning' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/queries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQueries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await fetch(`${API_URL}/queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          question: newQuestion,
          category: selectedCategory,
        }),
      });

      if (response.ok) {
        setNewQuestion('');
        setShowModal(false);
        fetchQueries();
      }
    } catch (error) {
      console.error('Error posting question:', error);
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">❓ Anonymous Questions</h1>
        <p className="text-gray-600">Ask questions anonymously and get advice from the community</p>
      </div>

      {/* Post Question Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-8 flex items-center justify-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Ask a Question
      </button>

      {/* Post Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
            
            {/* Category Select */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Input */}
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What's your question? (asked anonymously)"
              className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-600 resize-none h-32"
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostQuestion}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                Post Anonymously
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {queries.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          queries.map((query) => (
            <div key={query.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:border-sky-300">
              {/* Question Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                  ?
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{query.question}</h3>
                    <span className="inline-block px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                      {query.category || 'General'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {query.created_at ? new Date(query.created_at).toLocaleDateString() : 'Recently asked'}
                  </p>
                </div>
              </div>

              {/* Question Stats */}
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4" />
                  {query.views || 0} views
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  {query.answer_count || 0} answers
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QueriesPage;
