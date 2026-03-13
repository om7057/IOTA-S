import { useState } from 'react';
import { Heart, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTeen } from '../contexts/TeenContext';
import toast from 'react-hot-toast';

const MoodTracker = () => {
  const { moodEntries, addMoodEntry } = useTeen();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions = [
    { value: 1, label: 'Overwhelmed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { value: 2, label: 'Stressed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { value: 3, label: 'Neutral', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    { value: 4, label: 'Good', color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { value: 5, label: 'Calm', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  ];

  const tagOptions = ['Stress', 'Tired', 'Anxious', 'School', 'Friends', 'Family', 'Excited', 'Relaxed'];

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addMoodEntry({
      mood: selectedMood,
      tags: selectedTags,
      note: note.trim(),
    });
    
    setIsSubmitting(false);
    setSelectedMood(null);
    setSelectedTags([]);
    setNote('');
    
    toast.success('Mood logged successfully');
  };

  // Calculate trend
  const getTrend = () => {
    if (moodEntries.length < 2) return 'neutral';
    const recent = moodEntries.slice(0, 3);
    const older = moodEntries.slice(3, 6);
    
    if (older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.mood, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'up';
    if (recentAvg < olderAvg - 0.5) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-500 mt-1">How are you feeling right now?</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Gauge className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Mood Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Select your mood</h2>
        <div className="flex flex-wrap gap-3">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMood(option.value)}
              className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                selectedMood === option.value
                  ? `${option.color} border-current`
                  : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">What's influencing your mood? (Optional)</h3>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-sky-100 text-sky-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <Check className="w-4 h-4 inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add a note (Optional)</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any thoughts you'd like to add..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className={`w-full mt-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            selectedMood && !isSubmitting
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
            'Log Mood'
          )}
        </button>
      </div>

      {/* Trend Card */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Your Trend</h2>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            trend === 'up' 
              ? 'bg-sky-100 text-sky-700' 
              : trend === 'down'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs attention' : 'Stable'}
          </div>
        </div>
        
        {/* Simple visualization */}
        <div className="flex items-end gap-2 h-24">
          {moodEntries.slice(0, 7).reverse().map((entry, index) => (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  entry.mood >= 4 ? 'bg-sky-400' :
                  entry.mood >= 3 ? 'bg-gray-400' :
                  'bg-slate-400'
                }`}
                style={{ height: `${entry.mood * 20}%` }}
              />
              <span className="text-xs text-gray-400">
                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Entries</h2>
        {moodEntries.length > 0 ? (
          <div className="space-y-3">
            {moodEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      moodOptions.find(m => m.value === entry.mood)?.color
                    }`}>
                      {moodOptions.find(m => m.value === entry.mood)?.label}
                    </span>
                    {entry.tags.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {entry.tags.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-gray-600 mt-2">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No mood entries yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking to see your patterns</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
