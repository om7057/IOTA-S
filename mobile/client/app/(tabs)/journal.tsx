import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { supabase } from '../../lib/supabase';

interface JournalEntry {
  entry_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SuggestedGroup {
  group_name: string;
  query_count: number;
}

export default function JournalScreen() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Fetch journal entries on component mount
  useEffect(() => {
    if (session?.access_token) {
      fetchJournalEntries();
    }
  }, [session]);
  
  const fetchJournalEntries = async () => {
    if (!session?.access_token) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/journal-inputs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
      Alert.alert('Error', error.message || 'Failed to fetch journal entries');
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleSaveEntry = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your journal entry');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your journal');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Error', 'Please sign in to save journal entries');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (currentEntryId) {
        // Update existing entry
        response = await fetch(`${API_URL}/journal-inputs/${currentEntryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ title, content }),
        });
      } else {
        // Create new entry
        response = await fetch(`${API_URL}/journal-inputs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ title, content }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      const data = await response.json();
      
      if (currentEntryId) {
        // Update the entries list with the edited entry
        setEntries(entries.map(entry => 
          entry.entry_id === currentEntryId ? data : entry
        ));
      } else {
        // Add the new entry to the beginning of the list
        setEntries([data, ...entries]);
      }
      
      // Reset form state
      setTitle('');
      setContent('');
      setCurrentEntryId(null);
      setModalVisible(false);
      
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', error.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setCurrentEntryId(entry.entry_id);
    setModalVisible(true);
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    if (!session?.access_token) return;
    
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/journal-inputs/${entryId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              });
              
              if (!response.ok) {
                throw new Error('Failed to delete entry');
              }
              
              // Update the entries list by removing the deleted entry
              setEntries(entries.filter(entry => entry.entry_id !== entryId));
            } catch (error: any) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', error.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };
  
  const openNewEntryModal = () => {
    setTitle('');
    setContent('');
    setCurrentEntryId(null);
    setModalVisible(true);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    
    // If opening the sidebar, automatically load suggested groups
    if (!sidebarVisible) {
      loadSuggestedGroups();
    }
  };

  const loadSuggestedGroups = async () => {
    try {
      setLoadingGroups(true);
      
      // Get user ID with proper error handling
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      const userId = userData.user.id;
      
      // Get session token with proper error handling
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error('No valid session');
      }
      const token = sessionData.session.access_token;
      
      // First analyze queries to get group suggestions
      const analyzeResponse = await fetch(`${API_URL}/api/users/${userId}/analyze-queries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze queries');
      }
      
      // Then get the suggested groups
      const groupsResponse = await fetch(`${API_URL}/api/users/${userId}/suggested-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch suggested groups');
      }
      
      const data = await groupsResponse.json();
      setSuggestedGroups(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggested groups:', error);
      Alert.alert('Error', 'Failed to load suggested groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const renderEntryItem = ({ item }: { item: JournalEntry }) => {
    return (
      <TouchableOpacity 
        style={styles.entryItem}
        onPress={() => handleEditEntry(item)}
      >
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Feather name="file-text" size={16} color="#37352f" style={styles.entryIcon} />
            <Text style={styles.entryTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <Text style={styles.entryExcerpt} numberOfLines={2}>{item.content}</Text>
          <Text style={styles.entryDate}>{formatDate(item.created_at)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.entryAction}
          onPress={() => handleDeleteEntry(item.entry_id)}
        >
          <Feather name="more-horizontal" size={20} color="#9B9A97" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Sidebar Menu (Notion-like) */}
      {sidebarVisible && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Daily Journal</Text>
            <TouchableOpacity onPress={toggleSidebar}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="book-outline" size={20} color="#666" />
            <Text style={styles.sidebarItemText}>All Entries</Text>
          </TouchableOpacity>
          
          {/* Suggested Groups Section */}
          <View style={styles.suggestedGroupsSection}>
            <Text style={styles.sectionTitle}>Suggested Groups</Text>
            {loadingGroups ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : suggestedGroups.length > 0 ? (
              suggestedGroups.map((group: SuggestedGroup, index) => (
                <TouchableOpacity key={index} style={styles.groupItem}>
                  <Ionicons name="people-outline" size={20} color="#666" />
                  <Text style={styles.groupItemText}>{group.group_name}</Text>
                  <Text style={styles.groupCountText}>({group.query_count} queries)</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noGroupsText}>No suggested groups yet</Text>
            )}
          </View>
        </View>
      )}
      
      {/* Main Content */}
      <View style={[styles.mainContent, sidebarVisible && styles.mainContentShifted]}>
        {/* Top Navigation Bar (Notion-style) */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Feather name="menu" size={24} color="#37352f" />
          </TouchableOpacity>
          
          <Text style={styles.navTitle}>Journal</Text>
          
          <TouchableOpacity style={styles.navButton} onPress={openNewEntryModal}>
            <Feather name="plus" size={24} color="#37352f" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#9B9A97" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9B9A97"
          />
        </View>
        
        {/* Entries List */}
        {refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37352f" />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={64} color="#EBECED" />
            <Text style={styles.emptyText}>No entries yet</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={openNewEntryModal}
            >
              <Text style={styles.emptyButtonText}>New Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={entries}
            renderItem={renderEntryItem}
            keyExtractor={item => item.entry_id}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* New/Edit Entry Modal (Notion-like editor) */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="arrow-left" size={24} color="#37352f" />
            </TouchableOpacity>
            
            <View style={styles.editorActions}>
              {loading ? (
                <ActivityIndicator size="small" color="#37352f" />
              ) : (
                <TouchableOpacity onPress={handleSaveEntry}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.editorContent}>
            <TextInput
              style={styles.editorTitle}
              placeholder="Untitled"
              placeholderTextColor="#9B9A97"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            
            <TextInput
              style={styles.editorBody}
              placeholder="Start writing..."
              placeholderTextColor="#9B9A97"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    paddingTop: 40,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#EBECED',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECED',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#37352f',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 2,
    borderRadius: 3,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#37352f',
    marginLeft: 12,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContentShifted: {
    opacity: 0.3,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECED',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#37352f',
  },
  navButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#EBECED',
    borderRadius: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#37352f',
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9B9A97',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EBECED',
    borderRadius: 3,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#37352f',
  },
  entriesList: {
    padding: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECED',
  },
  entryContent: {
    flex: 1,
    paddingRight: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryIcon: {
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37352f',
  },
  entryExcerpt: {
    fontSize: 14,
    color: '#9B9A97',
    marginBottom: 4,
    lineHeight: 20,
  },
  entryDate: {
    fontSize: 12,
    color: '#9B9A97',
  },
  entryAction: {
    padding: 8,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECED',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37352f',
  },
  editorContent: {
    flex: 1,
    padding: 16,
  },
  editorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#37352f',
    marginBottom: 16,
    padding: 0,
  },
  editorBody: {
    fontSize: 16,
    color: '#37352f',
    lineHeight: 24,
    padding: 0,
    minHeight: 300,
  },
  suggestedGroupsSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  groupItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  groupCountText: {
    fontSize: 12,
    color: '#666',
  },
  noGroupsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});