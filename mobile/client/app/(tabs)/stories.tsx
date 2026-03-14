import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

type Topic = {
  id: string;
  name: string;
  description?: string;
};

type Story = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  topic_id: string;
  created_at: string;
};

export default function StoriesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session?.token) {
      fetchTopics();
    }
  }, [session?.token]);

  useEffect(() => {
    if (selectedTopicId && session?.token) {
      fetchStories(selectedTopicId);
    }
  }, [selectedTopicId, session?.token]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/topics`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      setTopics(data);
      
      // Auto-select first topic
      if (data.length > 0 && !selectedTopicId) {
        setSelectedTopicId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      Alert.alert('Error', 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async (topicId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories/topic/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedTopicId) {
      fetchStories(selectedTopicId);
    }
  };

  const renderTopicItem = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={[
        styles.topicItem,
        selectedTopicId === item.id && styles.selectedTopicItem,
      ]}
      onPress={() => setSelectedTopicId(item.id)}
    >
      <Text
        style={[
          styles.topicText,
          selectedTopicId === item.id && styles.selectedTopicText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => router.push(`/story-player/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.storyContent}>
        <Ionicons name="book-outline" size={32} color="#4b7bec" style={styles.storyIcon} />
        <View style={styles.storyText}>
          <Text style={styles.storyTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.storyDescription} numberOfLines={2}>
            {item.description || 'An interactive story'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading && topics.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Story Adventures</Text>
        <Text style={styles.headerSubtitle}>Choose your learning journey</Text>
      </View>

      {/* Topics tabs - using ScrollView instead of FlatList to avoid nested VirtualizedList warning */}
      {topics.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsContainer}
          scrollEventThrottle={16}>
          {topics.map((topic) => renderTopicItem({ item: topic }))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && stories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4b7bec" />
        </View>
      ) : stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storiesList}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4b7bec']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          {renderHeader()}
          <Ionicons name="book-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No stories available</Text>
          <Text style={styles.emptySubtext}>Check back soon for new adventures!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  topicsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  topicItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedTopicItem: {
    backgroundColor: '#4b7bec',
    borderColor: '#4b7bec',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedTopicText: {
    color: 'white',
  },
  storiesList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  storyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  storyContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    gap: 12,
  },
  storyIcon: {
    marginRight: 4,
  },
  storyText: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storyDescription: {
    fontSize: 13,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
