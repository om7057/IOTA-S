import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Check, Save } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const Journal = () => {
  const { journalEntries, addJournalEntry } = useTeen();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
  const [showNewEntry, setShowNewEntry] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Auto-save indicator
  useEffect(() => {
    if (content.length > 10) {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saved');
      }, 1000);
    } else {
      setSaveStatus('idle');
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content]);

  const handleSubmit = async () => {
    if (!content.trim() || content.length < 10) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addJournalEntry(content.trim());
    
    setIsSubmitting(false);
    setContent('');
    setShowNewEntry(false);
    setSaveStatus('idle');
    
    toast.success('Journal entry saved');
  };

  const prompts = [
    "What's been on your mind lately?",
    "What made you smile today?",
    "What's something you're looking forward to?",
    "What's a challenge you're facing?",
    "What are you grateful for right now?",
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-500 mt-1">A safe space for your thoughts</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* New Entry Toggle */}
      {!showNewEntry ? (
        <button
          onClick={() => setShowNewEntry(true)}
          className="w-full bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-elevated hover:border-sky-200 transition-all duration-300 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start a new entry</h3>
              <p className="text-sm text-gray-500 mt-1">Write about your day, thoughts, or feelings</p>
            </div>
          </div>
        </button>
      ) : (
        /* New Entry Form */
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New Entry</h2>
            <div className="flex items-center gap-2 text-sm">
              {saveStatus === 'saving' && (
                <span className="text-gray-400 flex items-center gap-1">
                  <Save className="w-4 h-4 animate-pulse" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sky-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={randomPrompt}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
            rows={8}
            autoFocus
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => {
                setShowNewEntry(false);
                setContent('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={content.length < 10 || isSubmitting}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                content.length >= 10 && !isSubmitting
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Past Entries */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Entries</h2>
        {journalEntries.length > 0 ? (
          <div className="space-y-4">
            {journalEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white rounded-2xl p-6 shadow-card border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">No entries yet</h3>
            <p className="text-gray-500 mt-1">Start writing to capture your thoughts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
