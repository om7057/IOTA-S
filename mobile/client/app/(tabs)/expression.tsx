import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

// Define types
type Topic = {
  topic_id: string;
  topic_name: string;
  description: string;
  created_at: string;
};

type User = {
  id: string;
  display_name: string;
  email: string;
};

type Post = {
  post_id: string;
  content: string;
  created_at: string;
  users: User;
  topics: Topic;
  likes_count: number;
  liked?: boolean;
};

type Comment = {
  comment_id: string;
  content: string;
  created_at: string;
  users: User;
};

export default function ExpressionScreen() {
  const { session } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch topics on component mount
  useEffect(() => {
    if (session?.access_token) {
      fetchTopics();
    }
  }, [session?.access_token]);

  // Fetch posts when a topic is selected
  useEffect(() => {
    if (selectedTopic && session?.access_token) {
      fetchPosts(selectedTopic.topic_id);
    }
  }, [selectedTopic, session?.access_token]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/topics`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.status}`);
      }

      const data = await response.json();
      setTopics(data);
      
      // Auto-select the first topic if none is selected
      if (data.length > 0 && !selectedTopic) {
        setSelectedTopic(data[0]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      Alert.alert('Error', 'Failed to load topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/topics/${topicId}/posts`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      
      // Update like status for each post
      const postsWithLikeStatus = await Promise.all(
        data.map(async (post: Post) => {
          try {
            const likeResponse = await fetch(`${API_URL}/posts/${post.post_id}/like`, {
              headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              return { ...post, liked: likeData.liked };
            }
            return post;
          } catch (error) {
            console.error('Error fetching like status:', error);
            return post;
          }
        })
      );
      
      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedTopic || !session?.access_token || sending) return;

    try {
      setSending(true);
      const response = await fetch(`${API_URL}/topics/${selectedTopic.topic_id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.status}`);
      }

      const newPost = await response.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleLikeToggle = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.status}`);
      }

      const likeData = await response.json();
      
      // Update the posts state with the new like status and count
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === postId 
            ? { ...post, liked: likeData.liked, likes_count: likeData.likes_count } 
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const handleCommentPress = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.post_id);
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !session?.access_token || sendingComment) return;

    try {
      setSendingComment(true);
      const response = await fetch(`${API_URL}/posts/${selectedPost.post_id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const newCommentData = await response.json();
      setComments(prevComments => [...prevComments, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSendingComment(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedTopic) {
      fetchPosts(selectedTopic.topic_id);
    } else {
      setRefreshing(false);
    }
  }, [selectedTopic]);

  if (loading && !refreshing && topics.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderTopicItem = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={[
        styles.topicItem,
        selectedTopic?.topic_id === item.topic_id && styles.selectedTopicItem
      ]}
      onPress={() => setSelectedTopic(item)}
    >
      <Text 
        style={[
          styles.topicText,
          selectedTopic?.topic_id === item.topic_id && styles.selectedTopicText
        ]}
      >
        {item.topic_name}
      </Text>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.users.display_name}</Text>
        <Text style={styles.postTime}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikeToggle(item.post_id)}
        >
          <Ionicons
            name={item.liked ? "heart" : "heart-outline"}
            size={20}
            color={item.liked ? "#e74c3c" : "#666"}
          />
          <Text style={styles.actionText}>{item.likes_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentPress(item)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{item.users.display_name}</Text>
        <Text style={styles.commentTime}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mental Health Expressions</Text>
      </View>
      
      {/* Topics horizontal scrollable list */}
      <View style={styles.topicsContainer}>
        <FlatList
          data={topics}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item.topic_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsList}
        />
      </View>
      
      {/* New post input */}
      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.newPostInput}
          value={newPostContent}
          onChangeText={setNewPostContent}
          placeholder={`What's on your mind about ${selectedTopic?.topic_name || 'this topic'}?`}
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.postButton, (!newPostContent.trim() || sending) && styles.disabledButton]}
          onPress={handleCreatePost}
          disabled={!newPostContent.trim() || sending}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      
      {/* Posts list */}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.post_id}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      
      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {loadingComments ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.comment_id}
                contentContainerStyle={styles.commentsList}
                ListEmptyComponent={
                  <Text style={styles.emptyCommentsText}>No comments yet. Be the first to comment!</Text>
                }
              />
            )}
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity
                style={[styles.commentButton, (!newComment.trim() || sendingComment) && styles.disabledButton]}
                onPress={handleAddComment}
                disabled={!newComment.trim() || sendingComment}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4b7bec',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3867d6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  topicsContainer: {
    marginVertical: 10,
  },
  topicsList: {
    paddingHorizontal: 10,
  },
  topicItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTopicItem: {
    backgroundColor: '#4b7bec',
    borderColor: '#3867d6',
  },
  topicText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTopicText: {
    color: 'white',
    fontWeight: 'bold',
  },
  newPostContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  newPostInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  postButton: {
    backgroundColor: '#4b7bec',
    marginLeft: 10,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#b8c2d6',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postsList: {
    padding: 10,
  },
  postItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},
postHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
},
postAuthor: {
  fontWeight: 'bold',
  fontSize: 15,
  color: '#333',
},
postTime: {
  fontSize: 12,
  color: '#999',
},
postContent: {
  fontSize: 15,
  color: '#333',
  marginBottom: 10,
  lineHeight: 20,
},
postActions: {
  flexDirection: 'row',
  borderTopWidth: 1,
  borderTopColor: '#eee',
  paddingTop: 10,
},
actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 20,
},
actionText: {
  marginLeft: 5,
  fontSize: 13,
  color: '#666',
},
modalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  backgroundColor: 'white',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '80%',
  paddingBottom: Platform.OS === 'ios' ? 30 : 10,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
},
commentsList: {
  padding: 10,
  maxHeight: 400,
},
commentItem: {
  backgroundColor: '#f9f9f9',
  borderRadius: 10,
  padding: 12,
  marginBottom: 8,
},
commentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 5,
},
commentAuthor: {
  fontWeight: 'bold',
  fontSize: 14,
  color: '#333',
},
commentTime: {
  fontSize: 11,
  color: '#999',
},
commentContent: {
  fontSize: 14,
  color: '#333',
},
commentInputContainer: {
  flexDirection: 'row',
  padding: 10,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},
commentInput: {
  flex: 1,
  backgroundColor: '#f9f9f9',
  borderRadius: 20,
  paddingHorizontal: 15,
  paddingVertical: 8,
  maxHeight: 80,
  borderWidth: 1,
  borderColor: '#eee',
},
commentButton: {
  backgroundColor: '#4b7bec',
  marginLeft: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 20,
},
emptyCommentsText: {
  textAlign: 'center',
  padding: 20,
  color: '#999',
  fontStyle: 'italic',
}
})