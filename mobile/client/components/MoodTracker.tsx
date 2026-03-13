import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import FacialEmotionDetector from './FacialEmotionDetector';

interface MoodEntry {
  id: string;
  mood: string;
  moodIntensity: number;
  tags: string[];
  notes: string;
  date: string;
}

const MoodTracker = () => {
  const { session } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFacialDetector, setShowFacialDetector] = useState(false);

  const moodOptions = [
    { name: 'happy', emoji: '😄', label: 'Happy' },
    { name: 'sad', emoji: '😢', label: 'Sad' },
    { name: 'angry', emoji: '😠', label: 'Angry' },
    { name: 'scared', emoji: '😨', label: 'Scared' },
    { name: 'confused', emoji: '🤔', label: 'Confused' },
    { name: 'excited', emoji: '🤩', label: 'Excited' },
    { name: 'calm', emoji: '😌', label: 'Calm' },
    { name: 'tired', emoji: '😴', label: 'Tired' },
  ];

  const moodTags = ['school', 'friends', 'family', 'homework', 'tired', 'test', 'playtime', 'exercise'];

  useEffect(() => {
    if (session?.user?.id) {
      fetchTodayMood();
    }
  }, [session?.user?.id]);

  const fetchTodayMood = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/api/moods/user/${session?.user?.id}/today`);
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

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:3000/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          mood: selectedMood,
          moodIntensity: intensity,
          tags,
          notes,
        }),
      });

      if (response.ok) {
        const newMood = await response.json();
        setTodayMood(newMood);
        setSelectedMood(null);
        setIntensity(3);
        setTags([]);
        setNotes('');
        setShowForm(false);
        Toast.show({ type: 'success', text1: 'Mood saved!', text2: 'Great job checking in! 🌟' });
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save mood');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    setSelectedMood(emotion);
    const detectedIntensity = Math.max(1, Math.round((confidence / 100) * 5));
    setIntensity(detectedIntensity);
    Toast.show({ type: 'success', text1: 'Emotion Detected!', text2: `I detected you're ${emotion}! 🎉` });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-6">
        {/* Today's Mood Status */}
        {todayMood && !showForm && (
          <View className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-3xl p-6 border-2 border-sky-200 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Today's Mood</Text>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-4">
                <Text className="text-6xl">{moodOptions.find((m) => m.name === todayMood.mood)?.emoji}</Text>
                <View>
                  <Text className="text-2xl font-bold text-gray-900 capitalize">{todayMood.mood}</Text>
                  <Text className="text-sm text-gray-600">
                    Intensity: {Array(todayMood.moodIntensity).fill('⭐').join('')} {todayMood.moodIntensity}/5
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowForm(true)} className="bg-sky-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Update</Text>
              </TouchableOpacity>
            </View>
            {todayMood.tags && todayMood.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-3">
                {todayMood.tags.map((tag) => (
                  <View key={tag} className="bg-sky-200 px-3 py-1 rounded-full">
                    <Text className="text-sky-800 text-sm font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {todayMood.notes && (
              <Text className="text-sm text-gray-700 bg-white p-3 rounded-lg italic">"{todayMood.notes}"</Text>
            )}
          </View>
        )}

        {/* Mood Form */}
        {(!todayMood || showForm) && (
          <View className="bg-white rounded-3xl p-6 border-2 border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-6">How are you feeling today?</Text>

            {/* Camera Button */}
            <TouchableOpacity
              onPress={() => setShowFacialDetector(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl py-4 px-6 mb-6 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text className="text-white font-bold">Scan Your Face 📸</Text>
            </TouchableOpacity>

            {/* Mood Selection */}
            <Text className="text-sm font-semibold text-gray-700 mb-3">Or pick your mood:</Text>
            <View className="flex-row flex-wrap gap-3 mb-8">
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.name}
                  onPress={() => setSelectedMood(mood.name)}
                  className={`flex-1 min-w-[22%] p-3 rounded-2xl border-3 ${
                    selectedMood === mood.name
                      ? 'bg-sky-100 border-sky-400'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <Text className="text-2xl text-center mb-1">{mood.emoji}</Text>
                  <Text className="text-xs font-semibold text-gray-700 text-center">{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Intensity Slider */}
            {selectedMood && (
              <View className="mb-8">
                <Text className="text-sm font-semibold text-gray-700 mb-3">How strong is this feeling?</Text>
                <View className="flex-row items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setIntensity(num)}
                      className={`flex-1 py-3 rounded-lg ${intensity === num ? 'bg-sky-600' : 'bg-gray-200'}`}
                    >
                      <Text className={`text-center font-bold ${intensity === num ? 'text-white' : 'text-gray-700'}`}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-center text-2xl font-bold text-sky-600 mt-2">
                  {Array(intensity).fill('⭐').join('')}
                </Text>
              </View>
            )}

            {/* Tag Selection */}
            {selectedMood && (
              <View className="mb-8">
                <Text className="text-sm font-semibold text-gray-700 mb-3">What made you feel this way? (choose any)</Text>
                <View className="flex-row flex-wrap gap-2">
                  {moodTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full ${
                        tags.includes(tag) ? 'bg-sky-600' : 'bg-gray-200'
                      }`}
                    >
                      <Text className={`font-semibold text-sm ${tags.includes(tag) ? 'text-white' : 'text-gray-700'}`}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            {selectedMood && (
              <View className="mb-8">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Anything you want to share? (optional)</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Tell us what happened..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700"
                />
              </View>
            )}

            {/* Submit Button */}
            {selectedMood && (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl py-4 items-center flex-row justify-center gap-2"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg">✨ Save My Mood</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Facial Emotion Detector */}
      <FacialEmotionDetector
        isOpen={showFacialDetector}
        onClose={() => setShowFacialDetector(false)}
        onEmotionSelected={handleEmotionDetected}
        moodOptions={moodOptions}
      />

      <Toast />
    </ScrollView>
  );
};

export default MoodTracker;
