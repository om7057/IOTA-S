import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

type Mood = {
  name: string;
  emoji: string;
  label: string;
  color: string;
};

const MOODS: Mood[] = [
  { name: 'happy', emoji: '😄', label: 'Happy', color: '#FFC107' },
  { name: 'sad', emoji: '😢', label: 'Sad', color: '#3B82F6' },
  { name: 'angry', emoji: '😠', label: 'Angry', color: '#EF4444' },
  { name: 'scared', emoji: '😨', label: 'Scared', color: '#9333EA' },
  { name: 'confused', emoji: '🤔', label: 'Confused', color: '#F97316' },
  { name: 'excited', emoji: '🤩', label: 'Excited', color: '#EC4899' },
  { name: 'calm', emoji: '😌', label: 'Calm', color: '#14B8A6' },
  { name: 'tired', emoji: '😴', label: 'Tired', color: '#6366F1' },
];

const MOOD_TAGS = ['school', 'friends', 'family', 'homework', 'tired', 'test', 'playtime', 'exercise'];

export default function MoodTrackerScreen() {
  const { session } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<any>(null);

  useEffect(() => {
    if (session?.token) {
      fetchTodayMood();
    }
  }, [session?.token]);

  const fetchTodayMood = async () => {
    try {
      const response = await fetch(`${API_URL}/moods/today`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodayMood(data);
      }
    } catch (error) {
      console.error('Error fetching today mood:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Oops!', 'Please select a mood first! 😊');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/moods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: selectedMood,
          intensity,
          tags,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mood');
      }

      const newMood = await response.json();
      setTodayMood(newMood);
      setSelectedMood(null);
      setIntensity(3);
      setTags([]);
      setNotes('');

      Alert.alert('Great! 🎉', 'Your mood has been saved! Keep tracking your feelings!');
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (todayMood) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mood Check-In</Text>
          <Text style={styles.headerSubtitle}>You already checked in today!</Text>
        </View>

        <View style={styles.todayMoodCard}>
          <Text style={styles.todayMoodEmoji}>
            {MOODS.find((m) => m.name === todayMood.mood)?.emoji}
          </Text>
          <Text style={styles.todayMoodLabel}>
            {MOODS.find((m) => m.name === todayMood.mood)?.label}
          </Text>
          <Text style={styles.todayMoodTime}>
            Today at {new Date(todayMood.created_at).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.motivationCard}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.motivationText}>Great job checking in with your emotions today! 🌟</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How are you feeling?</Text>
        <Text style={styles.headerSubtitle}>Let's check in with your emotions today</Text>
      </View>

      {/* Mood Selection */}
      <View style={styles.moodGrid}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.name}
            style={[
              styles.moodButton,
              selectedMood === mood.name && styles.moodButtonSelected,
              { borderColor: mood.color },
            ]}
            onPress={() => setSelectedMood(mood.name)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Intensity Slider */}
      {selectedMood && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How strong is your feeling?</Text>
          <View style={styles.intensityContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityButton,
                  intensity === level && styles.intensityButtonActive,
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text style={styles.intensityText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Tags */}
      {selectedMood && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What triggered this feeling?</Text>
          <View style={styles.tagsContainer}>
            {MOOD_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  tags.includes(tag) && styles.tagActive,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    tags.includes(tag) && styles.tagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Submit Button */}
      {selectedMood && (
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Save My Mood 💝</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#4b7bec',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3867d6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 12,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  moodButtonSelected: {
    backgroundColor: '#e0e7ff',
    borderWidth: 3,
  },
  moodEmoji: {
    fontSize: 36,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  intensityButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: '#4b7bec',
    borderColor: '#4b7bec',
  },
  intensityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagActive: {
    backgroundColor: '#4b7bec',
    borderColor: '#4b7bec',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  tagTextActive: {
    color: 'white',
  },
  submitButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4b7bec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  todayMoodCard: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 30,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todayMoodEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  todayMoodLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  todayMoodTime: {
    fontSize: 13,
    color: '#999',
  },
  motivationCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFF8DC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
});
