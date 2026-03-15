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
  Picker
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TeenCommunityScreen = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('general');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { token } = useAuth();

  const categories = ['general', 'mental-health', 'peer-support', 'safety', 'relationships', 'school'];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teen/groups/groups');
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teen/groups/groups/${groupId}/messages`);
      setGroupMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/teen/groups/groups',
        {
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCategory,
          isPrivate: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateForm(false);
      setSelectedGroup(response.data);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/teen/groups/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGroups();
    } catch (error) {
      if (error.response?.status !== 400) {
        console.error('Error joining group:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/teen/groups/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    try {
      setLoading(true);
      await axios.post(
        `/api/teen/groups/groups/${selectedGroup.id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageContent('');
      fetchGroupMessages(selectedGroup.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general': { bg: '#e3f2fd', text: '#1976d2' },
      'mental-health': { bg: '#f3e5f5', text: '#7b1fa2' },
      'peer-support': { bg: '#e8f5e9', text: '#388e3c' },
      'safety': { bg: '#ffebee', text: '#d32f2f' },
      'relationships': { bg: '#fce4ec', text: '#c2185b' },
      'school': { bg: '#fff3e0', text: '#f57c00' }
    };
    return colors[category] || colors['general'];
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    } else {
      fetchGroups();
    }
    setRefreshing(false);
  }, [selectedGroup]);

  if (!selectedGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Communities</Text>
          <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
            <Text style={styles.createButton}>+</Text>
          </TouchableOpacity>
        </View>

        {showCreateForm && (
          <ScrollView style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              multiline
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category</Text>
              <Picker
                selectedValue={newGroupCategory}
                onValueChange={setNewGroupCategory}
                style={styles.picker}
              >
                {categories.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateGroup}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Group'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <FlatList
          data={groups}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedGroup(item)}
              style={styles.groupCard}
            >
              <View style={styles.groupHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupMembers}>
                    👥 {item.memberCount || 0} members
                  </Text>
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(item.category).bg }
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: getCategoryColor(item.category).text }
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>
              </View>
              {item.description && (
                <Text style={styles.groupDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedGroup(null)}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{selectedGroup.name}</Text>
        <TouchableOpacity onPress={() => handleLeaveGroup(selectedGroup.id)}>
          <Text style={styles.leaveButton}>Leave</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.groupDetailHeader}>
        <Text style={styles.groupDetailTitle}>{selectedGroup.name}</Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(selectedGroup.category).bg }
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: getCategoryColor(selectedGroup.category).text }
            ]}
          >
            {selectedGroup.category}
          </Text>
        </View>
      </View>

      {selectedGroup.description && (
        <Text style={styles.groupDetailDesc}>{selectedGroup.description}</Text>
      )}

      <View style={styles.messagesLabel}>
        <Text style={styles.messagesTitle}>Group Chat</Text>
        <Text style={styles.memberCount}>
          👥 {selectedGroup.memberCount || 0} members
        </Text>
      </View>

      <FlatList
        data={groupMessages}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageSender}>
                {item.User?.name || 'Anonymous'}
              </Text>
              <Text style={styles.messageTime}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            <Text style={styles.messageContent}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      <View style={styles.messageFormContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Share your thoughts..."
          value={messageContent}
          onChangeText={setMessageContent}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading || !messageContent.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
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
  createButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  leaveButton: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
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
  groupCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: '#666',
  },
  groupDesc: {
    fontSize: 14,
    color: '#555',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupDetailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  groupDetailDesc: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  messagesLabel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  messageCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
  },
  messageFormContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
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

export default TeenCommunityScreen;
