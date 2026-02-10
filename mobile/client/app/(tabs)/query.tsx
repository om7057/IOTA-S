// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useAuth } from '../../contexts/AuthContext';
// import { API_URL } from '../../constants';
// import { Ionicons } from '@expo/vector-icons';

// type Query = {
//   query_id: string;
//   question: string;
//   answer: string | null;
//   created_at: string;
//   user: {
//     display_name: string;
//     email: string;
//   };
// };

// export default function QueryScreen() {
//   const { session } = useAuth();
//   const [queries, setQueries] = useState<Query[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [newQuery, setNewQuery] = useState('');
//   const [sending, setSending] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [analyzing, setAnalyzing] = useState(false);

//   useEffect(() => {
//     if (session?.access_token) {
//       fetchQueries();
//     }
//   }, [session?.access_token]);

//   const fetchQueries = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/queries`, {
//         headers: {
//           'Authorization': `Bearer ${session?.access_token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Server response:', errorText);
//         throw new Error(`Failed to fetch queries: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Fetched queries:', data);
      
//       // Sort queries by creation date, newest first
//       const sortedQueries = data.sort((a: Query, b: Query) => 
//         new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//       setQueries(sortedQueries);
//     } catch (error) {
//       console.error('Error fetching queries:', error);
//       Alert.alert('Error', 'Failed to load queries. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleSend = async () => {
//     if (!newQuery.trim() || !session?.access_token || sending) return;

//     try {
//       setSending(true);
//       const response = await fetch(`${API_URL}/queries`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.access_token}`,
//         },
//         body: JSON.stringify({
//           question: newQuery.trim(),
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Server response:', errorText);
//         throw new Error(`Failed to send query: ${response.status}`);
//       }

//       const newQueryData = await response.json();
//       console.log('New query created:', newQueryData);
      
//       // Add the new query to the beginning of the list
//       setQueries(prevQueries => [newQueryData, ...prevQueries]);
//       setNewQuery('');
//     } catch (error) {
//       console.error('Error sending query:', error);
//       Alert.alert('Error', 'Failed to send query. Please try again.');
//     } finally {
//       setSending(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchQueries();
//   };

//   const handleAnalyzeQueries = async () => {
//     if (!session?.access_token) {
//       Alert.alert('Error', 'Please sign in to analyze queries');
//       return;
//     }

//     if (queries.length === 0) {
//       Alert.alert('No Queries', 'Please add some queries to analyze');
//       return;
//     }

//     setAnalyzing(true);
//     try {
//       const response = await fetch(`${API_URL}/analyze-queries`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${session.access_token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ queries }),
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Analysis server error:', errorText);
//         throw new Error('Failed to analyze queries');
//       }

//       const data = await response.json();
//       console.log('Analysis response:', data);
      
//       // Simply show a success message since the results are stored in the database
//       Alert.alert('Success', 'Analysis completed successfully. Refreshing results...');
//       fetchQueries(); // Refresh the queries to get any updated data
      
//     } catch (error) {
//       console.error('Error analyzing queries:', error);
//       Alert.alert('Error', 'Failed to analyze queries. Please try again.');
//     } finally {
//       setAnalyzing(false);
//     }
//   };

//   const renderQuery = ({ item }: { item: Query }) => (
//     <View style={styles.queryItem}>
//       <View style={styles.queryHeader}>
//         <Text style={styles.queryTitle}>{item.question}</Text>
//         <Text style={styles.queryTime}>
//           {new Date(item.created_at).toLocaleString()}
//         </Text>
//       </View>
//       {item.answer && (
//         <View style={styles.answerContainer}>
//           <Text style={styles.answerLabel}>Answer:</Text>
//           <Text style={styles.answer}>{item.answer}</Text>
//         </View>
//       )}
//       <View style={styles.queryFooter}>
//         <Text style={styles.queryAuthor}>
//           Posted by {item.user?.display_name || 'Anonymous User'}
//         </Text>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//     >
//       <View style={styles.header}>
//         <Text style={styles.title}>Queries</Text>
//         <TouchableOpacity 
//           style={styles.analyzeButton}
//           onPress={handleAnalyzeQueries}
//           disabled={analyzing || queries.length === 0}
//         >
//           {analyzing ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.analyzeButtonText}>Analyze</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={queries}
//         renderItem={renderQuery}
//         keyExtractor={(item) => item.query_id}
//         contentContainerStyle={styles.listContainer}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           value={newQuery}
//           onChangeText={setNewQuery}
//           placeholder="Type your query..."
//           placeholderTextColor="#999"
//           multiline
//         />
//         <TouchableOpacity
//           style={[styles.sendButton, sending && styles.sendButtonDisabled]}
//           onPress={handleSend}
//           disabled={sending || !newQuery.trim()}
//         >
//           <Ionicons
//             name="send"
//             size={24}
//             color={sending || !newQuery.trim() ? '#999' : '#007AFF'}
//           />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   analyzeButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   analyzeButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   queryItem: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   queryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   queryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     flex: 1,
//     marginRight: 8,
//   },
//   queryTime: {
//     fontSize: 12,
//     color: '#666',
//   },
//   queryDescription: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 8,
//   },
//   queryFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   queryAuthor: {
//     fontSize: 12,
//     color: '#666',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     maxHeight: 100,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f5f5f5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonDisabled: {
//     opacity: 0.5,
//   },
//   answerContainer: {
//     backgroundColor: '#f8f8f8',
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 8,
//   },
//   answerLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 4,
//   },
//   answer: {
//     fontSize: 14,
//     color: '#333',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

type Query = {
  query_id: string;
  question: string;
  answer: string | null;
  created_at: string;
  user: {
    display_name: string;
    email: string;
  };
};

export default function QueryScreen() {
  const { session } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      fetchQueries();
    }
  }, [session?.access_token]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/queries`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to fetch queries: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched queries:', data);
      
      // Sort queries by creation date, newest first
      const sortedQueries = data.sort((a: Query, b: Query) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setQueries(sortedQueries);
    } catch (error) {
      console.error('Error fetching queries:', error);
      Alert.alert('Error', 'Failed to load queries. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSend = async () => {
    if (!newQuery.trim() || !session?.access_token || sending) return;

    try {
      setSending(true);
      const response = await fetch(`${API_URL}/queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question: newQuery.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to send query: ${response.status}`);
      }

      const newQueryData = await response.json();
      console.log('New query created:', newQueryData);
      
      // Add the new query to the beginning of the list
      setQueries(prevQueries => [newQueryData, ...prevQueries]);
      setNewQuery('');
      
      // Show notification if there's already an answer
      if (newQueryData.answer) {
        Alert.alert(
          'Response Received',
          'Your query has been answered by AI.',
          [{ text: 'View', onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error('Error sending query:', error);
      Alert.alert('Error', 'Failed to send query. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueries();
  };

  const handleAnalyzeQueries = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Please sign in to analyze queries');
      return;
    }

    // Get unanswered queries
    const unansweredQueries = queries.filter(query => !query.answer);
    
    if (unansweredQueries.length === 0) {
      Alert.alert('No Queries', 'There are no unanswered queries to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/analyze-queries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analysis server error:', errorText);
        throw new Error('Failed to analyze queries');
      }

      const data = await response.json();
      console.log('Analysis response:', data);
      
      // Show summary of analysis
      Alert.alert(
        'Analysis Complete', 
        `Processed ${data.processed} out of ${data.total} queries.`,
        [{ text: 'OK', onPress: () => fetchQueries() }]
      );
      
    } catch (error) {
      console.error('Error analyzing queries:', error);
      Alert.alert('Error', 'Failed to analyze queries. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderQuery = ({ item }: { item: Query }) => (
    <View style={styles.queryItem}>
      <View style={styles.queryHeader}>
        <Text style={styles.queryTitle}>{item.question}</Text>
        <Text style={styles.queryTime}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      {item.answer ? (
        <View style={styles.answerContainer}>
          <View style={styles.answerLabelContainer}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#007AFF" />
            <Text style={styles.answerLabel}>Answer</Text>
          </View>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      ) : (
        <View style={styles.pendingContainer}>
          <Ionicons name="time-outline" size={16} color="#888" />
          <Text style={styles.pendingText}>Awaiting analysis...</Text>
        </View>
      )}
      <View style={styles.queryFooter}>
        <View style={styles.authorContainer}>
          <Ionicons name="person-circle-outline" size={14} color="#666" />
          <Text style={styles.queryAuthor}>
            {item.user?.display_name || 'Anonymous User'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>always with you</Text>
          <TouchableOpacity 
            style={[
              styles.analyzeButton,
              (analyzing || queries.filter(q => !q.answer).length === 0) && styles.analyzeButtonDisabled
            ]}
            onPress={handleAnalyzeQueries}
            disabled={analyzing || queries.filter(q => !q.answer).length === 0}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics-outline" size={14} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.analyzeButtonText}>
                  Analyze ({queries.filter(q => !q.answer).length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading queries...</Text>
          </View>
        ) : (
          <FlatList
            data={queries}
            renderItem={renderQuery}
            keyExtractor={(item) => item.query_id}
            contentContainerStyle={[
              styles.listContainer,
              queries.length === 0 && styles.emptyListContainer
            ]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ddd" />
                <Text style={styles.emptyTitle}>No queries yet</Text>
                <Text style={styles.emptyText}>Start by asking a question below!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
            value={newQuery}
            onChangeText={setNewQuery}
            placeholder="Ask AI a question..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (sending || !newQuery.trim()) ? styles.sendButtonDisabled : styles.sendButtonActive
            ]}
            onPress={handleSend}
            disabled={sending || !newQuery.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#b0d0f7',
  },
  buttonIcon: {
    marginRight: 4,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    padding: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  queryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  queryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    color: '#333',
    lineHeight: 22,
  },
  queryTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  queryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queryAuthor: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    marginRight: 0,
    maxHeight: 120,
    minHeight: 44,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    bottom: 19,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  answerContainer: {
    backgroundColor: '#f0f8ff',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  answerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
  answer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  pendingContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ccc',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pendingText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
});