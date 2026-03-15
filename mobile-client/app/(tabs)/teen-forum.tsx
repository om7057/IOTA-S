import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TeenForumScreen = () => {
  const [topics, setTopics] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teen/discussions/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (topicId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/discussions/topics/${topicId}/discussions`);
      setDiscussions(response.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/discussions/discussions/${discussionId}`);
      setSelectedDiscussion(response.data);
      setComments(response.data.TeenComments || []);
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    setSelectedDiscussion(null);
    fetchDiscussions(topicId);
  };

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setLoading(true);
      await axios.post(
        '/api/teen/discussions/discussions',
        { topicId: selectedTopic, title: newTitle, content: newContent, isAnonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewContent('');
      setIsAnonymous(false);
      setShowCreateForm(false);
      fetchDiscussions(selectedTopic);
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      await axios.post(
        `/api/teen/discussions/discussions/${selectedDiscussion.id}/comments`,
        { content: newComment, isAnonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchDiscussionDetails(selectedDiscussion.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (selectedDiscussion) {
      fetchDiscussionDetails(selectedDiscussion.id);
    } else if (selectedTopic) {
      fetchDiscussions(selectedTopic);
    } else {
      fetchTopics();
    }
    setRefreshing(false);
  }, [selectedDiscussion, selectedTopic]);

  if (!selectedTopic) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Teen Forum</Text>
        </View>
        <FlatList
          data={topics}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleTopicSelect(item.id)}
              style={styles.topicCard}
            >
              <Text style={styles.topicName}>{item.name}</Text>
              <Text style={styles.topicDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  if (!selectedDiscussion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedTopic(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Discussions</Text>
          <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
            <Text style={styles.createButton}>+</Text>
          </TouchableOpacity>
        </View>

        {showCreateForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Discussion Title"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Share your thoughts..."
              value={newContent}
              onChangeText={setNewContent}
              multiline
            />
            <TouchableOpacity
              style={styles.checkBox}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Text>{isAnonymous ? '✓' : '  '} Post anonymously</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateDiscussion}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={discussions}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => fetchDiscussionDetails(item.id)}
              style={styles.discussionCard}
            >
              <View style={styles.discussionHeader}>
                <Text style={styles.discussionTitle}>{item.title}</Text>
                <Text style={styles.likes}>👍 {item.likes || 0}</Text>
              </View>
              <Text style={styles.discussionAuthor}>
                {item.isAnonymous ? 'Anonymous' : item.User?.name || 'Unknown'}
              </Text>
              <Text style={styles.discussionPreview} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.commentCount}>
                {item.commentCount || 0} replies
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDiscussion(null)}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {selectedDiscussion.title}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.discussionContent}
      >
        <View style={styles.discussionDetail}>
          <View style={styles.discussionInfo}>
            <Text style={styles.author}>
              {selectedDiscussion.isAnonymous ? 'Anonymous' : selectedDiscussion.User?.name}
            </Text>
            <Text style={styles.likes}>👍 {selectedDiscussion.likes || 0}</Text>
          </View>
          <Text style={styles.content}>{selectedDiscussion.content}</Text>
        </View>

        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>
                {comment.isAnonymous ? 'Anonymous' : comment.User?.name}
              </Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentLikes}>👍 {comment.likes || 0}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentFormContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={styles.commentSubmitButton}
          onPress={handleAddComment}
          disabled={loading || !newComment.trim()}
        >
          <Text style={styles.commentSubmitText}>Post</Text>
        </TouchableOpacity>
      </View>
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
    marginLeft: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  createButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  topicCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDesc: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  checkBox: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  discussionCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discussionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  likes: {
    fontSize: 14,
    color: '#666',
  },
  discussionAuthor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  discussionPreview: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  commentCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  discussionContent: {
    flex: 1,
  },
  discussionDetail: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  discussionInfo: {
    marginBottom: 12,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  commentsContainer: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  comment: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentLikes: {
    fontSize: 12,
    color: '#666',
  },
  commentFormContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    maxHeight: 80,
  },
  commentSubmitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  commentSubmitText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TeenForumScreen;
