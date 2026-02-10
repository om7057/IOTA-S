"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { API_URL } from "@/constants"
import { useAuth } from "@/contexts/AuthContext"

type Group = {
  group_id: string
  group_name: string
  created_at: string
}

type GroupMessage = {
  message_id: string
  content: string
  created_at: string
  users: {
    id: string
    display_name: string
    email: string
    is_verified: boolean
  }
}

type User = {
  id: string
  display_name: string
  is_verified: boolean
}

type DirectMessage = {
  message_id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

type Conversation = {
  partnerId: string
  partner: User
  latestMessage: DirectMessage
  unreadCount: number
}

type Query = {
  id: string
  query_text: string
  created_at: string
  user_id: string
}

type SuggestedGroup = {
  group_name: string
  query_count: number
}

type AnalysisResult = {
  analyzed: number
  groups: string[]
  results: Array<{
    group: string
    status: "joined" | "already_member" | "failed"
    error?: string
  }>
}

// Get screen dimensions
const { width, height } = Dimensions.get("window")

export default function GroupScreen() {
  const { session } = useAuth()
  const [groupName, setGroupName] = useState("")
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Direct messaging states
  const [dmVisible, setDmVisible] = useState(false)
  const [dmPartner, setDmPartner] = useState<User | null>(null)
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([])
  const [dmText, setDmText] = useState("")
  const [sendingDm, setSendingDm] = useState(false)
  const [inboxVisible, setInboxVisible] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // New states for group analysis
  const [analyzingQueries, setAnalyzingQueries] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (session?.access_token) {
      fetchMyGroups()
      fetchUnreadCount()
    }
  }, [session?.access_token])

  // Periodically check for unread messages
  useEffect(() => {
    if (!session?.access_token) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [session?.access_token])

  // Fetch number of unread direct messages
  const fetchUnreadCount = async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch(`${API_URL}/direct-messages/unread/count`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`)
      }

      const { count } = await response.json()
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  // Fetch groups the user is a member of
  const fetchMyGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`)
      }

      const data = await response.json()
      setMyGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
      Alert.alert("Error", "Failed to load your groups. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected group
  const fetchMessages = async () => {
    if (!selectedGroup) return

    try {
      setRefreshing(true)
      const response = await fetch(`${API_URL}/groups/${selectedGroup.group_id}/messages`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      Alert.alert("Error", "Failed to load messages. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  // Join a group
  const handleJoinGroup = async () => {
    if (!groupName.trim() || !session?.access_token || joining) return

    try {
      setJoining(true)
      const response = await fetch(`${API_URL}/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        Alert.alert("Error", result.error || "Group does not exist")
        return
      }

      Alert.alert("Success", result.message)
      setGroupName("")

      // Refresh groups
      fetchMyGroups()
    } catch (error) {
      console.error("Error joining group:", error)
      Alert.alert("Error", "Failed to join group. Please try again.")
    } finally {
      setJoining(false)
    }
  }

  // Send a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedGroup || !session?.access_token || sendingMessage) return

    try {
      setSendingMessage(true)
      const response = await fetch(`${API_URL}/groups/${selectedGroup.group_id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: messageText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const newMessage = await response.json()

      // Add the new message to the beginning of the list
      setMessages((prevMessages) => [newMessage, ...prevMessages])
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle group selection
  const selectGroup = (group: Group) => {
    setSelectedGroup(group)
    fetchMessages()
  }

  // Direct messaging functions
  const openDirectMessage = async (userId: string) => {
    if (!session?.access_token) return

    try {
      const response = await fetch(`${API_URL}/direct-messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load conversation")
      }

      const data = await response.json()
      setDmMessages(data.messages)

      // Set the partner information
      setDmPartner(data.partner)

      // Open the chat window with animation
      setDmVisible(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Refresh unread count
      fetchUnreadCount()
    } catch (error) {
      console.error("Error opening direct message:", error)
      Alert.alert("Error", "Failed to load conversation. Please try again.")
    }
  }

  const closeDm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDmVisible(false)
      setDmPartner(null)
      setDmMessages([])
    })
  }

  const sendDirectMessage = async () => {
    if (!dmText.trim() || !dmPartner || !session?.access_token || sendingDm) return

    try {
      setSendingDm(true)
      const response = await fetch(`${API_URL}/direct-messages/${dmPartner.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: dmText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const { message } = await response.json()

      // Add the new message to the beginning of the list
      setDmMessages((prevMessages) => [message, ...prevMessages])
      setDmText("")
    } catch (error) {
      console.error("Error sending direct message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setSendingDm(false)
    }
  }

  const openInbox = async () => {
    try {
      setLoadingConversations(true)
      setInboxVisible(true)

      const response = await fetch(`${API_URL}/direct-messages/inbox`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch inbox: ${response.status}`)
      }

      const data = await response.json()
      setConversations(data)

      // Reset unread count
      fetchUnreadCount()
    } catch (error) {
      console.error("Error fetching inbox:", error)
      Alert.alert("Error", "Failed to load inbox. Please try again.")
    } finally {
      setLoadingConversations(false)
    }
  }

  const closeInbox = () => {
    setInboxVisible(false)
  }

  const selectConversation = (conversation: Conversation) => {
    closeInbox()
    openDirectMessage(conversation.partner.id)
  }

  // NEW FUNCTION: Analyze user queries and join recommended groups
  const analyzeQueries = async () => {
    if (!session?.access_token || analyzingQueries) return

    try {
      setAnalyzingQueries(true)

      // Call the API endpoint for analyzing user queries
      const response = await fetch(`${API_URL}/users/${session.user.id}/analyze-queries`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze queries")
      }

      const result = await response.json()
      setAnalysisResult(result)
      setShowAnalysisModal(true)

      // Refresh groups
      fetchMyGroups()
    } catch (error) {
      console.error("Error analyzing queries:", error)
      Alert.alert("Error", "Failed to analyze queries. Please try again.")
    } finally {
      setAnalyzingQueries(false)
    }
  }

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false)
    setAnalysisResult(null)
  }

  // Render a group item
  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={[styles.groupItem, selectedGroup?.group_id === item.group_id && styles.selectedGroup]}
      onPress={() => selectGroup(item)}
    >
      <View style={styles.groupItemContent}>
        <View style={styles.groupIconContainer}>
          <Text style={styles.groupIconText}>{item.group_name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.groupName}>{item.group_name}</Text>
      </View>
    </TouchableOpacity>
  )

  // Render a message item
  const renderMessageItem = ({ item }: { item: GroupMessage }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <TouchableOpacity
          onPress={() => (item.users?.is_verified ? openDirectMessage(item.users.id) : null)}
          disabled={!item.users?.is_verified}
          style={styles.messageAuthorContainer}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{(item.users?.display_name || "U").charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text
              style={[styles.messageAuthor, item.users?.is_verified ? styles.verifiedUser : styles.nonVerifiedUser]}
            >
              {item.users?.display_name || "Unknown User"}
              {item.users?.is_verified && <Text style={styles.verifiedBadge}> ✓</Text>}
            </Text>
            <Text style={styles.messageTime}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  )

  // Render a direct message item
  const renderDirectMessageItem = ({ item }: { item: DirectMessage }) => {
    const isFromMe = item.sender_id === session?.user?.id

    return (
      <View style={[styles.dmItem, isFromMe ? styles.dmFromMe : styles.dmFromOther]}>
        <Text style={styles.dmText}>{item.content}</Text>
        <Text style={styles.dmTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    )
  }

  // Render a conversation item
  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => selectConversation(item)}>
      <View style={styles.conversationAvatar}>
        <Text style={styles.conversationAvatarText}>{(item.partner.display_name || "U").charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>
            {item.partner.display_name || "Unknown User"}
            {item.partner.is_verified && <Text style={styles.verifiedBadge}> ✓</Text>}
          </Text>
          <Text style={styles.conversationTime}>
            {new Date(item.latestMessage.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.conversationPreviewContainer}>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {item.latestMessage.content}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  // Render analysis result item
  const renderAnalysisResultItem = ({ item }: { item: { group: string; status: string; error?: string } }) => (
    <View style={styles.analysisResultItem}>
      <View style={styles.analysisResultHeader}>
        <View style={styles.analysisGroupIconContainer}>
          <Text style={styles.analysisGroupIconText}>{item.group.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.analysisGroupName}>{item.group}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          item.status === "joined"
            ? styles.statusJoined
            : item.status === "already_member"
              ? styles.statusAlreadyMember
              : styles.statusFailed,
        ]}
      >
        <Text style={styles.statusText}>
          {item.status === "joined" ? "Joined" : item.status === "already_member" ? "Already Member" : "Failed"}
        </Text>
      </View>
      {item.error && <Text style={styles.errorText}>{item.error}</Text>}
    </View>
  )

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Groups</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeQueries} disabled={analyzingQueries}>
            {analyzingQueries ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.analyzeButtonContent}>
                <Ionicons name="analytics" size={18} color="#fff" />
                <Text style={styles.analyzeButtonText}>Find My Groups</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.inboxButton} onPress={openInbox}>
            <Ionicons name="mail" size={24} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.joinContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter group name to join..."
          value={groupName}
          onChangeText={setGroupName}
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGroup} disabled={joining || !groupName.trim()}>
          {joining ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Join</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4287f5" />
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.groupsContainer}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {myGroups.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No groups joined yet</Text>
                <Text style={styles.emptySubtext}>Join a group to start chatting</Text>
              </View>
            ) : (
              <FlatList
                data={myGroups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.group_id}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.groupsList}
              />
            )}
          </View>

          {selectedGroup ? (
            <View style={styles.chatContainer}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>{selectedGroup.group_name}</Text>
                <Text style={styles.chatSubtitle}>
                  {messages.length} {messages.length === 1 ? "message" : "messages"}
                </Text>
              </View>

              <FlatList
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.message_id}
                style={styles.messagesList}
                onRefresh={fetchMessages}
                refreshing={refreshing}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesListContent}
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No messages yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to start the conversation</Text>
                  </View>
                )}
              />

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!messageText.trim() || sendingMessage) && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noSelectionContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.noSelectionTitle}>No Group Selected</Text>
              <Text style={styles.noSelectionText}>Select a group from the list to view messages</Text>
            </View>
          )}
        </View>
      )}

      {/* Direct Message Modal */}
      {dmVisible && (
        <View style={styles.dmOverlay}>
          <Animated.View
            style={[
              styles.dmContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.dmHeader}>
              <View style={styles.dmTitleContainer}>
                <View style={styles.dmAvatar}>
                  <Text style={styles.dmAvatarText}>{(dmPartner?.display_name || "U").charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.dmTitle}>
                    {dmPartner?.display_name || "Direct Message"}
                    {dmPartner?.is_verified && <Text style={styles.verifiedBadge}> ✓</Text>}
                  </Text>
                  <Text style={styles.dmSubtitle}>Direct Message</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeDm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={dmMessages}
              renderItem={renderDirectMessageItem}
              keyExtractor={(item) => item.message_id}
              style={styles.dmList}
              inverted
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dmListContent}
              ListEmptyComponent={() => (
                <View style={styles.dmEmptyContainer}>
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No messages yet</Text>
                  <Text style={styles.emptySubtext}>Start the conversation</Text>
                </View>
              )}
            />

            <View style={styles.dmInputContainer}>
              <TextInput
                style={styles.dmInput}
                placeholder="Type a message..."
                value={dmText}
                onChangeText={setDmText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.dmSendButton, (!dmText.trim() || sendingDm) && styles.sendButtonDisabled]}
                onPress={sendDirectMessage}
                disabled={!dmText.trim() || sendingDm}
              >
                {sendingDm ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Inbox Modal */}
      <Modal visible={inboxVisible} animationType="slide" transparent={true} onRequestClose={closeInbox}>
        <View style={styles.modalContainer}>
          <View style={styles.inboxContainer}>
            <View style={styles.inboxHeader}>
              <Text style={styles.inboxTitle}>Messages</Text>
              <TouchableOpacity onPress={closeInbox} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingConversations ? (
              <View style={styles.inboxLoading}>
                <ActivityIndicator size="large" color="#4287f5" />
                <Text style={styles.loadingText}>Loading conversations...</Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.partnerId}
                style={styles.conversationsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conversationsListContent}
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="mail-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No conversations yet</Text>
                    <Text style={styles.emptySubtext}>Messages from other users will appear here</Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Analysis Results Modal */}
      <Modal visible={showAnalysisModal} animationType="fade" transparent={true} onRequestClose={closeAnalysisModal}>
        <View style={styles.modalContainer}>
          <View style={styles.analysisContainer}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisTitle}>Group Analysis Results</Text>
              <TouchableOpacity onPress={closeAnalysisModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {analysisResult && (
              <View style={styles.analysisContent}>
                <View style={styles.analysisSummaryContainer}>
                  <Ionicons name="analytics" size={24} color="#4287f5" />
                  <Text style={styles.analysisSummary}>
                    {`Analyzed ${analysisResult.analyzed} queries and found ${analysisResult.groups.length} recommended groups for you.`}
                  </Text>
                </View>

                <FlatList
                  data={analysisResult.results}
                  renderItem={renderAnalysisResultItem}
                  keyExtractor={(item, index) => `${item.group}-${index}`}
                  style={styles.analysisResultsList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.analysisResultsContent}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyStateContainer}>
                      <Ionicons name="search-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>No groups found</Text>
                      <Text style={styles.emptySubtext}>Try again later</Text>
                    </View>
                  )}
                />

                <TouchableOpacity style={styles.closeAnalysisButton} onPress={closeAnalysisModal}>
                  <Text style={styles.closeAnalysisText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  analyzeButton: {
    backgroundColor: "#4287f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  analyzeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  inboxButton: {
    position: "relative",
    padding: 8,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e53935",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notificationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  joinContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 22,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: "#f5f7fa",
    fontSize: 15,
  },
  joinButton: {
    backgroundColor: "#4287f5",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  groupsContainer: {
    width: "30%",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f7fa",
    color: "#333",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  groupsList: {
    paddingVertical: 8,
  },
  groupItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  groupItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedGroup: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#4287f5",
  },
  groupName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  chatHeader: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chatSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messagesListContent: {
    paddingBottom: 16,
  },
  messageItem: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  messageAuthorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  messageAuthor: {
    fontWeight: "bold",
    fontSize: 14,
  },
  verifiedUser: {
    color: "#4287f5",
  },
  verifiedBadge: {
    color: "#4287f5",
    fontWeight: "bold",
  },
  nonVerifiedUser: {
    color: "#666",
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
    marginLeft: 40,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f5f7fa",
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: "#4287f5",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sendButtonDisabled: {
    backgroundColor: "#b0c4de",
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  noSelectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  noSelectionText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },

  // Direct message styles
  dmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dmContainer: {
    width: width * 0.85,
    height: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "column",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f7fa",
  },
  dmTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dmAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dmAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  dmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dmSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  closeButton: {
    padding: 4,
  },
  dmList: {
    flex: 1,
    padding: 12,
  },
  dmListContent: {
    paddingTop: 16,
  },
  dmEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  dmItem: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  dmFromMe: {
    alignSelf: "flex-end",
    backgroundColor: "#e3f2fd",
    borderBottomRightRadius: 4,
  },
  dmFromOther: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dmText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
  },
  dmTime: {
    fontSize: 11,
    color: "#777",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  dmInputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f5f7fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  dmInput: {
    flex: 1,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  dmSendButton: {
    width: 44,
    height: 44,
    backgroundColor: "#4287f5",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },

  // Inbox styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  inboxContainer: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inboxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f7fa",
  },
  inboxTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inboxLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  conversationsList: {
    flex: 1,
  },
  conversationsListContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conversationAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  conversationPreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationPreview: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadBadge: {
    backgroundColor: "#e53935",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Analysis modal styles
  analysisContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f5f7fa",
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  analysisContent: {
    padding: 16,
  },
  analysisSummaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  analysisSummary: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  analysisResultsList: {
    maxHeight: height * 0.5,
  },
  analysisResultsContent: {
    paddingBottom: 16,
  },
  analysisResultItem: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4287f5",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  analysisResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  analysisGroupIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  analysisGroupIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  analysisGroupName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusJoined: {
    backgroundColor: "#4caf50",
  },
  statusAlreadyMember: {
    backgroundColor: "#2196f3",
  },
  statusFailed: {
    backgroundColor: "#f44336",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  errorText: {
    color: "#f44336",
    fontSize: 13,
    marginTop: 4,
  },
  closeAnalysisButton: {
    backgroundColor: "#4287f5",
    borderRadius: 24,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  closeAnalysisText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})