# Phase 6: Teen Features API Documentation

## Overview

Phase 6 introduces social and real-time features: Groups, Discussions, Direct Messaging, and Group Chat. These features enable teens to connect, collaborate, and support each other within the platform.

## Models

### Group
- `id` (UUID) - Primary key
- `name` (String) - Group name
- `description` (Text) - Group description
- `creatorId` (UUID) - Group creator reference
- `type` (Enum) - public|private|interest-based
- `category` (String) - e.g., mental-health, academics, hobbies, support
- `icon` (String) - Emoji or icon identifier
- `memberCount` (Integer) - Total members
- `isActive` (Boolean) - Active status
- `lastActivityAt` (Date) - Last activity timestamp
- `avatarUrl` (String) - Group avatar image

### GroupMember
- `id` (UUID) - Primary key
- `groupId` (UUID) - Group reference
- `userId` (UUID) - User reference
- `role` (Enum) - owner|moderator|member
- `joinedAt` (Date) - Join timestamp
- `lastReadAt` (Date) - Last read timestamp
- `isActive` (Boolean) - Active status

### Discussion
- `id` (UUID) - Primary key
- `groupId` (UUID) - Group reference
- `creatorId` (UUID) - Thread creator reference
- `title` (String) - Discussion title
- `content` (Text) - Initial post content
- `isPinned` (Boolean) - Pinned status
- `isClosed` (Boolean) - Closed status
- `replyCount` (Integer) - Total replies
- `likeCount` (Integer) - Total likes
- `viewCount` (Integer) - Total views
- `lastActivityAt` (Date) - Last activity timestamp
- `tags` (JSONB) - Topic tags array

### DiscussionReply
- `id` (UUID) - Primary key
- `discussionId` (UUID) - Discussion reference
- `creatorId` (UUID) - Reply creator reference
- `parentReplyId` (UUID) - Parent reply (for nested replies)
- `content` (Text) - Reply content
- `likeCount` (Integer) - Total likes
- `isEdited` (Boolean) - Edit status
- `editedAt` (Date) - Edit timestamp

### Conversation
- `id` (UUID) - Primary key
- `user1Id` (UUID) - First user reference
- `user2Id` (UUID) - Second user reference
- `messageCount` (Integer) - Total messages
- `lastMessageAt` (Date) - Last message timestamp
- `isActive` (Boolean) - Active status

### DirectMessage
- `id` (UUID) - Primary key
- `conversationId` (UUID) - Conversation reference
- `senderId` (UUID) - Sender reference
- `content` (Text) - Message content
- `isRead` (Boolean) - Read status
- `readAt` (Date) - Read timestamp
- `isEdited` (Boolean) - Edit status
- `editedAt` (Date) - Edit timestamp

### GroupChat
- `id` (UUID) - Primary key
- `groupId` (UUID) - Group reference
- `senderId` (UUID) - Sender reference
- `content` (Text) - Message content
- `type` (Enum) - text|image|video|file|emoji|system
- `metadata` (JSONB) - For media/file data
- `isEdited` (Boolean) - Edit status
- `editedAt` (Date) - Edit timestamp

### Like
- `id` (UUID) - Primary key
- `userId` (UUID) - User reference
- `targetType` (Enum) - discussion|reply|post
- `targetId` (UUID) - Content ID being liked

## Group Endpoints

### Public
- `GET /api/groups` - List all groups
  - Query: `type`, `category`, `search`
- `GET /api/groups/:id` - Get group details with members

### User
- `GET /api/groups/user/list` - Get user's joined groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Group Owner/Moderator
- `PUT /api/groups/:id` - Update group info
- `DELETE /api/groups/:id` - Delete group
- `PUT /api/groups/:id/members/:memberId` - Update member role

## Discussion Endpoints

### Public
- `GET /api/discussions/group/:groupId` - List group discussions
  - Query: `sort` (recent|pinned)
- `GET /api/discussions/:id` - Get discussion with replies

### User
- `POST /api/discussions` - Create discussion thread
  - Body: `{ groupId, title, content, tags }`
- `POST /api/discussions/:id/like` - Like discussion
- `POST /api/discussions/:id/replies` - Reply to discussion
  - Body: `{ content, parentReplyId (optional) }`
- `POST /api/discussions/replies/:replyId/like` - Like reply
- `PUT /api/discussions/:id` - Edit discussion (creator only)

### Moderator/Owner
- `POST /api/discussions/:id/pin` - Pin/unpin discussion
- `POST /api/discussions/:id/close` - Close/reopen discussion

## Direct Message Endpoints

### User
- `GET /api/messages` - Get all conversations
- `GET /api/messages/user/:userId` - Get or create conversation with user
- `GET /api/messages/:conversationId/messages` - Get conversation messages
  - Query: `limit` (1-200, default: 50)
- `POST /api/messages/:conversationId/send` - Send message
  - Body: `{ content }`
- `POST /api/messages/:conversationId/messages/:messageId/read` - Mark as read
- `GET /api/messages/stats/unread` - Get unread count

## Group Chat Endpoints

### User
- `POST /api/chats/:groupId/send` - Send group message
  - Body: `{ content, type }`
- `GET /api/chats/:groupId/history` - Get group chat history
  - Query: `limit` (1-200, default: 50)
- `PUT /api/chats/:messageId` - Edit message (sender only)
  - Body: `{ content }`
- `DELETE /api/chats/:messageId` - Delete message (sender/moderator/owner only)

## Example Requests

### Create Group
```bash
POST /api/groups
Content-Type: application/json
Authorization: Bearer token

{
  "name": "Tech Enthusiasts",
  "description": "For those interested in tech topics",
  "type": "public",
  "category": "academic",
  "icon": "💻",
  "avatarUrl": "https://..."
}
```

### Create Discussion
```bash
POST /api/discussions
Content-Type: application/json
Authorization: Bearer token

{
  "groupId": "group-123",
  "title": "Best coding practices for beginners",
  "content": "What are the best practices you recommend?",
  "tags": ["coding", "best-practices", "beginner"]
}
```

### Reply to Discussion
```bash
POST /api/discussions/discussion-123/replies
Content-Type: application/json
Authorization: Bearer token

{
  "content": "I think the most important is clean code...",
  "parentReplyId": "optional-parent-reply-id"
}
```

### Send Direct Message
```bash
POST /api/messages/conversation-123/send
Content-Type: application/json
Authorization: Bearer token

{
  "content": "Hey! How are you doing?"
}
```

### Send Group Message
```bash
POST /api/chats/group-123/send
Content-Type: application/json
Authorization: Bearer token

{
  "content": "Great discussion everyone! 🎉",
  "type": "text"
}
```

### Get Group Discussions
```bash
GET /api/discussions/group/group-123?sort=pinned
```

### Like Discussion
```bash
POST /api/discussions/discussion-123/like
Authorization: Bearer token
```

## Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "data": {},
  "error": "Error message if success is false",
  "total": "Count for list endpoints"
}
```

## Authorization Levels

### Public Access (No Auth)
- View group listings
- View public group details
- View discussions (in public groups)

### Member Access (Auth Required)
- Create discussions in joined groups
- Reply to discussions
- Like discussions/replies
- Send direct messages
- Send group messages
- Leave groups

### Owner/Moderator Access
- Update group info
- Manage member roles
- Delete groups
- Pin/close discussions
- Delete group messages
- Delete discussions (moderators)

## Real-Time Features (Ready for WebSocket)

These endpoints are designed to work with WebSocket for real-time updates:
- Direct messages
- Group chat messages
- Discussion updates (new replies, likes)
- Member joins/leaves

## Error Codes

- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not authorized for action)
- `404` - Not found
- `500` - Server error

## Performance Considerations

- Message queries paginated (max 200 messages)
- Discussion replies loaded in one query
- Group member count cached in Group model
- Consider indexing on frequently queried fields
- For large discussions, implement reply pagination

## Notes

- Nested replies supported (threaded comments)
- Like/unlike is toggle action
- Discussions can be closed to prevent new replies
- Group members can see edit history (editedAt, isEdited fields)
- All timestamps tracked for activity tracking
- Member roles: owner (full control), moderator (manage discussions/users), member (basic participation)
