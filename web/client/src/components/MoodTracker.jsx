import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Frown, Smile, Heart, ZapOff, HelpCircle, Laugh, Wind, Moon, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import FacialEmotionDetector from './FacialEmotionDetector';

const MoodTracker = () => {
  const { user } = useUser();
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [todayMood, setTodayMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFacialDetector, setShowFacialDetector] = useState(false);

  // Child-friendly mood options with colors
  const moodOptions = [
    { name: 'happy', emoji: '😄', label: 'Happy', color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200', icon: <Smile className="w-8 h-8 text-yellow-600" /> },
    { name: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300 hover:bg-blue-200', icon: <Frown className="w-8 h-8 text-blue-600" /> },
    { name: 'angry', emoji: '😠', label: 'Angry', color: 'bg-red-100 border-red-300 hover:bg-red-200', icon: <Heart className="w-8 h-8 text-red-600" /> },
    { name: 'scared', emoji: '😨', label: 'Scared', color: 'bg-purple-100 border-purple-300 hover:bg-purple-200', icon: <ZapOff className="w-8 h-8 text-purple-600" /> },
    { name: 'confused', emoji: '🤔', label: 'Confused', color: 'bg-orange-100 border-orange-300 hover:bg-orange-200', icon: <HelpCircle className="w-8 h-8 text-orange-600" /> },
    { name: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-pink-100 border-pink-300 hover:bg-pink-200', icon: <Laugh className="w-8 h-8 text-pink-600" /> },
    { name: 'calm', emoji: '😌', label: 'Calm', color: 'bg-teal-100 border-teal-300 hover:bg-teal-200', icon: <Wind className="w-8 h-8 text-teal-600" /> },
    { name: 'tired', emoji: '😴', label: 'Tired', color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200', icon: <Moon className="w-8 h-8 text-indigo-600" /> },
  ];

  const moodTags = ['school', 'friends', 'family', 'homework', 'tired', 'test', 'playtime', 'exercise'];

  // Fetch today's mood
  useEffect(() => {
    if (user?.id) {
      fetchTodayMood();
    }
  }, [user]);

  const fetchTodayMood = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/moods/user/${user.id}/today`);
      if (response.ok) {
        const data = await response.json();
        setTodayMood(data);
        if (data) {
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error('Error fetching today mood:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMood) {
      toast.error('Please select a mood!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          mood: selectedMood,
          moodIntensity: intensity,
          tags,
          notes
        })
      });

      if (response.ok) {
        const newMood = await response.json();
        setTodayMood(newMood);
        setSelectedMood(null);
        setIntensity(3);
        setTags([]);
        setNotes('');
        setShowForm(false);
        toast.success('Mood saved! Great job checking in! 🌟');
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleEmotionDetected = (detectedMood, confidence) => {
    setSelectedMood(detectedMood);
    // Auto-set intensity based on confidence (50-100% confidence maps to 1-5 intensity)
    const detectedIntensity = Math.max(1, Math.round((confidence / 100) * 5));
    setIntensity(detectedIntensity);
    toast.success(`Great! I detected you're ${detectedMood}! 🎉`);
  };

  return (
    <div className="space-y-6">
      {/* Today's Mood Status */}
      {todayMood && !showForm ? (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-6 border-2 border-sky-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Mood</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{moodOptions.find(m => m.name === todayMood.mood)?.emoji}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {moodOptions.find(m => m.name === todayMood.mood)?.label}
                </p>
                <p className="text-sm text-gray-600">
                  Intensity: {'⭐'.repeat(todayMood.moodIntensity)} {todayMood.moodIntensity}/5
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors"
            >
              Update
            </button>
          </div>
          {todayMood.tags && todayMood.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {todayMood.tags.map(tag => (
                <span key={tag} className="bg-sky-200 text-sky-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {todayMood.notes && (
            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg italic">
              "{todayMood.notes}"
            </p>
          )}
        </div>
      ) : null}

      {/* Mood Form */}
      {(!todayMood || showForm) && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">How are you feeling today?</h3>

          {/* Camera Button */}
          <button
            onClick={() => setShowFacialDetector(true)}
            className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Scan Your Face 📸</span>
          </button>

          {/* Mood Selection */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Or pick your mood:</p>
            <div className="grid grid-cols-4 gap-3">
              {moodOptions.map(mood => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.name)}
                  className={`p-3 rounded-2xl border-3 transition-all transform hover:scale-110 ${
                    selectedMood === mood.name
                      ? 'scale-110 ' + mood.color.split(' ').slice(-1)[0] + ' ring-4 ring-offset-2'
                      : mood.color
                  }`}
                  title={mood.label}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <p className="text-xs font-semibold text-gray-700">{mood.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          {selectedMood && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                How strong is this feeling?
              </p>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                  <span>A little</span>
                  <span>Very much</span>
                </div>
                <p className="text-center text-2xl font-bold text-sky-600">
                  {'⭐'.repeat(intensity)}
                </p>
              </div>
            </div>
          )}

          {/* Tag Selection */}
          {selectedMood && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">What made you feel this way? (choose any)</p>
              <div className="flex flex-wrap gap-2">
                {moodTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      tags.includes(tag)
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedMood && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-2">Anything you want to share? (optional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us what happened..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-600 resize-none"
                rows="3"
              />
            </div>
          )}

          {/* Submit Button */}
          {selectedMood && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
            >
              {loading ? 'Saving...' : '✨ Save My Mood'}
            </button>
          )}
        </div>
      )}

      {/* Facial Emotion Detector Modal */}
      <FacialEmotionDetector
        isOpen={showFacialDetector}
        onClose={() => setShowFacialDetector(false)}
        onEmotionSelected={handleEmotionDetected}
        moodOptions={moodOptions}
      />
    </div>
  );
};

export default MoodTracker;
