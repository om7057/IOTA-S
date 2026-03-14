# Phase 7: Real-Time Features - Socket.io API Reference

**Version:** 1.0.0  
**Last Updated:** March 14, 2026  
**Status:** ✅ Complete

---

## Overview

Phase 7 implements real-time features using Socket.io 4.7.2, enabling live messaging, typing indicators, presence tracking, and instant notifications across the IOTAS platform.

### Key Features
- **Presence Tracking**: Real-time online/offline status with last-seen timestamps
- **Typing Indicators**: Live typing status in conversations and groups
- **Direct Messaging**: Real-time 1-on-1 messaging with read receipts
- **Group Chat**: Live group messaging with multi-type support
- **Discussion Updates**: Real-time notification of new replies and likes
- **Notifications**: Instant alerts for messages, mentions, and activities
- **Connection Management**: Robust connection/disconnection handling

---

## Socket.io Connection

### Initial Connection
```javascript
// Client-side connection
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Emit user online
socket.emit('user:online', userId);
```

### Connection States
- **on:connect** - Successfully connected to server
- **on:disconnect** - Disconnected from server (will auto-reconnect)
- **on:error** - Connection error occurred

---

## 1. Presence Tracking

### Purpose
Track which users are currently online and available.

### Events

#### `user:online`
**Direction:** Client → Server  
**Trigger:** User logs in or opens app  
**Payload:**
```javascript
{
  userId: "uuid-here"
}
```

**Response:**
```javascript
// Emitted to all clients
{
  'presence:user-online': {
    userId: "uuid-here",
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### `user:offline`
**Direction:** Client → Server  
**Trigger:** User logs out or closes app  
**Auto-triggered on disconnect**

**Response:**
```javascript
// Emitted to all clients
{
  'presence:user-offline': {
    userId: "uuid-here",
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### `presence:updated`
**Direction:** Server → All Clients  
**Frequency:** On any presence change

**Payload:**
```javascript
{
  userId: "uuid-here",
  isOnline: true,
  timestamp: "2026-03-14T10:30:00Z"
}
```

### Usage Example
```javascript
// Listen for presence updates
socket.on('presence:user-online', (data) => {
  console.log(`${data.userId} is now online`);
  updateUserStatus(data.userId, 'online');
});

socket.on('presence:user-offline', (data) => {
  console.log(`${data.userId} went offline`);
  updateUserStatus(data.userId, 'offline');
});
```

---

## 2. Direct Messaging (1-on-1)

### Purpose
Real-time private messaging between two users.

### Events

#### `dm:join`
**Direction:** Client → Server  
**Trigger:** User opens a 1-on-1 conversation  
**Payload:**
```javascript
conversationId // UUID of conversation
```

#### `dm:send`
**Direction:** Client → Server  
**Trigger:** User sends a message  
**Payload:**
```javascript
{
  conversationId: "uuid-here",
  content: "Hello! How are you?",
  senderId: "sender-uuid",
  targetUserId: "recipient-uuid"
}
```

**Server Response (to both participants):**
```javascript
{
  'dm:message-received': {
    id: "message-uuid",
    conversationId: "conv-uuid",
    senderId: "sender-uuid",
    content: "Hello! How are you?",
    isRead: false,
    createdAt: "2026-03-14T10:30:00Z"
  }
}
```

**Recipient Notification:**
```javascript
{
  'notification:new-message': {
    type: "direct_message",
    senderId: "sender-uuid",
    conversationId: "conv-uuid",
    preview: "Hello! How are you?",
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### `dm:typing`
**Direction:** Client → Server  
**Trigger:** User starts typing  
**Payload:**
```javascript
{
  conversationId: "conv-uuid",
  userId: "your-user-id"
}
```

**Server Response (to other participant):**
```javascript
{
  'dm:user-typing': {
    userId: "your-user-id"
  }
}
```

#### `dm:stop-typing`
**Direction:** Client → Server  
**Trigger:** User stops typing or sends message  
**Payload:**
```javascript
{
  conversationId: "conv-uuid",
  userId: "your-user-id"
}
```

#### `dm:mark-read`
**Direction:** Client → Server  
**Trigger:** User reads a message  
**Payload:**
```javascript
{
  messageId: "msg-uuid",
  conversationId: "conv-uuid"
}
```

**Server Response (to both participants):**
```javascript
{
  'dm:message-read': {
    messageId: "msg-uuid"
  }
}
```

### Usage Example
```javascript
// Join conversation
socket.emit('dm:join', conversationId);

// Send message
socket.emit('dm:send', {
  conversationId,
  content: 'Hello!',
  senderId: currentUserId,
  targetUserId: recipientId
});

// Listen for incoming messages
socket.on('dm:message-received', (message) => {
  addMessageToChat(message);
  
  // Mark as read
  socket.emit('dm:mark-read', {
    messageId: message.id,
    conversationId: message.conversationId
  });
});

// Typing indicators
socket.emit('dm:typing', { conversationId, userId: currentUserId });
setTimeout(() => {
  socket.emit('dm:stop-typing', { conversationId, userId: currentUserId });
}, 3000);
```

---

## 3. Group Chat

### Purpose
Real-time messaging within groups.

### Events

#### `group:join`
**Direction:** Client → Server  
**Trigger:** User opens a group  
**Payload:**
```javascript
groupId // UUID of group
```

**Server Response (to all in group):**
```javascript
{
  'group:user-joined': {
    userId: "your-user-id",
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### `group:leave`
**Direction:** Client → Server  
**Trigger:** User leaves group or closes client  
**Payload:**
```javascript
groupId // UUID of group
```

#### `group:send-message`
**Direction:** Client → Server  
**Trigger:** User sends a group message  
**Payload:**
```javascript
{
  groupId: "group-uuid",
  content: "Great discussion everyone!",
  senderId: "your-user-id",
  type: "text" // text, image, video, file, emoji, system
}
```

**Server Response (to all in group):**
```javascript
{
  'group:message-received': {
    id: "msg-uuid",
    groupId: "group-uuid",
    senderId: "your-user-id",
    content: "Great discussion everyone!",
    type: "text",
    createdAt: "2026-03-14T10:30:00Z"
  }
}
```

#### `group:edit-message`
**Direction:** Client → Server  
**Trigger:** Message author edits a message  
**Payload:**
```javascript
{
  messageId: "msg-uuid",
  groupId: "group-uuid",
  content: "Great discussion everyone! (edited)",
  senderId: "your-user-id"
}
```

**Server Response (to all in group):**
```javascript
{
  'group:message-edited': {
    messageId: "msg-uuid",
    content: "Great discussion everyone! (edited)",
    editedAt: "2026-03-14T10:31:00Z"
  }
}
```

#### `group:delete-message`
**Direction:** Client → Server  
**Trigger:** Message author or moderator deletes a message  
**Payload:**
```javascript
{
  messageId: "msg-uuid",
  groupId: "group-uuid",
  userId: "your-user-id"
}
```

**Server Response (to all in group):**
```javascript
{
  'group:message-deleted': {
    messageId: "msg-uuid"
  }
}
```

#### `group:typing`
**Direction:** Client → Server  
**Trigger:** User starts typing  
**Payload:**
```javascript
{
  groupId: "group-uuid",
  userId: "your-user-id"
}
```

**Server Response (to others in group):**
```javascript
{
  'group:user-typing': {
    userId: "your-user-id"
  }
}
```

#### `group:stop-typing`
**Direction:** Client → Server  
**Trigger:** User stops typing  
**Payload:**
```javascript
{
  groupId: "group-uuid",
  userId: "your-user-id"
}
```

### Usage Example
```javascript
// Join group
socket.emit('group:join', groupId);

// Send message
socket.emit('group:send-message', {
  groupId,
  content: 'Check out this resource!',
  senderId: currentUserId,
  type: 'text'
});

// Listen for messages
socket.on('group:message-received', (message) => {
  displayGroupMessage(message);
});

// Edit message (sender only)
socket.emit('group:edit-message', {
  messageId: msgId,
  groupId,
  content: 'Updated content',
  senderId: currentUserId
});

// Delete message
socket.emit('group:delete-message', {
  messageId: msgId,
  groupId,
  userId: currentUserId
});
```

---

## 4. Discussion Threads

### Purpose
Real-time updates for discussion threads and replies.

### Events

#### `discussion:join`
**Direction:** Client → Server  
**Trigger:** User opens a discussion thread  
**Payload:**
```javascript
discussionId // UUID of discussion
```

#### `discussion:leave`
**Direction:** Client → Server  
**Trigger:** User closes discussion thread  
**Payload:**
```javascript
discussionId // UUID of discussion
```

#### `discussion:new-reply`
**Direction:** Client → Server  
**Trigger:** New reply posted to discussion  
**Payload:**
```javascript
{
  discussionId: "disc-uuid",
  replyId: "reply-uuid",
  userId: "your-user-id",
  content: "Great point!",
  parentReplyId: null // If replying to a reply
}
```

**Server Response (to all in discussion):**
```javascript
{
  'discussion:reply-received': {
    replyId: "reply-uuid",
    discussionId: "disc-uuid",
    userId: "your-user-id",
    content: "Great point!",
    parentReplyId: null,
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### `discussion:reply-liked`
**Direction:** Client → Server  
**Trigger:** User likes a reply  
**Payload:**
```javascript
{
  discussionId: "disc-uuid",
  replyId: "reply-uuid",
  userId: "your-user-id",
  likeCount: 5
}
```

**Server Response (to all in discussion):**
```javascript
{
  'discussion:reply-like-updated': {
    replyId: "reply-uuid",
    likeCount: 5,
    userId: "your-user-id"
  }
}
```

### Usage Example
```javascript
// Join discussion
socket.emit('discussion:join', discussionId);

// Post reply
socket.emit('discussion:new-reply', {
  discussionId,
  replyId: generateUUID(),
  userId: currentUserId,
  content: 'I agree with this approach',
  parentReplyId: null
});

// Like reply
socket.emit('discussion:reply-liked', {
  discussionId,
  replyId: targetReplyId,
  userId: currentUserId,
  likeCount: updatedCount
});

// Listen for updates
socket.on('discussion:reply-received', (reply) => {
  addReplyToThread(reply);
});
```

---

## 5. Notifications

### Purpose
Push real-time notifications to users for important events.

### Notification Types

#### New Message
```javascript
{
  'notification:new-message': {
    type: "direct_message",
    senderId: "sender-uuid",
    conversationId: "conv-uuid",
    preview: "Hey! How's it going?",
    timestamp: "2026-03-14T10:30:00Z"
  }
}
```

#### New Discussion
```javascript
{
  'notification:new-discussion': {
    type: "new_discussion",
    groupId: "group-uuid",
    discussionId: "disc-uuid",
    title: "New discussion in Study Group",
    message: "Jane: Tips for the upcoming exam",
    action: "discussion:disc-uuid"
  }
}
```

#### New Reply
```javascript
{
  'notification:new-reply': {
    type: "new_reply",
    discussionId: "disc-uuid",
    replyId: "reply-uuid",
    title: "New reply from John",
    message: "Great question, here's the answer...",
    action: "reply:reply-uuid"
  }
}
```

#### Mention
```javascript
{
  'notification:received': {
    type: "mention",
    mentioner: "john",
    mentionType: "group_message",
    contextId: "group-uuid",
    title: "John mentioned you",
    message: "@Sarah Check this out",
    action: "mention:group_message:group-uuid"
  }
}
```

#### Like
```javascript
{
  'notification:received': {
    type: "like",
    likerId: "user-uuid",
    contentType: "reply",
    contentId: "reply-uuid",
    title: "Jane liked your reply",
    message: "Your reply: 'Great approach...'",
    action: "like:reply:reply-uuid"
  }
}
```

#### User Joined
```javascript
{
  'notification:user-joined': {
    type: "user_joined",
    groupId: "group-uuid",
    userId: "new-user-id",
    title: "New member joined Study Group",
    message: "Welcome Sarah!"
  }
}
```

#### System Notification
```javascript
{
  'notification:system': {
    type: "system",
    title: "System Maintenance",
    message: "Server maintenance scheduled for tonight",
    priority: "warning" // info, warning, critical
  }
}
```

#### Error Notification
```javascript
{
  'notification:received': {
    type: "error",
    title: "Error",
    message: "Failed to send message",
    code: "MSG_SEND_FAILED"
  }
}
```

### Usage Example
```javascript
// Listen for all notifications
socket.on('notification:received', (notification) => {
  showNotificationToast(notification);
  
  // Handle based on type
  switch(notification.type) {
    case 'mention':
      highlightMention(notification);
      break;
    case 'like':
      updateLikeCount(notification);
      break;
  }
});

// Listen for specific events
socket.on('notification:new-message', (notif) => {
  playMessageSound();
  showMessagePreview(notif);
});

socket.on('notification:system', (notif) => {
  if (notif.priority === 'critical') {
    showBanner(notif.message);
  }
});
```

---

## 6. Error Handling

### Error Events
```javascript
// Connection error
socket.on('error', (error) => {
  console.error('Socket error:', error);
  showErrorMessage(error.message);
});

// Emit-level error response
socket.emit('dm:send', data, (error, response) => {
  if (error) {
    console.error('Message send failed:', error);
    showErrorNotification(error.message);
  } else {
    onMessageSent(response);
  }
});

// Server-sent error
socket.on('error', (errorData) => {
  if (errorData.code === 'AUTH_FAILED') {
    redirectToLogin();
  }
});
```

### Common Error Codes
| Code | Issue | Resolution |
|------|-------|-----------|
| `NOT_AUTHENTICATED` | User not authenticated | Re-authenticate with token |
| `NOT_MEMBER` | User not member of group | Join group first |
| `UNAUTHORIZED` | Insufficient permissions | Check user role |
| `INVALID_PAYLOAD` | Malformed event data | Verify event structure |
| `CONVERSATION_NOT_FOUND` | Conversation doesn't exist | Create conversation first |
| `MESSAGE_NOT_FOUND` | Message doesn't exist | Verify message ID |
| `MSG_SEND_FAILED` | Failed to send message | Retry operation |

---

## 7. Service Architecture

### PresenceTracker
Manages user online/offline status.

```javascript
// Methods available globally
global.presenceTracker.isUserOnline(userId)
global.presenceTracker.getOnlineUsers()
global.presenceTracker.getUserSocketCount(userId)
global.presenceTracker.getPresenceStatus([userId1, userId2, ...])
```

### NotificationService
Handles all notification types.

```javascript
// Methods available globally
global.notificationService.notifyUser(userId, notification)
global.notificationService.notifyUsers(userIds, notification)
global.notificationService.notifyGroupMessage(groupId, groupName, senderId, senderName, preview)
global.notificationService.notifyDirectMessage(userId, senderId, senderName, preview, conversationId)
global.notificationService.notifyMentions(userIds, mentioner, mentionType, contextId, preview)
global.notificationService.notifyLike(userId, likerId, likerName, contentType, contentId, preview)
```

### TypingIndicator
Manages typing status across conversations.

```javascript
// Methods available globally
global.typingIndicator.setTyping(roomId, userId)
global.typingIndicator.clearTyping(roomId, userId)
global.typingIndicator.getTypingUsers(roomId)
global.typingIndicator.formatTypingMessage(userArray)
global.typingIndicator.getTypingStats()
```

---

## 8. Best Practices

### Client-Side
1. **Always emit `user:online` on connection** before performing other operations
2. **Join rooms before listening** for room-specific events
3. **Use typing indicators sparingly** (debounce to 300ms intervals)
4. **Mark messages as read** when user views them
5. **Handle reconnection gracefully** - resync state after reconnecting
6. **Validate data** before emitting to prevent invalid server calls

### Server-Side
1. **Verify user permissions** in all sensitive operations
2. **Validate payload structure** before processing
3. **Use database transactions** for critical operations
4. **Log all critical operations** for debugging
5. **Implement rate limiting** on high-frequency events (typing)
6. **Clean up resources** on disconnect (clear typing status, etc.)

### Performance
1. **Limit typing indicator broadcasts** to every 300ms
2. **Paginate message history** (max 200 messages)
3. **Use selective joins** only for active rooms
4. **Implement message pagination** for old conversations
5. **Batch notifications** when possible
6. **Monitor Socket.io memory usage** - set connection limits

---

## 9. Troubleshooting

### Connection Issues
```
Issue: Client cannot connect to Socket.io
Solution: 
- Verify CORS settings match client origin
- Check socket.io middleware and auth
- Ensure server is running on correct port
- Check firewall rules for websocket ports
```

### Missing Notifications
```
Issue: User not receiving notifications
Solution:
- Verify user is in correct room (user:${userId})
- Check notification service is initialized
- Verify io.to() or io.emit() is called
- Check browser console for errors
```

### Typing Indicators Not Showing
```
Issue: Typing status not updating
Solution:
- Ensure dm:typing/group:typing events are emitted
- Verify typingIndicator service is running
- Check room joins (dm:join, group:join, discussion:join)
- Verify client is listening to typing events
```

### Message Not Persisted
```
Issue: Message sent via Socket.io not in database
Solution:
- Controller function must save to database
- Verify database connection is active
- Check error responses for database errors
- Ensure message validation passes
```

---

## 10. Integration Examples

### React Native Client
```javascript
import { io } from 'socket.io-client';

const socket = io(process.env.API_URL, {
  reconnection: true,
  auth: { token: jwtToken }
});

// Join conversation and set up listeners
useEffect(() => {
  if (!conversationId) return;
  
  socket.emit('dm:join', conversationId);
  
  const handleMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };
  
  socket.on('dm:message-received', handleMessage);
  return () => socket.off('dm:message-received', handleMessage);
}, [conversationId]);
```

### Web Client
```javascript
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  auth: (cb) => {
    cb({ token: localStorage.getItem('authToken') });
  }
});

// Emit user online on login
socket.emit('user:online', currentUser.id);

// Listen for notifications
socket.on('notification:received', (notif) => {
  toast.show({
    title: notif.title,
    description: notif.message,
    status: notif.type
  });
});
```

---

## 11. Configuration

### Environment Variables (server)
```
SOCKET_IO_ENABLED=true
SOCKET_IO_TRANSPORTS=websocket,polling
SOCKET_IO_PIN_INTERVAL=60000
SOCKET_IO_MAX_CONNECTIONS=10000
```

### Limits & Defaults
- **Max message size:** 10MB
- **Max typing timeout:** 3 seconds
- **Connection timeout:** 60 seconds
- **Reconnection attempts:** 5
- **Paginated results:** 200 items max

---

## Summary

Phase 7 provides a complete real-time infrastructure for IOTAS:
- 60+ real-time events across messaging, presence, and notifications
- Robust connection management and error handling
- Scalable architecture with presence, typing, and notification services
- Full integration with Phases 2-6 models and controllers
- Production-ready configuration and security practices

