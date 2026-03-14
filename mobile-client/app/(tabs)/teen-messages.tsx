import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TeenMessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCounselorList, setShowCounselorList] = useState(false);
  const [userId, setUserId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchUserId();
    fetchConversations();
    fetchVerifiedCounselors();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  const fetchUserId = async () => {
    try {
      // Get user ID from token or storage
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(parseInt(storedUserId) || 0);
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teen/messages/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/messages/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
      markConversationAsRead(otherUserId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedCounselors = async () => {
    try {
      const response = await axios.get('/api/teen/messages/counselors/verified');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const markConversationAsRead = async (otherUserId) => {
    try {
      await axios.patch(
        `/api/teen/messages/messages/${otherUserId}/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) return;
    try {
      setLoading(true);
      await axios.post(
        `/api/teen/messages/messages/${selectedConversation.userId}`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageContent('');
      fetchMessages(selectedConversation.userId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (counselor) => {
    try {
      await axios.post(
        `/api/teen/messages/messages/${counselor.User.id}`,
        { content: 'Hi, I would like to chat with you.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCounselorList(false);
      setSelectedConversation({
        userId: counselor.User.id,
        otherUser: counselor.User
      });
      fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    } else {
      fetchConversations();
    }
    setRefreshing(false);
  }, [selectedConversation]);

  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity onPress={() => setShowCounselorList(!showCounselorList)}>
            <Text style={styles.newMessageButton}>+</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showCounselorList}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCounselorList(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verified Counselors</Text>
              <TouchableOpacity onPress={() => setShowCounselorList(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={counselors}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleStartConversation(item)}
                  style={styles.counselorCard}
                >
                  <View style={styles.counselorInfo}>
                    <Text style={styles.counselorName}>{item.User.name}</Text>
                    <Text style={styles.verificationBadge}>
                      ✓ {item.verificationType}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No verified counselors available</Text>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>

        <FlatList
          data={conversations}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedConversation(item)}
              style={styles.conversationCard}
            >
              <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>
                  {item.otherUser?.name || 'Unknown'}
                </Text>
                <Text style={styles.conversationPreview} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {selectedConversation.otherUser?.name || 'Unknown'}
          </Text>
        </View>

        <FlatList
          data={messages}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(item) => item.id.toString()}
          inverted
          renderItem={({ item }) => {
            const isOwn = item.senderId === userId;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isOwn ? styles.ownMessage : styles.otherMessage
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isOwn ? styles.ownMessageText : styles.otherMessageText
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isOwn ? styles.ownMessageTime : styles.otherMessageTime
                  ]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyMessagesContainer}>
              <Text style={styles.emptyMessagesText}>
                Start the conversation!
              </Text>
            </View>
          }
        />

        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInputField}
            placeholder="Type a message..."
            value={messageContent}
            onChangeText={setMessageContent}
            multiline
            maxHeight={80}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageContent.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageContent.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 8,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  newMessageButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  counselorCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counselorInfo: {
    flex: 1,
  },
  counselorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  verificationBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  conversationCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#cce5ff',
  },
  otherMessageTime: {
    color: '#888',
  },
  messageInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  messageInputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TeenMessagesScreen;
