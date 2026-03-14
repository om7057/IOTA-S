import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
  Picker,
  Switch
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TeenJournalScreen = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [stats, setStats] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [mood, setMood] = useState('happy');
  const [emotion, setEmotion] = useState('');
  const [tags, setTags] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMood, setFilterMood] = useState(null);
  const { token } = useAuth();

  const moodOptions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'confused', 'neutral'];
  const emotionOptions = ['', 'joy', 'sadness', 'fear', 'anger', 'surprise', 'disgust', 'trust', 'anticipation'];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [filterMood]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
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
      const response = await axios.get('/api/teen/journal/stats/mood', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateEntry = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setLoading(true);
      const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
      await axios.post(
        '/api/teen/journal',
        { title: newTitle, content: newContent, mood, emotion, tags: tagsArray },
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
    try {
      setLoading(true);
      await axios.delete(`/api/teen/journal/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEntry(null);
      fetchEntries();
      fetchStats();
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setLoading(false);
    }
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEntries();
    fetchStats();
    setRefreshing(false);
  }, []);

  if (selectedEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedEntry(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{selectedEntry.title}</Text>
        </View>

        <ScrollView style={styles.entryContent}>
          <View style={styles.entryDetail}>
            <View style={styles.entryMood}>
              <Text style={styles.moodEmoji}>
                {getMoodEmoji(selectedEntry.mood)}
              </Text>
              <View style={styles.moodInfo}>
                <Text style={styles.moodLabel}>Mood: {selectedEntry.mood}</Text>
                {selectedEntry.emotion && (
                  <Text style={styles.emotionLabel}>Emotion: {selectedEntry.emotion}</Text>
                )}
              </View>
            </View>

            <Text style={styles.dateText}>
              {new Date(selectedEntry.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.contentText}>{selectedEntry.content}</Text>

            {selectedEntry.tags && JSON.parse(selectedEntry.tags).length > 0 && (
              <View style={styles.tagsContainer}>
                {JSON.parse(selectedEntry.tags).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedEntry.aiSuggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 Suggestions for you</Text>
                {JSON.parse(selectedEntry.aiSuggestions).map((suggestion, idx) => (
                  <Text key={idx} style={styles.suggestionText}>
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            if (window.confirm('Delete this entry?')) {
              handleDeleteEntry(selectedEntry.id);
            }
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
          <Text style={styles.createButton}>✏️</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.averageMoodScore.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
          </View>
        </View>
      )}

      {showCreateForm && (
        <ScrollView style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entry Title"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>How are you feeling?</Text>
            <Picker
              selectedValue={mood}
              onValueChange={setMood}
              style={styles.picker}
            >
              {moodOptions.map(m => (
                <Picker.Item key={m} label={`${getMoodEmoji(m)} ${m}`} value={m} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Emotion (optional)</Text>
            <Picker
              selectedValue={emotion}
              onValueChange={setEmotion}
              style={styles.picker}
            >
              {emotionOptions.map(e => (
                <Picker.Item key={e} label={e || 'Select emotion'} value={e} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="What's on your mind?"
            value={newContent}
            onChangeText={setNewContent}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Tags (comma-separated)"
            value={tags}
            onChangeText={setTags}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateEntry}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <FlatList
        data={entries}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedEntry(item)}
            style={styles.entryCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
            </View>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.cardPreview} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No entries yet. Start writing!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  createButton: {
    fontSize: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  entryCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  moodEmoji: {
    fontSize: 24,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardPreview: {
    fontSize: 14,
    color: '#555',
  },
  entryContent: {
    flex: 1,
  },
  entryDetail: {
    padding: 16,
    backgroundColor: '#fff',
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  moodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emotionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e8e8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#7c3afd',
  },
  suggestionsContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 4,
  },
  deleteButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TeenJournalScreen;
